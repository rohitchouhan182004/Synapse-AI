import sys
import os
import json
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, engine
from app.models import (
    Base, User, StudentProfile, Skill, SkillRelationship, StudentSkill, SkillEvidence,
    CodingQuestion, CodingAssessment, CodingSubmission,
    InterviewSession, InterviewQuestion, InterviewAnswer,
    CareerRole, RoleSkillRequirement, StudentRoleMatch,
    LearningRoadmap, RoadmapTask, DigitalTwinSnapshot, TwinUpdateEvent, ActivityEvent
)
from app.core.security import get_password_hash
from app.intelligence.skill_graph import SkillDependencyGraph

def seed():
    print("--- Starting SYNAPSE Master Database Seeding ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Skills Master Catalog
        skills_data = [
            ("Programming Fundamentals", "programming-fundamentals", "Fundamentals", "Basic syntax, control flow, functions, and memory semantics.", 1),
            ("Java", "java", "Programming", "Core Java, JVM execution model, collections, memory management.", 2),
            ("Python", "python", "Programming", "Python idiomatic syntax, data manipulation, generators, typing.", 2),
            ("Object Oriented Programming", "oop", "Software Engineering", "Encapsulation, inheritance, polymorphism, design principles, SOLID.", 2),
            ("Data Structures & Algorithms", "dsa", "Algorithms", "Core algorithmic problem solving, Big-O asymptotic analysis.", 3),
            ("Recursion & Backtracking", "recursion", "Algorithms", "Base cases, call stack mechanics, exhaustive search.", 3),
            ("Trees & BST", "trees", "Data Structures", "Binary trees, BST traversal, balancing, tree-based recursion.", 3),
            ("Graph Algorithms", "graphs", "Data Structures", "Adjacency lists, BFS, DFS, cycle detection, shortest paths.", 4),
            ("Dynamic Programming", "dynamic-programming", "Algorithms", "Optimal substructure, memoization tables, bottom-up tabulation.", 5),
            ("SQL & Relational Databases", "sql", "Databases", "Relational modeling, complex queries, aggregation, normalization.", 2),
            ("Query Optimization & Indexing", "db-optimization", "Databases", "B-Tree indexes, execution plans, join optimization.", 4),
            ("REST APIs & Protocols", "api-development", "Web Engineering", "HTTP semantics, idempotency, authentication, serialization.", 2),
            ("Distributed System Design", "system-design", "Architecture", "Scalability, caching, load balancing, consensus, CAP theorem.", 5),
            ("Technical Communication", "communication", "Soft Skills", "Articulating technical trade-offs, conceptual clarity under review.", 2)
        ]

        skill_map = {}
        for name, slug, cat, desc, diff in skills_data:
            sk = db.query(Skill).filter(Skill.slug == slug).first()
            if not sk:
                sk = Skill(
                    name=name,
                    slug=slug,
                    category=cat,
                    description=desc,
                    difficulty_level=diff,
                    is_active=True
                )
                db.add(sk)
                db.flush()
            skill_map[slug] = sk

        # Prerequisite relationships
        prereqs = [
            ("programming-fundamentals", "oop"),
            ("programming-fundamentals", "dsa"),
            ("dsa", "recursion"),
            ("recursion", "trees"),
            ("trees", "graphs"),
            ("recursion", "dynamic-programming"),
            ("dsa", "dynamic-programming"),
            ("sql", "db-optimization"),
            ("oop", "api-development"),
            ("api-development", "system-design"),
            ("sql", "system-design")
        ]
        for src, dst in prereqs:
            if src in skill_map and dst in skill_map:
                rel = db.query(SkillRelationship).filter(
                    SkillRelationship.source_skill_id == skill_map[src].id,
                    SkillRelationship.target_skill_id == skill_map[dst].id
                ).first()
                if not rel:
                    db.add(SkillRelationship(
                        source_skill_id=skill_map[src].id,
                        target_skill_id=skill_map[dst].id,
                        relationship_type="prerequisite",
                        strength_weight=1.0
                    ))
        db.flush()

        # 2. Seed Career Roles & Requirements
        roles_data = [
            ("Backend Developer", "backend-developer", "Engineers robust, high-performance distributed server systems, APIs, and persistent storage layers.", "Engineering", [
                ("java", 1.8, 80.0, True),
                ("oop", 1.6, 75.0, True),
                ("sql", 1.8, 75.0, True),
                ("dsa", 1.5, 70.0, True),
                ("api-development", 1.5, 75.0, True),
                ("trees", 1.2, 65.0, False),
                ("system-design", 1.4, 70.0, False),
                ("communication", 1.0, 70.0, False)
            ]),
            ("Full Stack Developer", "full-stack-developer", "Bridges user interfaces with robust backend infrastructure and integrated web workflows.", "Engineering", [
                ("python", 1.5, 75.0, True),
                ("api-development", 1.8, 80.0, True),
                ("sql", 1.5, 70.0, True),
                ("oop", 1.4, 70.0, True),
                ("dsa", 1.2, 65.0, False),
                ("communication", 1.2, 75.0, False)
            ]),
            ("AI Engineer", "ai-engineer", "Deploys machine learning models, inference optimization, and intelligent reasoning pipelines.", "Data & AI", [
                ("python", 1.9, 85.0, True),
                ("dsa", 1.6, 75.0, True),
                ("dynamic-programming", 1.4, 70.0, False),
                ("sql", 1.3, 65.0, False),
                ("system-design", 1.5, 70.0, False)
            ]),
            ("Software Engineer", "software-engineer", "Generalist software craftsmanship across algorithmic problem solving, code health, and team delivery.", "Core Engineering", [
                ("dsa", 1.8, 75.0, True),
                ("oop", 1.6, 75.0, True),
                ("java", 1.4, 70.0, False),
                ("trees", 1.5, 70.0, True),
                ("graphs", 1.4, 65.0, False),
                ("communication", 1.3, 75.0, True)
            ])
        ]

        for r_name, r_slug, r_desc, r_cat, reqs in roles_data:
            role = db.query(CareerRole).filter(CareerRole.slug == r_slug).first()
            if not role:
                role = CareerRole(
                    name=r_name,
                    slug=r_slug,
                    description=r_desc,
                    category=r_cat,
                    market_demand="High"
                )
                db.add(role)
                db.flush()

            for sk_slug, weight, expected, is_mand in reqs:
                if sk_slug in skill_map:
                    rq = db.query(RoleSkillRequirement).filter(
                        RoleSkillRequirement.role_id == role.id,
                        RoleSkillRequirement.skill_id == skill_map[sk_slug].id
                    ).first()
                    if not rq:
                        db.add(RoleSkillRequirement(
                            role_id=role.id,
                            skill_id=skill_map[sk_slug].id,
                            importance_weight=weight,
                            expected_proficiency=expected,
                            is_mandatory=is_mand
                        ))
        db.flush()

        # 3. Seed Coding Questions
        questions_data = [
            (
                "Invert Binary Tree",
                "invert-binary-tree",
                "Given the root of a binary tree, invert the tree, and return its root. Swap left and right subtrees recursively.",
                "easy",
                "Trees",
                "trees",
                "root = [4,2,7,1,3,6,9]",
                "[4,7,2,9,6,3,1]",
                "Number of nodes in the tree is in the range [0, 100]. -100 <= Node.val <= 100",
                json.dumps([
                    {"input": "root = [4,2,7,1,3,6,9]", "expected_output": "[4,7,2,9,6,3,1]", "is_hidden": False},
                    {"input": "root = [2,1,3]", "expected_output": "[2,3,1]", "is_hidden": False},
                    {"input": "root = []", "expected_output": "[]", "is_hidden": True}
                ]),
                json.dumps({
                    "python": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invertTree(root):\n    # Write your solution here\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root\n",
                    "java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Implement\n        return root;\n    }\n}"
                })
            ),
            (
                "Lowest Common Ancestor in Binary Search Tree",
                "lowest-common-ancestor-bst",
                "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
                "medium",
                "Trees",
                "trees",
                "root = [6,2,8,0,4,7,9], p = 2, q = 8",
                "6",
                "All Node.val are unique. p != q.",
                json.dumps([
                    {"input": "root = [6,2,8,0,4,7,9], p = 2, q = 8", "expected_output": "6", "is_hidden": False},
                    {"input": "root = [6,2,8,0,4,7,9], p = 2, q = 4", "expected_output": "2", "is_hidden": False}
                ]),
                json.dumps({
                    "python": "def lowestCommonAncestor(root, p, q):\n    curr = root\n    while curr:\n        if p.val > curr.val and q.val > curr.val:\n            curr = curr.right\n        elif p.val < curr.val and q.val < curr.val:\n            curr = curr.left\n        else:\n            return curr\n    return None\n",
                    "java": "class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        return root;\n    }\n}"
                })
            ),
            (
                "Course Schedule (Cycle Detection in Directed Graph)",
                "course-schedule-cycle",
                "There are a total of numCourses you have to take, labeled 0 to numCourses - 1. You are given prerequisites where prerequisites[i] = [a, b] indicates you must take course b first. Determine if you can finish all courses.",
                "medium",
                "Graphs",
                "graphs",
                "numCourses = 2, prerequisites = [[1,0]]",
                "true",
                "1 <= numCourses <= 2000. 0 <= prerequisites.length <= 5000.",
                json.dumps([
                    {"input": "numCourses = 2, prerequisites = [[1,0]]", "expected_output": "true", "is_hidden": False},
                    {"input": "numCourses = 2, prerequisites = [[1,0],[0,1]]", "expected_output": "false", "is_hidden": False}
                ]),
                json.dumps({
                    "python": "def canFinish(numCourses, prerequisites):\n    # Build graph and perform topological sort / cycle detection\n    adj = {i: [] for i in range(numCourses)}\n    for crs, pre in prerequisites:\n        adj[crs].append(pre)\n    visited = set()\n    # Implement DFS\n    return True\n",
                    "java": "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        return true;\n    }\n}"
                })
            )
        ]

        for q_title, q_slug, q_desc, q_diff, q_topic, sk_slug, q_in, q_out, q_con, q_tests, q_starter in questions_data:
            q = db.query(CodingQuestion).filter(CodingQuestion.slug == q_slug).first()
            if not q:
                db.add(CodingQuestion(
                    title=q_title,
                    slug=q_slug,
                    description=q_desc,
                    difficulty=q_diff,
                    topic=q_topic,
                    primary_skill_id=skill_map[sk_slug].id if sk_slug in skill_map else None,
                    expected_input=q_in,
                    expected_output=q_out,
                    constraints=q_con,
                    test_cases_json=q_tests,
                    starter_code_json=q_starter,
                    is_active=True
                ))
        db.flush()

        # 4. Seed Demo Student with the exact history from Part 3 & 5
        demo_email = "demo@synapse.ai"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                password_hash=get_password_hash("SynapseDemo2026!"),
                is_active=True,
                is_verified=True,
                created_at=datetime.now(timezone.utc) - timedelta(days=30)
            )
            db.add(user)
            db.flush()

        student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not student:
            student = StudentProfile(
                user_id=user.id,
                full_name="Aravind Sharma",
                university="National Institute of Technology",
                degree="Bachelor of Technology",
                specialization="Computer Science and Engineering",
                graduation_year=2026,
                current_semester=6,
                experience_level="intermediate",
                career_interests=json.dumps(["Backend Engineering", "Distributed Systems", "Database Optimization"]),
                target_role="Backend Developer",
                profile_completion=100,
                created_at=datetime.now(timezone.utc) - timedelta(days=30)
            )
            db.add(student)
            db.flush()

        # Target historical skill values from Part 3 / Part 5:
        # Java: 82, OOP: 78, Python: 65, SQL: 74, DSA: 42, Trees: 31, Graphs: 28, Dynamic Programming: 24, Communication: 76, System Design: None (insufficient)
        target_skills = [
            ("java", 82.0, 88.0, 5, 80.0, "improving", 4.2),
            ("oop", 78.0, 84.0, 4, 75.0, "improving", 2.1),
            ("python", 65.0, 72.0, 3, 70.0, "stable", 0.0),
            ("sql", 74.0, 80.0, 4, 90.0, "improving", 3.5), # Blind spot: reported 90, assessed 74
            ("dsa", 42.0, 75.0, 6, 65.0, "declining", -3.2),
            ("trees", 31.0, 70.0, 4, 55.0, "declining", -4.5), # Concept bottleneck
            ("graphs", 28.0, 68.0, 3, 50.0, "stable", -1.0),
            ("dynamic-programming", 24.0, 65.0, 3, 40.0, "stable", 0.5),
            ("communication", 76.0, 80.0, 3, 75.0, "improving", 1.8),
            ("programming-fundamentals", 85.0, 92.0, 6, 85.0, "stable", 0.0),
            ("api-development", 72.0, 78.0, 3, 70.0, "improving", 2.0)
        ]

        skills_map_for_snapshot = {}
        for slug, prof, conf, count, self_rep, trend, vel in target_skills:
            if slug in skill_map:
                sk_id = skill_map[slug].id
                st_sk = db.query(StudentSkill).filter(
                    StudentSkill.student_id == student.id,
                    StudentSkill.skill_id == sk_id
                ).first()
                if not st_sk:
                    st_sk = StudentSkill(
                        student_id=student.id,
                        skill_id=sk_id,
                        proficiency_score=prof,
                        confidence_score=conf,
                        evidence_count=count,
                        self_reported_score=self_rep,
                        assessed_score=prof,
                        trend_direction=trend,
                        velocity_score=vel,
                        last_assessed_at=datetime.now(timezone.utc) - timedelta(days=2)
                    )
                    db.add(st_sk)
                else:
                    st_sk.proficiency_score = prof
                    st_sk.confidence_score = conf
                    st_sk.evidence_count = count
                    st_sk.self_reported_score = self_rep
                    st_sk.assessed_score = prof
                    st_sk.trend_direction = trend
                    st_sk.velocity_score = vel

                skills_map_for_snapshot[slug] = {
                    "proficiency_score": prof,
                    "confidence_score": conf,
                    "evidence_count": count
                }

                # Seed historical evidence record
                db.add(SkillEvidence(
                    student_id=student.id,
                    skill_id=sk_id,
                    source_type="coding_assessment" if slug in ["trees", "dsa", "graphs", "dynamic-programming", "java"] else "interview",
                    source_id=f"hist_{slug}",
                    raw_score=prof,
                    normalized_score=prof,
                    difficulty_weight=1.0,
                    recency_weight=1.0,
                    evidence_quality=1.0,
                    created_at=datetime.now(timezone.utc) - timedelta(days=5)
                ))
        db.flush()

        # 5. Seed Historical Digital Twin Snapshots
        snap_1 = DigitalTwinSnapshot(
            student_id=student.id,
            model_version="v1.0.0-synapse",
            overall_readiness=45.0,
            learning_velocity=1.2,
            consistency_score=60.0,
            skill_state_json=json.dumps(skills_map_for_snapshot),
            role_alignment_json=json.dumps({"backend-developer": {"alignment_score": 62.0, "readiness_score": 52.0}}),
            identified_bottlenecks_json=json.dumps([{
                "skill_slug": "trees",
                "skill_name": "Trees & BST",
                "current_score": 31.0,
                "affected_dependents": ["graphs"],
                "severity": "high",
                "rationale": "Tree traversal recursion flaws are constraining progress in advanced graph structures."
            }]),
            identified_blindspots_json=json.dumps([{
                "skill_name": "SQL & Relational Databases",
                "skill_slug": "sql",
                "self_reported_score": 90.0,
                "assessed_score": 74.0,
                "discrepancy": 16.0,
                "nature": "overestimation",
                "explanation": "Self-reported advanced SQL comfort, but query optimization and locking mechanisms reflect intermediate demonstration."
            }]),
            change_summary="Week 1 Baseline: Java and SQL foundations verified; algorithmic gap flagged in tree structures.",
            created_at=datetime.now(timezone.utc) - timedelta(days=14)
        )
        db.add(snap_1)

        snap_2 = DigitalTwinSnapshot(
            student_id=student.id,
            model_version="v1.0.0-synapse",
            overall_readiness=58.5,
            learning_velocity=3.2,
            consistency_score=78.0,
            skill_state_json=json.dumps(skills_map_for_snapshot),
            role_alignment_json=json.dumps({"backend-developer": {"alignment_score": 76.0, "readiness_score": 68.0}}),
            identified_bottlenecks_json=json.dumps([{
                "skill_slug": "trees",
                "skill_name": "Trees & BST",
                "current_score": 31.0,
                "affected_dependents": ["graphs"],
                "severity": "high",
                "rationale": "Tree traversal recursion flaws are constraining progress in advanced graph structures."
            }]),
            identified_blindspots_json=json.dumps([{
                "skill_name": "SQL & Relational Databases",
                "skill_slug": "sql",
                "self_reported_score": 90.0,
                "assessed_score": 74.0,
                "discrepancy": 16.0,
                "nature": "overestimation",
                "explanation": "Self-reported advanced SQL comfort, but query optimization and locking mechanisms reflect intermediate demonstration."
            }]),
            change_summary="Week 2 Progress: Java accuracy solidified to 82%; Backend Developer alignment climbed to 76%.",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(snap_2)

        # 6. Seed Learning Roadmap
        backend_role = db.query(CareerRole).filter(CareerRole.slug == "backend-developer").first()
        roadmap = LearningRoadmap(
            student_id=student.id,
            role_id=backend_role.id if backend_role else None,
            title="Backend Developer Adaptive Mastery Path",
            target_role_name="Backend Developer",
            current_phase=2,
            total_phases=4,
            status="active",
            progress_percentage=35.0,
            created_at=datetime.now(timezone.utc) - timedelta(days=14)
        )
        db.add(roadmap)
        db.flush()

        roadmap_tasks_data = [
            (1, "Phase 01: Core Foundations & Bottlenecks", 1, "Algorithmic Complexity & Call Stack Mechanics", "Review stack memory allocation, recursion unwinding, and Big-O invariants.", "completed", 4.0),
            (1, "Phase 01: Core Foundations & Bottlenecks", 2, "OOP Invariants & Robust Exception Handling", "Practice defensive programming and clean modular class hierarchies in Java.", "completed", 5.0),
            (2, "Phase 02: Advanced Structures & Mechanics", 3, "Master Binary Tree Traversal Patterns", "Implement iterative and recursive DFS (pre/in/post order) and BFS on BSTs.", "pending", 6.0),
            (2, "Phase 02: Advanced Structures & Mechanics", 4, "Graph Representation & Cycle Detection", "Construct adjacency lists and write DFS cycle detection routines.", "pending", 7.0),
            (3, "Phase 03: Domain Specialization", 5, "Query Optimization & B-Tree Indexing", "Analyze EXPLAIN query plans and eliminate full table scans on large tables.", "pending", 8.0),
            (4, "Phase 04: Synthesis & Interview Execution", 6, "Mock Architectural Interview: Distributed State", "Demonstrate end-to-end design of an idempotent payment webhook receiver.", "pending", 5.0)
        ]

        for p_num, p_title, o_idx, title, desc, status_str, hrs in roadmap_tasks_data:
            db.add(RoadmapTask(
                roadmap_id=roadmap.id,
                phase_number=p_num,
                phase_title=p_title,
                order_index=o_idx,
                title=title,
                description=desc,
                priority="critical" if "Tree" in title else "high",
                estimated_hours=hrs,
                status=status_str,
                completed_at=datetime.now(timezone.utc) - timedelta(days=7) if status_str == "completed" else None
            ))

        # 7. Seed Student Role Matches
        for r in db.query(CareerRole).all():
            align_val = 76.0 if r.slug == "backend-developer" else (68.0 if r.slug == "full-stack-developer" else 54.0)
            ready_val = 68.0 if r.slug == "backend-developer" else 58.0
            db.add(StudentRoleMatch(
                student_id=student.id,
                role_id=r.id,
                alignment_score=align_val,
                readiness_score=ready_val,
                evidence_coverage=85.0 if r.slug == "backend-developer" else 70.0,
                strengths_json=json.dumps(["Java", "OOP", "SQL Fundamentals"]),
                gaps_json=json.dumps(["Trees & BST", "Graph Algorithms", "Distributed System Design"]),
                explanation_text=f"Demonstrates strong backend fundamentals (Java 82%, SQL 74%), but DSA algorithmic depth (Trees 31%) represents the primary readiness barrier."
            ))

        # 8. Seed Activity Events
        db.add(ActivityEvent(
            student_id=student.id,
            event_type="assessment_submitted",
            title="Evidence Logged: Java OOP Principles",
            description="Scored 85% on polymorphism and contract boundaries.",
            created_at=datetime.now(timezone.utc) - timedelta(days=3)
        ))
        db.add(ActivityEvent(
            student_id=student.id,
            event_type="interview_completed",
            title="Interview Completed: Backend Architecture",
            description="Technical correctness scored 82%; communication scored 76%.",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        ))

        db.commit()
        print("--- SYNAPSE Database Seeded Successfully with Realistic Demo Twin ---")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
