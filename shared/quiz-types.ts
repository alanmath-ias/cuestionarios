import type { StudentProgress, Quiz, Question, Answer } from "./schema.js";

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
    //completedAt?: string; // Convertir Date a string para el frontend, esto lo quite para arreglar database/storage
    completedAt: string | null; // Añade | null
  };
  quiz: Quiz;
  answers: QuizAnswerResult[];
}