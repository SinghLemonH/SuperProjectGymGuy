import { Context } from "hono";
import { RegisterSchema, LoginSchema, RefreshSchema } from "../models/auth.model";
import { registerUser, loginUser, refreshToken, logoutUser } from "../service/auth.service";

// POST /api/v1/auth/register
export const register = async (c: Context) => {
    try {
        // validate request body ด้วย Zod
        const body = await c.req.json();
        const input = RegisterSchema.parse(body);

        // เรียก service
        const result = await registerUser(input);

        return c.json(result, 201);

    } catch (error: any) {
        // Zod validation error
        if (error.name === "ZodError") {
            return c.json({
                error_code: "VALIDATION_ERROR",
                message: error.errors
            }, 400);
        }
        // Service error (409, 401 ฯลฯ)
        if (error.status) {
            return c.json({
                error_code: error.error_code,
                message: error.message
            }, error.status);
        }
        // Unexpected error
        return c.json({ error_code: "SERVER_ERROR", message: "Internal server error" }, 500);
    }
};

// POST /api/v1/auth/login
export const login = async (c: Context) => {
    try {
        const body = await c.req.json();
        const input = LoginSchema.parse(body);

        const result = await loginUser(input);

        return c.json(result, 200);

    } catch (error: any) {
        if (error.name === "ZodError") {
            return c.json({
                error_code: "VALIDATION_ERROR",
                message: error.errors
            }, 400);
        }
        if (error.status) {
            return c.json({
                error_code: error.error_code,
                message: error.message
            }, error.status);
        }
        return c.json({ error_code: "SERVER_ERROR", message: "Internal server error" }, 500);
    }
};

// POST /api/v1/auth/refresh
export const refresh = async (c: Context) => {
    try {
        const body = await c.req.json();
        const input = RefreshSchema.parse(body);

        const result = await refreshToken(input.refresh_token);

        return c.json(result, 200);

    } catch (error: any) {
        if (error.name === "ZodError") {
            return c.json({
                error_code: "VALIDATION_ERROR",
                message: error.errors
            }, 400);
        }
        if (error.status) {
            return c.json({
                error_code: error.error_code,
                message: error.message
            }, error.status);
        }
        return c.json({ error_code: "SERVER_ERROR", message: "Internal server error" }, 500);
    }
};

// POST /api/v1/auth/logout
export const logout = async (c: Context) => {
    try {
        const result = await logoutUser();
        return c.json(result, 200);

    } catch (error: any) {
        return c.json({ error_code: "SERVER_ERROR", message: "Internal server error" }, 500);
    }
};