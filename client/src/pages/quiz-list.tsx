import { useQuery } from '@tanstack/react-query';
import { QuizCard } from '@/components/dashboard/quiz-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, BookOpen, ListChecks, Youtube } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { calculatePercentage } from '@/lib/mathUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import  VideoEmbed  from './VideoEmbed';

interface Category {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string | null;
}

interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  youtube_sublink?: string | null;
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
      const data = await res.json();
      
      return data.map((sub: Subcategory) => ({
        ...sub,
        youtube_sublink: sub.youtube_sublink?.toUpperCase() === "NULL" 
          ? null 
          : sub.youtube_sublink?.trim() || null
      }));
    },
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/categories/${categoryId}/quizzes`],
  });

  const { data: progress, isLoading: loadingProgress } = useQuery<Progress[]>({
    queryKey: ['/api/progress'],
  });

  const quizzesBySubcategory = Array.isArray(subcategories)
  ? subcategories.map(subcategory => ({
      ...subcategory,
      quizzes: quizzes?.filter(quiz => quiz.subcategoryId === subcategory.id) || [],
    }))
  : [];

  const quizzesWithoutSubcategory = quizzes?.filter(quiz => !quiz.subcategoryId) || [];

  const getQuizProgress = (quizId: number) => {
    if (!progress) return null;
    return progress.find(p => p.quizId === quizId);
  };

  const calculateSubcategoryProgress = (subcategoryId: number) => {
    const subcategoryQuizzes = quizzes?.filter(q => q.subcategoryId === subcategoryId) || [];
    if (subcategoryQuizzes.length === 0) return 0;
    
    const completed = progress?.filter(p => 
      subcategoryQuizzes.some(q => q.id === p.quizId) && p.status === 'completed'
    ).length || 0;
    
    return (completed / subcategoryQuizzes.length) * 100;
  };

  const handleQuizAction = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };

  const handleTraining = (subcategoryId: number) => {
    setLocation(`/training2/${categoryId}/${subcategoryId}`);
  };

  const isLoading = loadingCategory || loadingSubcategories || loadingQuizzes || loadingProgress;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Botón atrás */}
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setLocation('/')}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>

    {/* Título de la categoría */}
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4 mb-4">
      {loadingCategory ? 'Cargando...' : category?.name}
    </h1>

    {/* Video embebido */}
    {category?.youtubeLink && (
      <div className="w-full max-w-3xl mx-auto mb-8">
        <VideoEmbed youtubeLink={category.youtubeLink} />
      </div>
    )}

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
        <div className="space-y-8">
          {/* Sección de Subcategorías */}
          {quizzesBySubcategory.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Temas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzesBySubcategory.map(subcategory => {
                  const progressPercentage = calculateSubcategoryProgress(subcategory.id);

                  return (
                    <Card 
                      key={subcategory.id} 
                      className="rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                              {subcategory.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-blue-600 dark:text-blue-400">
                              {subcategory.quizzes.length} cuestionario(s)
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {progressPercentage.toFixed(0)}% completado
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress 
                          value={progressPercentage} 
                          className="h-2 bg-blue-100 dark:bg-blue-900" 
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {subcategory.description || 'Sin descripción'}
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                              onClick={() => handleTraining(subcategory.id)}
                            >
                              <Dumbbell className="h-4 w-4" />
                              Entrenar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold flex items-center justify-center gap-2"
                              onClick={() => {
                                document.getElementById(`subcategory-${subcategory.id}`)?.scrollIntoView({
                                  behavior: 'smooth'
                                });
                              }}
                            >
                              <ListChecks className="h-4 w-4" />
                              Ver cuestionarios
                            </Button>
                          </div>
                          {subcategory.youtube_sublink && (
                            <a
                            href={subcategory.youtube_sublink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button 
                              size="sm"
                              className="w-full font-semibold flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                              <Youtube className="h-4 w-4 text-red-600" />
                              YouTube Videos
                            </Button>
                          </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Listado de Cuestionarios por Subcategoría */}
          {quizzesBySubcategory.map(subcategory => (
            <section 
              key={`quizzes-${subcategory.id}`} 
              id={`subcategory-${subcategory.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {subcategory.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {subcategory.quizzes.length} cuestionario(s)
                  </Badge>
                </div>
              </div>

              <div className="p-6">
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
                          className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No hay cuestionarios en este tema</p>
                  </div>
                )}
              </div>

              {subcategory.youtube_sublink && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
                  <a
                    href={subcategory.youtube_sublink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button 
                      size="sm"
                      className="w-full font-semibold flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                      <Youtube className="h-4 w-4 text-red-600" />
                     YouTube Videos
                    </Button>
                  </a>
                </div>
              )}
            </section>
          ))}

          {/* Cuestionarios Generales */}
          {quizzesWithoutSubcategory.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Cuestionarios generales
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Cuestionarios que no pertenecen a un tema específico
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {quizzesWithoutSubcategory.length} cuestionario(s)
                  </Badge>
                </div>
              </div>

              <div className="p-6">
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
                        className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Sin Contenido */}
          {quizzesBySubcategory.length === 0 && quizzesWithoutSubcategory.length === 0 && (
            <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardContent className="space-y-4">
                <BookOpen className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No hay cuestionarios disponibles en esta materia
                </p>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 dark:text-blue-400" 
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizList;