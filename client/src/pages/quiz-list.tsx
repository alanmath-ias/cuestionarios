import { useQuery } from '@tanstack/react-query';
import { QuizCard } from '@/components/dashboard/quiz-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { calculatePercentage } from '@/lib/mathUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number | null;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
}

interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: Date | string;
}

function QuizList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [_, setLocation] = useLocation();

  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    queryFn: async () => {
      const categories = await fetch('/api/categories').then(res => res.json());
      return categories.find((c: Category) => c.id === parseInt(categoryId));
    },
  });

  const { data: subcategories, isLoading: loadingSubcategories } = useQuery<Subcategory[]>({
    queryKey: [`/api/categories/${categoryId}/subcategories`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subcategories/by-category/${categoryId}`);
      return res.json();
    },
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/categories/${categoryId}/quizzes`],
  });

  const { data: progress, isLoading: loadingProgress } = useQuery<Progress[]>({
    queryKey: ['/api/progress'],
  });

  const quizzesBySubcategory = subcategories?.map(subcategory => ({
    ...subcategory,
    quizzes: quizzes?.filter(quiz => quiz.subcategoryId === subcategory.id) || [],
  })) || [];

  const quizzesWithoutSubcategory = quizzes?.filter(quiz => !quiz.subcategoryId) || [];

  const getQuizProgress = (quizId: number) => {
    if (!progress) return null;
    return progress.find(p => p.quizId === quizId);
  };

  const handleQuizAction = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };

  const handleTraining = (subcategoryId: number) => {
    setLocation(`/training2/${categoryId}/${subcategoryId}`);
    //setLocation(`/training/${subcategoryId}`);
  };

  const isLoading = loadingCategory || loadingSubcategories || loadingQuizzes || loadingProgress;

  return (
    <div id="quizSection" className="container mx-auto px-4 py-6 max-w-6xl">
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
        <div className="space-y-8">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-8 w-1/3 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subcategorías */}
          {quizzesBySubcategory.map(subcategory => (
            <div key={subcategory.id} className="space-y-4">
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-800 dark:text-blue-200">{subcategory.name}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {subcategory.quizzes.length} cuestionario(s)
                      </Badge>
                    </div>
                    <Button
                      variant="default"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleTraining(subcategory.id)}
                    >
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Entrenamiento
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {subcategory.description || 'Sin descripción'}
                  </p>
                </CardContent>
              </Card>

              {subcategory.quizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subcategory.quizzes.map(quiz => {
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
                        status={status}
                        progress={progressPercentage}
                        score={quizProgress?.score}
                        onStart={() => handleQuizAction(quiz.id)}
                        onContinue={() => handleQuizAction(quiz.id)}
                        onRetry={() => handleQuizAction(quiz.id)}
                        className="h-full"
                      />
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No hay cuestionarios en esta subcategoría
                  </CardContent>
                </Card>
              )}
            </div>
          ))}

          {/* Sin subcategoría */}
          {quizzesWithoutSubcategory.length > 0 && (
            <div className="space-y-4">
              <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-800 dark:text-gray-200">Cuestionarios generales</span>
                      <Badge variant="secondary">
                        {quizzesWithoutSubcategory.length} cuestionario(s)
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Cuestionarios que no pertenecen a una subcategoría específica
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzesWithoutSubcategory.map(quiz => {
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
                      status={status}
                      progress={progressPercentage}
                      score={quizProgress?.score}
                      onStart={() => handleQuizAction(quiz.id)}
                      onContinue={() => handleQuizAction(quiz.id)}
                      onRetry={() => handleQuizAction(quiz.id)}
                      className="h-full"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Sin nada */}
          {quizzesBySubcategory.length === 0 && quizzesWithoutSubcategory.length === 0 && (
            <Card className="text-center py-10">
              <CardContent>
                <p className="text-muted-foreground">No hay cuestionarios disponibles en esta categoría</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizList;
