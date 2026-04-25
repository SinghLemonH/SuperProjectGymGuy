import { db } from "../database/supabase";
import { sql } from "drizzle-orm";

import {CreateWorkoutSessionInput,UpdateWorkoutSessionInput} from "../models/WorkoutSession.model";

//Get by user
export const getWorkoutSessionsByUserId = async (userId: string) => {
  try {
    const result = await db.execute(sql`
      SELECT *
      FROM workout_session
      WHERE user_id = ${userId}
      ORDER BY session_no DESC
    `);

    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch workout sessions"
    };
  }
};

//Get by id
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
        message: "Workout session not found"
      };
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

//Create
export const createWorkoutSession = async (input: CreateWorkoutSessionInput) => {
  try {
    const sessionNoResult = await db.execute(sql`
      SELECT COALESCE(MAX(session_no), 0) + 1 AS next_no
      FROM workout_session
      WHERE user_id = ${input.user_id}
    `);

    const nextNo = sessionNoResult.rows[0].next_no;

    const result = await db.execute(sql`
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

    return result.rows[0];
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot create workout session"
    };
  }
};

//Update
export const updateWorkoutSession = async (
  id: string,
  input: UpdateWorkoutSessionInput
) => {
  try {
    const result = await db.execute(sql`
      UPDATE workout_session
      SET session_datetime =
        COALESCE(${input.session_datetime}, session_datetime)
      WHERE id = ${id}
      RETURNING *
    `);

    if (result.rows.length === 0) {
      throw {
        status: 404,
        error_code: "NOT_FOUND",
        message: "Workout session not found"
      };
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

//Delete
export const deleteWorkoutSession = async (id: string) => {
  try {
    const result = await db.execute(sql`
      DELETE FROM workout_session
      WHERE id = ${id}
      RETURNING *
    `);

    if (result.rows.length === 0) {
      throw {
        status: 404,
        error_code: "NOT_FOUND",
        message: "Workout session not found"
      };
    }

    return { message: "Workout session deleted successfully" };
  } catch (error) {
    throw error;
  }
};