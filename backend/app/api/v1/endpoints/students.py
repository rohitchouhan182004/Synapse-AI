import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.skill import Skill, StudentSkill
from app.schemas.student import StudentOnboardingRequest, StudentProfileUpdate, StudentProfileOut
from app.api.dependencies import get_current_user, get_current_student
from app.intelligence.twin_updater import TwinUpdater

router = APIRouter(prefix="/students", tags=["Student Profile"])

@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(student: StudentProfile = Depends(get_current_student)):
    interests = json.loads(student.career_interests) if student.career_interests else []
    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        full_name=student.full_name,
        university=student.university,
        degree=student.degree,
        specialization=student.specialization,
        graduation_year=student.graduation_year,
        current_semester=student.current_semester,
        experience_level=student.experience_level,
        target_role=student.target_role,
        career_interests=interests,
        profile_completion=student.profile_completion,
        created_at=student.created_at,
        updated_at=student.updated_at
    )

@router.post("/onboarding", response_model=StudentProfileOut)
def complete_onboarding(
    payload: StudentOnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        student = StudentProfile(user_id=current_user.id, full_name=payload.full_name)
        db.add(student)

    student.full_name = payload.full_name
    student.university = payload.university
    student.degree = payload.degree
    student.specialization = payload.specialization
    student.graduation_year = payload.graduation_year
    student.current_semester = payload.current_semester
    student.experience_level = payload.experience_level
    student.target_role = payload.target_role
    student.career_interests = json.dumps(payload.career_interests)
    student.profile_completion = 95
    student.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(student)

    # Initialize declared self-reported skills
    for item in payload.declared_skills:
        slug = item.get("skill_slug")
        score = float(item.get("self_reported_score", 50.0))
        skill = db.query(Skill).filter(Skill.slug == slug).first()
        if skill:
            st_skill = db.query(StudentSkill).filter(
                StudentSkill.student_id == student.id,
                StudentSkill.skill_id == skill.id
            ).first()
            if not st_skill:
                st_skill = StudentSkill(
                    student_id=student.id,
                    skill_id=skill.id,
                    proficiency_score=score * 0.75, # conservative initial Bayesian prior
                    confidence_score=15.0, # clearly marked as low initial confidence
                    evidence_count=0,
                    self_reported_score=score,
                    trend_direction="stable"
                )
                db.add(st_skill)
    db.commit()

    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        full_name=student.full_name,
        university=student.university,
        degree=student.degree,
        specialization=student.specialization,
        graduation_year=student.graduation_year,
        current_semester=student.current_semester,
        experience_level=student.experience_level,
        target_role=student.target_role,
        career_interests=payload.career_interests,
        profile_completion=student.profile_completion,
        created_at=student.created_at,
        updated_at=student.updated_at
    )

@router.put("/me", response_model=StudentProfileOut)
def update_profile(
    payload: StudentProfileUpdate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        student.full_name = payload.full_name
    if payload.university is not None:
        student.university = payload.university
    if payload.degree is not None:
        student.degree = payload.degree
    if payload.specialization is not None:
        student.specialization = payload.specialization
    if payload.graduation_year is not None:
        student.graduation_year = payload.graduation_year
    if payload.current_semester is not None:
        student.current_semester = payload.current_semester
    if payload.experience_level is not None:
        student.experience_level = payload.experience_level
    if payload.target_role is not None:
        student.target_role = payload.target_role
    if payload.career_interests is not None:
        student.career_interests = json.dumps(payload.career_interests)

    student.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(student)

    interests = json.loads(student.career_interests) if student.career_interests else []
    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        full_name=student.full_name,
        university=student.university,
        degree=student.degree,
        specialization=student.specialization,
        graduation_year=student.graduation_year,
        current_semester=student.current_semester,
        experience_level=student.experience_level,
        target_role=student.target_role,
        career_interests=interests,
        profile_completion=student.profile_completion,
        created_at=student.created_at,
        updated_at=student.updated_at
    )
