import { Context, Next } from "hono";
import { verify } from "hono/jwt"

//for check Bearer token before entering protecting  endpoint 
export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization") //pull Authorization Header

    //check header have "Bearer" ?
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({
            error_code: "UNAUTHORIZED", message: "Invalid or expired token"
        }, 401);
    }

    //cut "Bearer "
    const token = authHeader.split(" ")[1];

    //verify token expired or not
    try {
        const payload = await verify(token, process.env.JWT_SECRET!);
        
        c.set("userId", payload.sub); //for controller calling

        await next();
        
    } catch(error) {
        return c.json(
            { error_code: "UNAUTHORIZED", message: "Invalid or expired token" },
            401
        );
    }
};