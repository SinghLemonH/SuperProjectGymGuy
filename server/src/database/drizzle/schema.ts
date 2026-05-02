import { pgTable, foreignKey, uuid, smallint, timestamp, unique, text, real, date, numeric, check, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const cautionType = pgEnum("caution_type", ['injury', 'chronic_health', 'allergy', 'physical_restriction', 'medication', 'diet'])
export const exerciseCategory = pgEnum("exercise_category", ['strength', 'cardio', 'body_weight', 'flexibility', 'plyometric', 'olympic_lifting', 'strongman'])
export const fitnessGoal = pgEnum("fitness_goal ", ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_health'])
export const muscle = pgEnum("muscle", ['chest', 'quads', 'heart', 'abs', 'lower_back'])
export const scaleNumber = pgEnum("scale_number ", ['1', '2', '3', '4', '5'])
export const scaleText = pgEnum("scale_text", ['low', 'medium', 'high'])
export const sex = pgEnum("sex", ['male', 'female'])
export const userLevel = pgEnum("user_level", ['beginner', 'intermediate', 'advanced', 'professional'])


export const workoutSession = pgTable("workout_session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionNo: smallint("session_no").notNull(),
	userId: uuid("user_id").notNull(),
	workoutPlanId: uuid("workout_plan_id").notNull(),
	sessionDatetime: timestamp("session_datetime", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "workout_session_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.workoutPlanId],
			foreignColumns: [workoutPlan.id],
			name: "workout_session_workout_plan_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workoutPlan = pgTable("workout_plan", {
	userId: uuid("user_id").notNull(),
	code: text().notNull(),
	planName: text("plan_name").notNull(),
	difficulty: real().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	description: text(),
	completeness: numeric().default('0').notNull(),
	id: uuid().primaryKey().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "workout_plan_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("Work_plan_Code_key").on(table.code),
]);

export const userCaution = pgTable("user_caution", {
	userId: uuid("user_id").notNull(),
	id: uuid().primaryKey().notNull(),
	cautionType: cautionType("caution_type").notNull(),
	seriousLevel: scaleText("serious_level").default('low').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_caution_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	memberSince: timestamp("member_since", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
	age: smallint().notNull(),
	weight: real().notNull(),
	height: real().notNull(),
	sex: sex().default('male').notNull(),
	userLevel: userLevel("user_level").default('beginner').notNull(),
	fitnessGoal: fitnessGoal("fitness_goal").notNull(),
	bmr: smallint(),
}, (table) => [
	unique("User_Username_key").on(table.username),
	unique("User_Email_key").on(table.email),
]);

export const workoutSessionExercise = pgTable("workout_session_exercise", {
	workoutSessionId: uuid("workout_session_id").notNull(),
	notes: text(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutPlanExerciseId: uuid("workout_plan_exercise_id"),
}, (table) => [
	foreignKey({
			columns: [table.workoutPlanExerciseId],
			foreignColumns: [workoutPlanExercise.id],
			name: "workout_session_exercise_workout_plan_exercise_id_fkey"
		}),
	foreignKey({
			columns: [table.workoutSessionId],
			foreignColumns: [workoutSession.id],
			name: "workout_session_exercise_workout_session_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const exercise = pgTable("exercise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
	calorieRate: real("calorie_rate").notNull(),
	description: text(),
	scoreBased: real("score_based").default(sql`'0'`).notNull(),
	category: exerciseCategory().notNull(),
	difficultyLevel: scaleNumber("difficulty_level").notNull(),
}, (table) => [
	unique("Exercise_Code_key").on(table.code),
	unique("Exercise_Name_key").on(table.name),
]);

export const exerciseMuscleAff = pgTable("exercise_muscle_aff", {
	exerciseId: uuid("exercise_id").notNull(),
	name: muscle().notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	impactLevel: scaleNumber("impact_level").default('1').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercise.id],
			name: "exercise_muscle_aff_exercise_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workoutPlanExercise = pgTable("workout_plan_exercise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutPlanId: uuid("workout_plan_id").notNull(),
	exerciseId: uuid("exercise_id").notNull(),
	targetSets: smallint("target_sets").notNull(),
	targetReps: smallint("target_reps"),
	targetDuration: smallint("target_duration"),
	note: text(),
	targetWeight: smallint("target_weight"),
	dateNumber: smallint("date_number").default(sql`'1'`),
}, (table) => [
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercise.id],
			name: "workout_plan_exercise_exercise_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.workoutPlanId],
			foreignColumns: [workoutPlan.id],
			name: "workout_plan_exercise_workout_plan_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	check("Workout_plan_exercise_Target_sets_check", sql`target_sets > 0`),
]);
