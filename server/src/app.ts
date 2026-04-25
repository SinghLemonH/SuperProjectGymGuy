import { Hono } from "hono";
import { testconn } from "./database/supabase";
//import authRoutes from "./routes/auth.routes";

const app = new Hono();

// ─── Routes ────────────────────────────────────────────────────────
//app.route("/api/v1", authRoutes);

// ─── Start Server ──────────────────────────────────────────────────
(async () => {
    if (await testconn()) {
        console.log("Database connection successfully!!")
    }
})();

export default app;