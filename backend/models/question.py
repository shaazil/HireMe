"""
Question bank model — stores interview questions with categories and difficulty.
"""

import uuid

from sqlalchemy import String, Text, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum

from models.base import Base


class QuestionCategory(str, enum.Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    PROBLEM_SOLVING = "problem_solving"
    COMMUNICATION = "communication"


class QuestionDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionBank(Base):
    __tablename__ = "question_bank"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(
        SAEnum(QuestionCategory, native_enum=False, length=30), nullable=False
    )
    difficulty: Mapped[str] = mapped_column(
        SAEnum(QuestionDifficulty, native_enum=False, length=10),
        nullable=False,
        default=QuestionDifficulty.MEDIUM,
    )
    role_tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
