// En shared/types.ts
export type Question = {
    id: number;
    content: string;
    quizId: number;
    type: string;
    difficulty: string;
    points: number;
    options: {
      id: number;
      text: string;  // Mapeado desde answers.content
      isCorrect: boolean;
      explanation?: string;
    }[];
  };

  export type Subcategory = {
    id: number;
    name: string;
    description: string;
    categoryId: number;
  };
  
  