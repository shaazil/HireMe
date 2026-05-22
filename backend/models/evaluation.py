"""
Evaluation report model — AI-generated assessment with detailed score breakdown.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Float, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from models.base import Base


class Recommendation(str, enum.Enum):
    STRONG_HIRE = "strong_hire"
    HIRE = "hire"
    MAYBE = "maybe"
    PASS = "pass"


class EvaluationReport(Base):
    __tablename__ = "evaluation_reports"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    overall_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    interview_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    coding_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    communication_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    technical_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    behavioral_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    improvements: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str] = mapped_column(
        SAEnum(Recommendation, native_enum=False, length=20),
        nullable=False,
        default=Recommendation.MAYBE,
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    session = relationship("InterviewSession", back_populates="evaluation")
