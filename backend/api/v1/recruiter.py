from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from models.candidate import Candidate
from models.interview import InterviewSession, SessionStatus, ApplicationStatus
from models.evaluation import EvaluationReport
from models.vacancy import Vacancy
from models.user import User, UserRole
from api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])

@router.get("/candidates")
def list_candidates(
    vacancy_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all completed sessions and their evaluations for the recruiter dashboard."""
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can access this")
        
    query = (
        db.query(InterviewSession)
        .join(Vacancy, InterviewSession.vacancy_id == Vacancy.id)
        .filter(Vacancy.recruiter_id == current_user.recruiter.id)
        .filter(InterviewSession.status == SessionStatus.COMPLETED)
    )
    
    if vacancy_id:
        query = query.filter(InterviewSession.vacancy_id == vacancy_id)
        
    sessions = query.order_by(InterviewSession.completed_at.desc()).all()
    
    results = []
    for s in sessions:
        candidate = db.query(Candidate).filter(Candidate.id == s.candidate_id).first()
        report = db.query(EvaluationReport).filter(EvaluationReport.session_id == s.id).first()
        
        results.append({
            "session_id": s.id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "candidate_email": candidate.user.email if candidate and candidate.user else None,
            "role_applied": s.role_applied,
            "vacancy_id": s.vacancy_id,
            "application_status": s.application_status,
            "completed_at": s.completed_at,
            "score": report.overall_score if report else None,
            "recommendation": report.recommendation if report else "pending",
            "resume_url": candidate.resume_url if candidate else None,
        })
        
    return {"data": results}

class StatusUpdateRequest(BaseModel):
    status: str

@router.post("/applications/{session_id}/status")
def update_application_status(
    session_id: str,
    body: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can update status")
        
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Verify this recruiter owns the vacancy
    vacancy = db.query(Vacancy).filter(Vacancy.id == session.vacancy_id).first()
    if not vacancy or vacancy.recruiter_id != current_user.recruiter.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
        
    session.application_status = ApplicationStatus(body.status)
    db.commit()
    
    # Auto-close logic if hired
    if session.application_status == ApplicationStatus.HIRED and vacancy.max_slots is not None:
        hired_count = db.query(InterviewSession).filter(
            InterviewSession.vacancy_id == vacancy.id,
            InterviewSession.application_status == ApplicationStatus.HIRED
        ).count()
        
        if hired_count >= vacancy.max_slots:
            vacancy.is_active = False
            db.commit()
    
    return {"status": "success", "new_status": session.application_status}
