import { db } from "../database/supabase";
import { sql } from "drizzle-orm";
import { PatchUserInput, UserProfileResponse } from "../models/users.model";

//GET /users/:id
export const getUserById = async (id: string): Promise<UserProfileResponse> => {

    const result = await db.execute(sql`
        SELECT id, username, email, sex, fitness_goal, user_level,
               age, weight, height, bmr, member_since
        FROM users
        WHERE id = ${id}
        LIMIT 1
    `);

    const user = result.rows[0] as any;

    if (!user) {
        throw { status: 404, error_code: "NOT_FOUND", message: "User not found" };
    }

    return user;
};

//GET /users/:id/dashboard
export const getUserDashboard = async (id: string) => {

    //check user is existed?
    const userResult = await db.execute(sql`
        SELECT id, bmr, user_level FROM users
        WHERE id = ${id}
        LIMIT 1
    `);

    const user = userResult.rows[0] as any;
    if (!user) {
        throw { status: 404, error_code: "NOT_FOUND", message: "User not found" };
    }

    //cal total calories burned
    const caloriesResult = await db.execute(sql`
        SELECT COALESCE(SUM(wse.actual_duration * e.calorie_rate), 0) AS total_calories
        FROM workout_session ws
        JOIN workout_session_exercise wse ON wse.workout_session_id = ws.id
        JOIN exercise e ON e.id = wse.exercise_id
        WHERE ws.user_id = ${id}
    `);

    //find active workout plan
    const planResult = await db.execute(sql`
        SELECT id, plan_name, completeness
        FROM workout_plan
        WHERE user_id = ${id}
        AND end_date >= CURRENT_DATE
        ORDER BY start_date DESC
        LIMIT 1
    `);

    //count total sessions
    const sessionResult = await db.execute(sql`
        SELECT COUNT(*) AS total_sessions
        FROM workout_session
        WHERE user_id = ${id}
    `);

    return {
        bmr:             user.bmr,
        user_level:      user.user_level,
        total_calories:  caloriesResult.rows[0] as any,
        active_plan:     planResult.rows[0] ?? null,
        total_sessions:  (sessionResult.rows[0] as any).total_sessions,
    };
};

//GET /users/:id/leaderboard
export const getUserLeaderboard = async (id: string) => {

    //top 10 users by total calories this mount
    const leaderboardResult = await db.execute(sql`
        SELECT 
            u.id,
            u.username,
            u.user_level,
            COALESCE(SUM(wse.actual_duration * e.calorie_rate), 0) AS total_calories
        FROM users u
        LEFT JOIN workout_session ws ON ws.user_id = u.id
            AND DATE_TRUNC('month', ws.session_datetime) = DATE_TRUNC('month', NOW())
        LEFT JOIN workout_session_exercise wse ON wse.workout_session_id = ws.id
        LEFT JOIN exercise e ON e.id = wse.exercise_id
        GROUP BY u.id, u.username, u.user_level
        ORDER BY total_calories DESC
        LIMIT 10
    `);

    //find rank of this user
    const rankResult = await db.execute(sql`
        SELECT rank FROM (
            SELECT 
                u.id,
                RANK() OVER (ORDER BY COALESCE(SUM(wse.actual_duration * e.calorie_rate), 0) DESC) AS rank
            FROM users u
            LEFT JOIN workout_session ws ON ws.user_id = u.id
                AND DATE_TRUNC('month', ws.session_datetime) = DATE_TRUNC('month', NOW())
            LEFT JOIN workout_session_exercise wse ON wse.workout_session_id = ws.id
            LEFT JOIN exercise e ON e.id = wse.exercise_id
            GROUP BY u.id
        ) ranked
        WHERE id = ${id}
    `);

    return {
        my_rank:     (rankResult.rows[0] as any)?.rank ?? null,
        leaderboard: leaderboardResult.rows,
    };
};

//PATCH /users/:id
export const patchUser = async (id: string, input: PatchUserInput) => {

    //check user is existed
    const userResult = await db.execute(sql`
        SELECT id, age, weight, height, sex FROM users
        WHERE id = ${id}
        LIMIT 1
    `);

    const user = userResult.rows[0] as any;
    if (!user) {
        throw { status: 404, error_code: "NOT_FOUND", message: "User not found" };
    }

    //check  duplicate username if chaged
    if (input.username) {
        const existingUsername = await db.execute(sql`
            SELECT id FROM users
            WHERE username = ${input.username}
            AND id != ${id}
            LIMIT 1
        `);
        if (existingUsername.rows.length > 0) {
            throw { status: 409, error_code: "CONFLICT", message: "Username already exists" };
        }
    }

    //recalculate BMR if weight, height,age changed
    const newAge    = input.age    ?? user.age;
    const newWeight = input.weight ?? user.weight;
    const newHeight = input.height ?? user.height;

    const bmr = user.sex === "male"
        ? Math.round(10 * newWeight + 6.25 * newHeight - 5 * newAge + 5)
        : Math.round(10 * newWeight + 6.25 * newHeight - 5 * newAge - 161);

    //update user
    const updated = await db.execute(sql`
        UPDATE users SET
            username     = COALESCE(${input.username ?? null}, username),
            age          = COALESCE(${input.age ?? null}, age),
            weight       = COALESCE(${input.weight ?? null}, weight),
            height       = COALESCE(${input.height ?? null}, height),
            fitness_goal = COALESCE(${input.fitness_goal ?? null}, fitness_goal),
            user_level   = COALESCE(${input.user_level ?? null}, user_level),
            bmr          = ${bmr}
        WHERE id = ${id}
        RETURNING id, username, email, sex, fitness_goal, user_level,
                  age, weight, height, bmr, member_since
    `);

    return updated.rows[0];
};

//DELETE /users/:id
export const deleteUser = async (id: string) => {

    const userResult = await db.execute(sql`
        SELECT id FROM users
        WHERE id = ${id}
        LIMIT 1
    `);

    if (userResult.rows.length === 0) {
        throw { status: 404, error_code: "NOT_FOUND", message: "User not found" };
    }

    //soft delete: set is_active = false
    await db.execute(sql`
        UPDATE users SET is_active = false
        WHERE id = ${id}
    `);

    return { message: "User deleted successfully" };
};