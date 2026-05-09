import { Request, Response } from "express";
import {
    getExercisePopularity,
    getUserWeightBMIProgress,
    getLeaderboardConsistencyCalories
} from "../service/reportWichitchai.service";

// GET /reports/exercise-popularity
export const exercisePopularity = async (req: Request, res: Response) => {
    try {
        const { category, difficulty_level, exercise_name } = req.query;
        const result = await getExercisePopularity({
            category:         category as string,
            difficulty_level: difficulty_level as string,
            exercise_name:    exercise_name as string,
        });
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ error_code: error.error_code, message: error.message });
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

// GET /reports/user-weight-bmi-progress
export const userWeightBMIProgress = async (req: Request, res: Response) => {
    try {
        const { username, from_date, to_date } = req.query;
        const result = await getUserWeightBMIProgress({
            username:  username as string,
            from_date: from_date as string,
            to_date:   to_date as string,
        });
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ error_code: error.error_code, message: error.message });
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

// GET /reports/leaderboard-consistency-calories
export const leaderboardConsistencyCalories = async (req: Request, res: Response) => {
    try {
        const { username, month, sort_by, order } = req.query;
        const result = await getLeaderboardConsistencyCalories({
            username: username as string,
            month:    month as string,
            sort_by:  sort_by as string,
            order:    order as string,
        });
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.status) return res.status(error.status).json({ error_code: error.error_code, message: error.message });
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};