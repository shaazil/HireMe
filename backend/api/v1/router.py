"""
Top-level API v1 router — aggregates all route modules.
"""

from fastapi import APIRouter

from api.v1.auth import router as auth_router
from api.v1.candidates import router as candidates_router
from api.v1.interviews import router as interviews_router
from api.v1.coding import router as coding_router
from api.v1.evaluations import router as evaluations_router
from api.v1.recruiter import router as recruiter_router
from api.v1.vacancies import router as vacancies_router
from api.v1.settings import router as settings_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(candidates_router)
router.include_router(interviews_router)
router.include_router(coding_router)
router.include_router(evaluations_router)
router.include_router(recruiter_router)
router.include_router(vacancies_router)
router.include_router(settings_router)
