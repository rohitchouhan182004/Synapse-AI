from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class InterviewSessionCreate(BaseModel):
    category: str = "technical"
    topic: str = "Backend Architecture"
    difficulty: str = "intermediate"


class InterviewQuestionOut(BaseModel):
    id: int
    order_index: int
    question_text: str
    topic: str

    class Config:
        from_attributes = True


class InterviewAnswerSubmit(BaseModel):
    question_id: int
    student_answer: str


class InterviewAnswerOut(BaseModel):
    question_id: int
    technical_score: float
    conceptual_depth_score: float
    communication_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    feedback_text: Optional[str] = None


class InterviewSessionOut(BaseModel):
    id: int
    title: str
    category: str
    difficulty: str
    topic: str
    status: str
    overall_score: float
    technical_score: float
    communication_score: float
    clarity_score: float
    feedback_summary: Optional[str] = None
    created_at: datetime
    questions: List[InterviewQuestionOut] = []

    class Config:
        from_attributes = True
