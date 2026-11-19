from typing import List, Optional
from pydantic import BaseModel


class RoleSkillRequirementOut(BaseModel):
    skill_name: str
    skill_slug: str
    category: str
    importance_weight: float
    expected_proficiency: float
    student_proficiency: float = 0.0
    student_confidence: float = 0.0
    is_mandatory: bool


class CareerRoleOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    market_demand: str
    alignment_score: float = 0.0
    readiness_score: float = 0.0
    evidence_coverage: float = 0.0
    strengths: List[str] = []
    gaps: List[str] = []
    explanation: Optional[str] = None
    requirements: List[RoleSkillRequirementOut] = []

    class Config:
        from_attributes = True


class CareerCompareRequest(BaseModel):
    role_ids: List[int]


class CareerCompareResponse(BaseModel):
    roles: List[CareerRoleOut]
    shared_skills: List[str] = []
    unique_requirements: dict = {}
