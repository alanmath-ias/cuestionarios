import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, ClipboardList, ClipboardCheck, MessageCircle, AlertTriangle } from "lucide-react";

type User = {
  name: string;
};

type SessionData = {
  user?: User;
};

type QuizInfo = {
  quizId: number;
  progressId: number;
  title: string;
  status: "completed" | "in_progress";
  score?: number;
  reviewed?: boolean;
  feedback?: string | null;
};

export default function ParentDashboard() {
  const { session } = useSession() as { session: SessionData };
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resChild, resQuizzes] = await Promise.all([
          fetch("/api/parent/student"),
          fetch("/api/parent/student-quizzes")
        ]);
  
        if (!resChild.ok || !resQuizzes.ok) {
          throw new Error("Error fetching data");
        }
  
        const [dataChild, dataQuizzes] = await Promise.all([
          resChild.json(),
          resQuizzes.json()
        ]);
  
        setStudentName(dataChild.studentName || "Estudiante");
        setQuizzes(Array.isArray(dataQuizzes) ? dataQuizzes : []);
      } catch (err) {
        console.error("Error loading parent dashboard:", err);
        // Opcional: mostrar mensaje de error al usuario
        setStudentName("Estudiante");
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completed = quizzes.filter((q) => q.status === "completed");
  const pending = quizzes.filter((q) => q.status === "in_progress");

  const progressPercentage = quizzes.length > 0
    ? (completed.length / quizzes.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Hola {session?.user?.name ?? "Usuario"}</h1>
      <p className="text-muted-foreground mb-6">
        Aquí puedes revisar las tareas de {studentName}
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
            {completed.length > 0 ? (
              <div className="flex flex-col gap-3">
                {completed.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.quizId} 
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
                  No hay actividad reciente
                </p>
                <p className="text-sm text-gray-500">
                  {studentName} no ha completado tareas aún
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-yellow-800">Tareas Pendientes</h2>
          </div>
          {pending.length === 0 ? (
            <p className="text-muted-foreground">No hay tareas pendientes.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pending.map((quiz) => (
                <Card
                  key={quiz.quizId}
                  className="rounded-2xl bg-yellow-50 border border-yellow-200 shadow-sm hover:shadow-md transition-all"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div>
                      <CardTitle className="text-lg text-yellow-800 font-semibold">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm text-yellow-700">
                        Pendiente de completar
                      </CardDescription>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="secondary" 
                      className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={() => navigate(`/quiz/${quiz.quizId}`)}
                    >
                      Ver detalles
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
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
          {completed.length === 0 ? (
            <p className="text-muted-foreground">No hay tareas completadas aún.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completed.map((quiz) => (
                <Card key={quiz.quizId} className="rounded-2xl bg-green-50 border border-green-200 shadow-sm hover:shadow-md transition-all relative">
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {quiz.reviewed && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Revisado
                      </div>
                    )}
                    {quiz.feedback && (
                      <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Feedback
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pr-10">
                    <div>
                      <CardTitle className="text-lg text-green-800 font-semibold">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm text-green-700">
                        Puntaje: {quiz.score ?? "N/A"}
                      </CardDescription>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {quiz.feedback && (
                      <div className="mb-3 bg-white p-3 rounded border border-green-200">
                        <h4 className="text-sm font-semibold text-green-800 mb-1">Retroalimentación:</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{quiz.feedback}</p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="flex items-center text-green-700 border-green-400 hover:bg-green-100"
                      onClick={() => navigate(`/quiz-results/${quiz.progressId}`)}
                    >
                      Ver Resultados
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}