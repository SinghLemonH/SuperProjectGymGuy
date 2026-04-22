-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."caution_type" AS ENUM('injury', 'chronic_health', 'allergy', 'physical_restriction', 'medication', 'diet');--> statement-breakpoint
CREATE TYPE "public"."exercise_category" AS ENUM('strength', 'cardio', 'body_weight', 'flexibility', 'plyometric', 'olympic_lifting', 'strongman');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal " AS ENUM('weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_health');--> statement-breakpoint
CREATE TYPE "public"."muscle" AS ENUM('chest', 'quads', 'heart', 'abs', 'lower_back');--> statement-breakpoint
CREATE TYPE "public"."scale_number " AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TYPE "public"."scale_text" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."user_level" AS ENUM('beginner', 'intermediate', 'advanced', 'professional');--> statement-breakpoint
CREATE TABLE "workout_session_exercise" (
	"workout_session_id" uuid NOT NULL,
	"exercise_id" uuid,
	"actual_weight" smallint,
	"actual_set" smallint NOT NULL,
	"actual_reps" smallint,
	"actual_duration" smallint,
	"notes" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_session_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_no" smallint NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_plan_id" uuid NOT NULL,
	"session_datetime" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_plan" (
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"plan_name" text NOT NULL,
	"difficulty" real NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"description" text,
	"completeness" numeric DEFAULT '0' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	CONSTRAINT "Work_plan_Code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "workout_plan" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_caution" (
	"user_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"caution_type" "caution_type" NOT NULL,
	"serious_level" "scale_text" DEFAULT 'low' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_caution" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"member_since" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"age" smallint NOT NULL,
	"weight" real NOT NULL,
	"height" real NOT NULL,
	"sex" "sex" DEFAULT 'male' NOT NULL,
	"user_level" "user_level" DEFAULT 'beginner' NOT NULL,
	"fitness_goal" "fitness_goal " NOT NULL,
	"bmr" smallint,
	CONSTRAINT "User_Username_key" UNIQUE("username"),
	CONSTRAINT "User_Email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"calorie_rate" real NOT NULL,
	"description" text,
	"score_based" real DEFAULT '0' NOT NULL,
	"category" "exercise_category" NOT NULL,
	"difficulty_level" "scale_number " NOT NULL,
	CONSTRAINT "Exercise_Code_key" UNIQUE("code"),
	CONSTRAINT "Exercise_Name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "exercise_muscle_aff" (
	"exercise_id" uuid NOT NULL,
	"name" "muscle" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"impact_level" "scale_number " DEFAULT '1' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_muscle_aff" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_plan_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_plan_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"target_sets" smallint NOT NULL,
	"target_reps" smallint,
	"target_duration" smallint,
	"score_override" numeric DEFAULT '0' NOT NULL,
	"note" text,
	"target_weight" smallint,
	CONSTRAINT "Workout_plan_exercise_Target_sets_check" CHECK (target_sets > 0)
);
--> statement-breakpoint
ALTER TABLE "workout_plan_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "workout_session_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "workout_session_exercise_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_session"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_caution" ADD CONSTRAINT "user_caution_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exercise_muscle_aff" ADD CONSTRAINT "exercise_muscle_aff_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_plan_exercise" ADD CONSTRAINT "workout_plan_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workout_plan_exercise" ADD CONSTRAINT "workout_plan_exercise_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plan"("id") ON DELETE cascade ON UPDATE cascade;
*/