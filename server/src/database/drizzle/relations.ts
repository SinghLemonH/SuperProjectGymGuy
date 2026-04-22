import { relations } from "drizzle-orm/relations";
import { exercise, workoutSessionExercise, workoutSession, users, workoutPlan, userCaution, exerciseMuscleAff, workoutPlanExercise } from "./schema";

export const workoutSessionExerciseRelations = relations(workoutSessionExercise, ({one}) => ({
	exercise: one(exercise, {
		fields: [workoutSessionExercise.exerciseId],
		references: [exercise.id]
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

export const workoutSessionRelations = relations(workoutSession, ({one, many}) => ({
	workoutSessionExercises: many(workoutSessionExercise),
	user: one(users, {
		fields: [workoutSession.userId],
		references: [users.id]
	}),
	workoutPlan: one(workoutPlan, {
		fields: [workoutSession.workoutPlanId],
		references: [workoutPlan.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	workoutSessions: many(workoutSession),
	workoutPlans: many(workoutPlan),
	userCautions: many(userCaution),
}));

export const workoutPlanRelations = relations(workoutPlan, ({one, many}) => ({
	workoutSessions: many(workoutSession),
	user: one(users, {
		fields: [workoutPlan.userId],
		references: [users.id]
	}),
	workoutPlanExercises: many(workoutPlanExercise),
}));

export const userCautionRelations = relations(userCaution, ({one}) => ({
	user: one(users, {
		fields: [userCaution.userId],
		references: [users.id]
	}),
}));

export const exerciseMuscleAffRelations = relations(exerciseMuscleAff, ({one}) => ({
	exercise: one(exercise, {
		fields: [exerciseMuscleAff.exerciseId],
		references: [exercise.id]
	}),
}));

export const workoutPlanExerciseRelations = relations(workoutPlanExercise, ({one}) => ({
	exercise: one(exercise, {
		fields: [workoutPlanExercise.exerciseId],
		references: [exercise.id]
	}),
	workoutPlan: one(workoutPlan, {
		fields: [workoutPlanExercise.workoutPlanId],
		references: [workoutPlan.id]
	}),
}));