from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class SkillOut(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    difficulty_level: int
    parent_skill_id: Optional[int] = None

    class Config:
        from_attributes = True


class StudentSkillOut(BaseModel):
    id: int
    skill_id: int
    name: str
    slug: str
    category: str
    proficiency_score: float
    confidence_score: float
    evidence_count: int
    self_reported_score: Optional[float] = None
    assessed_score: Optional[float] = None
    trend_direction: str
    velocity_score: float
    last_assessed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SkillEvidenceOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    source_type: str
    raw_score: float
    normalized_score: float
    difficulty_weight: float
    evidence_quality: float
    created_at: datetime

    class Config:
        from_attributes = True


class SkillDetailOut(BaseModel):
    skill: StudentSkillOut
    prerequisites: List[SkillOut] = []
    dependents: List[SkillOut] = []
    evidence_history: List[SkillEvidenceOut] = []
    explanation: Optional[str] = None
