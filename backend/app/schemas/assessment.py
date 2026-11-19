from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CodingQuestionOut(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    difficulty: str
    topic: str
    constraints: Optional[str] = None
    starter_code: Dict[str, str] = {}
    sample_test_cases: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class CodingSubmissionCreate(BaseModel):
    question_id: int
    language: str
    code: str


class CodingSubmissionOut(BaseModel):
    id: int
    question_id: int
    question_title: str
    language: str
    status: str
    score: float
    runtime_ms: int
    memory_kb: int
    test_cases_passed: int
    total_test_cases: int
    feedback: Optional[str] = None
    detected_mistakes: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True
