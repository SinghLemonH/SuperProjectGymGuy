import { Request, Response } from "express";
import * as musclesService from "../service/muscles.service";
import { CreateMuscleSchema } from "../models/muscles.model";

export async function listMuscles(_req: Request, res: Response) {
  try {
    const muscles = await musclesService.listMuscles();
    return res.status(200).json({ muscles });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
}

export async function createMuscle(req: Request, res: Response) {
  try {
    const payload = CreateMuscleSchema.parse(req.body);
    await musclesService.createMuscle(payload);
    return res.status(201).json({ message: "Muscle entry created" });
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("Cannot create a new muscle entry")) {
      return res.status(501).json({ message });
    }
    return res.status(400).json({ message });
  }
}
