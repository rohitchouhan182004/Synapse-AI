import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, LearningRoadmap, RoadmapTask, CareerRole, StudentRoleMatch
from app.schemas.roadmap import LearningRoadmapOut, RoadmapTaskOut, RoadmapGenerateRequest
from app.api.dependencies import get_current_student
from app.intelligence.roadmap_generator import RoadmapGenerator
from app.intelligence.skill_graph import SkillDependencyGraph

router = APIRouter(prefix="/roadmaps", tags=["Adaptive Roadmap"])

@router.get("/me", response_model=LearningRoadmapOut)
def get_my_roadmap(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.student_id == student.id,
        LearningRoadmap.status == "active"
    ).order_by(LearningRoadmap.id.desc()).first()

    if not roadmap:
        # Auto-generate one if none exists
        return generate_roadmap(RoadmapGenerateRequest(target_role_name=student.target_role or "Backend Developer"), student, db)

    tasks_out = []
    completed_count = 0
    for t in roadmap.tasks:
        if t.status == "completed":
            completed_count += 1
        prereqs = json.loads(t.prerequisites_json) if t.prerequisites_json else []
        tasks_out.append(RoadmapTaskOut(
            id=t.id,
            phase_number=t.phase_number,
            phase_title=t.phase_title,
            order_index=t.order_index,
            title=t.title,
            description=t.description,
            rationale=t.rationale,
            priority=t.priority,
            estimated_hours=t.estimated_hours,
            prerequisites=prereqs,
            status=t.status,
            completion_criteria=t.completion_criteria,
            completed_at=t.completed_at
        ))

    pct = round((completed_count / max(1, len(tasks_out))) * 100.0, 1)
    roadmap.progress_percentage = pct
    db.commit()

    return LearningRoadmapOut(
        id=roadmap.id,
        title=roadmap.title,
        target_role_name=roadmap.target_role_name,
        current_phase=roadmap.current_phase,
        total_phases=roadmap.total_phases,
        status=roadmap.status,
        progress_percentage=pct,
        tasks=tasks_out
    )

@router.post("/generate", response_model=LearningRoadmapOut)
def generate_roadmap(
    payload: RoadmapGenerateRequest,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    role_name = payload.target_role_name or student.target_role or "Backend Developer"
    student.target_role = role_name
    db.commit()

    # Look up role match to find specific gaps
    role = db.query(CareerRole).filter(CareerRole.name == role_name).first()
    gaps_list = []
    if role:
        match = db.query(StudentRoleMatch).filter(
            StudentRoleMatch.student_id == student.id,
            StudentRoleMatch.role_id == role.id
        ).first()
        if match and match.gaps_json:
            raw_gaps = json.loads(match.gaps_json)
            for g in raw_gaps:
                gaps_list.append({"skill_name": g, "skill_slug": g.lower().replace(" ", "-"), "delta": 25.0})

    skill_graph = SkillDependencyGraph()
    generated_tasks = RoadmapGenerator.generate_adaptive_roadmap(role_name, gaps_list, skill_graph)

    # Archive previous active roadmap
    old_roadmaps = db.query(LearningRoadmap).filter(
        LearningRoadmap.student_id == student.id,
        LearningRoadmap.status == "active"
    ).all()
    for o in old_roadmaps:
        o.status = "archived"

    roadmap = LearningRoadmap(
        student_id=student.id,
        role_id=role.id if role else None,
        title=f"{role_name} Adaptive Mastery Path",
        target_role_name=role_name,
        current_phase=1,
        total_phases=4,
        status="active",
        progress_percentage=0.0
    )
    db.add(roadmap)
    db.flush()

    tasks_out = []
    for t_data in generated_tasks:
        prereqs = t_data.get("prerequisites", [])
        t_model = RoadmapTask(
            roadmap_id=roadmap.id,
            phase_number=t_data["phase_number"],
            phase_title=t_data["phase_title"],
            order_index=t_data["order_index"],
            title=t_data["title"],
            description=t_data["description"],
            rationale=t_data.get("rationale"),
            priority=t_data["priority"],
            estimated_hours=t_data["estimated_hours"],
            prerequisites_json=json.dumps(prereqs),
            status=t_data["status"],
            completion_criteria=t_data.get("completion_criteria")
        )
        db.add(t_model)
        db.flush()
        tasks_out.append(RoadmapTaskOut(
            id=t_model.id,
            phase_number=t_model.phase_number,
            phase_title=t_model.phase_title,
            order_index=t_model.order_index,
            title=t_model.title,
            description=t_model.description,
            rationale=t_model.rationale,
            priority=t_model.priority,
            estimated_hours=t_model.estimated_hours,
            prerequisites=prereqs,
            status=t_model.status,
            completion_criteria=t_model.completion_criteria
        ))

    db.commit()

    return LearningRoadmapOut(
        id=roadmap.id,
        title=roadmap.title,
        target_role_name=roadmap.target_role_name,
        current_phase=roadmap.current_phase,
        total_phases=roadmap.total_phases,
        status=roadmap.status,
        progress_percentage=0.0,
        tasks=tasks_out
    )

@router.post("/tasks/{task_id}/toggle", response_model=RoadmapTaskOut)
def toggle_task_status(
    task_id: int,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    task = db.query(RoadmapTask).join(LearningRoadmap, RoadmapTask.roadmap_id == LearningRoadmap.id).filter(
        RoadmapTask.id == task_id,
        LearningRoadmap.student_id == student.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")

    if task.status == "completed":
        task.status = "pending"
        task.completed_at = None
    else:
        task.status = "completed"
        task.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(task)

    prereqs = json.loads(task.prerequisites_json) if task.prerequisites_json else []
    return RoadmapTaskOut(
        id=task.id,
        phase_number=task.phase_number,
        phase_title=task.phase_title,
        order_index=task.order_index,
        title=task.title,
        description=task.description,
        rationale=task.rationale,
        priority=task.priority,
        estimated_hours=task.estimated_hours,
        prerequisites=prereqs,
        status=task.status,
        completion_criteria=task.completion_criteria,
        completed_at=task.completed_at
    )
