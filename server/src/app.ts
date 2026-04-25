import express from "express";
import { testconn } from "./database/supabase";
import authRoutes from "./routes/auth.routes";
import workoutSessionRoutes from "./routes/WorkoutSession.route";

const app = express();

// ─── Middleware ────────────────────────────────────────────────────
app.use(express.json()); // parse JSON body

// ─── Routes ────────────────────────────────────────────────────────
app.use("/api/v1", authRoutes);
app.use("/api/v1", workoutSessionRoutes);

// ─── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

(async () => {
    if (await testconn()) {
        console.log("Database connection successfully!!")
    }
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
})();

export default app;