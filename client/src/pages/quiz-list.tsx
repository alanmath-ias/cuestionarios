import { useQuery } from '@tanstack/react-query';
import { QuizCard } from '@/components/dashboard/quiz-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { calculatePercentage } from '@/lib/mathUtils';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
}
{/*}
interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
}
*/}

//deepseek mejora active-quiz
interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: Date | string; // Añadir este campo
}
//fin deepseek mejora active-quiz

function QuizList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [_, setLocation] = useLocation();
  
  // Fetch category details
  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    queryFn: async () => {
      const categories = await fetch('/api/categories').then(res => res.json());
      return categories.find((c: Category) => c.id === parseInt(categoryId));
    },
  });
  
  // Fetch quizzes for this category
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/categories/${categoryId}/quizzes`],
  });
  
  // Fetch student progress
  const { data: progress, isLoading: loadingProgress } = useQuery<Progress[]>({
    queryKey: ['/api/progress'],
  });
  
  // Get progress for a specific quiz
  const getQuizProgress = (quizId: number) => {
    if (!progress) return null;
    return progress.find(p => p.quizId === quizId);
  };
  
  // Handlers for quiz actions
  const handleStartQuiz = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };
  
  const handleContinueQuiz = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };
  
  const handleRetryQuiz = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };
  
  const isLoading = loadingCategory || loadingQuizzes || loadingProgress;

  return (
    <div id="quizSection">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-3"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-semibold">
          {loadingCategory ? 'Cargando...' : category?.name}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {quizzes.map(quiz => {
            const quizProgress = getQuizProgress(quiz.id);
            const status = quizProgress?.status || 'not_started';
            const progressPercentage = quizProgress ? 
              calculatePercentage(quizProgress.completedQuestions, quiz.totalQuestions) : 0;
            
            return (
              <QuizCard
                key={quiz.id}
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                questionCount={quiz.totalQuestions}
                timeLimit={quiz.timeLimit}
                difficulty={quiz.difficulty}
                status={status as 'not_started' | 'in_progress' | 'completed'}
                progress={progressPercentage}
                score={quizProgress?.score}
                onStart={() => handleStartQuiz(quiz.id)}
                onContinue={() => handleContinueQuiz(quiz.id)}
                onRetry={() => handleRetryQuiz(quiz.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay cuestionarios disponibles en esta categoría</p>
        </div>
      )}
    </div>
  );
}

export default QuizList;
