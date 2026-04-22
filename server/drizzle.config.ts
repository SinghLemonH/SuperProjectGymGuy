// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'

dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "./src/database/drizzle/schema.ts",
    out: "./src/database/drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    schemaFilter: ["public"]
});
