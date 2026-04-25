import { z } from "zod";
import { MuscleName } from "./exercises.model";

export const CreateMuscleSchema = z.object({
  muscle: z.enum(MuscleName),
});

export const ListMusclesSchema = z.object({
  muscles: z.array(z.enum(MuscleName)),
});

export type CreateMuscleInput = z.infer<typeof CreateMuscleSchema>;
export type MuscleListResponse = z.infer<typeof ListMusclesSchema>;
