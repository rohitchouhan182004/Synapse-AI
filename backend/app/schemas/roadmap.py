from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class RoadmapTaskOut(BaseModel):
    id: int
    phase_number: int
    phase_title: str
    order_index: int
    title: str
    description: str
    rationale: Optional[str] = None
    priority: str
    estimated_hours: float
    prerequisites: List[str] = []
    status: str
    completion_criteria: Optional[str] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LearningRoadmapOut(BaseModel):
    id: int
    title: str
    target_role_name: str
    current_phase: int
    total_phases: int
    status: str
    progress_percentage: float
    tasks: List[RoadmapTaskOut] = []

    class Config:
        from_attributes = True


class RoadmapGenerateRequest(BaseModel):
    target_role_name: Optional[str] = None
