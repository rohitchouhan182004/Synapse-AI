from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)  # 1 to 5
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent_skill = relationship("Skill", remote_side=[id], backref="sub_skills")
    student_skills = relationship("StudentSkill", back_populates="skill")
    evidence = relationship("SkillEvidence", back_populates="skill")


class SkillRelationship(Base):
    __tablename__ = "skill_relationships"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source_skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    target_skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    relationship_type: Mapped[str] = mapped_column(String(50), default="prerequisite")  # prerequisite, corequisite, child_of
    strength_weight: Mapped[float] = mapped_column(Float, default=1.0)


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    proficiency_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)   # 0 to 100
    evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    self_reported_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    assessed_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    trend_direction: Mapped[str] = mapped_column(String(20), default="stable")  # improving, stable, declining
    velocity_score: Mapped[float] = mapped_column(Float, default=0.0)
    last_assessed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")
