import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Category } from "@/types/types";
import { UserQuiz } from "@/types/types";
import {
  BookOpen,
  ListChecks,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
  MessageCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { Youtube } from 'lucide-react';
import { useParams } from "wouter";

interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
}

async function fetchParentChild() {
  const response = await fetch("/api/parent/child", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo obtener el hijo asociado");
  return response.json();
}

async function fetchChildCategories(childId: string) {
  const response = await fetch(`/api/user/categories?user_id=${childId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener categorías del hijo");
  return response.json();
}

async function fetchChildQuizzes(childId: string) {
  const response = await fetch(`/api/user/quizzes?user_id=${childId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener cuestionarios del hijo");
  return response.json();
}

async function fetchChildAlerts(childId: string) {
  const res = await fetch(`/api/user/alerts?user_id=${childId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener alertas del hijo");
  return res.json();
}

async function fetchQuizFeedback(progressId: string) {
  if (!progressId) return null;
  const res = await fetch(`/api/quiz-feedback/${progressId}`);
  if (!res.ok) return null;
  return res.json();
}

function CompletedQuizCard({ quiz, childId }: { quiz: QuizWithFeedback; childId: string }) {
  const { data: feedback, isLoading: loadingFeedback } = useQuery({
    queryKey: ['quiz-feedback', quiz.progressId],
    queryFn: () => quiz.progressId ? fetchQuizFeedback(quiz.progressId) : null,
    enabled: !!quiz.progressId
  });

  return (
    <Card className="rounded-2xl bg-green-50 border border-green-200 shadow-sm hover:shadow-md transition-all relative">
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        {quiz.reviewed && (
          <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Revisado
          </div>
        )}
        {feedback?.feedback && (
          <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
            <MessageCircle className="h-3 w-3 mr-1" />
            Feedback
          </div>
        )}
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pr-10">
        <div>
          <CardTitle className="text-lg text-green-800 font-semibold">{quiz.title}</CardTitle>
          <CardDescription className="text-sm capitalize text-green-700">
            {quiz.difficulty}
          </CardDescription>
        </div>
        <div className="absolute bottom-3 right-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
      </CardHeader>
      
      <CardContent>
        {!loadingFeedback && feedback?.feedback && (
          <div className="mb-3 bg-white p-3 rounded border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-1">Retroalimentación AlanMath:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
          </div>
        )}
        <Link href={`/results/${quiz.progressId}?user_id=${childId}`}>
          <Button variant="outline" className="flex items-center text-green-700 border-green-400 hover:bg-green-100">
            Ver Resultados
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

async function fetchAuthenticatedUser() {
    const response = await fetch("/api/user", { credentials: "include" });
    if (!response.ok) throw new Error("No se pudo obtener la información del usuario");
    return response.json();
  }

  
export default function ParentDashboard() {
  const queryClient = useQueryClient();
  const params = useParams();

  const queryOptions = {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60,
  };

// Obtener datos del usuario autenticado
const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["authenticated-user"],
    queryFn: fetchAuthenticatedUser,
  });

  // Primero obtenemos el hijo asociado al padre
  const { data: childData, isLoading: loadingChild } = useQuery({
    queryKey: ["parent-child"],
    queryFn: fetchParentChild,
    ...queryOptions,
  });

  const childId = childData?.child_id || params.childId;
 //const childId = childData?.child_id;

  // Luego obtenemos todos los datos del hijo
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["child-categories", childId],
    queryFn: () => fetchChildCategories(childId),
    ...queryOptions,
    enabled: !!childId,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithFeedback[]>({
    queryKey: ["child-quizzes", childId],
    queryFn: () => fetchChildQuizzes(childId),
    ...queryOptions,
    enabled: !!childId,
  });

  const { data: alerts } = useQuery({
    queryKey: ["child-alerts", childId],
    queryFn: () => fetchChildAlerts(childId),
    ...queryOptions,
    enabled: !!childId,
  });

  const isLoading = loadingChild || loadingCategories || loadingQuizzes;

  

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && childId) {
        queryClient.invalidateQueries({ queryKey: ["parent-child"] });
        queryClient.invalidateQueries({ queryKey: ["child-categories"] });
        queryClient.invalidateQueries({ queryKey: ["child-quizzes"] });
        queryClient.invalidateQueries({ queryKey: ["child-alerts"] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, childId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!childId) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Hola {user?.name}</h1>
        <p className="text-muted-foreground">No se ha podido identificar al estudiante asociado.</p>
      </div>
    );
  }

  const completedQuizzes = quizzes?.filter((q) => q.status === "completed") || [];
  const pendingQuizzes = quizzes?.filter((q) => q.status !== "completed") || [];

  const progressPercentage = quizzes && quizzes.length > 0
    ? (completedQuizzes.length / quizzes.length) * 100
    : 0;



    
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Hola {user?.name}!</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
  Aquí puedes ver las Materias, Tareas y Progreso de 
  <span className="text-2xl font-bold text-gray-900 ml-2">
    {childData?.child_name || 'tu hijo'}
  </span>
</h2>
      {alerts?.hasPendingTasks && (
        <div className="mb-4 p-4 rounded-xl bg-yellow-100 text-yellow-800 flex items-center gap-2 shadow-md">
          <AlertTriangle className="w-5 h-5" />
          {childData?.child_name || 'tu hijo'} tiene tareas pendientes por resolver.
        </div>
      )}

      {alerts?.hasFeedback && (
        <div className="mb-4 p-4 rounded-xl bg-green-100 text-green-800 flex items-center gap-2 shadow-md">
          <MessageCircle className="w-5 h-5" />
          Tu hijo ha recibido retroalimentación en uno o más cuestionarios.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card de Progreso General */}
        <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-800">
              Progreso General
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {progressPercentage.toFixed(0)}%
            </div>
            <div className="text-indigo-500 font-medium">
              DE TAREAS COMPLETADAS
            </div>
            <div className="mt-4 h-2 bg-indigo-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Actividad Reciente */}
        <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-800">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedQuizzes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {completedQuizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all 
                              hover:bg-white hover:shadow-sm hover:border hover:border-green-200"
                  >
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 flex-1">
                      {quiz.title}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">
                  Tu hijo aún no ha tenido actividad
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-3">Materias que ve {childData?.child_name || 'tu hijo'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories?.map((category) => (
          <Card
            key={category.id}
            className="rounded-2xl bg-gradient-to-tr from-indigo-100 to-white border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg text-indigo-800 font-semibold">{category.name}</CardTitle>
                <CardDescription className="text-sm text-indigo-600">En Progreso...</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </CardHeader>
            {/*<CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/category/${category.id}?user_id=${childId}`} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto flex items-center justify-center font-semibold border-indigo-500 text-indigo-700"
                    >
                      Ver cuestionarios
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/training/${category.id}?user_id=${childId}`} className="w-full sm:w-auto">
                    <Button
                      variant="default"
                      className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Entrenamiento
                    </Button>
                  </Link>
                </div>
                {category.youtubeLink && (
                  <a
                    href={category.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold">
                      <Youtube className="w-5 h-5" />
                      YouTube VIDEOS
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>*/}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">Tareas Pendientes</h2>
          </div>
          {pendingQuizzes.length === 0 ? (
            <p className="text-muted-foreground">Tu hijo no tiene tareas pendientes.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="rounded-2xl bg-yellow-50 border border-yellow-200 shadow-sm hover:shadow-md transition-all"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div>
                      <CardTitle className="text-lg text-yellow-800 font-semibold">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm capitalize text-yellow-700">
                        {quiz.difficulty}
                      </CardDescription>
                    </div>
                    <ListChecks className="h-6 w-6 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <Link href={`/quiz/${quiz.id}?user_id=${childId}`}>
                      <Button variant="secondary" className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600">
                        Ver detalles
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-green-800">Tareas Terminadas</h2>
          </div>
          {completedQuizzes.length === 0 ? (
            <p className="text-muted-foreground">Tu hijo no ha completado ninguna tarea aún.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedQuizzes.map((quiz) => (
                <CompletedQuizCard key={quiz.id} quiz={quiz} childId={childId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}