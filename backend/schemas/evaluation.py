"""
Evaluation report schemas.
"""

from pydantic import BaseModel
from datetime import datetime


class EvaluationReportResponse(BaseModel):
    id: str
    session_id: str
    overall_score: float
    interview_score: float
    coding_score: float
    communication_score: float
    technical_score: float
    behavioral_score: float
    strengths: list[str]
    improvements: list[str]
    ai_summary: str
    recommendation: str
    generated_at: datetime

    # Session / application
    candidate_name: str | None = None
    role_applied: str | None = None
    application_status: str | None = None

    # Candidate profile (for recruiter review)
    candidate_email: str | None = None
    candidate_phone: str | None = None
    candidate_position: str | None = None
    experience_years: int | None = None
    skills: list[str] | None = None
    resume_text: str | None = None
    resume_filename: str | None = None

    # Vacancy context
    vacancy_title: str | None = None
    vacancy_company: str | None = None

    model_config = {"from_attributes": True}
