"""
Interview session and response models.
Stores the full conversation transcript with timestamps for replay.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from models.base import Base


class InteractionMode(str, enum.Enum):
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"


class SessionStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    INTERVIEWED = "interviewed"
    UNDER_REVIEW = "under_review"
    HIRED = "hired"
    REJECTED = "rejected"


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    candidate_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    vacancy_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=True
    )
    role_applied: Mapped[str | None] = mapped_column(String(255), nullable=True)
    interaction_mode: Mapped[str] = mapped_column(
        SAEnum(InteractionMode, native_enum=False, length=10),
        nullable=False,
        default=InteractionMode.TEXT,
    )
    status: Mapped[str] = mapped_column(
        SAEnum(SessionStatus, native_enum=False, length=20),
        nullable=False,
        default=SessionStatus.IN_PROGRESS,
    )
    application_status: Mapped[str] = mapped_column(
        SAEnum(ApplicationStatus, native_enum=False, length=20),
        nullable=False,
        default=ApplicationStatus.APPLIED,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="interview_sessions")
    vacancy = relationship("Vacancy", back_populates="interviews")
    responses = relationship(
        "InterviewResponse", back_populates="session", cascade="all, delete-orphan"
    )
    coding_submissions = relationship(
        "CodingSubmission", back_populates="session", cascade="all, delete-orphan"
    )
    evaluation = relationship(
        "EvaluationReport", back_populates="session", uselist=False
    )


class InterviewResponse(Base):
    """Stores each question–answer exchange with AI scoring and timestamps."""

    __tablename__ = "interview_responses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("question_bank.id"), nullable=True
    )
    # Denormalized — the actual question text asked (may be AI-generated, not in bank)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="behavioral")
    ai_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    responded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    session = relationship("InterviewSession", back_populates="responses")
