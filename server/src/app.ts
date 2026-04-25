import express from "express";
import { testconn } from "./database/supabase";
import authRoutes from "./routes/auth.routes";
import exercisesRoutes from "./routes/exercises.routes";
import musclesRoutes from "./routes/muscles.routes";


const app = express();

// ─── Middleware ────────────────────────────────────────────────────
app.use(express.json()); // parse JSON body

// ─── Routes ────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/exercises", exercisesRoutes);
app.use("/api/v1/muscles", musclesRoutes);


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