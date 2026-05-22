"""
AI-powered response evaluation and report generation.
Uses interview context for fair, role-aligned scoring.
"""

import logging
from typing import Any

from ai import provider

logger = logging.getLogger(__name__)

EVAL_SYSTEM = """You are a senior hiring panelist evaluating interview responses.
Score fairly against the role requirements. Reward specificity, depth, and real examples.
Penalize vague, generic, or off-topic answers. Keep feedback constructive and concise."""


async def evaluate_response(
    question: str,
    response: str,
    category: str,
    role: str = "Software Engineer",
    resume_summary: str | None = None,
) -> dict:
    """Score a single interview response (1.0–5.0) with actionable feedback."""
    context = f"Role: {role}\nCategory: {category}"
    if resume_summary:
        context += f"\nResume context: {resume_summary[:800]}"

    prompt = f"""{context}

Question: {question}
Candidate response: {response}

Evaluate for: relevance to the question, technical/behavioral depth, clarity, 
use of specific examples, and alignment with the {role} role.

Respond as JSON:
{{"score": 3.5, "feedback": "2-3 sentences of specific, actionable feedback"}}"""

    result = await provider.generate_json(prompt, EVAL_SYSTEM)
    if not result or "score" not in result:
        words = len(response.split())
        has_example = any(
            w in response.lower()
            for w in ("because", "for example", "specifically", "we built", "i implemented")
        )
        score = min(5.0, max(1.0, 2.0 + (words / 45) + (0.8 if has_example else 0)))
        return {
            "score": round(score, 1),
            "feedback": (
                "Your answer was noted. Strengthen it with a concrete example — "
                "what you did, the constraint, and the measurable outcome."
            ),
        }
    result["score"] = round(max(1.0, min(5.0, float(result["score"]))), 1)
    result["feedback"] = result.get("feedback", "Response recorded.")
    return result


async def generate_evaluation_report(
    candidate_name: str,
    role: str,
    responses: list[dict],
    coding_result: dict | None = None,
    resume_summary: str | None = None,
    job_context: str | None = None,
) -> dict:
    """Generate a comprehensive, context-aware evaluation report."""
    responses_text = "\n\n".join(
        f"[{r.get('category', 'general')}] Q: {r['question']}\n"
        f"A: {r['response']}\nScore: {r.get('score', 'N/A')}/5"
        for r in responses
    )

    coding_text = ""
    if coding_result:
        coding_text = f"""
Coding challenge: {coding_result.get('title', 'N/A')}
Language: {coding_result.get('language', 'N/A')}
Tests passed: {coding_result.get('passed', 0)}/{coding_result.get('total', 0)}
Coding score: {coding_result.get('score', 'N/A')}/5.0
AI review: {coding_result.get('feedback', 'N/A')[:500]}"""

    job_block = f"\nJob context: {job_context}" if job_context else ""
    resume_block = f"\nResume: {resume_summary[:1200]}" if resume_summary else ""

    prompt = f"""Generate a hiring evaluation report.

Candidate: {candidate_name}
Role: {role}{job_block}{resume_block}

Interview transcript:
{responses_text}
{coding_text}

Assess holistically: communication, technical depth, behavioral fit, problem-solving, 
and coding ability (if provided). Reference specific answers in the summary.

Respond as JSON:
{{
    "overall_score": 3.5,
    "interview_score": 3.5,
    "coding_score": 3.0,
    "communication_score": 3.5,
    "technical_score": 3.0,
    "behavioral_score": 4.0,
    "strengths": ["specific strength 1", "strength 2", "strength 3"],
    "improvements": ["specific area 1", "area 2", "area 3"],
    "ai_summary": "2-3 sentence professional summary referencing actual interview content",
    "recommendation": "strong_hire|hire|maybe|pass"
}}

All scores between 1.0 and 5.0. Be fair and evidence-based."""

    result = await provider.generate_json(prompt, EVAL_SYSTEM)
    if not result or "overall_score" not in result:
        scores = [r.get("score", 3.0) for r in responses if r.get("score")]
        avg = sum(scores) / len(scores) if scores else 3.0
        coding_score = coding_result.get("score", 0) if coding_result else 0
        overall = avg * 0.7 + coding_score * 0.3 if coding_result else avg

        return {
            "overall_score": round(overall, 1),
            "interview_score": round(avg, 1),
            "coding_score": round(coding_score, 1),
            "communication_score": round(avg, 1),
            "technical_score": round(avg, 1),
            "behavioral_score": round(avg, 1),
            "strengths": ["Completed the full interview", "Engaged with all questions"],
            "improvements": [
                "Add more quantified outcomes to project stories",
                "Go deeper on technical trade-offs and constraints",
            ],
            "ai_summary": (
                f"{candidate_name} completed the {role} interview. "
                f"Overall performance was {'strong' if overall >= 4 else 'satisfactory' if overall >= 3 else 'below expectations'}."
            ),
            "recommendation": "hire" if overall >= 4.2 else "maybe" if overall >= 3.0 else "pass",
        }

    for key in [
        "overall_score", "interview_score", "coding_score",
        "communication_score", "technical_score", "behavioral_score",
    ]:
        if key in result:
            result[key] = round(max(1.0, min(5.0, float(result[key]))), 1)

    return result
