import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//for check Bearer token before entering protected endpoint
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers["authorization"]; //pull Authorization Header

    //check header have "Bearer" ?
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error_code: "UNAUTHORIZED",
            message: "Invalid or expired token"
        });
    }

    //cut "Bearer "
    const token = authHeader.split(" ")[1];

    //verify token expired or not
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        res.locals.userId = (payload as any).sub; // for controller calling
        next();

    } catch (error) {
        return res.status(401).json({
            error_code: "UNAUTHORIZED",
            message: "Invalid or expired token"
        });
    }
};