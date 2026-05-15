import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { testconn } from "./database/supabase";
import authRoutes from "./routes/auth.routes";
import exercisesRoutes from "./routes/exercises.routes";
import musclesRoutes from "./routes/muscles.routes";
import workoutSessionRoutes from "./routes/WorkoutSession.route";
import userRoutes from "./routes/Users.routes";


// --- Report route ----------
import WathitreportsRoutes from "./routes/wathit_reports.routes";
import KittireportsRoutes from "./routes/Est_Report.route";
import WichitreportRoutes from "./routes/reportWichitchai.routes"
import ApichreportRoutes from "./routes/may_report.route"


const app = express();

// ─── Middleware ────────────────────────────────────────────────────
app.use(express.json()); // parse JSON body

// ─── Routes ────────────────────────────────────────────────────────
console.log("DATABASE_URL:", process.env.DATABASE_URL);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/exercises", exercisesRoutes);
app.use("/api/v1/muscles", musclesRoutes);
app.use("/api/v1/WathitReports", WathitreportsRoutes);
app.use("/api/v1/KittiReports", KittireportsRoutes);
app.use("/api/v1/WichitReports", WichitreportRoutes);
app.use("/api/v1/ApichReports", ApichreportRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", workoutSessionRoutes);
app.use("/api/v1/users", userRoutes);

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