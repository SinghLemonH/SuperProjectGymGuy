import { Request, Response } from "express";
import {CreateWorkoutSessionSchema,UpdateWorkoutSessionSchema} from "../models/WorkoutSession.model";
import {getWorkoutSessionsByUserId,getWorkoutSessionById,createWorkoutSession,updateWorkoutSession,deleteWorkoutSession} from "../service/WorkoutSession.service";

//GET /api/v1/users/:userId/workout-sessions
export const getByUser = async (req: Request, res: Response) => {
  try {
    const result = await getWorkoutSessionsByUserId((req.params as any)["userId"]);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({
        error_code: error.error_code,
        message: error.message
      });
    }

    return res.status(500).json({
      error_code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
};

//GET /api/v1/workout-sessions/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const result = await getWorkoutSessionById((req.params as any)["id"]);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({
        error_code: error.error_code,
        message: error.message
      });
    }

    return res.status(500).json({
      error_code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
};

//POST /api/v1/workout-sessions
export const create = async (req: Request, res: Response) => {
  try {
    const input = CreateWorkoutSessionSchema.parse(req.body);

    const result = await createWorkoutSession(input);

    return res.status(201).json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error_code: "VALIDATION_ERROR",
        message: error.errors
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        error_code: error.error_code,
        message: error.message
      });
    }

    return res.status(500).json({
      error_code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
};

//PATCH /api/v1/workout-sessions/:id
export const update = async (req: Request, res: Response) => {
  try {
    const input = UpdateWorkoutSessionSchema.parse(req.body);

    const result = await updateWorkoutSession((req.params as any)["id"], input);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error_code: "VALIDATION_ERROR",
        message: error.errors
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        error_code: error.error_code,
        message: error.message
      });
    }

    return res.status(500).json({
      error_code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
};

//DELETE /api/v1/workout-sessions/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const result = await deleteWorkoutSession((req.params as any)["id"]);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({
        error_code: error.error_code,
        message: error.message
      });
    }

    return res.status(500).json({
      error_code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
};