import { Router } from "express";
import * as c from "../controller/Est_Report.controller";

const r = Router();

// GET /score-exercise-summary?user_id=5&code=ABC&start_date=2024-01-01
r.get("/score-exercise-summary", c.handleScoreExerciseSummary);
// GET /exercise-muscle-plan-list?user_id=5&muscle_area=chest
r.get("/exercise-muscle-plan-list", c.handleExerciseMusclePlanList);
// GET /workout-distribution?user_id=5
r.get("/workout-distribution", c.handleWorkOutDistribution);

export const EstReportRoute = r;
