import { Router } from "express";
import * as reportsController from "../controller/wathit_reports.controller";

const router = Router();

router.get("/user-bmr", reportsController.getUserBMR);
router.get("/exercise-calories-burned", reportsController.getExerciseCalories);
router.get("/total-energy-burned", reportsController.getTotalEnergy);

export default router;