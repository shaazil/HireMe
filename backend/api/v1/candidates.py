"""
Candidate routes — profile, resume upload, interview history.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database.session import get_db
from api.deps import get_current_user
from models.user import User, UserRole
from models.candidate import Candidate
from models.interview import InterviewSession
from schemas.candidate import CandidateProfile, CandidateUpdate
from schemas.interview import InterviewSessionSummary

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/me", response_model=CandidateProfile)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Not a candidate account")
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profile not found")
    return CandidateProfile(
        id=candidate.id,
        name=candidate.name,
        email=current_user.email,
        phone=candidate.phone,
        position=candidate.position,
        resume_url=candidate.resume_url,
        skills=candidate.skills,
        experience_years=candidate.experience_years,
        created_at=candidate.created_at,
    )


@router.patch("/me", response_model=CandidateProfile)
def update_profile(
    body: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)
    db.commit()
    db.refresh(candidate)

    return CandidateProfile(
        id=candidate.id,
        name=candidate.name,
        email=current_user.email,
        phone=candidate.phone,
        position=candidate.position,
        resume_url=candidate.resume_url,
        skills=candidate.skills,
        experience_years=candidate.experience_years,
        created_at=candidate.created_at,
    )


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload and parse a PDF resume."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Read and extract text from PDF
    try:
        from PyPDF2 import PdfReader
        import io

        content = await file.read()
        reader = PdfReader(io.BytesIO(content))
        text = " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse PDF: {e}")

    # Store extracted text
    candidate.resume_text = text.strip()
    candidate.resume_url = file.filename

    # Try AI-powered analysis
    try:
        from ai import provider
        if provider.is_available():
            analysis = await provider.generate_json(
                f"Extract skills, experience years, and a brief summary from this resume:\n\n{text[:3000]}",
                "Respond as JSON: {\"skills\": [\"skill1\"], \"experience_years\": 2, \"summary\": \"brief summary\"}",
            )
            if analysis.get("skills"):
                candidate.skills = analysis["skills"]
            if analysis.get("experience_years"):
                candidate.experience_years = analysis["experience_years"]
    except Exception:
        pass  # AI analysis is optional

    db.commit()

    return {
        "message": "Resume uploaded and parsed successfully",
        "filename": file.filename,
        "text_length": len(candidate.resume_text or ""),
        "skills": candidate.skills,
    }


@router.get("/history", response_model=list[InterviewSessionSummary])
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Profile not found")

    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.candidate_id == candidate.id)
        .order_by(InterviewSession.started_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        scores = [r.ai_score for r in s.responses if r.ai_score is not None]
        vacancy_data = None
        if s.vacancy:
            vacancy_data = {"title": s.vacancy.title, "company": s.vacancy.company}
        
        result.append(
            InterviewSessionSummary(
                id=s.id,
                role_applied=s.role_applied,
                status=s.status,
                application_status=s.application_status.value if hasattr(s.application_status, "value") else s.application_status,
                interaction_mode=s.interaction_mode,
                started_at=s.started_at,
                completed_at=s.completed_at,
                response_count=len(s.responses),
                average_score=round(sum(scores) / len(scores), 1) if scores else None,
                vacancy=vacancy_data
            )
        )
    return result
