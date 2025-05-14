import { pgTable, foreignKey, serial, text, integer, index, varchar, json, timestamp, boolean, jsonb, unique, uuid, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const subcategories = pgTable("subcategories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	categoryId: integer("category_id").notNull(),
	colorClass: text("color_class"),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "subcategories_category_id_fkey"
		}),
]);

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const answers = pgTable("answers", {
	id: serial().primaryKey().notNull(),
	questionId: integer("question_id").notNull(),
	content: text().notNull(),
	isCorrect: boolean("is_correct").notNull(),
	explanation: text(),
});

export const quizzes = pgTable("quizzes", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	categoryId: integer("category_id").notNull(),
	timeLimit: integer("time_limit").notNull(),
	difficulty: text().notNull(),
	totalQuestions: integer("total_questions").notNull(),
	isPublic: boolean("is_public").default(false),
	subcategoryId: integer("subcategory_id"),
}, (table) => [
	foreignKey({
			columns: [table.subcategoryId],
			foreignColumns: [subcategories.id],
			name: "quizzes_subcategory_id_fkey"
		}),
]);

export const studentAnswers = pgTable("student_answers", {
	id: serial().primaryKey().notNull(),
	progressId: integer("progress_id").notNull(),
	questionId: integer("question_id").notNull(),
	answerId: integer("answer_id"),
	isCorrect: boolean("is_correct"),
	variables: jsonb(),
	timeSpent: integer("time_spent"),
});

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	colorClass: text("color_class").notNull(),
});

export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	quizId: integer("quiz_id").notNull(),
	content: text().notNull(),
	type: text().notNull(),
	difficulty: integer().notNull(),
	points: integer().default(5).notNull(),
	variables: jsonb(),
	imageUrl: text("image_url"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	email: text(),
	role: text().default('student').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const studentProgress = pgTable("student_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	quizId: integer("quiz_id").notNull(),
	status: text().notNull(),
	score: integer(),
	completedQuestions: integer("completed_questions").default(0),
	timeSpent: integer("time_spent"),
	completedAt: timestamp("completed_at", { mode: 'string' }),
});

export const quizSubmissions = pgTable("quiz_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id"),
	quizId: integer("quiz_id"),
	completedAt: timestamp("completed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	score: integer().notNull(),
	feedback: text(),
	reviewed: boolean().default(false),
	progressId: integer("progress_id"),
}, (table) => [
	foreignKey({
			columns: [table.progressId],
			foreignColumns: [studentProgress.id],
			name: "quiz_submissions_progress_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.quizId],
			foreignColumns: [quizzes.id],
			name: "quiz_submissions_quiz_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quiz_submissions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const quizfeedback = pgTable("quizfeedback", {
	id: serial().primaryKey().notNull(),
	userid: integer().notNull(),
	quizid: integer().notNull(),
	feedback: text().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.quizid],
			foreignColumns: [quizzes.id],
			name: "fk_quiz"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [users.id],
			name: "fk_user"
		}).onDelete("cascade"),
]);

export const userCategories = pgTable("user_categories", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	categoryId: integer("category_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "user_categories_category_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_categories_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_category_unique").on(table.userId, table.categoryId),
]);

export const quizFeedback = pgTable("quiz_feedback", {
	id: serial().primaryKey().notNull(),
	progressId: integer("progress_id").notNull(),
	feedback: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userQuizzes = pgTable("user_quizzes", {
	userId: integer("user_id").notNull(),
	quizId: integer("quiz_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.quizId],
			foreignColumns: [quizzes.id],
			name: "user_quizzes_quiz_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_quizzes_user_id_fkey"
		}),
	primaryKey({ columns: [table.userId, table.quizId], name: "user_quizzes_pkey"}),
]);
