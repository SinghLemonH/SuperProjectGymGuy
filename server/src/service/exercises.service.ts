import { db } from "../database/supabase";
import { exercise, exerciseMuscleAff, workoutPlanExercise, workoutSessionExercise } from "../database/drizzle/schema";
import { eq, inArray, or, sql } from "drizzle-orm";
import {
  CreateExerciseInput,
  ExerciseQueryInput,
  ExerciseResponse,
  MuscleResponse,
  PatchExerciseInput,
} from "../models/exercises.model";

function buildMuscleMap(rows: Array<{ id: string; exerciseId: string; name: string; impactLevel: string }>) {
  return rows.reduce<Record<string, MuscleResponse[]>>((acc, row) => {
    const list = acc[row.exerciseId] ?? [];
    list.push({ id: row.id, muscle: row.name as MuscleResponse["muscle"], impact_level: row.impactLevel as MuscleResponse["impact_level"] });
    acc[row.exerciseId] = list;
    return acc;
  }, {});
}

export async function listExercises(query: ExerciseQueryInput): Promise<{ data: ExerciseResponse[]; page: number; limit: number }> {
  let baseQuery = db.select().from(exercise);

  if (query.category) {
    baseQuery = baseQuery.where(eq(exercise.category, query.category));
  }

  if (query.difficulty_level) {
    baseQuery = baseQuery.where(eq(exercise.difficultyLevel, query.difficulty_level));
  }

  if (query.search) {
    const pattern = `%${query.search.toLowerCase()}%`;
    baseQuery = baseQuery.where(
      or(
        sql`LOWER(${exercise.name}) LIKE ${pattern}`,
        sql`LOWER(${exercise.code}) LIKE ${pattern}`
      )
    );
  }

  if (query.muscle) {
    const ids = await db.select({ exerciseId: exerciseMuscleAff.exerciseId }).from(exerciseMuscleAff).where(eq(exerciseMuscleAff.name, query.muscle));
    const exerciseIds = ids.map((row) => row.exerciseId);
    if (exerciseIds.length === 0) {
      return { data: [], page: query.page, limit: query.limit };
    }
    baseQuery = baseQuery.where(inArray(exercise.id, exerciseIds));
  }

  const exercises = await baseQuery.limit(query.limit).offset((query.page - 1) * query.limit);
  const exerciseIds = exercises.map((row) => row.id);

  const muscleRows = exerciseIds.length > 0
    ? await db.select().from(exerciseMuscleAff).where(inArray(exerciseMuscleAff.exerciseId, exerciseIds))
    : [];

  const muscleMap = buildMuscleMap(muscleRows as Array<{ id: string; exerciseId: string; name: string; impactLevel: string }>);

  const data: ExerciseResponse[] = exercises.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    difficulty_level: row.difficultyLevel,
    calorie_rate: row.calorieRate,
    score_based: row.scoreBased,
    description: row.description ?? null,
    muscle_mapping: muscleMap[row.id] ?? [],
  }));

  return { data, page: query.page, limit: query.limit };
}

export async function getExerciseById(id: string): Promise<ExerciseResponse | null> {
  const [row] = await db.select().from(exercise).where(eq(exercise.id, id));
  if (!row) {
    return null;
  }

  const muscleRows = await db.select().from(exerciseMuscleAff).where(eq(exerciseMuscleAff.exerciseId, id));
  const muscle_mapping = (muscleRows as Array<{ id: string; name: string; impactLevel: string }>).map((muscle) => ({
    id: muscle.id,
    muscle: muscle.name as MuscleResponse["muscle"],
    impact_level: muscle.impactLevel as MuscleResponse["impact_level"],
  }));

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    difficulty_level: row.difficultyLevel,
    calorie_rate: row.calorieRate,
    score_based: row.scoreBased,
    description: row.description ?? null,
    muscle_mapping,
  };
}

export async function createExercise(payload: CreateExerciseInput): Promise<ExerciseResponse> {
  const [created] = await db.insert(exercise).values({
    code: payload.code,
    name: payload.name,
    category: payload.category,
    difficultyLevel: payload.difficulty_level,
    calorieRate: payload.calorie_rate,
    scoreBased: payload.score_based,
    description: payload.description,
  }).returning({ id: exercise.id });

  if (!created?.id) {
    throw new Error("Failed to create exercise");
  }

  const muscleRows = payload.muscle_mapping.map((mapping) => ({
    exerciseId: created.id,
    name: mapping.muscle,
    impactLevel: mapping.impact_level,
  }));

  await db.insert(exerciseMuscleAff).values(muscleRows);
  return getExerciseById(created.id) as Promise<ExerciseResponse>;
}

export async function patchExercise(id: string, payload: PatchExerciseInput): Promise<ExerciseResponse | null> {
  const updatePayload: Record<string, unknown> = {};

  if (payload.code !== undefined) updatePayload.code = payload.code;
  if (payload.name !== undefined) updatePayload.name = payload.name;
  if (payload.category !== undefined) updatePayload.category = payload.category;
  if (payload.difficulty_level !== undefined) updatePayload.difficultyLevel = payload.difficulty_level;
  if (payload.calorie_rate !== undefined) updatePayload.calorieRate = payload.calorie_rate;
  if (payload.score_based !== undefined) updatePayload.scoreBased = payload.score_based;
  if (payload.description !== undefined) updatePayload.description = payload.description;

  if (Object.keys(updatePayload).length > 0) {
    await db.update(exercise).set(updatePayload).where(eq(exercise.id, id));
  }

  if (payload.muscle_mapping !== undefined) {
    await db.delete(exerciseMuscleAff).where(eq(exerciseMuscleAff.exerciseId, id));
    const muscleRows = payload.muscle_mapping.map((mapping) => ({
      exerciseId: id,
      name: mapping.muscle,
      impactLevel: mapping.impact_level,
    }));
    await db.insert(exerciseMuscleAff).values(muscleRows);
  }

  return getExerciseById(id);
}

export async function deleteExercise(id: string): Promise<void> {
  const planRef = await db.select().from(workoutPlanExercise).where(eq(workoutPlanExercise.exerciseId, id)).limit(1);
  if (planRef.length > 0) {
    throw new Error("Cannot delete exercise because it is used in a workout plan");
  }

  const sessionRef = await db.select().from(workoutSessionExercise).where(eq(workoutSessionExercise.exerciseId, id)).limit(1);
  if (sessionRef.length > 0) {
    throw new Error("Cannot delete exercise because it is used in a workout session");
  }

  await db.delete(exerciseMuscleAff).where(eq(exerciseMuscleAff.exerciseId, id));
  await db.delete(exercise).where(eq(exercise.id, id));
}
