// src/shared/quiz-types.ts
import type { StudentProgress, Quiz, Question, Answer } from "@shared/schema";

export interface QuizAnswerResult {
  id: number;
  progressId: number;
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  variables: Record<string, number>;
  timeSpent: number;
  question: Question;
  answerDetails: Answer | null;
  correctAnswer: Answer | null;
}

export interface QuizResult {
  progress: StudentProgress;
  quiz: Quiz;
  answers: QuizAnswerResult[];
}
