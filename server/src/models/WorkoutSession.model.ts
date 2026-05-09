import { z } from "zod";

const ExerciseLogSchema = z.object({
  workout_plan_exercise_id: z.string().uuid(),

  actualWeight: z.coerce.number().min(0).optional(),

  actualSet: z.coerce.number().min(0).optional(),

  actualReps: z.coerce.number().int().positive(),

  actualDuration: z.coerce.number().int().positive(),

  notes: z.string().optional(),
});

//POST /workout-sessions

export const CreateWorkoutSessionSchema = z.object({
  user_id: z.string().uuid(),
  workout_plan_id: z.string().uuid(),
  session_datetime: z.string().min(1),
  exercises: z.array(ExerciseLogSchema).min(1),
});

//PATCH /workout-sessions/:id
export const UpdateWorkoutSessionSchema = z.object({
  session_datetime: z.string().optional(),

  exercises: z.array(ExerciseLogSchema).optional(),
});

//type for service / controller
export type CreateWorkoutSessionInput =
  z.infer<typeof CreateWorkoutSessionSchema>;

export type UpdateWorkoutSessionInput =
  z.infer<typeof UpdateWorkoutSessionSchema>;
0