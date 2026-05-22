"""
Shared FastAPI dependencies: database session, current user extraction.
"""

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database.session import get_db
from models.user import User, UserRole
from models.candidate import Candidate
from utils.security import decode_access_token

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from the JWT token in cookies or headers."""
    token = request.cookies.get("hireme_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
        
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def get_or_create_candidate(db: Session, user: User) -> Candidate:
    """Return existing candidate profile or auto-create one for users missing it."""
    candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
    if candidate:
        return candidate

    if user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=403, detail="Only candidates can access this resource")

    candidate = Candidate(
        user_id=user.id,
        name=user.email.split("@")[0],
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

