import { Router } from "express";
import { register, login, refresh, logout } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// ไม่ต้องการ auth
router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);

// ต้องการ auth
router.post("/logout", authMiddleware, logout);

export default router;