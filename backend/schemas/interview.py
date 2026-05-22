"""
Interview session and response schemas.
"""

from pydantic import BaseModel
from datetime import datetime


class StartInterviewRequest(BaseModel):
    vacancy_id: str | None = None
    role_applied: str | None = None
    interaction_mode: str = "text"  # text, audio, video


class StartInterviewResponse(BaseModel):
    session_id: str
    first_question: str
    category: str
    question_number: int
    total_questions: int


class SubmitResponseRequest(BaseModel):
    session_id: str
    question_text: str
    response_text: str
    category: str = "behavioral"


class SubmitResponseResponse(BaseModel):
    score: float
    feedback: str
    next_question: str | None = None
    next_category: str | None = None
    question_number: int
    total_questions: int
    interview_complete: bool = False


class InterviewResponseItem(BaseModel):
    question_text: str
    response_text: str
    category: str
    ai_score: float | None = None
    ai_feedback: str | None = None
    responded_at: datetime

    model_config = {"from_attributes": True}


class VacancySummary(BaseModel):
    title: str
    company: str

class InterviewSessionSummary(BaseModel):
    id: str
    role_applied: str | None = None
    status: str
    application_status: str
    interaction_mode: str
    started_at: datetime
    completed_at: datetime | None = None
    response_count: int = 0
    average_score: float | None = None
    vacancy: VacancySummary | None = None

    model_config = {"from_attributes": True}
