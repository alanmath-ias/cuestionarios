import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Timer, Lightbulb, Flag } from "lucide-react";
import { startActiveQuizTour } from "@/lib/tour";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTimer } from "@/hooks/use-timer";
import { QuestionProgress } from "@/components/QuestionProgress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "@/hooks/useSession";
import { ContentRenderer } from "@/components/ContentRenderer";
import { AIMarkdown } from "@/components/ui/ai-markdown";

// Interfaces
interface Quiz {
  id: number;
  title: string;
  timeLimit: number;
  description?: string;
  categoryId: number;
}

interface Question {
  id: number;
  quizId: number;
  type: 'text' | 'multiple_choice' | 'equation';
  content: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  answers?: any[];
  variables?: any;
}

interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent: number;
  completedAt?: string;
  answers?: any[];
}

// Componente para renderizar contenido con saltos de línea y matemáticas
const QuestionContent = ({ content }: { content: string }) => {
  return (
    <div className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">
      <ContentRenderer content={content} />
    </div>
  );
};

const ActiveQuiz = () => {
  const { quizId } = useParams();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode');
  const { toast } = useToast();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<any[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<any[]>([]);
  const { session } = useSession();
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, string[]>>({});
  const [requestingHint, setRequestingHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIncompleteDialogOpen, setIsIncompleteDialogOpen] = useState(false);

  // Report Error State
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  // Queries
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
  });

  const { data: questions, isLoading: loadingQuestions, error: errorQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`, mode],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/quizzes/${quizId}/questions${mode ? `?mode=${mode}` : ''}`);
      return res.json();
    },
    enabled: !!quizId,
  });

  const { data: progress } = useQuery<Progress>({
    queryKey: [`/api/progress/${quizId}`],
    enabled: !!quizId && !!session?.userId,
  });

  // Mutations
  const reportErrorMutation = useMutation({
    mutationFn: async (data: { quizId: number; questionId: number; description: string }) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mejorar.",
      });
      setIsReportDialogOpen(false);
      setReportDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte.",
        variant: "destructive",
      });
    },
  });

  const createProgressMutation = useMutation({
    mutationFn: async (newProgress: any) => {
      const res = await apiRequest("POST", "/api/progress", newProgress);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${quizId}`] });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: any) => {
      const res = await apiRequest("POST", "/api/answers", answer);
      return res.json();
    },
  });

  // Handlers
  const handleReportSubmit = () => {
    if (!quiz || !questions || !reportDescription.trim()) return;
    const currentQuestion = questions[currentQuestionIndex];

    reportErrorMutation.mutate({
      quizId: quiz.id,
      questionId: currentQuestion.id,
      description: reportDescription,
    });
  };

  // Timer
  const { formattedTime, elapsedTime, start } = useTimer({
    initialTime: quiz?.timeLimit || 0,
    initialElapsedTime: progress?.timeSpent || 0,
    autoStart: session?.userId !== 1,
    onTimeUp: () => handleFinishQuiz()
  });

  // Effects
  useEffect(() => {
    if (!isInitialized && progress && questions) {
      if (progress.status === 'completed') {
        setLocation(`/results/${progress.id}`);
        return;
      }

      const completedCount = progress.completedQuestions || 0;
      if (completedCount > 0 && completedCount < questions.length) {
        setCurrentQuestionIndex(completedCount);
      }

      if (progress.answers && Array.isArray(progress.answers)) {
        const restoredAnswers = progress.answers.map((ans: any) => {
          if (ans.isCorrect === null && ans.answerId) {
            const question = questions.find(q => q.id === ans.questionId);
            const answerDef = question?.answers?.find((a: any) => a.id === ans.answerId);
            if (answerDef) {
              return { ...ans, isCorrect: answerDef.isCorrect };
            }
          }
          return ans;
        });
        setStudentAnswers(restoredAnswers);

        const answeredMap: Record<number, boolean> = {};
        restoredAnswers.forEach((ans: any) => {
          const qIndex = questions.findIndex(q => q.id === ans.questionId);
          if (qIndex !== -1) {
            answeredMap[qIndex] = true;
          }
        });
        setAnsweredQuestions(answeredMap);
      }
      setIsInitialized(true);
    }
  }, [progress, questions, setLocation, isInitialized]);

  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentQ = questions[currentQuestionIndex];
      if (currentQ.answers && Array.isArray(currentQ.answers)) {
        const shuffled = [...currentQ.answers].sort(() => Math.random() - 0.5);
        setShuffledAnswers(shuffled);
      }
    }
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    if (quiz && session?.userId && !progress && session.userId !== 1) {
      createProgressMutation.mutate({
        userId: session.userId,
        quizId: parseInt(quizId!),
        status: 'in_progress',
        completedQuestions: 0,
        timeSpent: 0,
        mode: mode || 'standard'
      });
    }
  }, [quiz, session, progress, quizId]);

  useEffect(() => {
    if (!loadingQuiz && !loadingQuestions && session?.userId && !session.tourStatus?.activeQuiz) {
      setTimeout(() => {
        startActiveQuizTour();
        fetch('/api/user/tour-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourType: 'activeQuiz' })
        });
      }, 1000);
    }
  }, [loadingQuiz, loadingQuestions, session]);

  const handleSelectAnswer = (answerId: number) => {
    if (answeredQuestions[currentQuestionIndex]) return;
    setSelectedAnswerId(answerId);
  };

  const submitCurrentAnswer = async () => {
    if (!questions || !progress?.id || selectedAnswerId === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers?.find((a: any) => a.id === selectedAnswerId);

    const studentAnswer: any = {
      progressId: progress.id,
      questionId: currentQuestion.id,
      answerId: selectedAnswerId,
      isCorrect: selectedAnswer?.isCorrect || false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    try {
      await submitAnswerMutation.mutateAsync(studentAnswer);
      setStudentAnswers([...studentAnswers, studentAnswer]);
      setAnsweredQuestions({ ...answeredQuestions, [currentQuestionIndex]: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu respuesta.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleNextQuestion = async () => {
    if (!questions || !progress) return;

    setIsNavigating(true);
    try {
      if (currentQuestionIndex < questions.length - 1) {
        if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
          await submitCurrentAnswer();
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        await createProgressMutation.mutateAsync({
          ...progress,
          completedQuestions: Math.max(progress.completedQuestions ?? 0, currentQuestionIndex + 1),
          timeSpent: elapsedTime,
        });

        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerId(null);
      } else {
        if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
          await submitCurrentAnswer();
        }
        const answeredCount = Object.keys(answeredQuestions).length + (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex] ? 1 : 0);
        if (questions && answeredCount < questions.length) {
          setIsIncompleteDialogOpen(true);
          return;
        }
        await handleFinishQuiz();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al avanzar',
        variant: 'destructive',
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTextAnswerSubmit = async () => {
    if (!questions || !progress?.id || !textAnswers[questions[currentQuestionIndex].id]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    const studentAnswer: any = {
      progressId: progress.id,
      questionId: currentQuestion.id,
      answerId: null,
      textAnswer: answerText,
      isCorrect: false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    try {
      await submitAnswerMutation.mutateAsync(studentAnswer);
      setStudentAnswers([...studentAnswers, studentAnswer]);
      setAnsweredQuestions({ ...answeredQuestions, [currentQuestionIndex]: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu respuesta.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestHint = async (type: 'regular' | 'super') => {
    if (!questions || !progress?.id) return;

    const currentQuestion = questions[currentQuestionIndex];
    const cost = type === 'regular' ? 1 : 2;

    if ((session?.hintCredits || 0) < cost) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${cost} créditos para esta pista.`,
        variant: 'destructive',
      });
      return;
    }

    setRequestingHint(true);
    try {
      const res = await apiRequest('POST', '/api/hints/request', {
        questionId: currentQuestion.id,
        hintType: type,
        hintIndex: (hintsRevealed[currentQuestion.id] || []).length + 1,
        progressId: progress.id
      });

      const data = await res.json();

      setHintsRevealed(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), data.content]
      }));

      toast({
        title: 'Pista revelada',
        description: 'Se ha descontado el costo de tus créditos.',
      });
      setIsHintDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener la pista.',
        variant: 'destructive',
      });
    } finally {
      setRequestingHint(false);
    }
  };

  const handleFinishQuiz = async () => {
    if (!progress || !quiz) return;

    try {
      const score = studentAnswers.length > 0 ? Number(((studentAnswers.filter(a => a.isCorrect).length / studentAnswers.length) * 10).toFixed(1)) : 0;

      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score,
        timeSpent: elapsedTime,
        completedAt: new Date().toISOString()
      };

      await createProgressMutation.mutateAsync(progressUpdate);

      await fetch("/api/quiz-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.userId,
          quizId: quiz?.id,
          score,
          progressId: progress.id,
        }),
      });

      setLocation(`/results/${progress.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo finalizar el cuestionario.',
        variant: 'destructive',
      });
    }
  };

  if (loadingQuiz || loadingQuestions) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (errorQuestions || !questions || questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-slate-950 text-slate-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Error al cargar las preguntas</h2>
        <p className="text-slate-400 mb-4">No se pudieron encontrar preguntas para este cuestionario.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">Recargar</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">No questions found</div>;

  const correctAnswers = questions?.reduce((acc: Record<number, boolean>, question, index) => {
    const studentAnswer = studentAnswers.find(a => a.questionId === question.id);
    if (studentAnswer) {
      acc[index] = studentAnswer.isCorrect;
    }
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Salir
              </Button>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              {quiz?.title}
              {session?.userId === 1 && (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                  Modo Admin - Sin Guardar
                </Badge>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div id="tour-timer" className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                <Timer className="h-4 w-4 mr-2 text-blue-400" />
                <span className={`font-mono font-medium ${elapsedTime > (quiz?.timeLimit || 0) * 0.9 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  {formattedTime()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-none">
              Pregunta {currentQuestionIndex + 1} / {questions.length}
            </Badge>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{studentAnswers.filter(a => a.isCorrect).length}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm font-medium text-red-400">
              <XCircle className="w-4 h-4" />
              <span>{studentAnswers.filter(a => !a.isCorrect).length}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-medium text-blue-400 px-2">
              {studentAnswers.reduce((sum, a) => {
                const question = questions?.find(q => q.id === a.questionId);
                return sum + (a.isCorrect ? (question?.points || 0) : 0);
              }, 0)} pts
            </span>
          </div>
        </div>

        {/* Main Content Area - No Card Wrapper */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <Badge
                className={`${currentQuestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' :
                    'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                  } border-none transition-colors`}
              >
                {currentQuestion.difficulty === 'hard' ? 'Difícil' :
                  currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
              </Badge>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-1 rounded-full font-medium shadow-lg shadow-blue-500/20">
              {currentQuestion.points} puntos
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-slate-400">
              {currentQuestion.type === 'equation'
                ? 'Resuelve la siguiente ecuación:'
                : currentQuestion.type === 'text'
                  ? 'Responde la siguiente pregunta:'
                  : 'Selecciona la respuesta correcta'}
            </h3>

            {currentQuestion.imageUrl && (
              <div className="mb-6 flex justify-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Imagen de la pregunta"
                  className="max-h-60 object-contain rounded"
                />
              </div>
            )}

            {/* Admin: Show Correct Answer */}
            {session?.userId === 1 && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-300 text-sm flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                <div className="w-full">
                  <span className="font-bold block mb-2 text-green-400">Respuesta Correcta (Solo Admin):</span>
                  {currentQuestion.type === 'text' ? (
                    <span className="font-mono bg-slate-950/50 px-2 py-1 rounded border border-green-500/20 block w-full">
                      {currentQuestion.answers?.map(a => a.content).join(' O ')}
                    </span>
                  ) : (
                    <div className="font-medium space-y-1">
                      {currentQuestion.answers?.filter((a: any) => a.isCorrect).map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <span>•</span> <ContentRenderer content={a.content} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <QuestionContent content={currentQuestion.content} />

            {hintsRevealed[currentQuestion.id]?.map((hint, index) => (
              <div key={index} className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Pista {index + 1}
                </h4>
                <div className="text-slate-300">
                  <AIMarkdown content={hint} />
                </div>
              </div>
            ))}
          </div>

          {currentQuestion.type === 'text' ? (
            <div className="space-y-4">
              <Textarea
                value={textAnswers[currentQuestion.id] || ''}
                onChange={(e) => !answeredQuestions[currentQuestionIndex] && setTextAnswers({
                  ...textAnswers,
                  [currentQuestion.id]: e.target.value
                })}
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
                disabled={answeredQuestions[currentQuestionIndex]}
                className="bg-slate-900/50 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
              />
              {!answeredQuestions[currentQuestionIndex] && (
                <Button
                  onClick={handleTextAnswerSubmit}
                  disabled={!textAnswers[currentQuestion.id]?.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirmar respuesta
                </Button>
              )}
              {answeredQuestions[currentQuestionIndex] && (
                <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/10">
                  <h4 className="font-medium mb-2 text-slate-400">Tu respuesta:</h4>
                  <p className="text-slate-200">{textAnswers[currentQuestion.id]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {shuffledAnswers.map((answer, index) => {
                const existingAnswer = studentAnswers.find(sa =>
                  sa.questionId === currentQuestion.id && sa.answerId === answer.id
                );
                const isSelected = selectedAnswerId === answer.id || !!existingAnswer;
                const isAnswered = answeredQuestions[currentQuestionIndex];

                let variantClass = "bg-slate-800/30 border-white/5 hover:bg-slate-800/60 hover:border-blue-500/30 text-slate-300";

                if (isAnswered) {
                  if (answer.isCorrect) {
                    variantClass = "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                  } else if (isSelected) {
                    variantClass = "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                  } else {
                    variantClass = "opacity-60 border-white/5 bg-slate-900/20 text-slate-500";
                  }
                } else if (isSelected) {
                  variantClass = "bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                }

                return (
                  <button
                    key={answer.id}
                    onClick={() => !isAnswered && handleSelectAnswer(answer.id)}
                    disabled={isAnswered}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${variantClass}`}
                  >
                    <div className="flex items-center gap-4 relative z-10 w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold shrink-0 transition-colors
                        ${isSelected || (isAnswered && answer.isCorrect)
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-slate-900/50 border-white/10 text-slate-500 group-hover:text-slate-300 group-hover:border-white/20'}
                      `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-base font-medium flex-1">
                        <ContentRenderer content={answer.content} />
                      </div>
                    </div>
                    {isAnswered && answer.isCorrect && <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0 ml-4" />}
                    {isAnswered && isSelected && !answer.isCorrect && <XCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0 ml-4" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            className="flex items-center border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/50"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <Button
            id="tour-hint-button"
            variant="outline"
            size="sm"
            className="h-10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-yellow-500/5 backdrop-blur-sm"
            onClick={() => setIsHintDialogOpen(true)}
            disabled={!session?.userId || answeredQuestions[currentQuestionIndex]}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            ¿Una Pista?
          </Button>

          {session?.userId === 2 && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-red-500/30 text-red-400 hover:bg-red-500/10 ml-2"
              onClick={() => setIsReportDialogOpen(true)}
            >
              <Flag className="mr-2 h-4 w-4" />
              Reportar
            </Button>
          )}

          <Button
            onClick={handleNextQuestion}
            disabled={isNavigating || (currentQuestion.type === 'text' && !answeredQuestions[currentQuestionIndex])}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20"
          >
            {isNavigating ? (
              'Procesando...'
            ) : (
              <>
                {currentQuestionIndex >= (questions?.length || 0) - 1 ? 'Finalizar' : 'Siguiente'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div id="tour-quiz-navigation" className="mt-8 bg-slate-900/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <QuestionProgress
            totalQuestions={questions?.length || 0}
            completedQuestions={Object.keys(answeredQuestions).length}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionClick={(index) => {
              console.log(`[PROGRESS] Clicked on question ${index}`);
              setCurrentQuestionIndex(index);
            }}
            disabled={false}
            correctAnswers={correctAnswers}
          />
        </div>

        <Dialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Solicitar Pista</DialogTitle>
              <DialogDescription className="text-slate-400">
                ¿Qué tipo de pista necesitas?
                <br />
                <span className="text-sm text-blue-400 font-medium mt-2 block">
                  Créditos disponibles: {session?.hintCredits ?? 0}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {requestingHint ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-center text-slate-400 animate-pulse font-medium">
                    Consultando a los sabios matemáticos...
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="justify-between h-auto py-4 border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:text-white group"
                    onClick={() => handleRequestHint('regular')}
                    disabled={requestingHint || (session?.hintCredits || 0) < 1}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-200 group-hover:text-white">Pista Regular</div>
                      <div className="text-sm text-slate-500 group-hover:text-slate-400">Ayuda sutil para guiarte</div>
                    </div>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">1 Crédito</Badge>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-between h-auto py-4 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 group"
                    onClick={() => handleRequestHint('super')}
                    disabled={requestingHint || (session?.hintCredits || 0) < 2}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-yellow-400 group-hover:text-yellow-300">Súper Pista</div>
                      <div className="text-sm text-yellow-500/70 group-hover:text-yellow-500/90">Muy reveladora (casi la respuesta)</div>
                    </div>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">2 Créditos</Badge>
                  </Button>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsHintDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Reportar Error en la Pregunta</DialogTitle>
              <DialogDescription className="text-slate-400">
                Describe el error que encontraste.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe el error..."
              className="bg-slate-950/50 border-white/10 text-slate-200"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleReportSubmit} className="bg-red-600 hover:bg-red-700 text-white">
                Enviar Reporte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isIncompleteDialogOpen} onOpenChange={setIsIncompleteDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Preguntas sin contestar
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Aún tienes {questions ? questions.length - Object.keys(answeredQuestions).length : 0} preguntas sin contestar.
                <br />
                Si finalizas ahora, las preguntas no contestadas se marcarán como incorrectas (o no sumarán puntos).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsIncompleteDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Volver al cuestionario
              </Button>
              <Button
                onClick={() => {
                  setIsIncompleteDialogOpen(false);
                  handleFinishQuiz();
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Finalizar de todos modos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ActiveQuiz;