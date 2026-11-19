import networkx as nx
from typing import List, Dict, Any, Set

class SkillDependencyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_default_hierarchy()

    def _build_default_hierarchy(self):
        # Default core nodes
        skills = [
            ("programming-fundamentals", "Fundamentals"),
            ("oop", "Object Oriented Programming"),
            ("dsa", "Data Structures & Algorithms"),
            ("recursion", "Recursion & Backtracking"),
            ("trees", "Trees & BST"),
            ("graphs", "Graph Algorithms"),
            ("dynamic-programming", "Dynamic Programming"),
            ("sql", "SQL & Relational Databases"),
            ("db-optimization", "Query Optimization & Indexing"),
            ("api-development", "REST APIs & Protocols"),
            ("system-design", "Distributed System Design"),
            ("communication", "Technical Communication")
        ]
        for slug, name in skills:
            self.graph.add_node(slug, name=name)

        # Prerequisites: A -> B means A is prerequisite for B
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
            self.graph.add_edge(src, dst, relation="prerequisite")

    def get_prerequisites(self, skill_slug: str) -> List[str]:
        if skill_slug in self.graph:
            return list(self.graph.predecessors(skill_slug))
        return []

    def get_dependents(self, skill_slug: str) -> List[str]:
        if skill_slug in self.graph:
            return list(self.graph.successors(skill_slug))
        return []

    def identify_bottlenecks(self, student_skills_map: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        bottlenecks = []
        for node in self.graph.nodes():
            current_state = student_skills_map.get(node, {})
            score = current_state.get("proficiency_score", 0.0)
            
            # If this node is weak (< 50) and has multiple downstream dependents
            if score < 50.0:
                dependents = self.get_dependents(node)
                if dependents:
                    # Calculate how many dependents suffer
                    affected = [d for d in dependents if student_skills_map.get(d, {}).get("proficiency_score", 0.0) < 65.0]
                    if affected or len(dependents) >= 2:
                        bottlenecks.append({
                            "skill_slug": node,
                            "skill_name": self.graph.nodes[node].get("name", node),
                            "current_score": score,
                            "affected_dependents": affected,
                            "severity": "high" if len(dependents) >= 2 else "medium",
                            "rationale": f"Foundational weakness in {node} is constraining growth across {', '.join(dependents)}."
                        })
        return bottlenecks
