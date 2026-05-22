"""
Interview routes — start session, submit responses, get next question.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from api.deps import get_current_user
from models.user import User
from models.candidate import Candidate
from models.interview import InterviewSession, InterviewResponse, SessionStatus
from schemas.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitResponseRequest,
    SubmitResponseResponse,
)
from services import interview_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])

TOTAL_QUESTIONS = interview_service.TOTAL_QUESTIONS


@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(
    body: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    result = await interview_service.start_interview(
        db,
        candidate,
        vacancy_id=body.vacancy_id,
        role_applied=body.role_applied,
        interaction_mode=body.interaction_mode,
    )

    return StartInterviewResponse(**result)


@router.post("/respond", response_model=SubmitResponseResponse)
async def submit_response(
    body: SubmitResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == body.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate or session.candidate_id != candidate.id:
        raise HTTPException(status_code=403, detail="Not your session")

    if session.status != SessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Interview session is no longer active")

    result = await interview_service.submit_interview_response(
        db,
        candidate,
        session,
        question_text=body.question_text,
        response_text=body.response_text,
        category=body.category,
    )

    return SubmitResponseResponse(**result)


@router.get("/{session_id}/status")
def get_session_status(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    response_count = (
        db.query(InterviewResponse)
        .filter(InterviewResponse.session_id == session.id)
        .count()
    )

    return {
        "session_id": session.id,
        "status": session.status,
        "interaction_mode": session.interaction_mode,
        "role_applied": session.role_applied,
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "response_count": response_count,
        "total_questions": TOTAL_QUESTIONS,
    }
