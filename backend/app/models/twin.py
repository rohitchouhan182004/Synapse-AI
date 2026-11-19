from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class DigitalTwinSnapshot(Base):
    __tablename__ = "digital_twin_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0.0-synapse")
    overall_readiness: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 100
    learning_velocity: Mapped[float] = mapped_column(Float, default=0.0)
    consistency_score: Mapped[float] = mapped_column(Float, default=0.0)
    skill_state_json: Mapped[str] = mapped_column(Text, nullable=False)  # Map of skill_slug -> {proficiency, confidence, status}
    role_alignment_json: Mapped[str] = mapped_column(Text, nullable=False)  # Map of role_slug -> {alignment, readiness}
    identified_bottlenecks_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # List of identified weak nodes
    identified_blindspots_json: Mapped[str | None] = mapped_column(Text, nullable=True)   # Discrepancies
    change_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    student = relationship("StudentProfile", back_populates="snapshots")


class TwinUpdateEvent(Base):
    __tablename__ = "twin_update_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # assessment_completed, interview_evaluated, roadmap_advanced
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    affected_skills_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    delta_summary_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True, nullable=False)
    recommendation_type: Mapped[str] = mapped_column(String(50), default="next_best_action")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    action_description: Mapped[str] = mapped_column(Text, nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    target_skill_slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    expected_impact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
