import { z } from "zod";

// snake_case line item (unchanged from the original contract).
const lineItemSchema = z.object({
  exercise_id: z.string(),
  target_sets: z.coerce.number().int(),
  target_reps: z.coerce.number().int().optional(),
  target_duration: z.coerce.number().int().optional(),
  target_weight: z.coerce.number().int().optional(),
  note: z.string().optional(),
});

export const WorkOutPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_name: z.string().min(1, "Plan is required"),
  start_date: z.string().min(8),
  end_date: z.string().min(8),
  description: z.string().optional(),
  completeness: z.number().nullable().optional(),
});

// CHANGED: plan_code is now optional (generated server-side if missing),
// line_items is optional (a plan can be created with no exercises yet),
// and an optional difficulty (1-5) is accepted for header-only plans.
export const CreateWorkOutPlanBodySchema = z.object({
  plan_code: z.string().min(1).optional(),
  plan_name: z.string().min(1, "Plan name is required"),
  start_date: z.string().min(8),
  end_date: z.string().min(8),
  description: z.string().optional(),
  difficulty: z.coerce.number().min(1).max(5).optional(),
  line_items: z.array(lineItemSchema).optional(),
});

export const UpdateWorkOutPlanBodySchema = z.object({
  plan_name: z.string().min(1).optional(),
  start_date: z.string().min(8).optional(),
  end_date: z.string().min(8).optional(),
  description: z.string().optional(),
  difficulty: z.coerce.number().min(1).max(5).optional(),
  line_items: z.array(lineItemSchema).optional(),
});