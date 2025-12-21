import { pgTable, foreignKey, serial, text, integer, index, varchar, json, timestamp, boolean, jsonb, unique, uuid, primaryKey, real } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"

import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";  // ✅ Forma correcta para Zod v3+
import { drizzle } from "drizzle-orm/postgres-js";
//import * as schema from './schema'; // ✅ corregido con extensión .js

//schema nuevo

export const subcategories = pgTable("subcategories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	categoryId: integer("category_id").notNull(),
	colorClass: text("color_class"),
	youtube_sublink: text("youtube_sublink").default(sql`NULL`), // Usar sql para establecer NULL como valor predeterminado
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
	url: text("url"), // opcional, tipo texto
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
	hintsUsed: integer("hints_used").default(0).notNull(),
});

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	colorClass: text("color_class").notNull(),
	youtubeLink: text("youtube_link"), // Columna sin valores predeterminados
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
	hint1: text("hint1"),
	hint2: text("hint2"),
	hint3: text("hint3"),
	explanation: text("explanation"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	email: text(),
	role: text().default('student').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	hintCredits: integer("hint_credits").default(50).notNull(),
	tourStatus: jsonb("tour_status").default({}),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const studentProgress = pgTable("student_progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	quizId: integer("quiz_id").notNull(),
	status: text().notNull(),
	score: real(),
	completedQuestions: integer("completed_questions").default(0),
	timeSpent: integer("time_spent"),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	hintsUsed: integer("hints_used").default(0).notNull(),
	isMini: boolean("is_mini").default(false), // Added to sync with DB
	assignedQuestionIds: jsonb("assigned_question_ids"), // Added to sync with DB
});

export const quizSubmissions = pgTable("quiz_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id"),
	quizId: integer("quiz_id"),
	completedAt: timestamp("completed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	score: real().notNull(),
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
	primaryKey({ columns: [table.userId, table.quizId], name: "user_quizzes_pkey" }),
]);



export const insertUserSchema = createInsertSchema(users).pick({
	username: true,
	password: true,
	name: true,
	email: true,
	role: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
	name: true,
	description: true,
	colorClass: true,
	youtubeLink: true, // Incluye youtubeLink en el esquema
});



export const insertQuizSchema = createInsertSchema(quizzes).pick({
	title: true,
	description: true,
	categoryId: true,
	subcategoryId: true, // ← ✅ Agrega esta línea
	timeLimit: true,
	difficulty: true,
	totalQuestions: true,
	isPublic: true,
});


export const insertQuestionSchema = createInsertSchema(questions).pick({
	quizId: true,
	content: true,
	type: true,
	difficulty: true,
	points: true,
	variables: true,
	imageUrl: true, // ✅ Agrega esta línea
});


export const insertAnswerSchema = createInsertSchema(answers).pick({
	questionId: true,
	content: true,
	isCorrect: true,
	explanation: true,
});


import { InferModel } from "drizzle-orm";

export type Progress = InferModel<typeof studentProgress>;


export const insertStudentProgressSchema = createInsertSchema(studentProgress, {
	completedAt: z.date()
		.or(z.string().datetime().transform(str => new Date(str)))
		.or(z.null())
		.optional()
		.transform(val => val === null ? undefined : val)
}).omit({ id: true });



export const insertStudentAnswerSchema = createInsertSchema(studentAnswers).pick({
	progressId: true,
	questionId: true,
	answerId: true,
	isCorrect: true,
	variables: true,
	timeSpent: true,
	hintsUsed: true,
});

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
	userId: true,
	categoryId: true,
});


export const parents = pgTable("parents", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(), // Ej: Ximena
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	childId: integer("child_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// Types exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

//export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;


export type Question = typeof questions.$inferSelect; // Para SELECTs
export type NewQuestion = typeof questions.$inferInsert; // Para INSERTs

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type InsertStudentAnswer = z.infer<typeof insertStudentAnswerSchema>;

export type UserCategory = typeof userCategories.$inferSelect;
export type InsertUserCategory = z.infer<typeof insertUserCategorySchema>;

export type Subcategory = typeof subcategories.$inferSelect;
export type Parent = typeof parents.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	studentProgress: many(studentProgress),
	quizSubmissions: many(quizSubmissions),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
	questions: many(questions),
	category: one(categories, {
		fields: [quizzes.categoryId],
		references: [categories.id],
	}),
	subcategory: one(subcategories, {
		fields: [quizzes.subcategoryId],
		references: [subcategories.id],
	}),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	quiz: one(quizzes, {
		fields: [questions.quizId],
		references: [quizzes.id],
	}),
	answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.id],
	}),
}));

export const studentProgressRelations = relations(studentProgress, ({ one, many }) => ({
	user: one(users, {
		fields: [studentProgress.userId],
		references: [users.id],
	}),
	quiz: one(quizzes, {
		fields: [studentProgress.quizId],
		references: [quizzes.id],
	}),
	answers: many(studentAnswers),
}));

export const studentAnswersRelations = relations(studentAnswers, ({ one }) => ({
	progress: one(studentProgress, {
		fields: [studentAnswers.progressId],
		references: [studentProgress.id],
	}),
	question: one(questions, {
		fields: [studentAnswers.questionId],
		references: [questions.id],
	}),
	answerDetails: one(answers, {
		fields: [studentAnswers.answerId],
		references: [answers.id],
	}),
}));



export const questionReports = pgTable("question_reports", {
	id: serial().primaryKey().notNull(),
	quizId: integer("quiz_id").notNull(),
	questionId: integer("question_id").notNull(),
	userId: integer("user_id").notNull(),
	description: text().notNull(),
	status: text().default("pending").notNull(), // pending, resolved
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionReportSchema = createInsertSchema(questionReports);
export const selectQuestionReportSchema = createInsertSchema(questionReports);
export type QuestionReport = z.infer<typeof selectQuestionReportSchema>;
export type InsertQuestionReport = z.infer<typeof insertQuestionReportSchema>;
