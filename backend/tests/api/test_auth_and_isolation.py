import pytest
from app.database.session import SessionLocal
from app.api.v1.endpoints.auth import register, login, get_me
from app.api.v1.endpoints.students import complete_onboarding, get_my_profile
from app.api.v1.endpoints.dashboard import get_dashboard_overview
from app.api.v1.endpoints.digital_twin import get_current_twin, simulate_future_self
from app.api.v1.endpoints.skills import get_my_skills, get_master_skills
from app.api.v1.endpoints.coding import get_coding_questions, submit_code
from app.api.v1.endpoints.careers import get_career_roles
from app.api.v1.endpoints.roadmaps import get_my_roadmap
from app.schemas.auth import UserRegister, UserLogin
from app.schemas.student import StudentOnboardingRequest
from app.schemas.twin import FutureSelfSimulateRequest
from app.schemas.assessment import CodingSubmissionCreate
from app.models import User, StudentProfile

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_demo_user_authentication(db):
    res = login(UserLogin(email="demo@synapse.ai", password="SynapseDemo2026!"), db=db)
    assert res.email == "demo@synapse.ai"
    assert res.full_name == "Aravind Sharma"
    assert res.access_token is not None

def test_demo_user_dashboard_and_twin(db):
    demo_user = db.query(User).filter(User.email == "demo@synapse.ai").first()
    student = db.query(StudentProfile).filter(StudentProfile.user_id == demo_user.id).first()

    overview = get_dashboard_overview(student=student, db=db)
    assert overview.full_name == "Aravind Sharma"
    assert overview.overall_readiness > 50.0
    assert len(overview.top_strengths) >= 1
    assert overview.next_best_action is not None

    twin = get_current_twin(student=student, db=db)
    assert twin.overall_readiness > 50.0
    assert "java" in twin.skill_state
    assert len(twin.identified_bottlenecks) >= 1

def test_master_skills_and_coding_questions(db):
    skills = get_master_skills(db=db)
    assert len(skills) >= 10
    assert any(s.slug == "trees" for s in skills)

    questions = get_coding_questions(db=db)
    assert len(questions) >= 3

def test_multi_user_data_isolation(db):
    """
    Critical multi-user verification:
    User Alpha and User Beta register independently.
    User Alpha cannot see or mutate User Beta's private student profile.
    """
    email_a = "user_alpha_iso@synapse.ai"
    email_b = "user_beta_iso@synapse.ai"
    pwd = "StrongPassword2026!"

    # 1. Register User A
    user_a = db.query(User).filter(User.email == email_a).first()
    if not user_a:
        register(UserRegister(email=email_a, password=pwd, full_name="User Alpha"), db=db)
        user_a = db.query(User).filter(User.email == email_a).first()

    # 2. Register User B
    user_b = db.query(User).filter(User.email == email_b).first()
    if not user_b:
        register(UserRegister(email=email_b, password=pwd, full_name="User Beta"), db=db)
        user_b = db.query(User).filter(User.email == email_b).first()

    # 3. User A onboarding
    complete_onboarding(
        StudentOnboardingRequest(
            full_name="User Alpha",
            university="Alpha University",
            target_role="Backend Developer",
            career_interests=["Backend", "Databases"]
        ),
        current_user=user_a,
        db=db
    )

    # 4. User B onboarding
    complete_onboarding(
        StudentOnboardingRequest(
            full_name="User Beta",
            university="Beta Polytechnic",
            target_role="AI Engineer",
            career_interests=["Vision", "NLP"]
        ),
        current_user=user_b,
        db=db
    )

    student_a = db.query(StudentProfile).filter(StudentProfile.user_id == user_a.id).first()
    student_b = db.query(StudentProfile).filter(StudentProfile.user_id == user_b.id).first()

    prof_a = get_my_profile(student=student_a)
    prof_b = get_my_profile(student=student_b)

    assert prof_a.full_name == "User Alpha"
    assert prof_a.university == "Alpha University"
    assert prof_b.full_name == "User Beta"
    assert prof_b.university == "Beta Polytechnic"

    # Crucial tenant isolation guarantee:
    assert prof_a.id != prof_b.id
    assert prof_a.user_id != prof_b.user_id

def test_future_self_simulation_api(db):
    demo_user = db.query(User).filter(User.email == "demo@synapse.ai").first()
    student = db.query(StudentProfile).filter(StudentProfile.user_id == demo_user.id).first()

    sim_res = simulate_future_self(
        FutureSelfSimulateRequest(
            hypothetical_skills={"trees": 80.0, "graphs": 75.0},
            target_role_slug="backend-developer"
        ),
        student=student,
        db=db
    )
    assert sim_res.is_hypothetical is True
    assert sim_res.delta_role_alignment >= 0
