"""
Coding challenge and submission schemas.
"""

from pydantic import BaseModel
from datetime import datetime


class CodingChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    starter_code: dict | None = None
    time_limit_ms: int = 5000
    memory_limit_kb: int = 256000
    public_test_cases: list[dict] | None = None
    constraints: list[str] | None = None

    model_config = {"from_attributes": True}


class SubmitCodeRequest(BaseModel):
    session_id: str
    challenge_id: str
    code: str
    language: str = "python"


class SubmitCodeResponse(BaseModel):
    score: float
    passed_tests: int
    total_tests: int
    runtime_ms: int | None = None
    memory_kb: int | None = None
    ai_feedback: str
    test_results: list[dict] | None = None
