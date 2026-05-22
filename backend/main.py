"""
hireme — FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager
from pythonjsonlogger.jsonlogger import JsonFormatter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from utils.config import get_settings
from database.session import engine, SessionLocal
from models.base import Base
from models.user import User  # noqa: F401 — ensure all models are imported for table creation
from models.candidate import Candidate  # noqa: F401
from models.recruiter import Recruiter  # noqa: F401
from models.vacancy import Vacancy  # noqa: F401
from models.question import QuestionBank  # noqa: F401
from models.interview import InterviewSession, InterviewResponse  # noqa: F401
from models.coding import CodingChallenge, CodingSubmission  # noqa: F401
from models.evaluation import EvaluationReport  # noqa: F401
from database.seed import seed_all
from api.v1.router import router as v1_router
from utils.limiter import limiter

logHandler = logging.StreamHandler()
formatter = JsonFormatter(
    fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
    rename_fields={"levelname": "level", "asctime": "timestamp"}
)
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
# Disable uvicorn default loggers to prevent duplicate output, but let them pass through
logging.getLogger("uvicorn.access").handlers = [logHandler]
logging.getLogger("uvicorn.error").handlers = [logHandler]

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup, seed data, then yield."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Seeding initial data...")
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()

    logger.info("hireme backend is ready.")
    yield
    logger.info("Shutting down hireme backend.")


app = FastAPI(
    title="hireme API",
    description="AI-powered hiring intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(v1_router)

import os

# Mount static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "hireme-api"}
