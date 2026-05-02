import { Router } from "express";
import * as c from "../controller/Est_Report.controller";

const r = Router();

// EX GET /score-exercise-summary?user_id=5&code=ABC&start_date=2024-01-01
r.get("/score-exercise-summary", c.handleScoreExerciseSummary);

// EX GET /exercise-muscle-plan-list?user_id=5&muscle_area=chest
r.get("/exercise-muscle-plan-list", c.handleExerciseMusclePlanList);
// EX GET /workout-distribution?user_id=5
r.get("/workout-distribution", c.handleWorkOutDistribution);

export default r;
