"""
Auth request/response schemas.
"""

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "candidate"  # "candidate" or "recruiter"
    company: str | None = None
    position: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    name: str
    company: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: str
    company: str | None = None

    model_config = {"from_attributes": True}
