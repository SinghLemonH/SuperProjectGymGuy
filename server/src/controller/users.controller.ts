import { Request, Response } from "express";
import { PatchUserSchema } from "../models/users.model";
import { getUserById, getUserDashboard, getUserLeaderboard, patchUser, deleteUser } from "../service/users.service";

//GET /api/v1/users/:id
export const getProfile = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await getUserById(id);
        return res.status(200).json(result);

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error_code: error.error_code,
                message: error.message
            });
        }
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

//GET /api/v1/users/:id/dashboard
export const getDashboard = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await getUserDashboard(id);
        return res.status(200).json(result);

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error_code: error.error_code,
                message: error.message
            });
        }
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

//GET /api/v1/users/:id/leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await getUserLeaderboard(id);
        return res.status(200).json(result);

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error_code: error.error_code,
                message: error.message
            });
        }
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

//PATCH /api/v1/users/:id
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const input = PatchUserSchema.parse(req.body);
        const result = await patchUser(id, input);
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
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};

//DELETE /api/v1/users/:id
export const removeUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const result = await deleteUser(id);
        return res.status(200).json(result);

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                error_code: error.error_code,
                message: error.message
            });
        }
        return res.status(500).json({ error_code: "SERVER_ERROR", message: "Internal server error" });
    }
};