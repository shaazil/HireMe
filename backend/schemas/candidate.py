"""
Candidate profile schemas.
"""

from pydantic import BaseModel
from datetime import datetime


class CandidateProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None = None
    position: str | None = None
    resume_url: str | None = None
    skills: list[str] | None = None
    experience_years: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    position: str | None = None
    experience_years: int | None = None


class ResumeAnalysis(BaseModel):
    skills: list[str]
    experience_years: int | None = None
    summary: str
    projects: list[str]
    education: list[str]
