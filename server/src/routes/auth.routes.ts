import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ไม่ต้องการ auth
router.post("/auth/register", register);
router.post("/auth/login",    login);
router.post("/auth/refresh",  refresh);

// ต้องการ auth
router.post("/auth/logout", authMiddleware, logout);

export default router;