import { Request, Response } from "express";
import { RegisterSchema, LoginSchema, RefreshSchema } from "../models/auth.model";
import { registerUser, loginUser, refreshToken, logoutUser } from "../service/auth.service";

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response) => {
    try {
        // validate body ด้วย Zod
        const input = RegisterSchema.parse(req.body);

        const result = await registerUser(input);

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

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response) => {
    try {
        const input = LoginSchema.parse(req.body);

        const result = await loginUser(input);

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

// POST /api/v1/auth/refresh
export const refresh = async (req: Request, res: Response) => {
    try {
        const input = RefreshSchema.parse(req.body);

        const result = await refreshToken(input.refresh_token);

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

// POST /api/v1/auth/logout
export const logout = async (req: Request, res: Response) => {
    try {
        const result = await logoutUser();
        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({
            error_code: "SERVER_ERROR",
            message: "Internal server error"
        });
    }
};