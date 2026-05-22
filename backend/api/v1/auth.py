"""
Authentication routes — register, login, current user info.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from database.session import get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from services.auth_service import register_user, login_user
from api.deps import get_current_user
from models.user import User
from utils.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    try:
        result = register_user(
            db=db,
            email=body.email,
            password=body.password,
            name=body.name,
            role=body.role,
            company=body.company,
            position=body.position,
        )
        response.set_cookie(
            key="hireme_token",
            value=result["access_token"],
            httponly=True,
            samesite="lax",
            secure=False,  # Set to True in production (HTTPS)
            max_age=86400 * 7,
        )
        return UserResponse(
            id=result["user_id"],
            email=body.email,
            role=result["role"],
            name=result["name"],
            company=result.get("company")
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=UserResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        result = login_user(db=db, email=body.email, password=body.password)
        response.set_cookie(
            key="hireme_token",
            value=result["access_token"],
            httponly=True,
            samesite="lax",
            secure=False,  # Set to True in production (HTTPS)
            max_age=86400 * 7,
        )
        return UserResponse(
            id=result["user_id"],
            email=body.email,
            role=result["role"],
            name=result["name"],
            company=result.get("company")
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="hireme_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"status": "success"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    name = ""
    company = None
    if current_user.candidate:
        name = current_user.candidate.name
    elif current_user.recruiter:
        name = current_user.recruiter.name
        company = current_user.recruiter.company
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        name=name,
        company=company,
    )
