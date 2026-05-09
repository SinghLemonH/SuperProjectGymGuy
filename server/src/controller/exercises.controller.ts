import { Request, Response } from "express";
import {
  CreateExerciseSchema,
  ExerciseQuerySchema,
  PatchExerciseSchema,
} from "../models/exercises.model";
import * as exercisesService from "../service/exercises.service";

export async function listExercises(req: Request, res: Response) {
  try {
    const query = ExerciseQuerySchema.parse(req.query);
    const result = await exercisesService.listExercises(query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function getExerciseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const exercise = await exercisesService.getExerciseById(id as string);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    return res.status(200).json(exercise);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function createExercise(req: Request, res: Response) {
  try {
    const payload = CreateExerciseSchema.parse(req.body);
    const exercise = await exercisesService.createExercise(payload);
    return res.status(201).json(exercise);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function patchExercise(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payload = PatchExerciseSchema.parse(req.body);
    const exercise = await exercisesService.patchExercise(id as string, payload);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    return res.status(200).json(exercise);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function deleteExercise(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await exercisesService.deleteExercise(id as string);

    return res.status(200).json({
      message: "Exercise deleted"
    });

  } catch (error) {
    const message = (error as Error).message;

    if (
      message.includes("workout plan") ||
      message.includes("workout session")
    ) {
      return res.status(409).json({ message });
    }

    return res.status(400).json({ message });
  }
}
