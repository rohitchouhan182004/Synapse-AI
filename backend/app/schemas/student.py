from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class StudentOnboardingRequest(BaseModel):
    full_name: str
    university: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
    current_semester: Optional[int] = None
    experience_level: str = "beginner"
    target_role: str = "Backend Developer"
    career_interests: List[str] = []
    declared_skills: List[dict] = []  # [{skill_slug: str, self_reported_score: float}]


class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
    current_semester: Optional[int] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    career_interests: Optional[List[str]] = None


class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    university: Optional[str] = None
    degree: Optional[str] = None
    specialization: Optional[str] = None
    graduation_year: Optional[int] = None
    current_semester: Optional[int] = None
    experience_level: str
    target_role: Optional[str] = None
    career_interests: List[str] = []
    profile_completion: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
