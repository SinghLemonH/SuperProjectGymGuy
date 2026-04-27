import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';
import dotenv from "dotenv"

dotenv.config({ path: ".env.local"})

const dbUrl = process.env.DATABASE_URL

export const pool = new Pool({
    connectionString: dbUrl,
});

const db = drizzle(pool, { schema });

export async function testconn(): Promise<boolean> {
    try {
        await db.execute(`SELECT 1`);
        return true;
    } 
    catch {
        throw new Error("Test Database failed")
    }
}

export { db }