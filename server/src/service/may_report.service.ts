import { db } from "../database/supabase";
import { sql } from "drizzle-orm";

// Report 1: Total Calories Burned per User
// นับแคลที่แต่ละ user เผาผลาญรวมจากทุก session
// สูตร: calorie_rate × target_duration แล้ว SUM

export const getTotalCaloriesBurned = async () => {
  try {
    const result = await db.execute(sql`
      SELECT
        "users".id              AS users_id,
        "users".username,
        COUNT(DISTINCT "workout_session".id) AS total_sessions,
                ROUND(
          CAST(
            COALESCE(
              SUM(
                "exercise".calorie_rate
                * COALESCE("workout_plan_exercise".target_duration, 0)
              ), 0
            ) AS numeric
          ), 2) AS total_calories_burned
      FROM "users"
      LEFT JOIN "workout_session"
        ON "workout_session".user_id = "users".id
      LEFT JOIN "workout_session_exercise"
        ON "workout_session".id = "workout_session_exercise".workout_session_id
      LEFT JOIN "workout_plan_exercise"
        ON "workout_plan_exercise".id = "workout_session_exercise".workout_plan_exercise_id
      LEFT JOIN "exercise"
        ON "exercise".id = "workout_plan_exercise".exercise_id
            GROUP BY
              "users".id,
              "users".username
            ORDER BY username ASC, total_calories_burned DESC
    `);

    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch total calories burned report na ja",
    };
  }
};

// Report 2: Total Workout Sessions per User
// นับว่าแต่ละ user มาออกกำลังกายกี่ครั้งรวม
// รวม first/last session ด้วยเพื่อดู activity range

export const getTotalWorkoutSessions = async () => {
  try {
    const result = await db.execute(sql`
      SELECT
        "users".id       AS users_id,
        "users".username,
        COUNT("workout_session".id)              AS total_sessions,
        MIN("workout_session".session_datetime)  AS first_session,
        MAX("workout_session".session_datetime)  AS last_session
      FROM "workout_session"
      JOIN "users"
        ON "workout_session".user_id = "users".id
            GROUP BY
        "users".id,
        "users".username
      ORDER BY username ASC, total_sessions DESC
    `);

    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch total workout sessions report",
    };
  }
};

// Report 3: Workout Plan Achievement (%)
// เปรียบเทียบแคลที่ทำจริง vs เป้าหมายของแต่ละ plan
// achievement_percentage = (actual / goal) * 100
// ถ้า goal = 0 จะ return '0%'

export const getPlanAchievement = async () => {
  try {
    const result = await db.execute(sql`
      SELECT
        "users".id       AS users_id,
        "users".username,
        "workout_plan".plan_name,

                -- actual calories from completed sessions
        ROUND(
          CAST(
            COALESCE(
              SUM(
                "exercise_completed".calorie_rate
                * COALESCE("wpe_completed".target_duration, 0)
              ), 0
            ) AS numeric
          ), 2) AS actual_calories,

        -- แคลเป้าหมายที่ตั้งไว้ใน workout_plan_exercise
        ROUND(
          CAST(
            COALESCE(
              SUM(
                "exercise_goal".calorie_rate
                * COALESCE("wpe_goal".target_duration, 0)
              ), 0
            ) AS numeric
          ), 2) AS goal_calories,

        -- achievement percentage
        CASE
          WHEN COALESCE(SUM("exercise_goal".calorie_rate * COALESCE("wpe_goal".target_duration, 0)), 0) > 0
          THEN ROUND(
            CAST(
              (COALESCE(SUM("exercise_completed".calorie_rate * COALESCE("wpe_completed".target_duration, 0)), 0)
              / SUM("exercise_goal".calorie_rate * COALESCE("wpe_goal".target_duration, 0))) * 100
            AS numeric), 2) || '%'
          ELSE '0%'
        END AS achievement_percentage

      FROM "workout_plan"
      JOIN "workout_plan_exercise" AS "wpe_goal"
        ON "wpe_goal".workout_plan_id = "workout_plan".id
      JOIN "exercise" AS "exercise_goal"
        ON "exercise_goal".id = "wpe_goal".exercise_id
      JOIN "users"
        ON "workout_plan".user_id = "users".id

      -- LEFT JOIN to actual completed workout data
      LEFT JOIN "workout_session"
        ON "workout_session".workout_plan_id = "workout_plan".id
        AND "workout_session".user_id = "users".id
      LEFT JOIN "workout_session_exercise" AS "wse"
        ON "wse".workout_session_id = "workout_session".id
      LEFT JOIN "workout_plan_exercise" AS "wpe_completed"
        ON "wpe_completed".id = "wse".workout_plan_exercise_id
      LEFT JOIN "exercise" AS "exercise_completed"
        ON "exercise_completed".id = "wpe_completed".exercise_id

            GROUP BY
        "users".id,
        "users".username,
        "workout_plan".plan_name
      ORDER BY username ASC, goal_calories DESC
    `);

    return result.rows;
  } catch {
    throw {
      status: 500,
      error_code: "INTERNAL_ERROR",
      message: "Cannot fetch plan achievement report na ja",
    };
  }
};