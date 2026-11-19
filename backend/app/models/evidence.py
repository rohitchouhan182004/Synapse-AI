from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # coding_assessment, interview, self_reported, practical_task
    source_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_score: Mapped[float] = mapped_column(Float, nullable=False)
    normalized_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0 to 100
    difficulty_weight: Mapped[float] = mapped_column(Float, default=1.0)
    recency_weight: Mapped[float] = mapped_column(Float, default=1.0)
    evidence_quality: Mapped[float] = mapped_column(Float, default=1.0)
    assessment_metadata: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON details
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    student = relationship("StudentProfile", back_populates="evidence")
    skill = relationship("Skill", back_populates="evidence")
