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
  answerDetails: (Answer & { isCorrect?: boolean }) | null;
  correctAnswer: Answer | null;
}

export interface QuizResult {
  progress: Omit<StudentProgress, 'createdAt'> & {
    completedAt?: string; // Convertir Date a string para el frontend
  };
  quiz: Quiz;
  answers: QuizAnswerResult[];
}