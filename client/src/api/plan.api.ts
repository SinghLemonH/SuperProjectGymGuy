import { apiFetch } from "./fetchWithAuth";

/* ────────────────────────────────────────────────────────────────────────────
 * This file talks to the EXISTING backend without any server changes.
 *
 * Endpoints actually available on the server (see app.ts / routes):
 *   GET    /api/v1/users/:userId/workout-plans   -> { data: RawListPlan[] }   (auth)
 *   GET    /api/v1/:idOrCode                      -> { header, line_items }
 *   POST   /api/v1/                               -> create  (needs plan_code + line_items)
 *   PUT    /api/v1/:idOrCode                      -> update header fields
 *   DELETE /api/v1/:idOrCode                      -> delete
 *
 * The backend speaks snake_case, so we translate to the camelCase shapes the
 * React pages expect right here, keeping the components clean.
 * ──────────────────────────────────────────────────────────────────────────── */

// ─── Client-facing types (camelCase) ───────────────────────────────────────────

export interface WorkoutPlanExercise {
  id: string;                      // line-item row id (workout_plan_exercise.id)
  exerciseId: string;              // the exercise uuid (needed to log a session)
  exerciseName: string;
  category?: string;
  targetSets: number | null;
  targetReps: number | null;
  targetDuration: number | null;
  targetWeight: number | null;
  note: string | null;
  dateNumber: number;              // which workout day this exercise belongs to
  completed: boolean;              // already logged in a session?
}

export interface WorkoutPlan {
  id: string;                      // uuid (list) or the idOrCode used to fetch (detail)
  code?: string;
  planName: string;
  difficulty: number;
  startDate: string;
  endDate: string;
  description: string | null;
  completeness: number;
  exerciseCount?: number;          // only known on the detail view
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanListResponse {
  data: WorkoutPlan[];
  total?: number;
}

// One chosen exercise when creating/updating a plan.
export interface CreatePlanExercise {
  exerciseId: string;
  targetSets: number;
  targetReps?: number;
  targetDuration?: number;
  targetWeight?: number;
  note?: string;
  dateNumber?: number;
}

export interface CreateWorkoutPlanPayload {
  planName: string;
  startDate: string;
  endDate: string;
  description?: string;
  difficulty?: number;
  lineItems?: CreatePlanExercise[];   // exercises picked in the modal
}

// ─── Raw backend shapes (snake_case) ────────────────────────────────────────────

interface RawListPlan {
  id: string;
  workout_plan_code: string;
  workout_plan_name: string;
  username?: string;
  difficulty: number | string | null;
  start_date: string;
  end_date: string;
  description: string | null;
  completeness: number | string | null;
  exercise_count?: number | string | null;
}

interface RawDetailHeader {
  plan_code: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  description: string | null;
  completeness: number | string | null;
  difficulty: number | string | null;
}

interface RawLineItem {
  line_item_id?: string;
  exercise_id?: string;
  exercise_code: string;
  exercise_name: string;
  exercise_category: string | null;
  exercise_difficulty_level: string | number | null;
  calorie_rate: number | null;
  score_based: number | null;
  target_sets: number | null;
  target_reps: number | null;
  target_duration: number | null;
  target_weight: number | null;
  note: string | null;
  date_number: number | null;
  completed?: boolean | null;
}

interface RawDetailResponse {
  header: RawDetailHeader;
  line_items: RawLineItem[];
}

// ─── Mappers ────────────────────────────────────────────────────────────────────

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};

const mapListPlan = (r: RawListPlan): WorkoutPlan => ({
  id: r.id,
  code: r.workout_plan_code,
  planName: r.workout_plan_name,
  difficulty: num(r.difficulty),
  startDate: r.start_date,
  endDate: r.end_date,
  description: r.description,
  completeness: num(r.completeness),
  exerciseCount: r.exercise_count != null ? num(r.exercise_count) : undefined,
});

const mapLineItem = (li: RawLineItem, i: number): WorkoutPlanExercise => ({
  id: li.line_item_id ?? `${li.exercise_code ?? "ex"}-${i}`,
  exerciseId: li.exercise_id ?? "",
  exerciseName: li.exercise_name,
  category: li.exercise_category ?? undefined,
  targetSets: li.target_sets ?? null,
  targetReps: li.target_reps ?? null,
  targetDuration: li.target_duration ?? null,
  targetWeight: li.target_weight ?? null,
  note: li.note ?? null,
  dateNumber: li.date_number ?? 1,
  completed: li.completed === true,
});

// ─── API calls ──────────────────────────────────────────────────────────────────

/**
 * All workout plans that exist in the database (every user's plans), including
 * each plan's exercise count. Uses the existing GET /api/v1/ list endpoint.
 *
 * NOTE: `userId` is kept for call-site compatibility but is intentionally
 * ignored — we show every plan in Supabase. To restrict to the logged-in user
 * again, switch the call back to `/users/${userId}/workout-plans`.
 */
export const getUserPlans = async (_userId?: string): Promise<WorkoutPlanListResponse> => {
  const res = await apiFetch<{ data: RawListPlan[]; total?: number }>(`?limit=1000`);
  return {
    data: (res.data ?? []).map(mapListPlan),
    total: res.total,
  };
};

/** Single plan + exercises. `idOrCode` is the plan uuid (from the list) or its code. */
export const getWorkoutPlanById = async (idOrCode: string): Promise<WorkoutPlan> => {
  const res = await apiFetch<RawDetailResponse>(`/${idOrCode}`);
  const h = res.header;
  const exercises = (res.line_items ?? []).map(mapLineItem);
  return {
    id: idOrCode,
    code: h.plan_code,
    planName: h.plan_name,
    difficulty: num(h.difficulty),
    startDate: h.start_date,
    endDate: h.end_date,
    description: h.description,
    completeness: num(h.completeness),
    exerciseCount: exercises.length,
    exercises,
  };
};

/**
 * Create a plan. The existing backend expects snake_case + a plan_code +
 * line_items, so we generate a code and pass the exercises array through
 * (empty for a header-only plan).
 */
export const createWorkoutPlan = (payload: CreateWorkoutPlanPayload): Promise<WorkoutPlan> =>
  apiFetch("", {
    method: "POST",
    body: JSON.stringify({
      plan_code: `WP-${Date.now().toString(36).toUpperCase()}`,
      plan_name: payload.planName,
      start_date: payload.startDate,
      end_date: payload.endDate,
      description: payload.description ?? "",
      difficulty: payload.difficulty ?? 1,
      // map the chosen exercises to the snake_case shape the backend expects
      line_items: (payload.lineItems ?? []).map((li) => ({
        exercise_id: li.exerciseId,
        target_sets: li.targetSets,
        ...(li.targetReps != null ? { target_reps: li.targetReps } : {}),
        ...(li.targetDuration != null ? { target_duration: li.targetDuration } : {}),
        ...(li.targetWeight != null ? { target_weight: li.targetWeight } : {}),
        ...(li.note ? { note: li.note } : {}),
        date_number: li.dateNumber ?? 1,
      })),
    }),
  });

export const updateWorkoutPlan = (
  idOrCode: string,
  payload: Partial<CreateWorkoutPlanPayload>
): Promise<WorkoutPlan> =>
  apiFetch(`/${idOrCode}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(payload.planName !== undefined ? { plan_name: payload.planName } : {}),
      ...(payload.startDate !== undefined ? { start_date: payload.startDate } : {}),
      ...(payload.endDate !== undefined ? { end_date: payload.endDate } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }),
  });

export const deleteWorkoutPlan = (idOrCode: string): Promise<void> =>
  apiFetch(`/${idOrCode}`, { method: "DELETE" });

// ─── Finish a workout session ────────────────────────────────────────────────
// Logs the completed exercises of a plan. The backend session schema expects
// workout_plan_exercise_id (the line-item id, NOT the exercise id) plus
// positive actualReps/actualDuration. Endpoint: POST /api/v1/workout-sessions.

export interface FinishSessionItem {
  workoutPlanExerciseId: string;   // = WorkoutPlanExercise.id
  reps?: number;
  durationSec?: number;
  sets?: number;
  note?: string;
}

export const finishWorkoutSession = (params: {
  userId: string;
  workoutPlanId: string;
  items: FinishSessionItem[];
}): Promise<unknown> =>
  apiFetch("/workout-sessions", {
    method: "POST",
    body: JSON.stringify({
      user_id: params.userId,
      workout_plan_id: params.workoutPlanId,
      session_datetime: new Date().toISOString(),
      exercises: params.items.map((it) => ({
        workout_plan_exercise_id: it.workoutPlanExerciseId,
        // backend requires these to be positive integers
        actualReps: it.reps && it.reps > 0 ? it.reps : 1,
        actualDuration: it.durationSec && it.durationSec > 0 ? it.durationSec : 1,
        ...(it.sets && it.sets > 0 ? { actualSet: it.sets } : {}),
        ...(it.note ? { notes: it.note } : {}),
      })),
    }),
  });