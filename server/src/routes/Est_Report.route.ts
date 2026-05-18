import { Router } from "express";
import * as c from "../controller/Est_Report.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const r = Router();

// EX GET /score-exercise-summary (user_id comes from JWT auth)
r.get("/score-exercise-summary", authMiddleware, c.handleScoreExerciseSummary);

// EX GET /exercise-muscle-plan-list (user_id comes from JWT auth)
r.get("/exercise-muscle-plan-list", authMiddleware, c.handleExerciseMusclePlanList);
// EX GET /workout-distribution (user_id comes from JWT auth)
r.get("/workout-distribution", authMiddleware, c.handleWorkOutDistribution);

export default r;
