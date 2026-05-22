"""
Authentication service — user registration and login logic.
"""

from sqlalchemy.orm import Session

from models.user import User, UserRole
from models.candidate import Candidate
from models.recruiter import Recruiter
from utils.security import hash_password, verify_password, create_access_token


def register_user(
    db: Session,
    email: str,
    password: str,
    name: str,
    role: str = "candidate",
    company: str | None = None,
    position: str | None = None,
) -> dict:
    """Register a new user and create their role-specific profile."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("An account with this email already exists.")

    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        role=UserRole(role),
    )
    db.add(user)
    db.flush()  # Get the user ID before creating profile

    # Create role-specific profile
    if role == "candidate":
        profile = Candidate(user_id=user.id, name=name, position=position)
        db.add(profile)
    elif role == "recruiter":
        profile = Recruiter(user_id=user.id, name=name, company=company)
        db.add(profile)

    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "name": name,
        "company": company if role == "recruiter" else None,
    }


def login_user(db: Session, email: str, password: str) -> dict:
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password.")

    # Get name from profile
    company = None
    if user.role == UserRole.CANDIDATE and user.candidate:
        name = user.candidate.name
    elif user.role == UserRole.RECRUITER and user.recruiter:
        name = user.recruiter.name
        company = user.recruiter.company

    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "name": name,
        "company": company,
    }
