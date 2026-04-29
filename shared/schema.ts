import { pgTable, foreignKey, serial, text, integer, index, varchar, json, timestamp, boolean, jsonb, unique, uuid, primaryKey, real } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";
import { drizzle } from "drizzle-orm/postgres-js";

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	username: text("username").notNull(),
	password: text("password"),
	name: text("name").notNull(),
	email: text("email").notNull(),
	role: text("role").default('student').notNull(),
	googleId: text("google_id").unique(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	hintCredits: integer("hint_credits").default(50).notNull(),
	tourStatus: jsonb("tour_status").default({}),
	mercadopagoPayerId: text("mercadopago_payer_id"),
	subscriptionStatus: text("subscription_status").default('free'),
	subscriptionPlan: text("subscription_plan"),
	subscriptionEndDate: timestamp("subscription_end_date", { mode: 'string' }),
	canReport: boolean("can_report").default(false).notNull(),
	totalReports: integer("total_reports").default(0).notNull(),
	canCreateAiQuizzes: boolean("can_create_ai_quizzes").default(false).notNull(),
	duelWins: integer("duel_wins").default(0).notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	colorClass: text("color_class").notNull(),
	youtubeLink: text("youtube_link"),
	sortOrder: integer("sort_order").default(0),
});

export const subcategories = pgTable("subcategories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	categoryId: integer("category_id").notNull(),
	colorClass: text("color_class"),
	youtube_sublink: text("youtube_sublink").default(sql`NULL`),
	sortOrder: integer("sort_order").default(0),
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
	url: text("url"),
	sortOrder: integer("sort_order").default(0),
	isVerified: boolean("is_verified").default(false),
	isAiGenerated: boolean("is_ai_generated").default(false),
	createdByUserId: integer("created_by_user_id"),
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
	userResponse: text("user_response"),
	isCorrect: boolean("is_correct"),
	variables: jsonb(),
	timeSpent: integer("time_spent"),
	hintsUsed: integer("hints_used").default(0).notNull(),
	aiEvaluation: jsonb("ai_evaluation"),
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
}, (table) => [
	foreignKey({
		columns: [table.quizId],
		foreignColumns: [quizzes.id],
		name: "questions_quiz_id_fkey"
	}).onDelete("cascade"),
]);

export const answers = pgTable("answers", {
	id: serial().primaryKey().notNull(),
	questionId: integer("question_id").notNull(),
	content: text().notNull(),
	isCorrect: boolean("is_correct").notNull(),
	explanation: text(),
}, (table) => [
	foreignKey({
		columns: [table.questionId],
		foreignColumns: [questions.id],
		name: "answers_question_id_fkey"
	}).onDelete("cascade"),
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
	isMini: boolean("is_mini").default(false),
	assignedQuestionIds: jsonb("assigned_question_ids"),
	responseMode: text("response_mode").default('multiple_choice').notNull(),
});

export const quizSubmissions = pgTable("quiz_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: integer("user_id"),
	quizId: integer("quiz_id"),
	completedAt: timestamp("completed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	score: real().notNull(),
	feedback: text(),
	reviewed: boolean().default(false),
	readByStudent: boolean("read_by_student").default(false),
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
	responseMode: text("response_mode").default('multiple_choice').notNull(),
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
	googleId: true,
	canReport: true,
	canCreateAiQuizzes: true,
}).extend({
	email: z.string().email("Correo electrónico inválido (ejemplo: usuario@dominio.com)").min(1, "El correo es obligatorio"),
	username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
	name: true,
	description: true,
	colorClass: true,
	youtubeLink: true,
	sortOrder: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
	title: true,
	description: true,
	categoryId: true,
	subcategoryId: true,
	timeLimit: true,
	difficulty: true,
	totalQuestions: true,
	isPublic: true,
	sortOrder: true,
	isAiGenerated: true,
	createdByUserId: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
	quizId: true,
	content: true,
	type: true,
	difficulty: true,
	points: true,
	variables: true,
	imageUrl: true,
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
	userResponse: true,
	isCorrect: true,
	variables: true,
	timeSpent: true,
	hintsUsed: true,
	aiEvaluation: true,
});

export const insertUserCategorySchema = createInsertSchema(userCategories).pick({
	userId: true,
	categoryId: true,
});

export const parents = pgTable("parents", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	childId: integer("child_id").references(() => users.id, { onDelete: "cascade" }),
	requestedChildName: varchar("requested_child_name", { length: 100 }),
});

export const questionReports = pgTable("question_reports", {
	id: serial().primaryKey().notNull(),
	quizId: integer("quiz_id").notNull(),
	questionId: integer("question_id").notNull(),
	userId: integer("user_id").notNull(),
	description: text().notNull(),
	status: text().default("pending").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chiquiResults = pgTable("chiqui_results", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
	lastScore: real().notNull(),
	lastDate: timestamp("last_date").defaultNow().notNull(),
	lastAnswers: jsonb("last_answers").$type<any[]>().default([]),
}, (table) => [
	unique("chiqui_userId_categoryId_unique").on(table.userId, table.categoryId),
]);

export const chiquiHistory = pgTable("chiqui_history", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
	score: integer("score").notNull(),
	earnedCredits: integer("earned_credits").default(0).notNull(),
	date: timestamp("date").defaultNow().notNull(),
});

export const insertChiquiHistorySchema = createInsertSchema(chiquiHistory).pick({
	userId: true,
	categoryId: true,
	score: true,
	earnedCredits: true,
	date: true,
});

export type ChiquiHistory = typeof chiquiHistory.$inferSelect;
export type InsertChiquiHistory = z.infer<typeof insertChiquiHistorySchema>;

export const trainingHistory = pgTable("training_history", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
	score: real("score").notNull(),
	earnedCredits: integer("earned_credits").default(0).notNull(),
	completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const trainingResults = pgTable("training_results", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
	score: real("score").notNull(),
	totalQuestions: integer("total_questions").notNull(),
	answers: jsonb("answers").$type<any[]>().notNull(),
	questionsData: jsonb("questions_data").$type<any[]>().notNull(),
	timeSpent: integer("time_spent"),
	completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => [
	unique("training_results_user_category_unique").on(table.userId, table.categoryId),
]);

export const insertTrainingHistorySchema = createInsertSchema(trainingHistory);
export type TrainingHistory = typeof trainingHistory.$inferSelect;
export type InsertTrainingHistory = z.infer<typeof insertTrainingHistorySchema>;

export const insertTrainingResultSchema = createInsertSchema(trainingResults);
export type TrainingResult = typeof trainingResults.$inferSelect;
export type InsertTrainingResult = z.infer<typeof insertTrainingResultSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
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

export const questionReportsRelations = relations(questionReports, ({ one }) => ({
	user: one(users, {
		fields: [questionReports.userId],
		references: [users.id],
	}),
	quiz: one(quizzes, {
		fields: [questionReports.quizId],
		references: [quizzes.id],
	}),
	question: one(questions, {
		fields: [questionReports.questionId],
		references: [questions.id],
	}),
}));

export const insertQuestionReportSchema = createInsertSchema(questionReports);
export const selectQuestionReportSchema = createInsertSchema(questionReports);
export type QuestionReport = z.infer<typeof selectQuestionReportSchema>;
export type InsertQuestionReport = z.infer<typeof insertQuestionReportSchema>;

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export type PasswordResetToken = z.infer<typeof selectPasswordResetTokenSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export const friendships = pgTable("friendships", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	status: text("status").default('pending').notNull(),
	userWins: integer("user_wins").default(0).notNull(),
	friendWins: integer("friend_wins").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("friendship_unique").on(table.userId, table.friendId),
]);

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	type: text("type").notNull(),
	fromId: integer("from_id"),
	data: jsonb("data"),
	read: boolean("read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const duels = pgTable("duels", {
	id: serial("id").primaryKey(),
	challengerId: integer("challenger_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	topic: text("topic"),
	status: text("status").notNull(),
	wager: integer("wager").default(0).notNull(),
	quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: "set null" }),
	scores: jsonb("scores").default({ challenger: 0, receiver: 0 }).notNull(),
	currentQuestionIndex: integer("current_question_index").default(0),
	winnerId: integer("winner_id").references(() => users.id, { onDelete: "set null" }),
	handicap: jsonb("handicap").$type<{
		points?: { value: number; targetId: number };
		time?: { value: number; targetId: number };
	}>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const managedChallenges = pgTable("managed_challenges", {
	id: serial("id").primaryKey(),
	adminId: integer("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: "set null" }),
	aiTopic: text("ai_topic"),
	status: text("status").notNull().default('pending'), // 'pending', 'ready', 'in_progress', 'finished'
	wager: integer("wager").default(0).notNull(),
	creditsMode: text("credits_mode").notNull().default('redistribute'), // 'redistribute' or 'system_pay'
	questionsCount: integer("questions_count").default(10).notNull(),
	prizeConfig: jsonb("prize_config").$type<{
		winners: { 1: number; 2?: number; 3?: number };
		losers: { [userId: number]: number };
	}>(),
	winnerIds: jsonb("winner_ids").$type<number[]>().default([]),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const managedChallengeParticipants = pgTable("managed_challenge_participants", {
	id: serial("id").primaryKey(),
	challengeId: integer("challenge_id").notNull().references(() => managedChallenges.id, { onDelete: "cascade" }),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	status: text("status").notNull().default('pending'), // 'pending', 'ready', 'abandoned'
	score: integer("score").default(0).notNull(),
	rank: integer("rank"),
	pointsHandicap: integer("points_handicap").default(0).notNull(),
	timeHandicap: integer("time_handicap").default(0).notNull(),
	finishedAt: timestamp("finished_at"),
});

export const messages = pgTable("messages", {
	id: serial("id").primaryKey(),
	senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	read: boolean("read").default(false).notNull(),
	isEdited: boolean("is_edited").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: "user",
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromId],
    references: [users.id],
  }),
}));

export const duelsRelations = relations(duels, ({ one }) => ({
  challenger: one(users, {
    fields: [duels.challengerId],
    references: [users.id],
    relationName: "challenger",
  }),
  receiver: one(users, {
    fields: [duels.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  quiz: one(quizzes, {
    fields: [duels.quizId],
    references: [quizzes.id],
  }),
  winner: one(users, {
    fields: [duels.winnerId],
    references: [users.id],
    relationName: "winner",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	sender: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "sender",
	}),
	receiver: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "receiver",
	}),
}));

export const managedChallengesRelations = relations(managedChallenges, ({ one, many }) => ({
  admin: one(users, {
    fields: [managedChallenges.adminId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [managedChallenges.quizId],
    references: [quizzes.id],
  }),
  participants: many(managedChallengeParticipants),
}));

export const managedChallengeParticipantsRelations = relations(managedChallengeParticipants, ({ one }) => ({
  challenge: one(managedChallenges, {
    fields: [managedChallengeParticipants.challengeId],
    references: [managedChallenges.id],
  }),
  user: one(users, {
    fields: [managedChallengeParticipants.userId],
    references: [users.id],
  }),
}));

export const insertFriendshipSchema = createInsertSchema(friendships);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertMessageSchema = createInsertSchema(messages);

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type Duel = typeof duels.$inferSelect;
export type InsertDuel = typeof duels.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type ManagedChallenge = typeof managedChallenges.$inferSelect;
export type InsertManagedChallenge = typeof managedChallenges.$inferInsert;
export type ManagedChallengeParticipant = typeof managedChallengeParticipants.$inferSelect;
export type InsertManagedChallengeParticipant = typeof managedChallengeParticipants.$inferInsert;
