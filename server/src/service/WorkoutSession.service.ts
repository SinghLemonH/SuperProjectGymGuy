import { db } from "../database/supabase";
import { sql } from "drizzle-orm";
 
import {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
} from "../models/WorkoutSession.model";
 
const updatePlanCompleteness = async (workoutPlanId: string) => {
  await db.execute(sql`
    UPDATE workout_plan
    SET completeness = (
      SELECT ROUND(
        COUNT(DISTINCT wse.workout_plan_exercise_id)::numeric /
        NULLIF(COUNT(DISTINCT wpe.id), 0) * 100
      )
      FROM workout_plan_exercise wpe
      LEFT JOIN workout_session_exercise wse
        ON wse.workout_plan_exercise_id = wpe.id
      WHERE wpe.workout_plan_id = ${workoutPlanId}
    )
    WHERE id = ${workoutPlanId}
  `);
};
 
export const getWorkoutSessionsByUserId = async (userId: string) => {
  try {
    const result = await db.execute(sql`
      SELECT *
      FROM workout_session
      WHERE user_id = ${userId}
      ORDER BY session_datetime DESC
    `);
 
    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch workout sessions",
    };
  }
};
 
export const getWorkoutSessionById = async (id: string) => {
  try {
    const result = await db.execute(sql`
      SELECT *
      FROM workout_session
      WHERE id = ${id}
      LIMIT 1
    `);
 
    if (result.rows.length === 0) {
      throw {
        status: 404,
        error_code: "NOT_FOUND",
        message: "Workout session not found",
      };
    }
 
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
 
export const createWorkoutSession = async (
  input: CreateWorkoutSessionInput
) => {
  try {
 
    // หา session_no ถัดไปของ user
    const sessionNoResult = await db.execute(sql`
      SELECT COALESCE(MAX(session_no), 0) + 1 AS next_no
      FROM workout_session
      WHERE user_id = ${input.user_id}
    `);
 
    const nextNo = sessionNoResult.rows[0].next_no;
 
    // สร้าง workout_session
    const sessionResult = await db.execute(sql`
      INSERT INTO workout_session
        (session_no, user_id, workout_plan_id, session_datetime)
      VALUES (
        ${nextNo},
        ${input.user_id},
        ${input.workout_plan_id},
        ${input.session_datetime}
      )
      RETURNING *
    `);
 
    const session = sessionResult.rows[0];
 
    // INSERT workout_session_exercise แต่ละตัว
    const exerciseRows = await Promise.all(
      input.exercises.map((ex) =>
        db.execute(sql`
          INSERT INTO workout_session_exercise
            (workout_session_id, workout_plan_exercise_id, notes)
          VALUES (
            ${session.id},
            ${ex.workout_plan_exercise_id},
            ${ex.notes ?? null}
          )
          RETURNING *
        `)
      )
    );
 
    // update completeness ของ plan
    await updatePlanCompleteness(input.workout_plan_id);
 
    return {
      ...session,
      exercises: exerciseRows.map((r) => r.rows[0]),
    };
  } catch (error: any) {
    throw error.status
      ? error
      : {
          status: 500,
          error_code: "INTERNAL_ERROR",
          message: "Cannot create workout session",
        };
  }
};
 
export const updateWorkoutSession = async (
  id: string,
  input: UpdateWorkoutSessionInput
) => {
  try {
    const result = await db.execute(sql`
      UPDATE workout_session
      SET session_datetime =
        COALESCE(${input.session_datetime ?? null}, session_datetime)
      WHERE id = ${id}
      RETURNING *
    `);
 
    if (result.rows.length === 0) {
      throw {
        status: 404,
        error_code: "NOT_FOUND",
        message: "Workout session not found",
      };
    }
 
    const session: any = result.rows[0];
 
    if (input.exercises && input.exercises.length > 0) {
      await db.execute(sql`
        DELETE FROM workout_session_exercise
        WHERE workout_session_id = ${id}
      `);
 
      await Promise.all(
        input.exercises.map((ex) =>
          db.execute(sql`
            INSERT INTO workout_session_exercise
              (workout_session_id, workout_plan_exercise_id, notes)
            VALUES (
              ${id},
              ${ex.workout_plan_exercise_id},
              ${ex.notes ?? null}
            )
            RETURNING *
          `)
        )
      );
 
      await updatePlanCompleteness(session.workout_plan_id);
    }
 
    return session;
  } catch (error) {
    throw error;
  }
};
 
export const deleteWorkoutSession = async (id: string) => {
  try {
    const sessionResult = await db.execute(sql`
      SELECT workout_plan_id
      FROM workout_session
      WHERE id = ${id}
      LIMIT 1
    `);
 
    if (sessionResult.rows.length === 0) {
      throw {
        status: 404,
        error_code: "NOT_FOUND",
        message: "Workout session not found na ja",
      };
    }
 
    const workoutPlanId = sessionResult.rows[0].workout_plan_id as string;
 
    await db.execute(sql`
      DELETE FROM workout_session
      WHERE id = ${id}
    `);
 
    // trigger update completeness หลังลบ
    await updatePlanCompleteness(workoutPlanId);
 
    return { message: "Workout session deleted successfully na ja" };
  } catch (error) {
    throw error;
  }
};

export const getAllSessionsCalories = async () => {
  try {
    const result = await db.execute(sql`
      SELECT
        user_id,
        id AS session_id,
        session_no,
        session_datetime,
        total_calories
      FROM workout_session
      ORDER BY session_datetime DESC
    `);

    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch sessions calories",
    };
  }
}