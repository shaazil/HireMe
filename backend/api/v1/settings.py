"""
Settings API router for candidate and recruiter profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import os
import shutil

from database.session import get_db
from api.deps import get_current_user, get_or_create_candidate
from models.user import User, UserRole
from models.candidate import Candidate
from models.recruiter import Recruiter

router = APIRouter(prefix="/settings", tags=["Settings"])

UPLOAD_DIR = "uploads"

# --- Candidate Schemas ---
class CandidateSettingsUpdate(BaseModel):
    name: str
    phone: str | None = None
    position: str | None = None
    skills: list[str] | None = None
    experience_years: int | None = None

class CandidateSettingsResponse(BaseModel):
    name: str
    phone: str | None
    position: str | None
    resume_url: str | None
    skills: list[str] | None
    experience_years: int | None

# --- Recruiter Schemas ---
class RecruiterSettingsUpdate(BaseModel):
    name: str
    company: str | None = None
    title: str | None = None

class RecruiterSettingsResponse(BaseModel):
    name: str
    company: str | None
    title: str | None

# --- Candidate Endpoints ---

@router.get("/candidate", response_model=CandidateSettingsResponse)
def get_candidate_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Not a candidate")
    
    candidate = get_or_create_candidate(db, current_user)
        
    return {
        "name": candidate.name,
        "phone": candidate.phone,
        "position": candidate.position,
        "resume_url": candidate.resume_url,
        "skills": candidate.skills,
        "experience_years": candidate.experience_years
    }

@router.put("/candidate", response_model=CandidateSettingsResponse)
def update_candidate_settings(
    body: CandidateSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Not a candidate")
        
    candidate = get_or_create_candidate(db, current_user)
        
    candidate.name = body.name
    candidate.phone = body.phone
    candidate.position = body.position
    candidate.skills = body.skills
    candidate.experience_years = body.experience_years
    
    db.commit()
    db.refresh(candidate)
    
    return {
        "name": candidate.name,
        "phone": candidate.phone,
        "position": candidate.position,
        "resume_url": candidate.resume_url,
        "skills": candidate.skills,
        "experience_years": candidate.experience_years
    }

@router.post("/candidate/resume")
def upload_candidate_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Not a candidate")
        
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    candidate = get_or_create_candidate(db, current_user)

    # Generate a unique filename
    ext = ".pdf"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Remove old resume if it exists
    if candidate.resume_url:
        old_filename = candidate.resume_url.split("/")[-1]
        old_path = os.path.join(UPLOAD_DIR, old_filename)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass
                
    # Update DB
    resume_url = f"{os.getenv('API_URL', 'http://localhost:8000')}/uploads/{unique_filename}"
    candidate.resume_url = resume_url
    db.commit()
    
    return {"status": "success", "resume_url": resume_url}


# --- Recruiter Endpoints ---

@router.get("/recruiter", response_model=RecruiterSettingsResponse)
def get_recruiter_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Not a recruiter")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    return {
        "name": recruiter.name,
        "company": recruiter.company,
        "title": recruiter.title
    }

@router.put("/recruiter", response_model=RecruiterSettingsResponse)
def update_recruiter_settings(
    body: RecruiterSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Not a recruiter")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    recruiter.name = body.name
    recruiter.company = body.company
    recruiter.title = body.title
    
    db.commit()
    db.refresh(recruiter)
    
    return {
        "name": recruiter.name,
        "company": recruiter.company,
        "title": recruiter.title
    }
