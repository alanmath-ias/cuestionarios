import { pgTable, foreignKey, serial, text, integer, index, varchar, json, timestamp, boolean, jsonb, unique, uuid, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

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

//fin schema nuevo


//const db = drizzle(connection, { schema });

//session model
/*export const session = pgTable("session", {
  sid: text("sid").primaryKey(), // character varying → text en Drizzle
  sess: json("sess").notNull(),  // json
  expire: timestamp("expire", { withTimezone: false }).notNull(), // timestamp sin zona horaria
});*/

// User model
/*export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});*/

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

// Categories model
/*export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  colorClass: text("color_class").notNull(),
});*/

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  colorClass: true,
  youtubeLink: true, // Incluye youtubeLink en el esquema
});

// Quizzes model
/*export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  subcategoryId: integer("subcategory_id").references(() => subcategories.id).notNull(),
  timeLimit: integer("time_limit").notNull(),
  difficulty: text("difficulty").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  isPublic: boolean("is_public").default(false),
});*/


/*export const userQuizzes = pgTable("user_quizzes", {
  userId: integer("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
});*/


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

// Questions model (template questions that can be randomized)
/*export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  content: text("content").notNull(), // Can include placeholders like {a}, {b} for randomization
  type: text("type").notNull(), // "equation", "geometry", etc.
  difficulty: integer("difficulty").notNull(), // 1-5 difficulty rating
  points: integer("points").notNull().default(5),
  variables: jsonb("variables"), // JSON structure defining variable ranges, e.g. {"a": {"min": 1, "max": 10}}
  imageUrl: text("image_url"), // ✅

});*/

export const insertQuestionSchema = createInsertSchema(questions).pick({
  quizId: true,
  content: true,
  type: true,
  difficulty: true,
  points: true,
  variables: true,
  imageUrl: true, // ✅ Agrega esta línea
});

// Answers model (for each question)
/*export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  //questionId: integer("question_id").references(() => questionsTable.id), // Asegura la relación
  questionId: integer("question_id").notNull().references(() => questions.id),
  content: text("content").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  explanation: text("explanation")
});*/


export const insertAnswerSchema = createInsertSchema(answers).pick({
  questionId: true,
  content: true,
  isCorrect: true,
  explanation: true,
});

// Student Progress model
/*export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  status: text("status").notNull(), // "not_started", "in_progress", "completed"
  score: integer("score"),
  completedQuestions: integer("completed_questions").default(0),
  timeSpent: integer("time_spent"), // in seconds
  //completedAt: timestamp("completed_at"),//deep seek mejora active-quiz:
  completedAt: timestamp("completed_at", { mode: 'date' }), // Asegura el modo date
});*/

import { InferModel } from "drizzle-orm";

export type Progress = InferModel<typeof studentProgress>;


export const insertStudentProgressSchema = createInsertSchema(studentProgress, {
  completedAt: z.date()
    .or(z.string().datetime().transform(str => new Date(str)))
    .or(z.null())
    .optional()
    .transform(val => val === null ? undefined : val)
}).omit({ id: true });


// Student Answers model
/*export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull(),
  //questionId: integer("question_id").notNull(),
  //answerId: integer("answer_id"),
  questionId: integer("question_id").notNull().references(() => questions.id),
  answerId: integer("answer_id").references(() => answers.id),
  isCorrect: boolean("is_correct"),
  variables: jsonb("variables"), // The actual variables used in this instance of the question
  timeSpent: integer("time_spent"), // in seconds
});*/


export const insertStudentAnswerSchema = createInsertSchema(studentAnswers).pick({
  progressId: true,
  questionId: true,
  answerId: true,
  isCorrect: true,
  variables: true,
  timeSpent: true,
});

// User-Categories relation (many-to-many)
/*export const userCategories = pgTable("user_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
}, (table) => ({
  unq: unique("user_category_unique").on(table.userId, table.categoryId)
}));*/

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
  userId: true,
  categoryId: true,
});
// Subcategorias Model
/*export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  colorClass: text("color_class"),
});*/

export type UserQuiz = {
  id: number;
  title: string;
  categoryId: number;
  difficulty: string;
  status?: "not_started" | "in_progress" | "completed"; // Puede ser opcional
  reviewed?: boolean;
};


// chat gpt calificaciones quiz
// Quiz Submissions model (for tracking quiz completions and scores)
/*export const quizSubmissions = pgTable("quiz_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),

  progressId: integer("progress_id").references(() => studentProgress.id, { onDelete: "set null" }),

  completedAt: timestamp("completed_at", { withTimezone: false }).notNull(),
  score: integer("score").notNull(),

  feedback: text("feedback"),
  reviewed: boolean("reviewed").default(false),
  
});*/

// Asegúrate de que las claves externas sean las correctas para las tablas 'users' y 'quizzes'
/*export const quizFeedback = pgTable("quiz_feedback", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull(), // ahora es entero
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});*/


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


