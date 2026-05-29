import { Request, Response } from "express";
import * as reportsService from "../service/wathit_reports.service";

export async function getUserBMR(req: Request, res: Response) {
  try {
    const data = await reportsService.getUserBMR();
    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ message: (e as Error).message });
  }
}

export async function getExerciseCalories(req: Request, res: Response) {
  try {
    const data = await reportsService.getExerciseCalories();
    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ message: (e as Error).message });
  }
}

export async function getTotalEnergy(req: Request, res: Response) {
  try {
    const data = await reportsService.getTotalEnergy();
    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ message: (e as Error).message });
  }
}