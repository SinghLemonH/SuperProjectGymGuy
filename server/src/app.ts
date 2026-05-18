import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import cors from "cors";    

import { testconn } from "./database/supabase";

// ─── Routes imports ────────────────────────────────────────────────
import authRoutes           from "./routes/auth.routes";
import userRoutes           from "./routes/Users.routes";
import exercisesRoutes      from "./routes/exercises.routes";
import musclesRoutes        from "./routes/muscles.routes";
import workoutSessionRoutes from "./routes/WorkoutSession.route";
import workoutPlanRoutes    from "./routes/WorkoutPlan.routes";

// ─── Report routes ─────────────────────────────────────────────────
import WathitreportsRoutes  from "./routes/wathit_reports.routes";
import KittireportsRoutes   from "./routes/Est_Report.route";
import WichitreportRoutes   from "./routes/reportWichitchai.routes";
import ApichreportRoutes    from "./routes/may_report.route";


// --- Report route ----------
import WathitreportsRoutes from "./routes/wathit_reports.routes";
import KittireportsRoutes from "./routes/Est_Report.route";
import WichitreportRoutes from "./routes/reportWichitchai.routes"
import ApichreportRoutes from "./routes/may_report.route"


const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); 

// ─── Routes ────────────────────────────────────────────────────────
app.use("/api/v1/auth",      authRoutes);
app.use("/api/v1/users",     userRoutes);
app.use("/api/v1/exercises", exercisesRoutes);
app.use("/api/v1/muscles",   musclesRoutes);
app.use("/api/v1",           workoutSessionRoutes);
app.use("/api/v1",           workoutPlanRoutes);

// ─── Reports ───────────────────────────────────────────────────────
app.use("/api/v1/reports",   WathitreportsRoutes);
app.use("/api/v1/reports",   KittireportsRoutes);
app.use("/api/v1/reports",   WichitreportRoutes);
app.use("/api/v1/reports",   ApichreportRoutes);

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