"""
Vacancies API router.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.session import get_db
from api.deps import get_current_user
from models.user import User, UserRole
from models.vacancy import Vacancy
from models.recruiter import Recruiter
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="/vacancies", tags=["Vacancies"])


def _ensure_utc(dt: datetime) -> datetime:
    """Normalize datetimes for safe comparison (SQLite may return naive values)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _is_deadline_passed(deadline: datetime | None, now: datetime | None = None) -> bool:
    if not deadline:
        return False
    now = now or datetime.now(timezone.utc)
    return _ensure_utc(deadline) < _ensure_utc(now)

class VacancyCreate(BaseModel):
    title: str
    company: str
    location: str | None = None
    description: str | None = None
    max_slots: int | None = None
    deadline: datetime | None = None

class VacancyResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    company: str
    location: str | None
    description: str | None
    max_slots: int | None
    deadline: datetime | None
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}

@router.post("", response_model=VacancyResponse)
def create_vacancy(
    body: VacancyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can create vacancies")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
        
    deadline = _ensure_utc(body.deadline) if body.deadline else None

    vacancy = Vacancy(
        recruiter_id=recruiter.id,
        title=body.title,
        company=body.company,
        location=body.location,
        description=body.description,
        max_slots=body.max_slots,
        deadline=deadline,
    )
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    return vacancy

@router.get("", response_model=List[VacancyResponse])
def list_vacancies(db: Session = Depends(get_db)):
    """List all active vacancies for candidates (excludes closed and past-deadline roles)."""
    vacancies = (
        db.query(Vacancy)
        .filter(Vacancy.is_active == True)
        .order_by(Vacancy.created_at.desc())
        .all()
    )

    return [v for v in vacancies if not _is_deadline_passed(v.deadline)]

@router.get("/me", response_model=List[VacancyResponse])
def get_my_vacancies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List vacancies created by the current recruiter"""
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can view their vacancies")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    vacancies = db.query(Vacancy).filter(Vacancy.recruiter_id == recruiter.id).order_by(Vacancy.created_at.desc()).all()
    return vacancies

@router.patch("/{vacancy_id}/close")
def close_vacancy(
    vacancy_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can close vacancies")
        
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if vacancy.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not your vacancy")
        
    vacancy.is_active = False
    db.commit()
    return {"status": "success", "message": "Vacancy closed"}

@router.delete("/{vacancy_id}")
def delete_vacancy(
    vacancy_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can delete vacancies")
        
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
        
    recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if vacancy.recruiter_id != recruiter.id:
        raise HTTPException(status_code=403, detail="Not your vacancy")
        
    db.delete(vacancy)
    db.commit()
    return {"status": "success", "message": "Vacancy deleted"}
