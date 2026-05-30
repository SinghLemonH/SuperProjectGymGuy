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
  id: string;                      // synthesized (backend has no per-row id in detail)
  exerciseId: string;              // UUID ของ exercise จริงๆ สำหรับส่ง backend
  exerciseName: string;
  category?: string;
  targetSets: number | null;
  targetReps: number | null;       // not returned by backend -> null
  targetDuration: number | null;
  targetWeight: number | null;
  note: string | null;
  dateNumber: number;              // backend has no day grouping -> defaults to 1
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

export interface CreateWorkoutPlanPayload {
  planName: string;
  startDate: string;
  endDate: string;
  description?: string;
  difficulty?: number;
}

// ─── Raw backend shapes (snake_case) ────────────────────────────────────────────

interface RawListPlan {
  id: string;
  code: string;
  plan_name: string;
  user_id: string;
  difficulty: number | string | null;
  start_date: string;
  end_date: string;
  description: string | null;
  completeness: number | string | null;
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
  exercise_id: string;
  exercise_code: string;
  exercise_name: string;
  exercise_category: string | null;
  exercise_difficulty_level: string | number | null;
  calorie_rate: number | null;
  score_based: number | null;
  target_sets: number | null;
  target_duration: number | null;
  target_weight: number | null;
  note: string | null;
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
  code: r.code,
  planName: r.plan_name,
  difficulty: num(r.difficulty),
  startDate: r.start_date,
  endDate: r.end_date,
  description: r.description,
  completeness: num(r.completeness),
});

const mapLineItem = (li: RawLineItem, i: number): WorkoutPlanExercise => ({
  id: `${li.exercise_code ?? "ex"}-${i}`,
  exerciseId: li.exercise_id,
  exerciseName: li.exercise_name,
  category: li.exercise_category ?? undefined,
  targetSets: li.target_sets ?? null,
  targetReps: null,
  targetDuration: li.target_duration ?? null,
  targetWeight: li.target_weight ?? null,
  note: li.note ?? null,
  dateNumber: 1,
});

// ─── API calls ──────────────────────────────────────────────────────────────────

/** All plans for a user. Uses the existing GET /users/:id/workout-plans endpoint. */
export const getUserPlans = async (userId: string): Promise<WorkoutPlanListResponse> => {
  const res = await apiFetch<{ data: RawListPlan[]; total?: number }>(
    `/users/${userId}/workout-plans`
  );
  return {
    data: (res.data ?? []).map(mapListPlan),
    total: res.total,
  };
};

/** Single plan + exercises. `idOrCode` is the plan uuid (from the list) or its code. */
export const getWorkoutPlanById = async (idOrCode: string): Promise<WorkoutPlan> => {
  const res = await apiFetch<RawDetailResponse>(`/${idOrCode}`);
  console.log('line_items:', res.line_items)
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
      line_items: [],
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