"""
Coding challenge routes — session-aware challenge selection, code submission.
Difficulty is internal only and never returned to clients.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from api.deps import get_current_user
from models.user import User
from models.candidate import Candidate
from models.interview import InterviewSession
from models.coding import CodingChallenge, CodingSubmission
from schemas.coding import CodingChallengeResponse, SubmitCodeRequest, SubmitCodeResponse
from services import coding_service

router = APIRouter(prefix="/coding", tags=["Coding"])


@router.get("/challenge", response_model=CodingChallengeResponse)
async def get_challenge(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a personalized coding challenge for an interview session."""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate or session.candidate_id != candidate.id:
        raise HTTPException(status_code=403, detail="Not your session")

    try:
        challenge_data = await coding_service.get_challenge_for_session(db, candidate, session)
    except ValueError:
        raise HTTPException(status_code=404, detail="No coding challenges available")

    return CodingChallengeResponse(**challenge_data)


@router.post("/submit", response_model=SubmitCodeResponse)
async def submit_code(
    body: SubmitCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit code for evaluation."""
    session = db.query(InterviewSession).filter(InterviewSession.id == body.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    challenge = db.query(CodingChallenge).filter(CodingChallenge.id == body.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    result = await coding_service.evaluate_submission(body.code, body.language, challenge)

    submission = CodingSubmission(
        session_id=body.session_id,
        challenge_id=body.challenge_id,
        code=body.code,
        language=body.language,
        score=result["score"],
        passed_tests=result["passed"],
        total_tests=result["total"],
        runtime_ms=result.get("runtime_ms"),
        memory_kb=result.get("memory_kb"),
        ai_feedback=result["ai_feedback"],
    )
    db.add(submission)
    db.commit()

    return SubmitCodeResponse(
        score=result["score"],
        passed_tests=result["passed"],
        total_tests=result["total"],
        runtime_ms=result.get("runtime_ms"),
        memory_kb=result.get("memory_kb"),
        ai_feedback=result["ai_feedback"],
        test_results=result.get("test_results"),
    )
