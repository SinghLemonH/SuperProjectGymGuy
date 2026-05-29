import { Router } from "express";
import { getProfile, getDashboard, getLeaderboard, updateProfile, removeUser, getUserWorkoutPlans } from "../controller/users.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id",                  authMiddleware, getProfile);
router.get("/:id/dashboard",        authMiddleware, getDashboard);
router.get("/:id/leaderboard",      authMiddleware, getLeaderboard);
router.get("/:id/workout-plans",    authMiddleware, getUserWorkoutPlans);
router.patch("/:id",                authMiddleware, updateProfile);
router.delete("/:id",               authMiddleware, removeUser);

export default router;