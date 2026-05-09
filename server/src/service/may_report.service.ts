import { db } from "../database/supabase";
import { sql } from "drizzle-orm";

// Report 1: Total Calories Burned per User
// นับแคลที่แต่ละ user เผาผลาญรวมจากทุก session
// สูตร: calorie_rate × actual_duration แล้ว SUM

export const getTotalCaloriesBurned = async () => {
  try {
    const result = await db.execute(sql`
      SELECT
        "users".id              AS users_id,
        "users".username,
        COUNT("workout_session".id) AS total_sessions,
        ROUND(
          SUM(
            "exercise".calorie_rate
            * COALESCE("workout_session_exercise".actual_duration, 0)
          )::numeric
        , 2) AS total_calories_burned
      FROM "workout_session"
      JOIN "workout_session_exercise"
        ON "workout_session".id = "workout_session_exercise".workout_session_id
      JOIN "exercise"
        ON "workout_session_exercise".exercise_id = "exercise".id
      JOIN "users"
        ON "workout_session".user_id = "users".id
      GROUP BY
        "users".id,
        "users".username
      ORDER BY total_calories_burned DESC
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
      ORDER BY total_sessions DESC
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

        -- แคลที่ทำจริงจากทุก session exercise
        ROUND(
          SUM(
            "exercise".calorie_rate
            * COALESCE("workout_session_exercise".actual_duration, 0)
          )::numeric
        , 2) AS actual_calories,

        -- แคลเป้าหมายที่ตั้งไว้ใน workout_plan_exercise
        ROUND(
          SUM(
            "exercise".calorie_rate
            * COALESCE("workout_plan_exercise".target_duration, 0)
          )::numeric
        , 2) AS goal_calories,

        -- คำนวณ % achievement, division by zero ด้วย NULLIF
        COALESCE(
          ROUND(
            (
              SUM("exercise".calorie_rate * COALESCE("workout_session_exercise".actual_duration, 0))
              / NULLIF(SUM("exercise".calorie_rate * COALESCE("workout_plan_exercise".target_duration, 0)), 0)
            )::numeric * 100
          , 2
        )::text,
        '0'
      ) || '%' AS achievement_percentage

      FROM "workout_session"
      JOIN "workout_session_exercise"
        ON "workout_session".id = "workout_session_exercise".workout_session_id
      JOIN "exercise"
        ON "exercise".id = "workout_session_exercise".exercise_id
      JOIN "workout_plan"
        ON "workout_session".workout_plan_id = "workout_plan".id
      JOIN "workout_plan_exercise"
        ON "workout_plan_exercise".workout_plan_id = "workout_plan".id
      JOIN "users"
        ON "workout_session".user_id = "users".id
      GROUP BY
        "users".id,
        "users".username,
        "workout_plan".plan_name
      ORDER BY achievement_percentage DESC
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