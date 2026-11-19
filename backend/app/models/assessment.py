from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium")  # easy, medium, hard
    topic: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # Arrays, Trees, Graphs, DP, SQL
    primary_skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    expected_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    constraints: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_cases_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of {input, expected_output, is_hidden}
    starter_code_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON map of {python, java, javascript}
    solution_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    time_limit_ms: Mapped[int] = mapped_column(Integer, default=2000)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=128)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class CodingAssessment(Base):
    __tablename__ = "coding_assessments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed, abandoned
    score: Mapped[float] = mapped_column(Float, default=0.0)
    total_questions: Mapped[int] = mapped_column(Integer, default=1)
    completed_questions: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    submissions = relationship("CodingSubmission", back_populates="assessment", cascade="all, delete-orphan")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    assessment_id: Mapped[int | None] = mapped_column(ForeignKey("coding_assessments.id", ondelete="SET NULL"), nullable=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("coding_questions.id"), index=True, nullable=False)
    language: Mapped[str] = mapped_column(String(50), default="python")
    code: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="accepted")  # accepted, wrong_answer, time_limit_exceeded, runtime_error
    score: Mapped[float] = mapped_column(Float, default=100.0)
    runtime_ms: Mapped[int] = mapped_column(Integer, default=45)
    memory_kb: Mapped[int] = mapped_column(Integer, default=14200)
    test_cases_passed: Mapped[int] = mapped_column(Integer, default=5)
    total_test_cases: Mapped[int] = mapped_column(Integer, default=5)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_mistakes: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    assessment = relationship("CodingAssessment", back_populates="submissions")
    question = relationship("CodingQuestion")
