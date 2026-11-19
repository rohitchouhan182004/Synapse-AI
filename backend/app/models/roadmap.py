from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    role_id: Mapped[int | None] = mapped_column(ForeignKey("career_roles.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_role_name: Mapped[str] = mapped_column(String(100), default="Backend Developer")
    current_phase: Mapped[int] = mapped_column(Integer, default=1)
    total_phases: Mapped[int] = mapped_column(Integer, default=4)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, completed, archived
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.order_index")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    roadmap_id: Mapped[int] = mapped_column(ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    phase_number: Mapped[int] = mapped_column(Integer, default=1)
    phase_title: Mapped[str] = mapped_column(String(255), default="Foundation")
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="high")  # critical, high, medium, low
    estimated_hours: Mapped[float] = mapped_column(Float, default=5.0)
    prerequisites_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list of task titles / skill names
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, in_progress, completed
    completion_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    roadmap = relationship("LearningRoadmap", back_populates="tasks")
    skill = relationship("Skill")


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("roadmap_tasks.id"), nullable=True)
    activity_type: Mapped[str] = mapped_column(String(50), default="practice")  # practice, video, reading, project
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    score_achieved: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
