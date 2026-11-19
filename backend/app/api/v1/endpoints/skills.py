from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, StudentSkill, Skill, SkillEvidence, SkillRelationship
from app.schemas.skill import SkillOut, StudentSkillOut, SkillDetailOut, SkillEvidenceOut
from app.api.dependencies import get_current_student

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillOut])
def get_master_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).filter(Skill.is_active == True).all()
    return skills

@router.get("/me", response_model=List[StudentSkillOut])
def get_my_skills(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    skills_query = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(
        StudentSkill.student_id == student.id
    ).all()

    out = []
    for ss, sk in skills_query:
        out.append(StudentSkillOut(
            id=ss.id,
            skill_id=sk.id,
            name=sk.name,
            slug=sk.slug,
            category=sk.category,
            proficiency_score=ss.proficiency_score,
            confidence_score=ss.confidence_score,
            evidence_count=ss.evidence_count,
            self_reported_score=ss.self_reported_score,
            assessed_score=ss.assessed_score,
            trend_direction=ss.trend_direction,
            velocity_score=ss.velocity_score,
            last_assessed_at=ss.last_assessed_at
        ))
    return out

@router.get("/me/{skill_slug}", response_model=SkillDetailOut)
def get_skill_detail(
    skill_slug: str,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.slug == skill_slug).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    st_skill = db.query(StudentSkill).filter(
        StudentSkill.student_id == student.id,
        StudentSkill.skill_id == skill.id
    ).first()

    if not st_skill:
        st_skill_out = StudentSkillOut(
            id=0,
            skill_id=skill.id,
            name=skill.name,
            slug=skill.slug,
            category=skill.category,
            proficiency_score=0.0,
            confidence_score=0.0,
            evidence_count=0,
            trend_direction="insufficient_evidence",
            velocity_score=0.0
        )
    else:
        st_skill_out = StudentSkillOut(
            id=st_skill.id,
            skill_id=skill.id,
            name=skill.name,
            slug=skill.slug,
            category=skill.category,
            proficiency_score=st_skill.proficiency_score,
            confidence_score=st_skill.confidence_score,
            evidence_count=st_skill.evidence_count,
            self_reported_score=st_skill.self_reported_score,
            assessed_score=st_skill.assessed_score,
            trend_direction=st_skill.trend_direction,
            velocity_score=st_skill.velocity_score,
            last_assessed_at=st_skill.last_assessed_at
        )

    # Fetch evidence history
    evidences = db.query(SkillEvidence).filter(
        SkillEvidence.student_id == student.id,
        SkillEvidence.skill_id == skill.id
    ).order_by(SkillEvidence.id.desc()).all()

    ev_out = [
        SkillEvidenceOut(
            id=e.id,
            skill_id=skill.id,
            skill_name=skill.name,
            source_type=e.source_type,
            raw_score=e.raw_score,
            normalized_score=e.normalized_score,
            difficulty_weight=e.difficulty_weight,
            evidence_quality=e.evidence_quality,
            created_at=e.created_at
        ) for e in evidences
    ]

    return SkillDetailOut(
        skill=st_skill_out,
        prerequisites=[],
        dependents=[],
        evidence_history=ev_out,
        explanation=f"Competency derived from {len(ev_out)} validated assessments across practice and interviews."
    )
