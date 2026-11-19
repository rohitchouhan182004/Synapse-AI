from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class CareerRole(Base):
    __tablename__ = "career_roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="Engineering")
    market_demand: Mapped[str] = mapped_column(String(50), default="High")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    skill_requirements = relationship("RoleSkillRequirement", back_populates="role", cascade="all, delete-orphan")
    matches = relationship("StudentRoleMatch", back_populates="role", cascade="all, delete-orphan")


class RoleSkillRequirement(Base):
    __tablename__ = "role_skill_requirements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("career_roles.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    importance_weight: Mapped[float] = mapped_column(Float, default=1.0)  # 0.1 to 2.0
    expected_proficiency: Mapped[float] = mapped_column(Float, default=70.0)  # 0 to 100
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)

    role = relationship("CareerRole", back_populates="skill_requirements")
    skill = relationship("Skill")


class StudentRoleMatch(Base):
    __tablename__ = "student_role_matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("career_roles.id", ondelete="CASCADE"), index=True, nullable=False)
    alignment_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100
    evidence_coverage: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100
    strengths_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list
    gaps_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list
    explanation_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="role_matches")
    role = relationship("CareerRole", back_populates="matches")
