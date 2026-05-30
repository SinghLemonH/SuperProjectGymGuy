import { relations } from "drizzle-orm/relations";
import { users, workoutPlan, userCaution, workoutSession, exercise, workoutSessionExercise, workoutPlanExercise, exerciseMuscleAff } from "./schema";

export const workoutPlanRelations = relations(workoutPlan, ({one, many}) => ({
	user: one(users, {
		fields: [workoutPlan.userId],
		references: [users.id]
	}),
	workoutSessions: many(workoutSession),
	workoutPlanExercises: many(workoutPlanExercise),
}));

export const usersRelations = relations(users, ({many}) => ({
	workoutPlans: many(workoutPlan),
	userCautions: many(userCaution),
	workoutSessions: many(workoutSession),
}));

export const userCautionRelations = relations(userCaution, ({one}) => ({
	user: one(users, {
		fields: [userCaution.userId],
		references: [users.id]
	}),
}));

export const workoutSessionRelations = relations(workoutSession, ({one, many}) => ({
	user: one(users, {
		fields: [workoutSession.userId],
		references: [users.id]
	}),
	workoutPlan: one(workoutPlan, {
		fields: [workoutSession.workoutPlanId],
		references: [workoutPlan.id]
	}),
	workoutSessionExercises: many(workoutSessionExercise),
}));

export const workoutSessionExerciseRelations = relations(workoutSessionExercise, ({one}) => ({
	exercise: one(exercise, {
		fields: [workoutSessionExercise.exerciseId],
		references: [exercise.id]
	}),
	workoutPlanExercise: one(workoutPlanExercise, {
		fields: [workoutSessionExercise.workoutPlanExerciseId],
		references: [workoutPlanExercise.id]
	}),
	workoutSession: one(workoutSession, {
		fields: [workoutSessionExercise.workoutSessionId],
		references: [workoutSession.id]
	}),
}));

export const exerciseRelations = relations(exercise, ({many}) => ({
	workoutSessionExercises: many(workoutSessionExercise),
	exerciseMuscleAffs: many(exerciseMuscleAff),
	workoutPlanExercises: many(workoutPlanExercise),
}));

export const workoutPlanExerciseRelations = relations(workoutPlanExercise, ({one, many}) => ({
	workoutSessionExercises: many(workoutSessionExercise),
	exercise: one(exercise, {
		fields: [workoutPlanExercise.exerciseId],
		references: [exercise.id]
	}),
	workoutPlan: one(workoutPlan, {
		fields: [workoutPlanExercise.workoutPlanId],
		references: [workoutPlan.id]
	}),
}));

export const exerciseMuscleAffRelations = relations(exerciseMuscleAff, ({one}) => ({
	exercise: one(exercise, {
		fields: [exerciseMuscleAff.exerciseId],
		references: [exercise.id]
	}),
}));