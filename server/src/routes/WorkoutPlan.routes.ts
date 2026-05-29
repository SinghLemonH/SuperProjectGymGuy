import { Router } from "express";
import * as c from "../controller/WorkoutPlan.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const r = Router();

// CHANGED: protect these endpoints so res.locals.userId is populated from the JWT.
// Without this, create could not know which user owns the new plan.
r.use(authMiddleware);

r.get("/", c.handleListWorkoutPlan);
r.get("/:idOrCode", c.handleGetWorkoutPlan);
r.post("/", c.handleCreateWorkoutPlan);
r.delete("/:idOrCode", c.handleDeleteWorkoutPlan);
r.put("/:idOrCode", c.handleUpdateWorkoutPlan);

export default r;