import { Router } from "express";
import * as exercisesController from "../controller/exercises.controller";

const router = Router();

router.get("/", exercisesController.listExercises);
router.get("/:id", exercisesController.getExerciseById);
router.post("/", exercisesController.createExercise);
router.patch("/:id", exercisesController.patchExercise);
router.delete("/:id", exercisesController.deleteExercise);

export default router;
