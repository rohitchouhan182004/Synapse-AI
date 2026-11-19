from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.skill import StudentSkillOut
from app.schemas.career import CareerRoleOut


class TwinSnapshotOut(BaseModel):
    id: int
    model_version: str
    overall_readiness: float
    learning_velocity: float
    consistency_score: float
    skill_state: Dict[str, Any]
    role_alignment: Dict[str, Any]
    identified_bottlenecks: List[Dict[str, Any]] = []
    identified_blindspots: List[Dict[str, Any]] = []
    change_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FutureSelfSimulateRequest(BaseModel):
    hypothetical_skills: Dict[str, float]  # e.g. {"dsa": 80.0, "system-design": 70.0}
    target_role_slug: Optional[str] = "backend-developer"


class FutureSelfSimulateResponse(BaseModel):
    current_readiness: float
    projected_readiness: float
    delta_readiness: float
    target_role_slug: str
    current_role_alignment: float
    projected_role_alignment: float
    delta_role_alignment: float
    unlocked_competencies: List[str] = []
    rationale: str
    is_hypothetical: bool = True


class BlindSpotItem(BaseModel):
    skill_name: str
    skill_slug: str
    self_reported_score: float
    assessed_score: float
    discrepancy: float
    nature: str  # overestimation or underestimation
    explanation: str


class DashboardOverviewOut(BaseModel):
    full_name: str
    overall_readiness: float
    learning_momentum: float
    career_alignment_score: float
    interview_readiness_score: float
    primary_target_role: str
    next_best_action: Dict[str, Any]
    top_strengths: List[StudentSkillOut] = []
    identified_bottlenecks: List[Dict[str, Any]] = []
    blind_spots: List[BlindSpotItem] = []
    recent_activity: List[Dict[str, Any]] = []
    recent_changes: List[str] = []
