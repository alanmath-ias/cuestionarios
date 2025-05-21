// Definiciones de tipos para la aplicación


export interface User {
  id: number;
  username: string;
  name: string;
  email?: string | null;
  role?: string;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  colorClass?: string;
  youtubeLink?: string | null; // Opcional y puede ser null
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
  isPublic: boolean | null;
}
export interface Question {
  id: number;
  content: string;
  type: string;
  quizId: number;
  difficulty: number;
  points: number;
  variables?: Record<string, number>;
  imageUrl?: string; // 👈 nueva propiedad opcional
}


export interface Answer {
  id: number;
  content: string;
  questionId: number;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface StudentProgress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  completedQuestions: number | null;
  timeSpent: number | null;
  completedAt: Date | null;
}

export interface StudentAnswer {
  id: number;
  progressId: number;
  questionId: number;
  answerId: number | null;
  isCorrect: boolean | null;
  timeSpent: number | null;
  variables?: Record<string, number>;
}


export type UserQuiz = {
  id: number;
  title: string;
  categoryId: number;
  difficulty: string;
  status?: "not_started" | "in_progress" | "completed"; // Puede ser opcional
  reviewed?: boolean;
};
