import { z } from "zod";
          
export const WorkOutPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_name: z.string().min(1, "Plan is required"),
  start_date: z.string().min(8),
  end_date: z.string().min(8),
  description: z.string().optional(),
  completeness: z.number().nullable().optional(), 
});

export const CreateWorkOutPlanBodySchema = z.object({
  plan_code: z.string().min(1, "Plan code is required"),
  plan_name: z.string().min(1, "Plan name is required"),
  start_date: z.string().min(8),
  end_date: z.string().min(8),
  description: z.string().optional(),
  line_items: z.array(
      z.object({
        exercise_id: z.string(),
        target_sets: z.coerce.number().int(),
        target_reps: z.coerce.number().int().optional(),
        target_duration: z.coerce.number().int().optional(),
        target_weight: z.coerce.number().int().optional(),
        note: z.string().optional()
      }),
    )
    .min(1, "At least one exercise is required"),
});

export const UpdateWorkOutPlanBodySchema = z.object({
  plan_name: z.string().min(1).optional(),
  start_date: z.string().min(8).optional(),
  end_date: z.string().min(8).optional(),
  description: z.string().optional(),
  line_items: z.array(
      z.object({
        exercise_id: z.string(),
        target_sets: z.coerce.number().int(),
        target_reps: z.coerce.number().int().optional(),
        target_duration: z.coerce.number().int().optional(),
        target_weight: z.coerce.number().int().optional(),
        note: z.string().optional()
      }),
    ).optional()
});

