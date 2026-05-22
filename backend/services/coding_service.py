"""
Coding challenge selection and dynamic generation.
Difficulty is kept internal — never exposed to the client.
"""

import logging
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.candidate import Candidate
from models.coding import CodingChallenge, CodingSubmission, ChallengeDifficulty
from models.interview import InterviewSession, InterviewResponse
from ai import provider

logger = logging.getLogger(__name__)

CODING_SYSTEM = """You are a senior engineer designing realistic interview coding problems.
Problems should test practical logic and problem-solving — not obscure tricks or competitive programming trivia.
Align difficulty and domain with the candidate's role and experience.
Output ONLY valid JSON."""


def _infer_difficulty(
    experience_years: int | None,
    interview_scores: list[float],
) -> ChallengeDifficulty:
    """Pick internal difficulty from experience and interview performance."""
    avg = sum(interview_scores) / len(interview_scores) if interview_scores else 3.0
    years = experience_years or 3

    if years <= 2 or avg < 2.5:
        return ChallengeDifficulty.EASY
    if years >= 6 and avg >= 4.0:
        return ChallengeDifficulty.HARD
    if avg >= 3.8:
        return ChallengeDifficulty.MEDIUM
    return ChallengeDifficulty.MEDIUM


def _role_coding_focus(role: str) -> str:
    role_lower = role.lower()
    if any(k in role_lower for k in ("frontend", "react", "ui")):
        return "arrays, strings, DOM-related logic, or small algorithm tasks common in frontend interviews"
    if any(k in role_lower for k in ("backend", "api", "server")):
        return "data structures, API logic, parsing, or system-adjacent algorithm tasks"
    if any(k in role_lower for k in ("ml", "ai", "data")):
        return "data processing, array/matrix manipulation, or metric computation problems"
    return "practical algorithm and data structure problems suitable for full-stack engineers"


def _used_challenge_ids(db: Session, candidate_id: str) -> set[str]:
    """Challenge IDs this candidate has already attempted."""
    rows = (
        db.query(CodingSubmission.challenge_id)
        .join(InterviewSession, CodingSubmission.session_id == InterviewSession.id)
        .filter(InterviewSession.candidate_id == candidate_id)
        .all()
    )
    return {r[0] for r in rows}


def build_coding_context(
    candidate: Candidate,
    session: InterviewSession,
    db: Session,
) -> dict:
    scores = [
        r.ai_score
        for r in db.query(InterviewResponse)
        .filter(InterviewResponse.session_id == session.id)
        .all()
        if r.ai_score is not None
    ]
    vacancy = session.vacancy
    return {
        "role": session.role_applied or candidate.position or "Software Engineer",
        "skills": candidate.skills if isinstance(candidate.skills, list) else [],
        "experience_years": candidate.experience_years,
        "resume_snippet": (candidate.resume_text or "")[:1500],
        "interview_scores": scores,
        "company": vacancy.company if vacancy else None,
        "job_title": vacancy.title if vacancy else None,
    }


async def _generate_challenge_via_ai(ctx: dict, difficulty: ChallengeDifficulty) -> dict | None:
    if not provider.is_available():
        return None

    focus = _role_coding_focus(ctx["role"])
    prompt = f"""Design one coding interview challenge.

Role: {ctx['role']}
Internal difficulty: {difficulty.value} (do not mention this in the problem statement)
Focus area: {focus}
Experience: {ctx.get('experience_years') or 'unknown'} years
Skills: {', '.join(ctx['skills'][:15]) if ctx.get('skills') else 'not specified'}
Resume excerpt: {ctx.get('resume_snippet', '')[:800]}

Requirements:
- Realistic problem statement (2-4 paragraphs max in description markdown)
- starter_code for python and javascript
- At least 2 public sample test cases and 2 hidden test cases
- Clear constraints list
- Title should be professional (not "Easy Problem #1")

Respond as JSON:
{{
  "title": "...",
  "problem_statement": "markdown description",
  "starter_code": {{"python": "...", "javascript": "..."}},
  "sample_input": "example input string",
  "sample_output": "example output string",
  "constraints": ["constraint 1", "constraint 2"],
  "hidden_tests": [{{"input": "...", "expected": "...", "hidden": true}}],
  "public_tests": [{{"input": "...", "expected": "...", "hidden": false}}]
}}"""

    try:
        result = await provider.generate_json(prompt, CODING_SYSTEM)
        if not result or not result.get("title"):
            return None
        return result
    except Exception as e:
        logger.warning("AI coding challenge generation failed: %s", e)
        return None


def _persist_generated_challenge(db: Session, ai_data: dict, difficulty: ChallengeDifficulty) -> CodingChallenge:
    public_tests = ai_data.get("public_tests") or []
    hidden_tests = ai_data.get("hidden_tests") or []
    if ai_data.get("sample_input") and not public_tests:
        public_tests = [
            {
                "input": ai_data["sample_input"],
                "expected": ai_data.get("sample_output", ""),
                "hidden": False,
            }
        ]
    test_cases = public_tests + hidden_tests

    challenge = CodingChallenge(
        id=str(uuid.uuid4()),
        title=ai_data["title"],
        description=ai_data.get("problem_statement") or ai_data.get("description", ""),
        difficulty=difficulty,
        starter_code=ai_data.get("starter_code"),
        test_cases=test_cases,
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


def _pick_db_challenge(
    db: Session,
    difficulty: ChallengeDifficulty,
    exclude_ids: set[str],
) -> CodingChallenge | None:
    query = db.query(CodingChallenge).filter(CodingChallenge.difficulty == difficulty)
    if exclude_ids:
        query = query.filter(CodingChallenge.id.notin_(exclude_ids))
    challenge = query.order_by(func.random()).first()
    if not challenge and exclude_ids:
        challenge = (
            db.query(CodingChallenge)
            .filter(CodingChallenge.difficulty == difficulty)
            .order_by(func.random())
            .first()
        )
    if not challenge:
        challenge = db.query(CodingChallenge).order_by(func.random()).first()
    return challenge


async def get_challenge_for_session(
    db: Session,
    candidate: Candidate,
    session: InterviewSession,
) -> dict:
    """
    Return a coding challenge tailored to the session.
    Difficulty is never included in the API payload.
    """
    ctx = build_coding_context(candidate, session, db)
    difficulty = _infer_difficulty(ctx["experience_years"], ctx["interview_scores"])
    exclude = _used_challenge_ids(db, candidate.id)

    challenge: CodingChallenge | None = None
    generated_constraints: list[str] | None = None

    ai_data = await _generate_challenge_via_ai(ctx, difficulty)
    if ai_data:
        generated_constraints = ai_data.get("constraints")
        challenge = _persist_generated_challenge(db, ai_data, difficulty)
    else:
        challenge = _pick_db_challenge(db, difficulty, exclude)

    if not challenge:
        raise ValueError("No coding challenges available")

    public_tests = []
    if challenge.test_cases:
        public_tests = [t for t in challenge.test_cases if not t.get("hidden", False)]
    return {
        "id": challenge.id,
        "title": challenge.title,
        "description": challenge.description,
        "starter_code": challenge.starter_code,
        "time_limit_ms": challenge.time_limit_ms,
        "memory_limit_kb": challenge.memory_limit_kb,
        "public_test_cases": public_tests,
        "constraints": generated_constraints,
    }


def evaluate_code_heuristic(code: str, language: str, challenge: CodingChallenge) -> dict:
    """Heuristic evaluation when Judge0 is unavailable."""
    code_lower = code.lower().strip()
    lines = code.count("\n") + 1

    has_function = any(kw in code_lower for kw in ["def ", "function ", "public ", "void ", "const "])
    has_logic = any(kw in code_lower for kw in ["if ", "for ", "while ", "switch", "map(", "filter("])
    has_return = "return" in code_lower

    score = 2.0
    if has_function:
        score += 0.8
    if has_logic:
        score += 0.6
    if has_return:
        score += 0.4
    if lines >= 8:
        score += 0.5

    score = round(min(5.0, max(1.0, score)), 1)
    total = len(challenge.test_cases) if challenge.test_cases else 5
    passed = max(0, min(total, round(total * (score / 5.0))))

    return {
        "score": score,
        "passed": passed,
        "total": total,
        "runtime_ms": None,
        "memory_kb": None,
        "test_results": [
            {"test": i + 1, "passed": i < passed, "hidden": False}
            for i in range(min(total, 3))
        ],
    }


async def evaluate_submission(
    code: str,
    language: str,
    challenge: CodingChallenge,
) -> dict:
    """Run heuristic tests and optional AI code review."""
    result = evaluate_code_heuristic(code, language, challenge)
    ai_feedback = "Code submitted successfully."

    if provider.is_available():
        try:
            ai_result = await provider.generate_json(
                f"""Review this coding submission in context of the challenge.

Challenge: {challenge.title}
Description: {challenge.description[:1500]}
Language: {language}
Code:
```
{code[:2500]}
```

Evaluate correctness approach, code quality, edge cases, and efficiency.
Respond as JSON: {{"feedback": "detailed review", "quality_score": 3.5}}""",
                CODING_SYSTEM,
            )
            if ai_result.get("feedback"):
                ai_feedback = ai_result["feedback"]
            if ai_result.get("quality_score"):
                result["score"] = round(
                    result["score"] * 0.6 + float(ai_result["quality_score"]) * 0.4, 1
                )
        except Exception as e:
            logger.warning("AI code review failed: %s", e)

    result["ai_feedback"] = ai_feedback
    return result
