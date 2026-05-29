# GymGUY — Fitness Tracker Application

> CPE 231 Database Systems · International Sections 31 & 32 · Semester 2/2025

GymGUY is a full-stack fitness tracking web application that allows users to manage workout plans, log exercise sessions, track personal progress, and compete on a calorie-based leaderboard. The system is built on a 3-tier architecture: a React frontend, an Express REST API, and a PostgreSQL database hosted on Supabase.

---

## Table of Contents

- [Concept](#concept)
- [Team & Responsibilities](#team--responsibilities)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Reports](#reports)
- [Features](#features)

---

## Concept

GymGUY solves the problem of inconsistent workout tracking by combining a structured plan system with a session logging interface inspired by a **todo-list checklist**. Users create workout plans with specific exercises assigned to days of the week, then during each session they tick off each exercise as they complete it — driving `completeness` to update automatically.

Key design decisions:

- **BMR auto-calculation** using the Mifflin-St Jeor formula whenever weight, height, or age changes.
- **Completeness tracking** — each workout plan tracks how many plan exercises have been completed as a percentage, triggered automatically on every session insert or delete.
- **Leaderboard** ranks users by estimated calories burned per month, calculated by joining session exercises through workout plan exercises to the exercise calorie rate.
- **Consistency score** is computed on-the-fly from the ratio of active training days to planned days, so it always reflects real behaviour without storing a stale column.
- **Soft architecture** — report queries are separated per team member into their own service/controller/route files, allowing parallel development without merge conflicts.

---

## Team & Responsibilities

### Wichitchai 3439 — Auth · User Management · Reports

| Layer | Files | What it does |
|---|---|---|
| Backend model | `auth.model.ts` `users.model.ts` | Zod schemas for Register, Login, Refresh, PatchUser |
| Backend middleware | `auth.middleware.ts` | Verifies Bearer JWT on every protected route |
| Backend service | `auth.service.ts` `users.service.ts` | Register/Login/Refresh/Logout logic, BMR calculation, dashboard aggregation, leaderboard ranking |
| Backend controller | `auth.controller.ts` `users.controller.ts` | HTTP handlers, error formatting |
| Backend routes | `auth.routes.ts` `users.routes.ts` | Route registration |
| Backend reports | `reportWichitchai.service/controller/routes.ts` | Exercise popularity, User weight & BMI progress, Leaderboard consistency vs calories |
| Frontend api | `auth.api.ts` `user.api.ts` | fetch wrappers for all auth and user endpoints |
| Frontend pages | `Login.tsx` `Register.tsx` `Profile.tsx` | Auth forms, profile view and edit |
| Frontend layout | `fetchWithAuth.ts` `auth.ts` `App.tsx` `ProtectedRoute.tsx` `AppLayout.tsx` `Sidebar.tsx` | Shared infrastructure used by the whole team |

---

### Kittipich 3405 — Workout Plans · Dashboard · Leaderboard · Reports

| Layer | Files | What it does |
|---|---|---|
| Backend service | `WorkoutPlan.service.ts` | CRUD for workout plans, line-item enrichment, difficulty calculation, completeness update trigger |
| Backend reports | `Est_Report.route.ts` + service/controller | Score-exercise summary, plan completeness distribution, plan exercises by muscle |
| Frontend pages | `Dashboard.tsx` `LeaderBoard.tsx` | Stats cards, banner slider, recent sessions, leaderboard table with search |

---

### Wathit 3495 — Exercises · Muscles · Reports

| Layer | Files | What it does |
|---|---|---|
| Backend service | `exercises.service.ts` `muscles.service.ts` | Exercise CRUD with filtering, muscle group management |
| Backend reports | `wathit_reports.routes.ts` + service/controller | Exercise popularity by category, exercise calories burned, total energy burned |
| Frontend pages | `Exercises.tsx` `ExerciseDetail.tsx` `WorkoutPlans.tsx` | Exercise browser with filter/search, detail view with muscle mapping |

---

### Aphichaya 3447  — Workout Sessions · Reports

| Layer | Files | What it does |
|---|---|---|
| Backend model | `WorkoutSession.model.ts` | Zod schemas for CreateWorkoutSession, UpdateWorkoutSession |
| Backend service | `WorkoutSession.service.ts` | Session CRUD, auto-trigger `updatePlanCompleteness()` after every insert/delete |
| Backend reports | `may_report.route.ts` + service/controller | Total calories burned, total workout sessions, plan achievement |
| Frontend pages | `WorkoutSessions.tsx` `LogSession.tsx` `SessionDetail.tsx` | Session history, todo-list session logger, session detail view |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Auth | JSON Web Tokens (jsonwebtoken) — access token 15 min, refresh token 7 days |
| Validation | Zod |
| Password hashing | bcrypt |

---

## Database Schema

### Core Tables

| Table | Key Columns | Notes |
|---|---|---|
| `users` | id, username, email, password, age, weight, height, sex, user_level, fitness_goal, bmr | BMR recalculated on every PATCH |
| `exercise` | id, code, name, calorie_rate, score_based, category, difficulty_level | |
| `exercise_muscle_aff` | exercise_id, name (muscle enum), impact_level | Many-to-many: exercise ↔ muscle |
| `workout_plan` | id, code, plan_name, user_id, difficulty, completeness, start_date, end_date | completeness auto-updated by session trigger |
| `workout_plan_exercise` | id, workout_plan_id, exercise_id, target_sets, target_reps, target_duration, target_weight, date_number | date_number = day of week (1=Mon…7=Sun) |
| `workout_session` | id, session_no, user_id, workout_plan_id, session_datetime | |
| `workout_session_exercise` | id, workout_session_id, workout_plan_exercise_id, notes | Links to plan exercise — no duplicate exercise_id needed |
| `user_caution` | user_id, caution_type, serious_level | Injury/health flags per user |

### Enums

| Enum | Values |
|---|---|
| `sex` | male, female |
| `user_level` | beginner, intermediate, advanced, professional |
| `fitness_goal` | weight_loss, muscle_gain, strength, endurance, flexibility, general_health |
| `exercise_category` | strength, cardio, body_weight, flexibility, plyometric, olympic_lifting, strongman |
| `muscle` | chest, quads, heart, abs, lower_back |
| `scale_number` | 1–5 |
| `caution_type` | injury, chronic_health, allergy, physical_restriction, medication, diet |

---

## Project Structure

```
SuperProjectGymGuy/
├── server/
│   └── src/
│       ├── database/
│       │   ├── drizzle/schema.ts       # Drizzle table definitions
│       │   └── supabase.ts             # Pool + db export
│       ├── models/                     # Zod validation schemas
│       ├── middleware/
│       │   └── auth.middleware.ts      # JWT verification
│       ├── service/                    # Business logic + SQL queries
│       ├── controller/                 # HTTP request handlers
│       ├── routes/                     # Express routers
│       └── app.ts                      # Express app entry point
│
└── client/
    └── src/
        ├── api/
        │   ├── auth.ts                 # localStorage helpers
        │   ├── auth.api.ts             # login / register / logout
        │   ├── fetchWithAuth.ts        # auto token refresh wrapper
        │   ├── user.api.ts             # user + dashboard + leaderboard
        │   ├── exercise.api.ts
        │   ├── plan.api.ts
        │   ├── workout.api.ts
        │   └── report.api.ts
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.tsx
        │   │   ├── Sidebar.tsx
        │   │   └── ProtectedRoute.tsx
        │   └── ui/
        │       ├── Button.tsx
        │       ├── Input.tsx
        │       ├── Modal.tsx
        │       ├── Badge.tsx
        │       ├── StatsCard.tsx
        │       ├── BannerSlider.tsx
        │       └── index.ts
        ├── pages/
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Profile.tsx
        │   ├── Dashboard.tsx
        │   ├── LeaderBoard.tsx
        │   ├── Exercises.tsx
        │   ├── ExerciseDetail.tsx
        │   ├── WorkoutPlans.tsx
        │   ├── WorkoutSessions.tsx
        │   ├── LogSession.tsx
        │   ├── SessionDetail.tsx
        │   └── Reports.tsx
        └── App.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project with the schema migrated

### 1. Clone the repository

```bash
git clone https://github.com/SinghLemonH/SuperProjectGymGuy.git
cd SuperProjectGymGuy
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Set up environment variables

See [Environment Variables](#environment-variables) below.

### 5. Run database migrations

```bash
cd server
npx drizzle-kit pull   # sync schema from Supabase
```

### 6. Start the development servers

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

The API runs on `http://localhost:3000` and the frontend on `http://localhost:5173`.

---

## Environment Variables

### `server/.env.local`

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/postgres"
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

### `client/.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account, returns JWT pair |
| POST | `/login` | — | Login, returns JWT pair |
| POST | `/refresh` | — | Exchange refresh token for new access token |
| POST | `/logout` | ✅ | Invalidate session |

### Users — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:id` | ✅ | Get user profile |
| GET | `/:id/dashboard` | ✅ | BMR, calories, active plan, sessions |
| GET | `/:id/leaderboard` | ✅ | Monthly rank + top 10 |
| PATCH | `/:id` | ✅ | Update profile, auto-recalculates BMR |
| DELETE | `/:id` | ✅ | Delete user |

### Exercises — `/api/v1/exercises`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | List with filter/search/pagination |
| GET | `/:id` | ✅ | Exercise detail + muscle mapping |
| POST | `/` | ✅ | Create exercise |
| PATCH | `/:id` | ✅ | Update exercise |
| DELETE | `/:id` | ✅ | Delete exercise |

### Workout Plans — `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/workout-plans` | ✅ | List all plans with search |
| GET | `/workout-plans/:id` | ✅ | Plan detail with line items |
| POST | `/workout-plans` | ✅ | Create plan with exercises |
| PATCH | `/workout-plans/:id` | ✅ | Update plan, recalculates difficulty |
| DELETE | `/workout-plans/:id` | ✅ | Delete plan |

### Workout Sessions — `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/:id/workout-sessions` | ✅ | User session history |
| GET | `/workout-sessions/:id` | ✅ | Session detail |
| POST | `/workout-sessions` | ✅ | Log session, triggers completeness update |
| PATCH | `/workout-sessions/:id` | ✅ | Update session |
| DELETE | `/workout-sessions/:id` | ✅ | Delete session, triggers completeness update |

### Reports — `/api/v1/reports`

| Path | Owner | Description |
|---|---|---|
| `/exercise-popularity` | Wichitchai | Usage count per exercise with filters |
| `/user-weight-bmi-progress` | Wichitchai | BMI + status per user |
| `/leaderboard-consistency-calories` | Wichitchai | Monthly rank by calories + consistency score |
| `/score-exercise-summary` | Kittipich | Total score per exercise per plan |
| `/plan-completeness-distribution` | Kittipich | Completeness % across all plans |
| `/plan-exercises-by-muscle` | Kittipich | Muscle group distribution per plan |
| `/exercise-calories-burned` | Wathit | Calories burned per exercise type |
| `/total-energy-burned` | Wathit | Aggregate energy per user |
| `/total-calories-burned` | Aphichaya | Calories burned per session |
| `/total-workout-sessions` | Aphichaya | Session count over time |
| `/plan-achievement` | Aphichaya | Completeness achievement per plan |

---

## Features

- **JWT Authentication** with auto-refresh — access tokens expire in 15 minutes; `fetchWithAuth.ts` silently refreshes using the 7-day refresh token without the user noticing.
- **BMR Calculator** — Mifflin-St Jeor formula, recalculated server-side on every profile update.
- **Todo-style Session Logger** — exercises pulled from the selected plan are displayed as a checklist grouped by `date_number` (day of week). Ticking all items and submitting automatically updates plan completeness.
- **Auto Completeness** — `updatePlanCompleteness()` fires server-side after every session insert or delete, keeping the value always accurate.
- **Leaderboard** — monthly ranking by estimated calories burned, with consistency score showing active days / 30 days.
- **12 Reports** across 4 team members, each with query parameter filtering and paginated output.
- **Banner Slider** — rotating promotional/news banners on the dashboard with auto-advance and manual dot/arrow navigation.
- **Protected Routes** — all pages except Login and Register require a valid token; unauthenticated users are redirected automatically.

---

## License

This project was built for academic purposes as part of CPE 231 Database Systems at KMUTT.
