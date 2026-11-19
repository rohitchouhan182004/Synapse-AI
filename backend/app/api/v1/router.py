from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, students, dashboard, digital_twin,
    skills, coding, interviews, careers, roadmaps, analytics
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(dashboard.router)
api_router.include_router(digital_twin.router)
api_router.include_router(skills.router)
api_router.include_router(coding.router)
api_router.include_router(interviews.router)
api_router.include_router(careers.router)
api_router.include_router(roadmaps.router)
api_router.include_router(analytics.router)
