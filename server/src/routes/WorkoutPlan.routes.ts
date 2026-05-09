import { Router } from "express";
import * as c from "../controller/WorkoutPlan.controller";

const r = Router();
r.get("/", c.handleListWorkoutPlan);
r.get("/:idOrCode", c.handleGetWorkoutPlan);
r.post("/", c.handleCreateWorkoutPlan);
r.delete("/:idOrCode", c.handleDeleteWorkoutPlan);
r.put("/:idOrCode", c.handleUpdateWorkoutPlan);

export default r;
