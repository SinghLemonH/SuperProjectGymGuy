import { z } from "zod";

//check data in POST /auth/register before real use
export const RegisterSchema = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    fitness_goal: z.enum(["weight_loss", "muscle_gain", "strength",
                          "endurance", "flexibility", "general_health"]),
    sex: z.enum(["male", "female"]),
    age: z.number().int().positive(),
    weight: z.number().positive(),
    height: z.number().positive(),

});

//check data in POST /auth/login before real use
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

//check data in POST /auth/refresh before real use
export const RefreshSchema = z.object({
    refresh_token: z.string().min(1),
});

//type for using in Service and Controller
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;