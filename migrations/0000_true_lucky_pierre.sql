CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"color_class" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"difficulty" integer NOT NULL,
	"points" integer DEFAULT 5 NOT NULL,
	"variables" jsonb
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category_id" integer NOT NULL,
	"time_limit" integer NOT NULL,
	"difficulty" text NOT NULL,
	"total_questions" integer NOT NULL,
	"is_public" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"progress_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer_id" integer,
	"is_correct" boolean,
	"variables" jsonb,
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "student_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"completed_questions" integer DEFAULT 0,
	"time_spent" integer,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
