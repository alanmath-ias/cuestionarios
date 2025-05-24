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
import { Youtube } from 'lucide-react'; // Para Lucide Icons
// o
import { FaYoutube } from 'react-icons/fa'; // Para Font Awesome

interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
  // Otros campos que puedas necesitar
}

async function fetchCurrentUser() {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo obtener el usuario");
  return response.json();
}

async function fetchCategories() {
  const response = await fetch("/api/user/categories", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener categorías");
  return response.json();
}

async function fetchQuizzes() {
  const response = await fetch("/api/user/quizzes", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener cuestionarios");
  return response.json();
}

async function fetchAlerts() {
  const res = await fetch("/api/user/alerts", { credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener alertas");
  return res.json();
}

async function fetchQuizFeedback(progressId: string) {
  if (!progressId) return null;
  const res = await fetch(`/api/quiz-feedback/${progressId}`);
  if (!res.ok) return null;
  return res.json();
}

function CompletedQuizCard({ quiz }: { quiz: QuizWithFeedback }) {
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
        <Link href={`/results/${quiz.progressId}`}>
          <Button variant="outline" className="flex items-center text-green-700 border-green-400 hover:bg-green-100">
            Ver Resultados
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const queryClient = useQueryClient();

  const queryOptions = {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60,
  };

  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    ...queryOptions,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["user-categories"],
    queryFn: fetchCategories,
    ...queryOptions,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithFeedback[]>({
    queryKey: ["user-quizzes"],
    queryFn: fetchQuizzes,
    ...queryOptions,
  });

  const isLoading = loadingUser || loadingCategories || loadingQuizzes;

  const { data: alerts } = useQuery({
    queryKey: ["user-alerts"],
    queryFn: fetchAlerts,
    ...queryOptions,
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
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
      <h1 className="text-3xl font-bold mb-4">Hola {currentUser?.name}</h1>

      {alerts?.hasPendingTasks && (
        <div className="mb-4 p-4 rounded-xl bg-yellow-100 text-yellow-800 flex items-center gap-2 shadow-md">
          <AlertTriangle className="w-5 h-5" />
          Tienes tareas pendientes por resolver.
        </div>
      )}

      {alerts?.hasFeedback && (
        <div className="mb-4 p-4 rounded-xl bg-green-100 text-green-800 flex items-center gap-2 shadow-md">
          <MessageCircle className="w-5 h-5" />
          Has recibido retroalimentación en uno o más cuestionarios.
        </div>
      )}

      <p className="text-muted-foreground mb-6">
        Aquí puedes acceder a tus categorías y cuestionarios asignados
      </p>

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
          Aún no has tenido actividad
        </p>
        <p className="text-sm text-gray-500">
          ¡Anímate, comencemos!
        </p>
        <Link href="/category" className="inline-block mt-4">

{/*
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Explorar cuestionarios
          </Button>
*/}{/* este boton está muy bonito y debe conducir a unos quices de prueba o a ver alguna categoria de prueba*/}

        </Link>
      </div>
    )}
  </CardContent>
</Card>


      </div>

      <h2 className="text-xl font-semibold mb-3">Tus Categorías</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories?.map((category) => (
          <Card
          key={category.id}
          className="rounded-2xl bg-gradient-to-tr from-indigo-100 to-white border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-lg text-indigo-800 font-semibold">{category.name}</CardTitle>
              <CardDescription className="text-sm text-indigo-600">Categoría asignada</CardDescription>
            </div>
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href={`/category/${category.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center font-semibold border-indigo-500 text-indigo-700"
                  >
                    Ver cuestionarios
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/training/${category.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Entrenamiento
                  </Button>
                </Link>
              </div>
              {/* Botón de YouTube con nuevo estilo */}
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
          </CardContent>
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
            <p className="text-muted-foreground">No tienes tareas pendientes.</p>
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
                    <Link href={`/quiz/${quiz.id}`}>
                      <Button variant="secondary" className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600">
                        Resolver
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
            <p className="text-muted-foreground">No has completado ninguna tarea aún.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedQuizzes.map((quiz) => (
                <CompletedQuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}