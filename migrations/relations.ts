import { relations } from "drizzle-orm/relations";
import { categories, subcategories, quizzes, studentProgress, quizSubmissions, users, quizfeedback, userCategories, userQuizzes } from "./schema";

export const subcategoriesRelations = relations(subcategories, ({one, many}) => ({
	category: one(categories, {
		fields: [subcategories.categoryId],
		references: [categories.id]
	}),
	quizzes: many(quizzes),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	subcategories: many(subcategories),
	userCategories: many(userCategories),
}));

export const quizzesRelations = relations(quizzes, ({one, many}) => ({
	subcategory: one(subcategories, {
		fields: [quizzes.subcategoryId],
		references: [subcategories.id]
	}),
	quizSubmissions: many(quizSubmissions),
	quizfeedbacks: many(quizfeedback),
	userQuizzes: many(userQuizzes),
}));

export const quizSubmissionsRelations = relations(quizSubmissions, ({one}) => ({
	studentProgress: one(studentProgress, {
		fields: [quizSubmissions.progressId],
		references: [studentProgress.id]
	}),
	quiz: one(quizzes, {
		fields: [quizSubmissions.quizId],
		references: [quizzes.id]
	}),
	user: one(users, {
		fields: [quizSubmissions.userId],
		references: [users.id]
	}),
}));

export const studentProgressRelations = relations(studentProgress, ({many}) => ({
	quizSubmissions: many(quizSubmissions),
}));

export const usersRelations = relations(users, ({many}) => ({
	quizSubmissions: many(quizSubmissions),
	quizfeedbacks: many(quizfeedback),
	userCategories: many(userCategories),
	userQuizzes: many(userQuizzes),
}));

export const quizfeedbackRelations = relations(quizfeedback, ({one}) => ({
	quiz: one(quizzes, {
		fields: [quizfeedback.quizid],
		references: [quizzes.id]
	}),
	user: one(users, {
		fields: [quizfeedback.userid],
		references: [users.id]
	}),
}));

export const userCategoriesRelations = relations(userCategories, ({one}) => ({
	category: one(categories, {
		fields: [userCategories.categoryId],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [userCategories.userId],
		references: [users.id]
	}),
}));

export const userQuizzesRelations = relations(userQuizzes, ({one}) => ({
	quiz: one(quizzes, {
		fields: [userQuizzes.quizId],
		references: [quizzes.id]
	}),
	user: one(users, {
		fields: [userQuizzes.userId],
		references: [users.id]
	}),
}));