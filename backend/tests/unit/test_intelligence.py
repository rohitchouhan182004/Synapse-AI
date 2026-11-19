import pytest
from app.intelligence.skill_engine import SkillEngine
from app.intelligence.confidence_engine import ConfidenceEngine
from app.intelligence.skill_graph import SkillDependencyGraph
from app.intelligence.role_matcher import RoleMatcher
from app.intelligence.simulation_engine import SimulationEngine
from app.intelligence.blind_spot_detector import BlindSpotDetector

def test_confidence_engine_properties():
    # Zero evidence yields zero confidence
    assert ConfidenceEngine.calculate_confidence([]) == 0.0

    # Single evidence yields positive but conservative confidence
    single_ev = [{"source_type": "coding_assessment", "normalized_score": 80.0, "evidence_quality": 1.0, "difficulty_weight": 1.0}]
    c1 = ConfidenceEngine.calculate_confidence(single_ev)
    assert 10.0 <= c1 <= 50.0

    # Diverse multiple evidence increases confidence
    multi_ev = [
        {"source_type": "coding_assessment", "normalized_score": 85.0, "evidence_quality": 1.0, "difficulty_weight": 1.0},
        {"source_type": "interview", "normalized_score": 80.0, "evidence_quality": 1.0, "difficulty_weight": 1.0},
        {"source_type": "practical_task", "normalized_score": 82.0, "evidence_quality": 1.0, "difficulty_weight": 1.0},
        {"source_type": "coding_assessment", "normalized_score": 84.0, "evidence_quality": 1.0, "difficulty_weight": 1.0}
    ]
    c2 = ConfidenceEngine.calculate_confidence(multi_ev)
    assert c2 > c1
    assert c2 >= 70.0

def test_skill_engine_proficiency_and_trend():
    evidences = [
        {"source_type": "coding_assessment", "normalized_score": 40.0, "difficulty_weight": 1.0, "evidence_quality": 1.0},
        {"source_type": "coding_assessment", "normalized_score": 80.0, "difficulty_weight": 1.0, "evidence_quality": 1.0}
    ]
    prof, conf, trend, vel = SkillEngine.calculate_skill_state(evidences)
    assert 50.0 <= prof <= 75.0
    assert trend == "improving"
    assert vel > 0

def test_skill_graph_bottleneck_detection():
    graph = SkillDependencyGraph()
    # Trees (<50) with dependent Graphs
    skills_map = {
        "trees": {"proficiency_score": 32.0, "confidence_score": 75.0},
        "graphs": {"proficiency_score": 25.0, "confidence_score": 60.0}
    }
    bottlenecks = graph.identify_bottlenecks(skills_map)
    assert len(bottlenecks) >= 1
    assert any(b["skill_slug"] == "trees" for b in bottlenecks)

def test_role_matcher_and_readiness():
    reqs = [
        {"skill_slug": "java", "skill_name": "Java", "importance_weight": 1.8, "expected_proficiency": 80.0, "is_mandatory": True},
        {"skill_slug": "trees", "skill_name": "Trees", "importance_weight": 1.2, "expected_proficiency": 70.0, "is_mandatory": False}
    ]
    skills_map = {
        "java": {"proficiency_score": 85.0, "confidence_score": 90.0, "evidence_count": 4},
        "trees": {"proficiency_score": 35.0, "confidence_score": 70.0, "evidence_count": 2}
    }
    res = RoleMatcher.evaluate_role_suitability(reqs, skills_map)
    assert res["alignment_score"] > 60.0
    assert "Java" in res["strengths"]
    assert "Trees" in res["gaps"]

def test_future_self_simulation_isolation():
    skills_map = {
        "dsa": {"proficiency_score": 40.0, "confidence_score": 60.0, "evidence_count": 2}
    }
    reqs = [
        {"skill_slug": "dsa", "skill_name": "DSA", "importance_weight": 1.5, "expected_proficiency": 80.0, "is_mandatory": True}
    ]
    # Snapshot map before simulation
    original_score = skills_map["dsa"]["proficiency_score"]
    sim = SimulationEngine.simulate_hypothetical_growth(skills_map, reqs, {"dsa": 85.0})

    # Verify simulation projected growth
    assert sim["projected_alignment"] > sim["current_alignment"]
    assert sim["delta_alignment"] > 0
    assert sim["is_hypothetical"] is True

    # Crucial assertion: original map is unmutated!
    assert skills_map["dsa"]["proficiency_score"] == original_score

def test_blind_spot_detector():
    skills = [
        {"name": "SQL", "slug": "sql", "self_reported_score": 90.0, "assessed_score": 65.0}, # Overconfidence
        {"name": "Java", "slug": "java", "self_reported_score": 50.0, "assessed_score": 85.0} # Underconfidence
    ]
    spots = BlindSpotDetector.detect_blind_spots(skills)
    assert len(spots) == 2
    assert spots[0]["nature"] == "overestimation"
    assert spots[1]["nature"] == "underestimation"
