import { db } from "../database/supabase";
import { exercise as exerciseTable } from "../database/drizzle/schema";
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
  const conditions: any[] = [];

  if (query.category) {
    conditions.push(sql`category = ${query.category}`);
  }

  if (query.difficulty_level) {
    conditions.push(sql`difficulty_level = ${query.difficulty_level}`);
  }

  if (query.search) {
    const pattern = `%${query.search.toLowerCase()}%`;
    conditions.push(sql`(LOWER(name) LIKE ${pattern} OR LOWER(code) LIKE ${pattern})`);
  }

  let exerciseIds: string[] = [];
  if (query.muscle) {
    const querySql = sql`SELECT exercise_id FROM exercise_muscle_aff WHERE name = ${query.muscle}`;
    const result = await db.execute((querySql as any));
    exerciseIds = (result as any).rows.map((row: any) => row.exercise_id);
    if (exerciseIds.length === 0) {
      return { data: [], page: query.page, limit: query.limit };
    }
    const inClause = sql.join(exerciseIds.map(id => sql`${id}`), sql`, `);
    conditions.push(sql`id IN (${inClause})`);
  }

  const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

  const querySql = sql`
    SELECT id, code, name, category, difficulty_level, calorie_rate, score_based, description
    FROM exercise
    ${whereClause}
    LIMIT ${query.limit} OFFSET ${(query.page - 1) * query.limit}
  `;
  const result = await db.execute((querySql as any));
  const exercises = (result as any).rows;

  const exerciseIdsFromResult = exercises.map((row: any) => row.id);

  const muscleQuerySql = sql`
    SELECT id, exercise_id, name, impact_level
    FROM exercise_muscle_aff
    WHERE exercise_id IN (${sql.join(exerciseIdsFromResult.map((id: string) => sql`${id}`), sql`, `)})
  `;
  const muscleResult = exerciseIdsFromResult.length > 0
    ? await db.execute((muscleQuerySql as any))
    : { rows: [] };
  const muscleRows = (muscleResult as any).rows;

  const muscleMap = buildMuscleMap(muscleRows as Array<{ id: string; exerciseId: string; name: string; impactLevel: string }>);

  const data: ExerciseResponse[] = exercises.map((row: any) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    difficulty_level: row.difficulty_level,
    calorie_rate: row.calorie_rate,
    score_based: row.score_based,
    description: row.description ?? null,
    muscle_mapping: muscleMap[row.id] ?? [],
  }));

  return { data, page: query.page, limit: query.limit };
}

export async function getExerciseById(id: string): Promise<ExerciseResponse | null> {
  console.log("getExerciseById id:", id);
  const querySql = sql`
    SELECT id, code, name, category, difficulty_level, calorie_rate, score_based, description
    FROM ${exerciseTable}
    WHERE id = ${id}
  `;
  console.log("querySql.sql:", (querySql as any).sql);
  console.log("querySql.params:", (querySql as any).params);
  const result = await  db.execute((querySql as any));
  const rows = (result as any).rows;

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  const muscleQuerySql = sql`
    SELECT id, name, impact_level
    FROM exercise_muscle_aff
    WHERE exercise_id = ${id}
  `;
  const muscleResult = await db.execute((muscleQuerySql as any));
  const muscleRows = (muscleResult as any).rows;

  const muscle_mapping = muscleRows.map((muscle: any) => ({
    id: muscle.id,
    muscle: muscle.name as MuscleResponse["muscle"],
    impact_level: muscle.impact_level as MuscleResponse["impact_level"],
  }));

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    difficulty_level: row.difficulty_level,
    calorie_rate: row.calorie_rate,
    score_based: row.score_based,
    description: row.description ?? null,
    muscle_mapping,
  };
}

export async function createExercise(payload: CreateExerciseInput) {
  const description =
    payload.description && payload.description.trim() !== ""
      ? payload.description
      : null;

  const insertSql = sql`
    INSERT INTO exercise (
      code, name, category, difficulty_level,
      calorie_rate, score_based, description
    )
    VALUES (
      ${payload.code},
      ${payload.name},
      ${payload.category},
      ${payload.difficulty_level},
      ${payload.calorie_rate},
      ${payload.score_based},
      ${description}
    )
    RETURNING id
  `;

  const result = await db.execute(insertSql as any);

  const created = (result as any).rows[0];
  if (!created?.id) {
    throw new Error("Failed to create exercise");
  }

  const muscleValues = sql.join(
    payload.muscle_mapping.map((mapping) =>
      sql`(${created.id}, ${mapping.muscle}, ${mapping.impact_level})`
    ),
    sql`, `
  );

  const muscleInsertSql = sql`
    INSERT INTO exercise_muscle_aff (
      exercise_id, name, impact_level
    )
    VALUES ${muscleValues}
  `;

  await db.execute(muscleInsertSql as any);

  return await getExerciseById(created.id);
}

export async function patchExercise(
  id: string,
  payload: PatchExerciseInput
): Promise<ExerciseResponse | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (payload.code !== undefined) {
    updates.push("code = $" + (values.length + 1));
    values.push(payload.code);
  }

  if (payload.name !== undefined) {
    updates.push("name = $" + (values.length + 1));
    values.push(payload.name);
  }

  if (payload.category !== undefined) {
    updates.push("category = $" + (values.length + 1));
    values.push(payload.category);
  }

  if (payload.difficulty_level !== undefined) {
    updates.push("difficulty_level = $" + (values.length + 1));
    values.push(payload.difficulty_level);
  }

  if (payload.calorie_rate !== undefined) {
    updates.push("calorie_rate = $" + (values.length + 1));
    values.push(payload.calorie_rate);
  }

  if (payload.score_based !== undefined) {
    updates.push("score_based = $" + (values.length + 1));
    values.push(payload.score_based);
  }

  if (payload.description !== undefined) {
    updates.push("description = $" + (values.length + 1));
    values.push(payload.description);
  }

  if (updates.length > 0) {
    const query = `
      UPDATE exercise
      SET ${updates.join(", ")}
      WHERE id = $${values.length + 1}
    `;

    await db.$client.query(query, [...values, id]);
  }

  return await getExerciseById(id);
}

export async function deleteExercise(id: string): Promise<void> {
  const planQuerySql = sql`SELECT 1 FROM workout_plan_exercise WHERE exercise_id = ${id} LIMIT 1`;
  const planResult = await db.execute(planQuerySql as any);
  if ((planResult as any).rows.length > 0) {
    throw new Error("Cannot delete exercise because it is used in a workout plan");
  }

  const sessionQuerySql = sql`SELECT 1 FROM workout_session_exercise WHERE exercise_id = ${id} LIMIT 1`;
  const sessionResult = await db.execute(sessionQuerySql as any);
  if ((sessionResult as any).rows.length > 0) {
    throw new Error("Cannot delete exercise because it is used in a workout session");
  }

  const deleteMuscleSql = sql`DELETE FROM exercise_muscle_aff WHERE exercise_id = ${id}`;
  await db.execute(deleteMuscleSql as any);
  const deleteExerciseSql = sql`DELETE FROM exercise WHERE id = ${id}`;
  await db.execute(deleteExerciseSql as any);
}
