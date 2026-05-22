"""
Interview session orchestration — context building, question flow, scoring.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.candidate import Candidate
from models.interview import InterviewSession, InterviewResponse, SessionStatus
from models.vacancy import Vacancy
from ai import interviewer as ai_interviewer, evaluator as ai_evaluator

TOTAL_QUESTIONS = 6


def build_interview_context(
    candidate: Candidate,
    session: InterviewSession,
    db: Session,
    *,
    question_number: int = 1,
    conversation_history: list[dict] | None = None,
    categories_covered: list[str] | None = None,
    topics_asked: list[str] | None = None,
    response_scores: list[float] | None = None,
) -> dict:
    """Aggregate all signals used for personalized question generation."""
    vacancy: Vacancy | None = None
    if session.vacancy_id:
        vacancy = db.query(Vacancy).filter(Vacancy.id == session.vacancy_id).first()

    skills = candidate.skills
    if isinstance(skills, dict):
        skills = skills.get("list") or list(skills.values()) if skills else []
    elif not isinstance(skills, list):
        skills = []

    return {
        "candidate_name": candidate.name.split()[0] if candidate.name else "there",
        "role": session.role_applied or candidate.position or "Software Engineer",
        "resume_text": candidate.resume_text,
        "skills": skills,
        "experience_years": candidate.experience_years,
        "company_name": vacancy.company if vacancy else None,
        "job_title": vacancy.title if vacancy else None,
        "job_description": vacancy.description if vacancy else None,
        "conversation_history": conversation_history or [],
        "categories_covered": categories_covered or [],
        "topics_asked": topics_asked or [],
        "response_scores": response_scores or [],
        "question_number": question_number,
        "total_questions": TOTAL_QUESTIONS,
    }


def _load_session_history(db: Session, session_id: str) -> tuple[list[dict], list[str], list[str], list[float]]:
    responses = (
        db.query(InterviewResponse)
        .filter(InterviewResponse.session_id == session_id)
        .order_by(InterviewResponse.responded_at)
        .all()
    )
    history = [{"question": r.question_text, "response": r.response_text} for r in responses]
    categories = list({r.category for r in responses if r.category})
    topics = [r.question_text for r in responses]
    scores = [r.ai_score for r in responses if r.ai_score is not None]
    return history, categories, topics, scores


async def start_interview(
    db: Session,
    candidate: Candidate,
    *,
    vacancy_id: str | None,
    role_applied: str | None,
    interaction_mode: str,
) -> dict:
    """Create session and return the first personalized question."""
    session = InterviewSession(
        candidate_id=candidate.id,
        vacancy_id=vacancy_id,
        role_applied=role_applied or candidate.position or "Software Engineer",
        interaction_mode=interaction_mode,
        status=SessionStatus.IN_PROGRESS,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    ctx = build_interview_context(candidate, session, db, question_number=1)
    first_q = await ai_interviewer.generate_first_question(ctx)

    return {
        "session_id": session.id,
        "first_question": first_q["question"],
        "category": first_q.get("category", "behavioral"),
        "question_number": 1,
        "total_questions": TOTAL_QUESTIONS,
    }


async def submit_interview_response(
    db: Session,
    candidate: Candidate,
    session: InterviewSession,
    *,
    question_text: str,
    response_text: str,
    category: str,
) -> dict:
    """Evaluate answer, persist it, and return next question or completion."""
    resume_snippet = candidate.resume_text[:500] if candidate.resume_text else None

    eval_result = await ai_evaluator.evaluate_response(
        question=question_text,
        response=response_text,
        category=category,
        role=session.role_applied or "Software Engineer",
        resume_summary=resume_snippet,
    )

    db.add(
        InterviewResponse(
            session_id=session.id,
            question_text=question_text,
            response_text=response_text,
            category=category,
            ai_score=eval_result["score"],
            ai_feedback=eval_result["feedback"],
        )
    )
    db.commit()

    history, categories, topics, scores = _load_session_history(db, session.id)
    response_count = len(history)

    if response_count >= TOTAL_QUESTIONS:
        session.status = SessionStatus.COMPLETED
        session.completed_at = datetime.now(timezone.utc)
        db.commit()
        return {
            "score": eval_result["score"],
            "feedback": eval_result["feedback"],
            "next_question": None,
            "next_category": None,
            "question_number": response_count,
            "total_questions": TOTAL_QUESTIONS,
            "interview_complete": True,
        }

    ctx = build_interview_context(
        candidate,
        session,
        db,
        question_number=response_count + 1,
        conversation_history=history,
        categories_covered=categories,
        topics_asked=topics,
        response_scores=scores,
    )
    next_q = await ai_interviewer.generate_next_question(ctx)

    return {
        "score": eval_result["score"],
        "feedback": eval_result["feedback"],
        "next_question": next_q["question"],
        "next_category": next_q.get("category", "behavioral"),
        "question_number": response_count + 1,
        "total_questions": TOTAL_QUESTIONS,
        "interview_complete": False,
    }
