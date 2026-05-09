import { Router } from "express";
import { getProfile, getDashboard, getLeaderboard, updateProfile, removeUser } from "../controller/users.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id",              authMiddleware, getProfile);
router.get("/:id/dashboard",    authMiddleware, getDashboard);
router.get("/:id/leaderboard",  authMiddleware, getLeaderboard);
router.patch("/:id",            authMiddleware, updateProfile);
router.delete("/:id",           authMiddleware, removeUser);

export default router;