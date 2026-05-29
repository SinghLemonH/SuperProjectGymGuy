import { pool } from "../database/supabase";

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

export async function ScoreExerciseSummary(input : ScoreExerciseInput)     
{
    /* ------------- Defaults & Page Offset ------ */ 
    const pageVal = Number(input.page) || 1;
    const limitVal = Number(input.limit) || 10;
    const offset = limitVal ? (pageVal - 1) * limitVal : 0;
    const pageOffset = limitVal ? `OFFSET ${offset} LIMIT ${limitVal}` : '';

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

    /* ------------- WHERE clause ---------------- */
    const params: any[] = [input.user_id];
    let whereClause = `AND wp.user_id = $1`;

    if (input.workout_plan_code) {
        params.push(input.workout_plan_code);
        whereClause += ` AND wp.code = $${params.length}`;
    }
    if (input.start_date) {
        params.push(input.start_date);
        whereClause += ` AND wp.start_date >= $${params.length}`;
    }
    if (input.end_date) {
        params.push(input.end_date);
        whereClause += ` AND wp.end_date <= $${params.length}`;
    }

        // Use direct query instead of CREATE/DROP VIEW to avoid race conditions
    const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code, wp.plan_name AS workout_plan_name, wp.user_id AS user_id,
            e.code AS exercise_code, e.name AS exercise_name, e.category AS exercise_category,
            SUM(e.score_based) AS total_score,
            COUNT(*) OVER() AS full_count
        FROM workout_plan wp
        INNER JOIN workout_plan_exercise wpe ON wpe.workout_plan_id = wp.id
        INNER JOIN exercise e ON e.id = wpe.exercise_id
        WHERE 1=1 ${whereClause}
        GROUP BY wp.code, wp.plan_name, wp.user_id, e.code, e.name, e.category
        ORDER BY wp.code ${sortDirection}, e.code ${sortDirection}
        ${pageOffset}
    `, params);
    
    // check number of row 
    const total = rows.rows.length > 0 ? Number(rows.rows[0].full_count) : 0;
    
    return {
    data: rows.rows,
    page: pageVal,
    limit: limitVal || total,
    total: total,
    totalPages: limitVal ? Math.ceil(total / limitVal) : 1,
  };
}

export async function ExerciseMusclePlanList(input : ExerciseMusclePlanInput) {

    /* ------------- Defaults & Page Offset ------ */ 
    const pageVal = Number(input.page) || 1;
    const limitVal = Number(input.limit) || 10;
    const offset = limitVal ? (pageVal - 1) * limitVal : 0;
    const pageOffset = limitVal ? `OFFSET ${offset} LIMIT ${limitVal}` : '';

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

    const params = [];
    let whereClause = `WHERE wp.user_id = $1`;
    params.push(input.user_id);

    if (input.muscle_area) {
        whereClause += ` AND ema.name = $${params.length + 1}`;
        params.push(input.muscle_area);
    }

    const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code,
            wp.plan_name AS workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            ema.name AS muscle_name, 
            e.code AS exercise_code, 
            e.name AS exercise_name,
            COUNT(*) OVER() AS full_count
        FROM workout_plan AS wp 
        INNER JOIN workout_plan_exercise wpe ON wpe.workout_plan_id = wp.id
        INNER JOIN exercise e ON e.id = wpe.exercise_id
        INNER JOIN exercise_muscle_aff ema ON ema.exercise_id = e.id
        ${whereClause}
        ORDER BY wp.code ${sortDirection}, e.code ${sortDirection}
        ${pageOffset}
    `, params);

    const resultRows = rows.rows;
    const total = resultRows.length > 0 ? Number(resultRows[0].full_count) : 0;
    return {
    data: resultRows,
    page: pageVal,
    limit: limitVal || total,
    total: total,
    totalPages: limitVal ? Math.ceil(total / limitVal) : 1,
  };
}

export async function WorkOutDistribution(input : WorkOutDistInput) {
    /* ------------- Defaults & Page Offset ------ */ 
    const pageVal = Number(input.page) || 1;
    const limitVal = Number(input.limit) || 10;
    const offset = limitVal ? (pageVal - 1) * limitVal : 0;
    const pageOffset = limitVal ? `OFFSET ${offset} LIMIT ${limitVal}` : '';

    /* ------------- SORT BY clause -------------- */
    const sortDirection = input.sortDir === "asc" ? "ASC" : "DESC";

            // Use subquery instead of CREATE/DROP VIEW to avoid race conditions
    const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code, 
            wp.plan_name as workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            COALESCE(wpd.total_score, 0) AS total_score,
            wp.completeness AS plan_completeness,
            COUNT(*) OVER() AS full_count
        FROM workout_plan wp
        LEFT JOIN (
            SELECT wpe.workout_plan_id, SUM(e.score_based) AS total_score
            FROM workout_plan_exercise wpe
            INNER JOIN exercise e ON e.id = wpe.exercise_id
            GROUP BY wpe.workout_plan_id
        ) wpd ON wpd.workout_plan_id = wp.id
        WHERE wp.user_id = $1
        ORDER BY total_score ${sortDirection}, wp.code
        ${pageOffset}
    `, [input.user_id]);
    
        const total = rows.rows.length > 0 ? Number(rows.rows[0].full_count) : 0;
    return {
    data: rows.rows,
    page: pageVal,
    limit: limitVal || total,
    total: total,
    totalPages: limitVal ? Math.ceil(total / limitVal) : 1,
    };
}