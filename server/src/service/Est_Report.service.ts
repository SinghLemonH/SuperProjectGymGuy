import { pool } from "../database/supabase";

// function take score gain from each exercise plan  
interface ScoreExerciseInput {
    workout_plan_code?: string;
    start_date?: string;
    end_date?: string;
    page? : number;
    limit? : number;
    sortDir? : string;
}



interface ExerciseMusclePlanInput {
    muscle_area? : string;
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
    const params: any[] = [];
    let whereClause = '';

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
            u.username AS username,
            e.code AS exercise_code, e.name AS exercise_name, e.category AS exercise_category,
            SUM(e.score_based) AS total_score,
            COUNT(*) OVER() AS full_count
        FROM workout_plan wp
        INNER JOIN workout_plan_exercise wpe ON wpe.workout_plan_id = wp.id
        INNER JOIN exercise e ON e.id = wpe.exercise_id
        INNER JOIN users u ON u.id = wp.user_id
        WHERE 1=1 ${whereClause}
        GROUP BY wp.code, wp.plan_name, wp.user_id, u.username, e.code, e.name, e.category
        ORDER BY u.username ASC, wp.code ${sortDirection}, e.code ${sortDirection}
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
    let whereClause = '';

    if (input.muscle_area) {
        params.push(input.muscle_area);
        whereClause = `WHERE ema.name = $1`;
    }

        const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code,
            wp.plan_name AS workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            u.username AS username,
            ema.name AS muscle_name, 
            e.code AS exercise_code, 
            e.name AS exercise_name,
            COUNT(*) OVER() AS full_count
        FROM workout_plan AS wp 
        INNER JOIN workout_plan_exercise wpe ON wpe.workout_plan_id = wp.id
        INNER JOIN exercise e ON e.id = wpe.exercise_id
        INNER JOIN exercise_muscle_aff ema ON ema.exercise_id = e.id
        INNER JOIN users u ON u.id = wp.user_id
        ${whereClause}
        ORDER BY u.username ASC, wp.code ${sortDirection}, e.code ${sortDirection}
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

        const rows = await pool.query(`
        SELECT wp.code AS workout_plan_code, 
            wp.plan_name as workout_plan_name, 
            wp.start_date AS start_date, 
            wp.end_date AS end_date,
            u.username AS username,
            wp.user_id AS user_id,
            COALESCE(wpd.total_score, 0) AS total_score,
            wp.completeness AS plan_completeness,
            COUNT(*) OVER() AS full_count
        FROM workout_plan wp
        INNER JOIN users u ON u.id = wp.user_id
        LEFT JOIN (
            SELECT wpe.workout_plan_id, SUM(e.score_based) AS total_score
            FROM workout_plan_exercise wpe
            INNER JOIN exercise e ON e.id = wpe.exercise_id
            GROUP BY wpe.workout_plan_id
        ) wpd ON wpd.workout_plan_id = wp.id
        ORDER BY u.username ASC, total_score ${sortDirection}, wp.code
        ${pageOffset}
    `);
    
        const total = rows.rows.length > 0 ? Number(rows.rows[0].full_count) : 0;
    return {
    data: rows.rows,
    page: pageVal,
    limit: limitVal || total,
    total: total,
    totalPages: limitVal ? Math.ceil(total / limitVal) : 1,
    };
}
// WorkoutPlanList.dto still used exists interface WorkOutDistInput above