"""
Coding challenge and submission models.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from models.base import Base


class ChallengeDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class CodingChallenge(Base):
    __tablename__ = "coding_challenges"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(
        SAEnum(ChallengeDifficulty, native_enum=False, length=10),
        nullable=False,
        default=ChallengeDifficulty.MEDIUM,
    )
    # Per-language starter code: {"python": "def solve(...):", "javascript": "function solve(...) {}"}
    starter_code: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Test cases: [{"input": "...", "expected": "...", "hidden": false}, ...]
    test_cases: Mapped[list | None] = mapped_column(JSON, nullable=True)
    time_limit_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=5000)
    memory_limit_kb: Mapped[int] = mapped_column(Integer, nullable=False, default=256000)


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    challenge_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("coding_challenges.id"), nullable=False
    )
    code: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(30), nullable=False, default="python")
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    passed_tests: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_tests: Mapped[int | None] = mapped_column(Integer, nullable=True)
    runtime_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memory_kb: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    session = relationship("InterviewSession", back_populates="coding_submissions")
    challenge = relationship("CodingChallenge")
