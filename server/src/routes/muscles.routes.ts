import { Router } from "express";
import * as musclesController from "../controller/muscles.controller";

const router = Router();

router.get("/", musclesController.listMuscles);
router.post("/", musclesController.createMuscle);

export default router;
