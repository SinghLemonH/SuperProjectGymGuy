import { Router } from "express";
import { exercisePopularity, userWeightBMIProgress, leaderboardConsistencyCalories } from "../controller/reportWichitchai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/exercise-popularity",            authMiddleware, exercisePopularity);
router.get("/user-weight-bmi-progress",       authMiddleware, userWeightBMIProgress);
router.get("/leaderboard-consistency-calories", authMiddleware, leaderboardConsistencyCalories);

export default router;