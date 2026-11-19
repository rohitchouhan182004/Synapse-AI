from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    university: Mapped[str | None] = mapped_column(String(255), nullable=True)
    degree: Mapped[str | None] = mapped_column(String(255), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_semester: Mapped[int | None] = mapped_column(Integer, nullable=True)
    experience_level: Mapped[str] = mapped_column(String(50), default="beginner")
    career_interests: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON-encoded array or comma-separated
    target_role: Mapped[str | None] = mapped_column(String(100), default="Backend Developer")
    profile_completion: Mapped[int] = mapped_column(Integer, default=20)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    evidence = relationship("SkillEvidence", back_populates="student", cascade="all, delete-orphan")
    snapshots = relationship("DigitalTwinSnapshot", back_populates="student", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="student", cascade="all, delete-orphan")
    role_matches = relationship("StudentRoleMatch", back_populates="student", cascade="all, delete-orphan")
    activities = relationship("ActivityEvent", back_populates="student", cascade="all, delete-orphan")
