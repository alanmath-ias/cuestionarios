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
  Youtube,
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef } from "react";
import { useState } from "react";
import VideoEmbed from './VideoEmbed';

interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
  url?: string | null;
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
  if (!response.ok) throw new Error("Error al obtener materias");
  return response.json();
}

async function fetchQuizzes() {
  try {
    const response = await fetch("/api/user/quizzes", {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener cuestionarios: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    //console.log("Datos recibidos de /api/user/quizzes:", data); // ← LOG AQUÍ
    return data;
    
  } catch (error) {
    console.error("Error en fetchQuizzes:", error);
    throw error;
  }
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

function CompletedQuizCard({ quiz, playVideo }: { quiz: QuizWithFeedback, playVideo: (url: string) => void }) {
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
      
      <CardContent className="space-y-3">
        {!loadingFeedback && feedback?.feedback && (
          <div className="mb-3 bg-white p-3 rounded border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-1">Retroalimentación AlanMath:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Link href={`/results/${quiz.progressId}`}>
            <Button variant="outline" className="flex items-center text-green-700 border-green-400 hover:bg-green-100">
              Ver Resultados
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {quiz.url && (
            <Button 
              variant="outline" 
              className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => playVideo(quiz.url!)}
            >
              <Youtube className="h-4 w-4 mr-2" />
              Ver Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const playVideo = (youtubeLink: string) => {
    if (!youtubeLink) return;
    setSelectedVideo(youtubeLink);
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

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

  useEffect(() => {
    if (categories && categories.length > 0) {
      const categoriesWithVideo = categories.filter(cat => !!cat.youtubeLink);
      if (categoriesWithVideo.length > 0) {
        const randomCategory = categoriesWithVideo[
          Math.floor(Math.random() * categoriesWithVideo.length)
        ];
        setSelectedVideo(randomCategory.youtubeLink!);
      }
    }
  }, [categories]);
  
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

  // Ordenar las tareas completadas por fecha más reciente
  const sortedCompletedQuizzes = [...completedQuizzes].sort((a, b) =>
    new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
  );

  return (
    <div className="container mx-auto py-4">
      <div className="relative mb-4">
        <h1 className="text-3xl font-bold">
          Hola {currentUser?.name}:{" "}
          <span className="font-normal text-base">
            Aquí puedes acceder a tus Materias y Cuestionarios asignados
          </span>
        </h1>

        {alerts?.hasPendingTasks && (
          <div className="absolute top-0 right-0 mt-0 mr-0 p-2 rounded-lg bg-yellow-100 text-yellow-800 flex items-center gap-1 text-sm shadow-md max-w-xs sm:max-w-full">
            <AlertTriangle className="w-4 h-4" />
            Tienes tareas pendientes por resolver.
          </div>
        )}
      </div>

      {alerts?.hasFeedback && (
        <div className="mb-4 p-4 rounded-xl bg-green-100 text-green-800 flex items-center gap-2 shadow-md">
          <MessageCircle className="w-5 h-5" />
          Has recibido retroalimentación en uno o más cuestionarios.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card de Progreso General */}
        <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-base font-semibold text-indigo-800">
              Progreso General
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-1 px-3">
            <div className="text-2xl font-bold text-indigo-600 mb-0.5">
              {progressPercentage.toFixed(0)}%
            </div>
            <div className="text-indigo-500 font-medium text-xs">
              DE TAREAS COMPLETADAS
            </div>
            <div className="mt-1 h-1 rounded-full overflow-hidden bg-indigo-200">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Actividad Reciente */}
        <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-semibold text-green-800">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            {completedQuizzes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {completedQuizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm hover:border hover:border-green-200"
                  >
                    <div className="p-1 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xs font-medium text-gray-700 flex-1">
                      {quiz.title}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Aún no has tenido actividad</p>
                <p className="text-xs text-gray-500">¡Anímate, comencemos!</p>
                <p className="text-xs text-gray-500">
                  Si aún no tienes Materias Asignadas envía un mensaje al número de Whatsapp:
                </p>
                <p className="text-sm font-medium">+57 3208056799 AlanMath</p>
                <Link href="/category" className="inline-block mt-2">
                  {/* Aquí tu botón si decides activarlo */}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedVideo && (
        <div ref={videoSectionRef} className="mt-8 max-w-4xl mx-auto">
          <VideoEmbed youtubeLink={selectedVideo} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">Tus Materias</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {categories?.map((category) => (
          <Card
            key={category.id}
            className="rounded-2xl bg-gradient-to-tr from-indigo-100 to-white border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg text-indigo-800 font-semibold">{category.name}</CardTitle>
                <CardDescription className="text-sm text-indigo-600">Materia asignada</CardDescription>
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
                {category.youtubeLink && (
                  <Button
                    size="sm"
                    className="w-full font-semibold flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                    onClick={() => playVideo(category.youtubeLink!)}
                  >
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube Videos
                  </Button>
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
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Link href={`/quiz/${quiz.id}`}>
                        <Button variant="secondary" className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600">
                          Resolver
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {quiz.url && (
                        <Button 
                          variant="outline" 
                          className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => playVideo(quiz.url!)}
                        >
                          <Youtube className="h-4 w-4 mr-2" />
                          Ver Video (Repasar)
                        </Button>
                      )}
                    </div>
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

          {sortedCompletedQuizzes.length === 0 ? (
            <p className="text-muted-foreground">No has completado ninguna tarea aún.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {(showAllCompleted
                  ? sortedCompletedQuizzes
                  : sortedCompletedQuizzes.slice(0, 5)
                ).map((quiz) => (
                  <CompletedQuizCard key={quiz.id} quiz={quiz} playVideo={playVideo} />
                ))}
              </div>

              {sortedCompletedQuizzes.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="text-green-700 border-green-400 hover:bg-green-100"
                  >
                    {showAllCompleted ? "Ver menos" : "Ver todas"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}