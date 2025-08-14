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

// types/child.type.ts (o en tu archivo de interfaces)
export interface Child {
  id: number;
  name: string;
  email: string | null; // Permitir que sea null
  // Agrega otros campos relevantes que necesites
}