import { db } from "../database/supabase";
import { sql } from "drizzle-orm";

export async function getUserBMR() {
  const result = await db.execute(sql`
    SELECT 
      id AS user_id,
      username,
      age,
      weight,
      height,
      sex,
      bmr AS bmr_kcal_per_day
        FROM users
    ORDER BY username ASC
  `);

  return result.rows;
}

export async function getExerciseCalories() {
  const result = await db.execute(sql`
    SELECT 
      u.id AS user_id,
      u.username,

      COUNT(DISTINCT ws.id) AS total_session,

            COALESCE(
        SUM(e.calorie_rate * COALESCE(wpe.target_duration, 0)),
        0
      ) AS exercise_calories_burned

    FROM users u

    LEFT JOIN workout_session ws 
      ON ws.user_id = u.id

    LEFT JOIN workout_session_exercise se 
      ON se.workout_session_id = ws.id

    LEFT JOIN workout_plan_exercise wpe 
      ON wpe.id = se.workout_plan_exercise_id

    LEFT JOIN exercise e 
      ON e.id = wpe.exercise_id

    GROUP BY u.id, u.username
    ORDER BY username ASC
  `);

  return result.rows;
}

export async function getTotalEnergy() {
  const result = await db.execute(sql`
    SELECT 
      u.id AS user_id,
      u.username,

      u.bmr,

            COALESCE(
        SUM(e.calorie_rate * COALESCE(wpe.target_duration, 0)),
        0
      ) AS exercise_calories,

      (
        u.bmr + COALESCE(SUM(e.calorie_rate * COALESCE(wpe.target_duration, 0)), 0)
      ) AS total_energy_burned

    FROM users u

    LEFT JOIN workout_session ws 
      ON ws.user_id = u.id

    LEFT JOIN workout_session_exercise se 
      ON se.workout_session_id = ws.id

    LEFT JOIN workout_plan_exercise wpe 
      ON wpe.id = se.workout_plan_exercise_id

    LEFT JOIN exercise e 
      ON e.id = wpe.exercise_id

    GROUP BY u.id, u.username, u.bmr
    ORDER BY username ASC
  `);

  return result.rows;
}