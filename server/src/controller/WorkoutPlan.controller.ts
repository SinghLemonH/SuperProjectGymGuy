import { Request, Response } from "express";
import { z } from "zod";
import { CreateWorkOutPlanBodySchema, UpdateWorkOutPlanBodySchema } from "../models/WorkoutPlan.model";
import { listWorkoutPlan, getWorkoutPlan, createWorkOutPlan, updateWorkOutPlan, deleteWorkOutPlan } from "../service/WorkoutPlan.service";

// GET /api/v1/workout-plan/list?search=&page=1&limit=10&sortBy=code&sortDir=asc
export async function handleListWorkoutPlan(req : Request, res : Response) {
    try {
        const search = String(req.query.search || "");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortBy = String(req.query.sortBy || "code");
        const sortDir = String(req.query.sortDir || "asc");
        const result = await listWorkoutPlan({ search, page, limit, sortBy, sortDir });
        res.json(result);
    } catch (error : any) {
        res.status(500).json({message:error.message});
    }
}

// GET /api/v1/workout-plan/:idOrCode
export async function handleGetWorkoutPlan(req : Request, res : Response) {
    try {
        const idOrCode = String(req.params.idOrCode);

        const result = await getWorkoutPlan(idOrCode);

        if (!result) {
            return res.status(404).json({message:"Workout plan is not found"});
        }

        res.json(result);
    }

    catch (error : any) {
        res.status(500).json({message:error.message});
    }
}

// POST /api/v1/workout-plan
export async function handleCreateWorkoutPlan(req : Request, res : Response) {
    try {
        const parsed = CreateWorkOutPlanBodySchema.parse(req.body);
        const result = await createWorkOutPlan({...parsed, user_id : res.locals.userId});
        res.status(201).json(result);
    }

    catch (error : any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message : "Validation error", errors : error.message});
        }
        
        res.status(500).json({message : error.message});
    }
}

// PUT /api/v1/workout_plan/idOrCode
export async function handleUpdateWorkoutPlan(req : Request, res : Response) {

    try {
        const idOrCode = String(req.params.idOrCode);
        const parsed = UpdateWorkOutPlanBodySchema.parse(req.body)
        const result = await updateWorkOutPlan({...parsed, idOrCode})
        res.json(result);
    }

    catch (error : any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message : "Validation error", errors : error.message});
        }
        
        res.status(500).json({message : error.message});
    }
}


// DELETE /api/v1/workout_plan/:idOrCode <- workoutplanId or workoutplan_code
export async function handleDeleteWorkoutPlan(req : Request, res : Response) {
    
    try {
        const idOrCode = String(req.params.idOrCode);
        const result = await deleteWorkOutPlan(idOrCode);

        if (!result) {
            return res.status(404).json({message:"Workout plan is not found"});
        }

        res.json({message : "Workout plan deleted successfully"});
    }

    catch (error:any) {
        res.status(500).json({message : error.message});
    }
}