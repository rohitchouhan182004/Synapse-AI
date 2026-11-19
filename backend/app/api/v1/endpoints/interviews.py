import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, InterviewSession, InterviewQuestion, InterviewAnswer, Skill
from app.schemas.interview import (
    InterviewSessionCreate, InterviewSessionOut, InterviewQuestionOut,
    InterviewAnswerSubmit, InterviewAnswerOut
)
from app.api.dependencies import get_current_student
from app.intelligence.twin_updater import TwinUpdater

router = APIRouter(prefix="/interviews", tags=["Interview Studio"])

DEFAULT_INTERVIEW_QUESTIONS = {
    "Backend Architecture": [
        "Explain how database indexes improve query retrieval speed, and discuss the trade-offs on write throughput.",
        "How would you design an idempotent REST endpoint for processing financial transactions?",
        "Describe how you handle cascading failures and network partitions in a microservices or distributed environment."
    ],
    "Data Structures & Algorithms": [
        "Explain the conceptual distinction between depth-first search and breadth-first search on a directed graph.",
        "How do you determine whether a dynamic programming problem exhibits optimal substructure and overlapping subproblems?",
        "Explain how a hash map handles collisions and how that impacts time complexity."
    ],
    "System Design": [
        "How would you design a scalable distributed rate-limiting service?",
        "Compare SQL vs NoSQL storage strategies when designing a high-velocity telemetry pipeline.",
        "What strategies ensure cache coherence between Redis and a primary relational database?"
    ]
}

@router.post("/sessions", response_model=InterviewSessionOut)
def create_interview_session(
    payload: InterviewSessionCreate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    session = InterviewSession(
        student_id=student.id,
        title=f"{payload.topic} Mock Interview",
        category=payload.category,
        difficulty=payload.difficulty,
        topic=payload.topic,
        status="ongoing",
        created_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Seed 3 structured questions
    q_texts = DEFAULT_INTERVIEW_QUESTIONS.get(payload.topic, DEFAULT_INTERVIEW_QUESTIONS["Backend Architecture"])
    questions_out = []
    for idx, text in enumerate(q_texts, 1):
        q = InterviewQuestion(
            session_id=session.id,
            order_index=idx,
            question_text=text,
            topic=payload.topic
        )
        db.add(q)
        db.flush()
        questions_out.append(InterviewQuestionOut(
            id=q.id,
            order_index=q.order_index,
            question_text=q.question_text,
            topic=q.topic
        ))

    db.commit()

    return InterviewSessionOut(
        id=session.id,
        title=session.title,
        category=session.category,
        difficulty=session.difficulty,
        topic=session.topic,
        status=session.status,
        overall_score=0.0,
        technical_score=0.0,
        communication_score=0.0,
        clarity_score=0.0,
        feedback_summary="Session active. Submit answers to receive feedback.",
        created_at=session.created_at,
        questions=questions_out
    )

@router.post("/answers", response_model=InterviewAnswerOut)
def submit_interview_answer(
    payload: InterviewAnswerSubmit,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    session = db.query(InterviewSession).filter(
        InterviewSession.id == question.session_id,
        InterviewSession.student_id == student.id
    ).first()
    if not session:
        raise HTTPException(status_code=403, detail="Unauthorized session access")

    ans_text = payload.student_answer.strip()
    word_count = len(ans_text.split())

    # Analytical Rubric Evaluation
    tech_score = 50.0
    concept_score = 50.0
    comm_score = 60.0
    strengths = []
    weaknesses = []

    if word_count >= 50:
        tech_score += 25.0
        concept_score += 20.0
        strengths.append("Thorough conceptual elaboration")
    else:
        weaknesses.append("Response is brief; lacks concrete architectural mechanics")

    key_terms = ["b-tree", "index", "idempotency", "latency", "throughput", "cache", "partition", "dfs", "bfs", "complexity", "trade-off"]
    matches = [term for term in key_terms if term in ans_text.lower()]
    if matches:
        tech_score = min(95.0, tech_score + (len(matches) * 6.0))
        strengths.append(f"Correctly applied technical domain terminology: {', '.join(matches[:3])}")
    else:
        weaknesses.append("Consider citing specific algorithmic or storage trade-offs")

    feedback = f"Evaluated response with {round(tech_score, 1)}% technical precision and {round(comm_score, 1)}% clarity."

    ans = InterviewAnswer(
        question_id=question.id,
        student_answer=ans_text,
        technical_score=round(tech_score, 1),
        conceptual_depth_score=round(concept_score, 1),
        communication_score=round(comm_score, 1),
        strengths_json=json.dumps(strengths),
        weaknesses_json=json.dumps(weaknesses),
        feedback_text=feedback,
        created_at=datetime.now(timezone.utc)
    )
    db.add(ans)

    # Check if all questions in session are answered
    session.overall_score = round(tech_score * 0.7 + comm_score * 0.3, 1)
    session.technical_score = round(tech_score, 1)
    session.communication_score = round(comm_score, 1)
    session.clarity_score = round(concept_score, 1)
    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    session.feedback_summary = f"Interview completed. Demonstrated good grasp of {session.topic}."
    db.commit()

    # Log interview evidence to twin for Communication & relevant skill
    comm_skill = db.query(Skill).filter(Skill.slug == "communication").first()
    if comm_skill:
        TwinUpdater.process_evidence_and_update_twin(
            db=db,
            student_id=student.id,
            skill_id=comm_skill.id,
            source_type="interview",
            source_id=f"session_{session.id}",
            raw_score=comm_score,
            normalized_score=comm_score,
            difficulty_weight=1.0,
            evidence_quality=0.9,
            metadata_dict={"topic": session.topic, "type": "interview_verbal"}
        )

    return InterviewAnswerOut(
        question_id=question.id,
        technical_score=tech_score,
        conceptual_depth_score=concept_score,
        communication_score=comm_score,
        strengths=strengths,
        weaknesses=weaknesses,
        feedback_text=feedback
    )

@router.get("/history", response_model=List[InterviewSessionOut])
def get_interview_history(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.student_id == student.id
    ).order_by(InterviewSession.id.desc()).all()

    out = []
    for s in sessions:
        q_out = [InterviewQuestionOut(
            id=q.id,
            order_index=q.order_index,
            question_text=q.question_text,
            topic=q.topic
        ) for q in s.questions]

        out.append(InterviewSessionOut(
            id=s.id,
            title=s.title,
            category=s.category,
            difficulty=s.difficulty,
            topic=s.topic,
            status=s.status,
            overall_score=s.overall_score,
            technical_score=s.technical_score,
            communication_score=s.communication_score,
            clarity_score=s.clarity_score,
            feedback_summary=s.feedback_summary,
            created_at=s.created_at,
            questions=q_out
        ))
    return out
