import { Request, Response } from "express";

import { ScoreExerciseSummary, ExerciseMusclePlanList, WorkOutDistribution} from "../service/Est_Report.service";

export async function handleScoreExerciseSummary(req : Request, res : Response) {
    try {   
        const workout_plan_code = req.query.code ? String(req.query.code) : undefined;
        const start_date = req.query.start_date ? String(req.query.start_date) : undefined;
        const end_date = req.query.end_date ? String(req.query.end_date) : undefined;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortDir = String(req.query.sortDir || "asc");
        const result = await ScoreExerciseSummary({workout_plan_code, start_date, end_date, page, limit, sortDir });
        res.json(result);
    } catch (error : any) {
        res.status(500).json({message:error.message});
    }
}
export async function handleExerciseMusclePlanList(req : Request, res : Response) {
    try {
        const muscle_area = req.query.muscle_area ? String(req.query.muscle_area) : undefined;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortDir = String(req.query.sortDir || "asc");
        const result = await ExerciseMusclePlanList({muscle_area, page, limit, sortDir});
        res.json(result);
    } catch (error : any) {
        res.status(500).json({message:error.message});
    }
}
export async function handleWorkOutDistribution(req : Request, res : Response) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortDir = String(req.query.sortDir || "asc");
        const result = await WorkOutDistribution({page, limit, sortDir});
        res.json(result);
    } catch (error : any) {
        res.status(500).json({message:error.message});
    }
}

