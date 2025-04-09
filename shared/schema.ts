import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Categories model
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  colorClass: text("color_class").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  colorClass: true,
});

// Quizzes model
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  difficulty: text("difficulty").notNull(), // "basic", "intermediate", "advanced"
  totalQuestions: integer("total_questions").notNull(),
  isPublic: boolean("is_public").default(false), // Indica si el quiz es público o requiere autenticación
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  description: true,
  categoryId: true,
  timeLimit: true,
  difficulty: true,
  totalQuestions: true,
  isPublic: true,
});

// Questions model (template questions that can be randomized)
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  content: text("content").notNull(), // Can include placeholders like {a}, {b} for randomization
  type: text("type").notNull(), // "equation", "geometry", etc.
  difficulty: integer("difficulty").notNull(), // 1-5 difficulty rating
  points: integer("points").notNull().default(5),
  variables: jsonb("variables"), // JSON structure defining variable ranges, e.g. {"a": {"min": 1, "max": 10}}
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  quizId: true,
  content: true,
  type: true,
  difficulty: true,
  points: true,
  variables: true,
});

// Answers model
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  content: text("content").notNull(), // Can include placeholders like {a}, {b} for randomization
  isCorrect: boolean("is_correct").notNull(),
  explanation: text("explanation"),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  questionId: true,
  content: true,
  isCorrect: true,
  explanation: true,
});

// Student Progress model
export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  status: text("status").notNull(), // "not_started", "in_progress", "completed"
  score: integer("score"),
  completedQuestions: integer("completed_questions").default(0),
  timeSpent: integer("time_spent"), // in seconds
  completedAt: timestamp("completed_at"),
});

export const insertStudentProgressSchema = createInsertSchema(studentProgress).pick({
  userId: true,
  quizId: true,
  status: true,
  score: true,
  completedQuestions: true,
  timeSpent: true,
  completedAt: true,
});

// Student Answers model
export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull(),
  questionId: integer("question_id").notNull(),
  answerId: integer("answer_id"),
  isCorrect: boolean("is_correct"),
  variables: jsonb("variables"), // The actual variables used in this instance of the question
  timeSpent: integer("time_spent"), // in seconds
});

export const insertStudentAnswerSchema = createInsertSchema(studentAnswers).pick({
  progressId: true,
  questionId: true,
  answerId: true,
  isCorrect: true,
  variables: true,
  timeSpent: true,
});

// Types exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type InsertStudentAnswer = z.infer<typeof insertStudentAnswerSchema>;
