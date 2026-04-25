import { z } from "zod";

export const ExerciseCategory = [
  "strength",
  "cardio",
  "body_weight",
  "flexibility",
  "plyometric",
  "olympic_lifting",
  "strongman",
] as const;

export const ScaleNumber = ["1", "2", "3", "4", "5"] as const;

export const MuscleName = ["chest", "quads", "heart", "abs", "lower_back"] as const;

export const ExerciseMuscleMappingSchema = z.object({
  muscle: z.enum(MuscleName),
  impact_level: z.enum(ScaleNumber),
});

export const CreateExerciseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(ExerciseCategory),
  difficulty_level: z.enum(ScaleNumber),
  calorie_rate: z.number().positive(),
  score_based: z.number().positive(),
  description: z.string().optional(),
  muscle_mapping: z.array(ExerciseMuscleMappingSchema).nonempty(),
});

export const PatchExerciseSchema = CreateExerciseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "must send at least 1 field" }
);

export const ExerciseQuerySchema = z.object({
  category: z.enum(ExerciseCategory).optional(),
  difficulty_level: z.enum(ScaleNumber).optional(),
  muscle: z.enum(MuscleName).optional(),
  search: z.string().min(1).optional(),
  page: z.preprocess((value) => {
    if (typeof value === "string") {
      return parseInt(value, 10);
    }
    return value;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((value) => {
    if (typeof value === "string") {
      return parseInt(value, 10);
    }
    return value;
  }, z.number().int().positive().max(100).default(20)),
});

export const ExerciseMuscleResponseSchema = z.object({
  id: z.string(),
  muscle: z.enum(MuscleName),
  impact_level: z.enum(ScaleNumber),
});

export const ExerciseResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category: z.enum(ExerciseCategory),
  difficulty_level: z.enum(ScaleNumber),
  calorie_rate: z.number(),
  score_based: z.number(),
  description: z.string().nullable().optional(),
  muscle_mapping: z.array(ExerciseMuscleResponseSchema),
});

export const CreateMuscleSchema = z.object({
  muscle: z.enum(MuscleName),
});

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;
export type PatchExerciseInput = z.infer<typeof PatchExerciseSchema>;
export type ExerciseQueryInput = z.infer<typeof ExerciseQuerySchema>;
export type ExerciseResponse = z.infer<typeof ExerciseResponseSchema>;
export type CreateMuscleInput = z.infer<typeof CreateMuscleSchema>;
export type MuscleResponse = z.infer<typeof ExerciseMuscleResponseSchema>;

export const AVAILABLE_MUSCLES = MuscleName as readonly string[];
