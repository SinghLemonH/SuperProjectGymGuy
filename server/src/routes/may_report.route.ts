import { Router } from "express";
import {getTotalCaloriesBurnedReport,getTotalWorkoutSessionsReport,getPlanAchievementReport,} from "../controller/may_report.controller";

const router = Router();

// Report 1 – แคลรวมต่อ user (simple)
router.get("/reports/total-calories-burned", getTotalCaloriesBurnedReport);
// Report 2 – จำนวน session ต่อ user (simple)
router.get("/reports/total-workout-sessions", getTotalWorkoutSessionsReport);
// Report 3 – % achievement ต่อ plan ต่อ user (analysis)
router.get("/reports/plan-achievement", getPlanAchievementReport);

export default router;