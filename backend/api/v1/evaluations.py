"""
Evaluation routes — generate and retrieve interview reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database.session import get_db
from api.deps import get_current_user
from models.user import User, UserRole
from models.candidate import Candidate
from models.vacancy import Vacancy
from models.recruiter import Recruiter
from models.interview import InterviewSession, InterviewResponse
from models.coding import CodingSubmission
from models.evaluation import EvaluationReport
from schemas.evaluation import EvaluationReportResponse
from ai import evaluator as ai_evaluator

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


def _normalize_skills(skills) -> list[str]:
    if not skills:
        return []
    if isinstance(skills, list):
        return [str(s) for s in skills]
    if isinstance(skills, dict):
        return [str(k) for k in skills.keys()]
    return []


def _assert_can_view_session(session: InterviewSession, user: User, db: Session) -> None:
    """Candidates see own sessions; recruiters see sessions for their vacancies."""
    if user.role == UserRole.CANDIDATE:
        candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
        if not candidate or session.candidate_id != candidate.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this report")
        return

    if user.role == UserRole.RECRUITER:
        if not session.vacancy_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this report")
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == user.id).first()
        vacancy = db.query(Vacancy).filter(Vacancy.id == session.vacancy_id).first()
        if not recruiter or not vacancy or vacancy.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this report")
        return

    raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/{session_id}", response_model=EvaluationReportResponse)
async def get_evaluation(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get or generate the evaluation report for an interview session."""
    session = (
        db.query(InterviewSession)
        .options(joinedload(InterviewSession.vacancy))
        .filter(InterviewSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    _assert_can_view_session(session, current_user, db)

    candidate = (
        db.query(Candidate)
        .options(joinedload(Candidate.user))
        .filter(Candidate.id == session.candidate_id)
        .first()
    )

    # Check if report already exists
    existing = db.query(EvaluationReport).filter(EvaluationReport.session_id == session_id).first()
    if existing:
        return _report_to_response(existing, candidate, session)

    # Generate new report
    responses = (
        db.query(InterviewResponse)
        .filter(InterviewResponse.session_id == session_id)
        .order_by(InterviewResponse.responded_at)
        .all()
    )

    coding_sub = (
        db.query(CodingSubmission)
        .filter(CodingSubmission.session_id == session_id)
        .order_by(CodingSubmission.submitted_at.desc())
        .first()
    )

    # Build data for AI evaluation
    responses_data = [
        {
            "question": r.question_text,
            "response": r.response_text,
            "category": r.category,
            "score": r.ai_score,
        }
        for r in responses
    ]

    coding_data = None
    if coding_sub:
        coding_data = {
            "language": coding_sub.language,
            "passed": coding_sub.passed_tests or 0,
            "total": coding_sub.total_tests or 0,
            "score": coding_sub.score or 0,
        }
        if coding_sub.challenge:
            coding_data["title"] = coding_sub.challenge.title
        if coding_sub.ai_feedback:
            coding_data["feedback"] = coding_sub.ai_feedback

    job_context = None
    if session.vacancy:
        job_context = f"{session.vacancy.title} at {session.vacancy.company}"
        if session.vacancy.description:
            job_context += f" — {session.vacancy.description[:400]}"

    report_data = await ai_evaluator.generate_evaluation_report(
        candidate_name=candidate.name if candidate else "Unknown",
        role=session.role_applied or "Software Engineer",
        responses=responses_data,
        coding_result=coding_data,
        resume_summary=candidate.resume_text[:1200] if candidate and candidate.resume_text else None,
        job_context=job_context,
    )

    # Store report
    report = EvaluationReport(
        session_id=session_id,
        overall_score=report_data.get("overall_score", 3.0),
        interview_score=report_data.get("interview_score", 3.0),
        coding_score=report_data.get("coding_score", 0.0),
        communication_score=report_data.get("communication_score", 3.0),
        technical_score=report_data.get("technical_score", 3.0),
        behavioral_score=report_data.get("behavioral_score", 3.0),
        strengths=report_data.get("strengths", []),
        improvements=report_data.get("improvements", []),
        ai_summary=report_data.get("ai_summary", ""),
        recommendation=report_data.get("recommendation", "maybe"),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return _report_to_response(report, candidate, session)


def _report_to_response(
    report: EvaluationReport,
    candidate: Candidate | None,
    session: InterviewSession,
) -> EvaluationReportResponse:
    vacancy = session.vacancy
    email = candidate.user.email if candidate and candidate.user else None

    return EvaluationReportResponse(
        id=report.id,
        session_id=report.session_id,
        overall_score=report.overall_score,
        interview_score=report.interview_score,
        coding_score=report.coding_score,
        communication_score=report.communication_score,
        technical_score=report.technical_score,
        behavioral_score=report.behavioral_score,
        strengths=report.strengths or [],
        improvements=report.improvements or [],
        ai_summary=report.ai_summary or "",
        recommendation=report.recommendation,
        generated_at=report.generated_at,
        candidate_name=candidate.name if candidate else None,
        role_applied=session.role_applied,
        application_status=(
            session.application_status.value
            if hasattr(session.application_status, "value")
            else session.application_status
        ),
        candidate_email=email,
        candidate_phone=candidate.phone if candidate else None,
        candidate_position=candidate.position if candidate else None,
        experience_years=candidate.experience_years if candidate else None,
        skills=_normalize_skills(candidate.skills) if candidate else [],
        resume_text=candidate.resume_text if candidate else None,
        resume_filename=candidate.resume_url if candidate else None,
        vacancy_title=vacancy.title if vacancy else None,
        vacancy_company=vacancy.company if vacancy else None,
    )
