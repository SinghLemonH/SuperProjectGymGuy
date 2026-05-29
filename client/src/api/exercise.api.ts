import { apiFetch } from "./fetchWithAuth";

// README: Support ทั้ง camelCase และ snake_case เพื่อป้องกันบัคจากชั้น Database
export type MuscleEnum = "chest" | "quads" | "heart" | "abs" | "lower_back";

export type ExerciseCategoryEnum =
  | "strength" | "cardio" | "body_weight" | "flexibility"
  | "plyometric" | "olympic_lifting" | "strongman";

export type ScaleNumber = 1 | 2 | 3 | 4 | 5 | string | number;

export interface ExerciseMuscleMapping {
  id: string;
  muscle: MuscleEnum;
  impactLevel?: ScaleNumber;   // camelCase
  impact_level?: ScaleNumber;  // snake_case
}

export interface Exercise {
  id: string;
  code: string;
  name: string;
  category: ExerciseCategoryEnum;
  difficultyLevel?: ScaleNumber;  // camelCase
  difficulty_level?: ScaleNumber; // snake_case
  calorieRate?: number;           // camelCase
  calorie_rate?: number;          // snake_case
  scoreBased?: number | boolean;  // camelCase
  score_based?: number | boolean; // snake_case
  description: string | null;
  muscleMapping?: ExerciseMuscleMapping[];  // camelCase
  muscle_mapping?: ExerciseMuscleMapping[]; // snake_case
}

export type ExerciseListItem = Omit<Exercise, "muscleMapping">;

export interface ExerciseListResponse {
  data: ExerciseListItem[];
  total?: number;
  page?: number;
  limit?: number;
}

// GET /api/v1/exercises — no auth required
export const getExercises = (query = ""): Promise<ExerciseListResponse> =>
  apiFetch(`/exercises${query ? `?${query}` : ""}`);

// GET /api/v1/exercises/:id — no auth required
export const getExerciseById = (id: string): Promise<Exercise> =>
  apiFetch(`/exercises/${id}`);

// GET /api/v1/muscles — no auth required
export const getMuscles = (): Promise<{ muscles: MuscleEnum[] }> =>
  apiFetch("/muscles");