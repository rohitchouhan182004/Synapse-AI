# SYNAPSE: AI-Powered Student Digital Twin & Personal Intelligence Platform

SYNAPSE is a next-generation personal intelligence laboratory that models, visualizes, and accelerates a student's engineering capability. Instead of treating learning activities as isolated events, SYNAPSE constructs a continuously calibrated **Living Digital Twin** synthesized from verified code execution, verbal conceptual depth, prerequisite graph traversal, and learning agility telemetry.

---

## Key Highlights

- **Living Neural Topology:** Interactive force/radial graph (D3.js + SVG) rendering capability domains, prerequisite vectors, bottleneck alerts, and Bayesian confidence intervals.
- **Explainable Deterministic Engine:** Multi-factor evidence weighting, Bayesian skill updates, confidence saturation, NetworkX dependency graph traversal, and mistake frequency analysis — completely independent of external LLMs.
- **Target Role Alignment vs. Interview Readiness:** Decouples demonstrated competence from verbal mock execution to provide realistic career posture across Backend, Full Stack, AI, and Software Engineering.
- **Signature Future Self Simulator:** Isolated scratch-memory sandbox that projects multi-criteria role alignment gains from hypothetical skill investments without altering authoritative student records.
- **Adaptive 4-Phase Roadmap:** Automatically structures development milestones based on identified concept bottlenecks and prerequisite graph traversal.
- **Zero-Friction Local Run:** Clean modular monolith architecture without Docker, Kubernetes, or microservice overhead.

---

## Technology Stack

### Backend
- **Python:** 3.11+ (verified on 3.12.0)
- **Framework:** FastAPI, Pydantic v2
- **Persistence & ORM:** SQLAlchemy 2.0, Alembic, PyMySQL (with automatic zero-config persistent SQLite fallback for immediate local runs)
- **Security:** Argon2id (`argon2-cffi`), PyJWT (access + refresh tokens)
- **Algorithmic Intelligence:** NetworkX, NumPy, Scikit-learn
- **Testing:** Pytest

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Obsidian dark command center aesthetic)
- **Visualizations:** D3.js (interactive neural force graph), Recharts (time-series telemetry)
- **Icons & Motion:** Lucide React, Framer Motion
- **State Management:** TanStack Query v5

---

## Quick Start (Local Development)

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js v20+** and **npm** installed

---

### 2. Backend Setup

Open a terminal in the project root:

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed master skills, career roles, questions, and the demo student twin
python scripts/seed_database.py

# Launch FastAPI backend server (Runs on http://127.0.0.1:8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive Swagger API Documentation is available at:
`http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

Open a second terminal in the project root:

```powershell
# Navigate to frontend directory
cd frontend

# Install packages (if not already installed)
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demonstration Credentials

A fully calibrated student profile (**Aravind Sharma**) with historical assessment evidence, concept bottlenecks, and snapshot evolution is pre-seeded:

- **Email:** `demo@synapse.ai`
- **Password:** `SynapseDemo2026!`
- **One-Click Option:** Click the **"Load Demo Student Twin"** button on the login screen.

### Pre-Seeded Capability State:
- **Java:** 82% (High confidence, verified via multiple tests)
- **OOP:** 78% (Verified via assessments and mock probe)
- **SQL & DB:** 74% (Identified blind spot: self-reported 90%, assessed 74%)
- **DSA:** 42% (Declining trend detected)
- **Trees & BST:** 31% (Active concept bottleneck constraining Graphs & DP)
- **Graphs:** 28%
- **Dynamic Programming:** 24%
- **Technical Communication:** 76% (Verified via interview verbal probe)
- **Distributed System Design:** Insufficient evidence (accurately represented as uncertain rather than falsely zero)

---

## Automated Verification & Testing

### Run Backend Tests (11/11 passing):
```powershell
cd backend
pytest -v
```

### Run Frontend Build Check:
```powershell
cd frontend
npm run build
```

---

## API Endpoints Architecture

All endpoints are versioned under `/api/v1/`:

- `POST /api/v1/auth/register` — Identity registration with Argon2id hashing
- `POST /api/v1/auth/login` — JWT token generation
- `GET  /api/v1/students/me` — Authenticated student profile
- `POST /api/v1/students/onboarding` — Baseline calibration
- `GET  /api/v1/dashboard/overview` — 5 core questions & Living Twin summary
- `GET  /api/v1/digital-twin/me` — Current Digital Twin snapshot
- `GET  /api/v1/digital-twin/me/history` — Longitudinal snapshot timeline
- `POST /api/v1/digital-twin/me/simulate` — Future Self hypothetical sandbox
- `GET  /api/v1/skills/me` — Competency registry with Bayesian scores
- `GET  /api/v1/skills/me/{slug}` — Evidence provenance & prerequisite inspector
- `GET  /api/v1/coding/questions` — Algorithmic question library
- `POST /api/v1/coding/submissions` — Code submission, evaluation & live Twin update
- `POST /api/v1/interviews/sessions` — Initialize conceptual mock interview
- `POST /api/v1/interviews/answers` — Analytical rubric scoring & verbal evidence logging
- `GET  /api/v1/careers/roles` — Role alignment vs interview readiness metrics
- `POST /api/v1/careers/compare` — Multi-role competency diffing
- `GET  /api/v1/roadmaps/me` — Adaptive 4-phase milestone path
- `POST /api/v1/roadmaps/tasks/{id}/toggle` — Live task completion toggle
- `GET  /api/v1/analytics/overview` — Time-series telemetry and velocity curves
