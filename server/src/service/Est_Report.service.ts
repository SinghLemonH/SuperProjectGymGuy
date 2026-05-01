import { db, pool } from "../database/supabase";
import { sql } from "drizzle-orm";
import { PoolClient } from "pg";
import {resolveWorkoutPlanId} from "../service/WorkoutPlan.service"

// function take score gain from each exercise plan 
interface ScoreExerciseInput {
    user_id : string;
    workout_plan_code?: string;
    start_date?: string;
    end_date?: string;
    page? : number;
    limit? : number;
    sortDir? : string;
}

interface ExerciseMusclePlanInput {
    user_id : string;
    muscle_area? : string;
    page? : number;
    limit? : number;
    sortDir? : string;
}

interface WorkOutDistInput {
    user_id : string;
    page? : number;
    limit? : number;
    sortDir? : string;
}

async function CheckPlanWithUserID(workout_plan_code : Number, user_id : Number) {
    const rows = await db.execute(sql`
        SELECT *
        FROM workout_plan
        WHERE code = ${workout_plan_code} AND user_id = ${user_id}
    `);

    const found = Number(rows.rows.length) > 0 ? true : false;
    return found
}

export async function ScoreExerciseSummary(input : ScoreExerciseInput)     
{
    // page offset 
    const offset = (Number(input.page) - 1) * Number(input.limit);

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

    /* ------------- WHERE clause ---------------- */
    const params = [];
    let whereClause = `WHERE wp.user_id = ${input.user_id}`;

    if (input.start_date) {
        whereClause += ` AND wp.start_date >= $${params.length + 1}`;
        params.push(input.start_date);
    }

    if (input.end_date) {
        whereClause += ` AND wp.end_date <= $${params.length + 1}`;
        params.push(input.end_date);
    }

    // create view using pool.query (to support parameterized dates)
    await pool.query(`
        CREATE OR REPLACE VIEW exercise_plan_view AS
            SELECT exercise_id, wp.code AS workout_plan_code, SUM(score_override) AS total_score
            FROM workout_plan_exercise
            INNER JOIN workout_plan wp ON wp.id = workout_plan_id
            INNER JOIN exercise e ON e.id = exercise_id
            ${whereClause}
            GROUP BY exercise_id, wp.code
    `, params);

    // query using pool.query
    const rows = await pool.query(`
        SELECT e.code AS exercise_code, e.name AS exercise_name, e.category AS exercise_category,
            epv.workout_plan_code AS workout_plan_code, wp.workout_plan_name AS workout_plan_name, epv.total_score AS total_score
        FROM exercise e
        INNER JOIN exercise_plan_view epv ON e.id = epv.exercise_id
        INNER JOIN workout_plan wp ON wp.code = epv.workout_plan_code
        ORDER BY e.code ${sortDirection}
        OFFSET ${offset} LIMIT ${input.limit}
    `);
    
    // check number of row 
    const total = Number(rows.rows.length);
    
    return {
    data: rows,
    page: Number(input.page),
    limit: Number(input.limit),
    total: total,
    totalPages: Math.ceil(total / Number(input.limit)),
  };
}

export async function ExerciseMusclePlanList(input : ExerciseMusclePlanInput) {

    // page offset 
    const offset = (Number(input.page) - 1) * Number(input.limit);

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

        /* ------------- WHERE clause --------------- */
    let whereClause = `WHERE wp.user_id = ${input.user_id}`;

    const params = [];
    if (input.muscle_area) {
        whereClause += ` AND ema.name = $${params.length + 1}`;
        params.push(input.muscle_area);
    }

    const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code,
            wp.name AS workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            ema.name AS muscle_name, 
            e.code AS exercise_code, 
            e.name AS exercise_name 
        FROM workout_plan AS wp 
        INNER JOIN workout_plan_exercise wpe ON wpe.workout_plan_id = wp.id
        INNER JOIN exercise e ON e.id = wpe.exercise_id
        INNER JOIN exercise_muscle_aff ema ON ema.exercise_id = e.id
        ${whereClause}
        ORDER BY wp.code ${sortDirection}, e.code ${sortDirection}
        OFFSET ${offset} LIMIT ${input.limit}
    `, params);

    const total = rows.rows.length;
    return {
    data: rows,
    page: Number(input.page),
    limit: Number(input.limit),
    total: total,
    totalPages: Math.ceil(total / Number(input.limit))
  };
}

export async function WorkOutDistribution(input : WorkOutDistInput) {
    // page offset 
    const offset = (Number(input.page) - 1) * Number(input.limit);

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

    // create view 
    await db.execute(sql`
        CREATE OR REPLACE VIEW workout_plan_dist AS 
            SELECT wpe.workout_plan_id AS workout_plan_id, SUM(wpe.score_override) AS total_score
            FROM workout_plan_exercise wpe
            INNER JOIN workout_plan wp ON wp.id = wpe.workout_plan_id
            WHERE wp.user_id = ${input.user_id}
            GROUP BY wpe.workout_plan_id`);
    
    const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code, 
            wp.name as workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            wpd.total_score AS total_score
        FROM workout_plan wp
        INNER JOIN workout_plan_dist wpd ON wpd.workout_plan_id = wp.id
        ORDER BY total_score ${sortDirection}, wp.code
        OFFSET ${offset} LIMIT ${input.limit}
    `);
    
    const total = rows.rows.length;
    return {
    data: rows,
    page: Number(input.page),
    limit: Number(input.limit),
    total: total,
    totalPages: Math.ceil(total / Number(input.limit))
    };
}