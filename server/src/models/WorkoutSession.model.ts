import { z } from "zod";

const ExerciseLogSchema = z.object({

  exercise_id: z.string().uuid(),

  actual_set: z.coerce.number().int().positive(),
  actual_reps: z.coerce.number().int().positive(),
  actual_duration: z.coerce.number().int().positive(),
});

export const CreateWorkoutSessionSchema = z.object({
  user_id: z.string().uuid(),
  
  workout_plan_id: z.string().uuid().optional(),
  session_datetime: z.string().min(1),
  exercises: z.array(ExerciseLogSchema).min(1),
});

export const UpdateWorkoutSessionSchema = z.object({
  session_datetime: z.string().optional(),
  exercises: z.array(ExerciseLogSchema).optional(),
});

export type CreateWorkoutSessionInput =
  z.infer<typeof CreateWorkoutSessionSchema>;

export type UpdateWorkoutSessionInput =
  z.infer<typeof UpdateWorkoutSessionSchema>;