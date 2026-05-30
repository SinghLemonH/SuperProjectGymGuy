import { Router } from "express";
 
import {getByUser, getById, create, update, remove, getAllCalories} from "../controller/WorkoutSession.controller";
 
const router = Router();
 
router.get("/workout-sessions/calories", getAllCalories);
router.get("/users/:userId/workout-sessions", getByUser);
router.get("/workout-sessions/:id", getById);
router.post("/workout-sessions", create);
router.patch("/workout-sessions/:id", update);
router.delete("/workout-sessions/:id", remove);
 
export default router;
 