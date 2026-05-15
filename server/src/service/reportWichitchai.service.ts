import { db } from "../database/supabase";
import { sql } from "drizzle-orm";

//GET /reports/exercise-popularity
export const getExercisePopularity = async ({
    category,
    difficulty_level,
    exercise_name,
}: {
    category?: string;
    difficulty_level?: string;
    exercise_name?: string;
}) => {
    const result = await db.execute(sql`
        SELECT 
            e.name        AS exercise_name,
            e.code        AS exercise_code,
            e.category    AS category,
            e.difficulty_level AS difficulty_level,
            e.calorie_rate AS calorie_rate,
            COUNT(wse.id) AS total_usage
        FROM exercise e
        LEFT JOIN workout_plan_exercise wpe ON wpe.exercise_id = e.id
        LEFT JOIN workout_session_exercise wse ON wse.workout_plan_exercise_id = wpe.id
        WHERE 1=1
            ${category ? sql`AND e.category = ${category}` : sql``}
            ${difficulty_level ? sql`AND e.difficulty_level = ${difficulty_level}` : sql``}
            ${exercise_name ? sql`AND e.name ILIKE ${'%' + exercise_name + '%'}` : sql``}
        GROUP BY e.id, e.name, e.code, e.category, e.difficulty_level, e.calorie_rate
        ORDER BY total_usage DESC
    `);

    return { data: result.rows };
};

//GET /reports/user-weight-bmi-progress
export const getUserWeightBMIProgress = async ({
    username,
    from_date,
    to_date,
}: {
    username?: string;
    from_date?: string;
    to_date?: string;
}) => {
    const result = await db.execute(sql`
        SELECT
            u.id            AS user_id,
            u.username      AS username,
            u.age           AS age,
            u.weight        AS weight,
            u.height        AS height,
            u.sex           AS sex,
            u.member_since  AS member_since,
            ROUND(
                CAST(u.weight / ((u.height / 100.0) * (u.height / 100.0)) AS numeric)
            , 2) AS bmi,
            CASE
                WHEN u.weight / ((u.height / 100.0) * (u.height / 100.0)) < 18.5 THEN 'underweight'
                WHEN u.weight / ((u.height / 100.0) * (u.height / 100.0)) < 25.0 THEN 'normal'
                WHEN u.weight / ((u.height / 100.0) * (u.height / 100.0)) < 30.0 THEN 'overweight'
                ELSE 'obese'
            END AS bmi_status
        FROM users u
        WHERE 1=1
            ${username ? sql`AND u.username ILIKE ${'%' + username + '%'}` : sql``}
            ${from_date ? sql`AND u.member_since >= ${from_date}` : sql``}
            ${to_date ? sql`AND u.member_since <= ${to_date}` : sql``}
        ORDER BY bmi DESC
    `);

    return { data: result.rows };
};

//GET /reports/leaderboard-consistency-calories
export const getLeaderboardConsistencyCalories = async ({
    username,
    month,
    sort_by = "calories",
    order = "desc",
}: {
    username?: string;
    month?: string;
    sort_by?: string;
    order?: string;
}) => {
    const allowedSort = ["calories", "consistency"];
    const allowedOrder = ["asc", "desc"];
    const sortColumn = allowedSort.includes(sort_by) ? sort_by : "calories";
    const sortDir = allowedOrder.includes(order) ? order.toUpperCase() : "DESC";

    const targetMonth = month ?? new Date().toISOString().slice(0, 7);

    const result = await db.execute(sql`
        SELECT
            u.id            AS user_id,
            u.username      AS username,
            u.user_level    AS user_level,
            COALESCE(SUM(wse.actual_duration * e.calorie_rate), 0) AS calories,
            COUNT(DISTINCT DATE(ws.session_datetime)) AS active_days,
            ROUND(
                COUNT(DISTINCT DATE(ws.session_datetime))::numeric / 30 * 100
            , 2) AS consistency,
            RANK() OVER (
                ORDER BY COALESCE(SUM(wse.actual_duration * e.calorie_rate), 0) DESC
            ) AS rank
        FROM users u
        LEFT JOIN workout_session ws
            ON ws.user_id = u.id
            AND TO_CHAR(ws.session_datetime, 'YYYY-MM') = ${targetMonth}
        LEFT JOIN workout_session_exercise wse
            ON wse.workout_session_id = ws.id
        LEFT JOIN workout_plan_exercise wpe
            ON wpe.id = wse.workout_plan_exercise_id
        LEFT JOIN exercise e
            ON e.id = wpe.exercise_id
        WHERE 1=1
            ${username ? sql`AND u.username ILIKE ${'%' + username + '%'}` : sql``}
        GROUP BY u.id, u.username, u.user_level
        ORDER BY ${sql.raw(`${sortColumn} ${sortDir}`)}
    `);

    return { data: result.rows };
};