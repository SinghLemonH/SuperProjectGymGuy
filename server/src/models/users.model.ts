import { z } from "zod";

//check data in PATCH/users/:id before real use
export const PatchUserSchema = z.object({
    username:     z.string().min(1).optional(),
    age:          z.number().int().positive().optional(),
    weight:       z.number().positive().optional(),
    height:       z.number().positive().optional(),
    fitness_goal: z.enum(["weight_loss", "muscle_gain", "strength",
                         "endurance", "flexibility", "general_health"]).optional(),
    user_level:   z.enum(["beginner", "intermediate",
                         "advanced", "professional"]).optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "must send field 1 at lesat "}
);

//defined responed that return to user (no password)
export type UserProfileResponse = {
    id:           string;
    username:     string;
    email:        string;
    sex:          string;
    fitness_goal: string;
    user_level:   string;
    age:          number;
    weight:       number;
    height:       number;
    bmr:          number | null;
    member_since: string;
};


//type from PatchUserSchema for using in Service! and Controller!
export type PatchUserInput = z.infer<typeof PatchUserSchema>;

//tell Tyscript parameter input in func is shaping like that 
// const patchUser = async(id: string, data: PatchUserInput) => {

// }
