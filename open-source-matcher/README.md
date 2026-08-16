# OpenSource Junior Matcher

A collaborative platform that connects junior developers and students to form micro-teams (2–3 people) and solve real open-source GitHub issues labeled as `good first issue`, `help wanted`, or `beginner friendly`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, Flask, Flask-RESTful, SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Flask-Bcrypt |
| Database | SQLite (dev) / PostgreSQL (prod) via Flask-Migrate |
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6, Axios, Lucide React |
| Auth | JWT (access tokens, 24h expiry) |
| GitHub | GitHub REST API v2022-11-28 (search/issues) |

---

## Project Structure

```
open-source-matcher/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory, extension init, blueprint registration
│   │   ├── config.py            # Config classes (Dev / Prod)
│   │   ├── models/
│   │   │   ├── user.py          # User, Skill (many-to-many)
│   │   │   └── team.py          # Issue, Team, TeamMembership, PullRequestTracking
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # /api/auth/*
│   │   │   ├── user_routes.py   # /api/user/*
│   │   │   ├── github_routes.py # /api/github/issues, /api/issues/*
│   │   │   └── team_routes.py   # /api/teams/*
│   │   └── services/
│   │       └── github_service.py  # GitHub API integration
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/          # Badge, ProtectedRoute, CreateTeamModal
    │   │   └── layout/          # Navbar
    │   ├── context/
    │   │   └── AuthContext.jsx  # JWT auth state
    │   ├── pages/
    │   │   ├── ExplorePage.jsx   # GitHub issue explorer + filters
    │   │   ├── DashboardPage.jsx # User profile + team history
    │   │   ├── TeamsPage.jsx     # Open teams list
    │   │   ├── TeamSpacePage.jsx # Team workspace + checklist + PR tracking
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── services/
    │   │   └── api.js           # Axios instance + all API calls
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: set SECRET_KEY, JWT_SECRET_KEY, GITHUB_TOKEN

# Run (creates SQLite DB automatically)
python run.py
# API available at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with username, email, password |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get authenticated user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get own profile |
| PUT | `/api/user/profile` | Update profile, skills, role |
| GET | `/api/user/stats` | Get collaboration stats |

### GitHub / Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/github/issues` | Search GitHub issues (`?language=&label=&q=&page=`) |
| POST | `/api/issues/import` | Save a GitHub issue locally |
| GET | `/api/issues` | List locally imported issues |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create a team for an issue |
| GET | `/api/teams` | List all teams |
| GET | `/api/teams/:id` | Team detail with members and PRs |
| POST | `/api/teams/:id/join` | Join a team (max 3 members) |
| PATCH | `/api/teams/:id/status` | Update team status + register PR URL |
| GET | `/api/teams/my` | Teams where the authenticated user is a member |

---

## Environment Variables

### Backend (`.env`)
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///matcher.db
GITHUB_TOKEN=ghp_your_github_personal_access_token
FLASK_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

> `GITHUB_TOKEN` is optional but strongly recommended — unauthenticated GitHub API requests are limited to 10 requests/minute.

---

## Data Models

```
User ──< user_skills >── Skill
User ──< TeamMembership >── Team ──> Issue
Team ──< PullRequestTracking
```

- **User**: profile, GitHub username, role (Frontend/Backend/Fullstack), experience level, skills
- **Skill**: technology name, many-to-many with User
- **Issue**: imported GitHub issue with metadata, status (Open → In Team → Solved)
- **Team**: micro-team (max 3) linked to an Issue, status lifecycle (Forming → In Progress → PR Submitted → Merged)
- **TeamMembership**: user + team + role_in_team
- **PullRequestTracking**: PR URL + status per team

---

## Features

- **Issue Explorer**: Browse real GitHub issues filtered by language, label and keyword with pagination
- **Team Matchmaking**: Create or join teams (2–3 people) around a specific issue
- **Team Space**: Collaborative workspace with issue summary, member list, interactive best-practices checklist, and PR submission form
- **User Dashboard**: Active teams, merged PR count, skills, editable profile
- **JWT Authentication**: Secure registration and login with bcrypt-hashed passwords
