from typing import List, Dict, Any

class RoadmapGenerator:
    @staticmethod
    def generate_adaptive_roadmap(
        target_role_name: str,
        gaps: List[Dict[str, Any]],
        skill_graph
    ) -> List[Dict[str, Any]]:
        """
        Organizes gaps into 4 logical phases:
        Phase 1: Foundational Prereqs & Core Bottlenecks
        Phase 2: Core Data Structures & Architectural Mechanics
        Phase 3: Domain Specialization & Advanced Algorithms
        Phase 4: Synthesis & Interview Execution
        """
        phase_1_tasks = []
        phase_2_tasks = []
        phase_3_tasks = []
        phase_4_tasks = []

        # Analyze gap skill slugs
        gap_slugs = set(g.get("skill_slug", "") for g in gaps if g.get("skill_slug"))

        for g in gaps:
            name = g.get("skill_name", "Skill")
            slug = g.get("skill_slug", name.lower().replace(" ", "-"))
            delta = g.get("delta", 20.0)

            # Check prerequisites
            prereqs = skill_graph.get_prerequisites(slug)
            
            task_item = {
                "skill_slug": slug,
                "title": f"Master {name} Essentials",
                "description": f"Close the estimated {delta}-point competency gap in {name}.",
                "rationale": f"Directly strengthens readiness for {target_role_name}.",
                "priority": "critical" if delta > 30.0 else "high",
                "estimated_hours": round(max(3.0, delta * 0.4), 1),
                "prerequisites": prereqs,
                "status": "pending",
                "completion_criteria": f"Attain >= 70% demonstrated accuracy in {name} assessments."
            }

            if "fundamental" in slug or "oop" in slug or "recursion" in slug:
                phase_1_tasks.append(task_item)
            elif "dsa" in slug or "tree" in slug or "sql" in slug:
                phase_2_tasks.append(task_item)
            elif "graph" in slug or "dynamic" in slug or "optimization" in slug or "api" in slug:
                phase_3_tasks.append(task_item)
            else:
                phase_4_tasks.append(task_item)

        # Fallback ensuring rich 4-phase journey if few gaps exist
        if not phase_1_tasks:
            phase_1_tasks.append({
                "title": "Algorithmic Complexity & Foundations",
                "description": "Solidify Big-O reasoning and clean memory-conscious code structure.",
                "priority": "medium",
                "estimated_hours": 4.0,
                "prerequisites": [],
                "status": "completed",
                "completion_criteria": "Review time/space complexity analysis."
            })
        if not phase_2_tasks:
            phase_2_tasks.append({
                "title": "Non-Linear Data Structures & Tree Traversal",
                "description": "Implement recursive and iterative traversals (DFS/BFS) across BSTs.",
                "priority": "high",
                "estimated_hours": 6.0,
                "prerequisites": ["recursion"],
                "status": "pending",
                "completion_criteria": "Solve 5 tree traversal problems under 30 mins."
            })
        if not phase_3_tasks:
            phase_3_tasks.append({
                "title": "System Scalability & REST Contract Design",
                "description": "Design idempotent APIs and configure indexing strategies for high read/write ratio.",
                "priority": "high",
                "estimated_hours": 8.0,
                "prerequisites": ["sql", "api-development"],
                "status": "pending",
                "completion_criteria": "Build and evaluate an end-to-end relational backend architecture."
            })
        if not phase_4_tasks:
            phase_4_tasks.append({
                "title": "Timed Mock Interview Probes",
                "description": "Complete 3 technical verbal walkthroughs covering architecture and edge-case handling.",
                "priority": "critical",
                "estimated_hours": 5.0,
                "prerequisites": ["system-design"],
                "status": "pending",
                "completion_criteria": "Score >= 80% on Technical and Conceptual Depth."
            })

        tasks = []
        for i, t in enumerate(phase_1_tasks, 1):
            t["phase_number"] = 1
            t["phase_title"] = "Phase 01: Core Foundations & Bottlenecks"
            t["order_index"] = i
            tasks.append(t)
        for i, t in enumerate(phase_2_tasks, 1):
            t["phase_number"] = 2
            t["phase_title"] = "Phase 02: Advanced Structures & Mechanics"
            t["order_index"] = len(tasks) + 1
            tasks.append(t)
        for i, t in enumerate(phase_3_tasks, 1):
            t["phase_number"] = 3
            t["phase_title"] = "Phase 03: Domain Specialization"
            t["order_index"] = len(tasks) + 1
            tasks.append(t)
        for i, t in enumerate(phase_4_tasks, 1):
            t["phase_number"] = 4
            t["phase_title"] = "Phase 04: Synthesis & Interview Execution"
            t["order_index"] = len(tasks) + 1
            tasks.append(t)

        return tasks
