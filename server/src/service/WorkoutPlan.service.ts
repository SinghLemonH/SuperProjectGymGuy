import { db, pool } from "../database/supabase";
import { sql } from "drizzle-orm";
import { PoolClient } from "pg";

// ─── Helpers ──────────────────────────────────────────────────────

// ---- Check if a string is a UUID
function isUUID(value: string): boolean {
  return value.length === 36 && value.includes('-');
}

// ─── Types for functions ────────────────────────────────────────────────────────

// type of line item function 
interface LineItemInput {
  exercise_id: string;
  target_sets: number;
  target_reps?: number;
  target_duration?: number;
  target_weight?: number;
  note?: string;
}

interface CreateWorkOutPlanInput {
  plan_code: string;
  plan_name: string;
  user_id: string;
  description?: string;
  start_date: string;
  end_date: string;
  line_items: LineItemInput[];
}

interface UpdateWorkOutPlanInput {
  idOrCode: string;
  plan_name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  line_items?: LineItemInput[];
}

// function to search base on workout plan code or/and plan nama
export async function listWorkoutPlan({
    search = "",
    page = 1,
    limit = 10,
    sortBy = "code",
    sortDir = "asc"
} = {}) {
    // page offset 
    const offset = (Number(page) - 1) * Number(limit);

    // sort element
    const allowedSort = ["code", "plan_name", "difficulty", "start_date", "end_date", "completeness"];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "code";
    const sortDirection = sortDir === "asc" ? "ASC" : "DESC";

    // search element 
    const searchParam = `%${search}%`;

    // retrieve data 
    const planResult = await db.execute(sql`
        SELECT code AS workout_plan_code, 
            plan_name AS workout_plan_name,
            users.username AS username,
            difficulty,
            start_date,
            end_date, 
            description,
            completeness
        FROM workout_plan
        INNER JOIN users ON users.id = workout_plan.user_id
        WHERE plan_name ILIKE ${searchParam} OR code ILIKE ${searchParam}
        ORDER BY ${sql.raw(`${sortColumn} ${sortDirection}`)}
        LIMIT ${Number(limit)} OFFSET ${offset}`);
        const countResult = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM workout_plan
      INNER JOIN users ON users.id = workout_plan.user_id
      WHERE plan_name ILIKE ${searchParam} OR code ILIKE ${searchParam}
    `);
  const total = Number(countResult.rows[0].total);

    return {
    data: planResult,
    total: Number(total),
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  };
}


/** Get all workout plans for a specific user */
export async function getWorkoutPlansByUserId(userId: string) {
  const result = await db.execute(sql`
    SELECT id,
           code,
           plan_name,
           user_id,
           difficulty,
           start_date,
           end_date,
           description,
           completeness
    FROM workout_plan
    WHERE user_id = ${userId}
    ORDER BY start_date DESC
  `);
  
  return result.rows;
}

/** Resolve workout_plan to id (for internal use). */
export async function resolveWorkoutPlanId(work_out_plan_code : string) {
  const r = await db.execute(sql`SELECT id FROM workout_plan WHERE code = ${work_out_plan_code}`);
  return r.rows.length > 0 ? String(r.rows[0].id) : null;
}

/** Check and change CODE to ID
 *  If it's already a UUID, return as-is.
 *  If it's a code, look up the id from the DB. **/
async function resolvePlanId(idOrCode: string): Promise<string> {
  if (isUUID(idOrCode)) {
    return idOrCode;
  }
  const resolved = await resolveWorkoutPlanId(idOrCode);
  if (!resolved) throw new Error(`Workout plan not found: ${idOrCode}`);
  return resolved as string;
}



// --- function below support both id and code -- 

export async function getWorkoutPlan(idOrCode : string) {
  const id = await resolvePlanId(idOrCode);

  const header = await db.execute(sql`
    SELECT code AS plan_code, plan_name,
            u.username AS user_name, u.member_since AS member_since, 
            u.age AS age, u.weight AS weight, u.height AS height, u.sex AS sex, 
            u.user_level AS user_level, u.fitness_goal AS fitness_goal, u.bmr AS bmr, 
            difficulty, description, completeness,
            start_date, end_date
    FROM workout_plan 
    INNER JOIN users u ON workout_plan.user_id = u.id
    WHERE workout_plan.id = ${id}
    `);

  if (header.rows.length === 0) return null;

  const rows = await db.execute(sql`
    SELECT e.code AS exercise_code, e.name AS exercise_name,
            e.calorie_rate AS calorie_rate, e.score_based AS score_based, 
            e.category AS exercise_category, e.difficulty_level AS exercise_difficulty_level,
            target_sets, target_duration, target_weight, note
    
    FROM workout_plan_exercise 
    INNER JOIN exercise e ON workout_plan_exercise.exercise_id = e.id
    WHERE workout_plan_id = ${id}
    ORDER BY workout_plan_exercise.id 
    `);

  return {
    header : header.rows[0],
    line_items : rows
  };
}

async function calculateDifficulty(client : PoolClient, workout_plan_id : string) : Promise<Number>{
  const plan_difficulty = await client.query(
  `SELECT AVG(e.difficulty_level) AS difficulty
  FROM workout_plan_exercise wpe
  INNER JOIN exercise e ON e.id = wpe.exercise_id
  WHERE wpe.workout_plan_id = $1`, [workout_plan_id]);

  return plan_difficulty.rows[0].difficulty as Number;
}

export async function createWorkOutPlan(input: CreateWorkOutPlanInput) {

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // 2. Insert workout plan header
    const planResult = await client.query(
      `INSERT INTO workout_plan (code, plan_name, user_id, start_date, end_date, description, completeness)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING id, code, plan_name`,
      [input.plan_code, input.plan_name, input.user_id, input.start_date, input.end_date, input.description]
    );

    const planId = planResult.rows[0].id;

        for (const li of input.line_items) {
          await client.query(
            `INSERT INTO workout_plan_exercise (workout_plan_id, exercise_id, target_sets, target_reps, target_duration, target_weight, note)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              planId,
              li.exercise_id,
              li.target_sets,
              li.target_reps ?? null,
              li.target_duration ?? null,
              li.target_weight ?? null,
              li.note ?? null
            ]
          );
        }

    // Update difficulty 
    const difficulty = await calculateDifficulty(client, planId)
    await client.query('UPDATE workout_plan SET difficulty = $1 WHERE id = $2', [difficulty, planId]);

    // Commit transaction
    await client.query("COMMIT");

    return planResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateWorkOutPlan(input: UpdateWorkOutPlanInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const id = await resolvePlanId(input.idOrCode);
    // Build dynamic UPDATE query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.plan_name !== undefined) {
      setClauses.push(`plan_name = $${paramIndex++}`);
      values.push(input.plan_name);
    }
    if (input.start_date !== undefined) {
      setClauses.push(`start_date = $${paramIndex++}`);
      values.push(input.start_date);
    }
    if (input.end_date !== undefined) {
      setClauses.push(`end_date = $${paramIndex++}`);
      values.push(input.end_date);
    }
    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }

    if (setClauses.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE workout_plan SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
    }
      // Update line items if provided
      if (input.line_items && input.line_items.length > 0) {
      // Delete existing line items
        await client.query(`DELETE FROM workout_plan_exercise WHERE workout_plan_id = $1`, [id]);

        for (const li of input.line_items) {
          await client.query(
            `INSERT INTO workout_plan_exercise (workout_plan_id, exercise_id, target_sets, target_reps, target_duration, target_weight, note)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, li.exercise_id, li.target_sets, li.target_reps ?? null, li.target_duration ?? null, li.target_weight ?? null, li.note ?? null]
          );
        }
    }

    // Update difficulty 
    const difficulty = await calculateDifficulty(client, id);
    await client.query('UPDATE workout_plan SET difficulty = $1 WHERE id = $2', [difficulty, id]);

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteWorkOutPlan(idOrCode: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const id = await resolvePlanId(idOrCode);

    // Delete line items first (foreign key constraint)
    await client.query(`DELETE FROM workout_plan_exercise WHERE workout_plan_id = $1`, [id]);
    // Delete the plan
    const result = await client.query(`DELETE FROM workout_plan WHERE id = $1 RETURNING id`, [id]);

    await client.query("COMMIT");
    return result.rows.length > 0 ? { deleted: true } : null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

