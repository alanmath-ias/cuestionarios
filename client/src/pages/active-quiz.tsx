import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Timer, Lightbulb, HelpCircle } from "lucide-react";
import { startActiveQuizTour } from "@/lib/tour";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTimer } from "@/hooks/use-timer";
import { QuizOption } from "@/components/QuizOption";
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
  answers?: any[]; // Added this
}

// Componente para renderizar contenido con saltos de línea y matemáticas
const QuestionContent = ({ content }: { content: string }) => {
  return (
    <div className="text-lg mb-6">
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

  // Updated useTimer call
  const { formattedTime, elapsedTime, start } = useTimer({
    initialTime: quiz?.timeLimit || 0,
    initialElapsedTime: progress?.timeSpent || 0,
    autoStart: true,
    onTimeUp: () => handleFinishQuiz()
  });

  // Initialize state from progress
  useEffect(() => {
    if (!isInitialized && progress && questions) {
      if (progress.status === 'completed') {
        setLocation(`/results/${progress.id}`);
        return;
      }

      // Restore completed questions count
      const completedCount = progress.completedQuestions || 0;
      if (completedCount > 0 && completedCount < questions.length) {
        setCurrentQuestionIndex(completedCount);
      }

      // Restore answers
      if (progress.answers && Array.isArray(progress.answers)) {
        console.log("[DEBUG] Restoring answers:", progress.answers);
        // Backfill isCorrect if missing (e.g. from hint creation or old data)
        const restoredAnswers = progress.answers.map((ans: any) => {
          if (ans.isCorrect === null && ans.answerId) {
            console.log(`[DEBUG] Backfilling answer ${ans.answerId} for question ${ans.questionId}`);
            const question = questions.find(q => q.id === ans.questionId);
            const answerDef = question?.answers?.find((a: any) => a.id === ans.answerId);
            if (answerDef) {
              console.log(`[DEBUG] Found answer def:`, answerDef);
              return { ...ans, isCorrect: answerDef.isCorrect };
            } else {
              console.log(`[DEBUG] Answer def not found for answerId ${ans.answerId}`);
            }
          }
          return ans;
        });
        console.log("[DEBUG] Restored answers with backfill:", restoredAnswers);
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

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentQ = questions[currentQuestionIndex];
      if (currentQ.answers && Array.isArray(currentQ.answers)) {
        // Create a copy and shuffle
        const shuffled = [...currentQ.answers].sort(() => Math.random() - 0.5);
        setShuffledAnswers(shuffled);
      }
    }
  }, [questions, currentQuestionIndex]);

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

  // Initialize progress if not exists
  useEffect(() => {
    if (quiz && session?.userId && !progress) {
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

  // Auto-start tour for new users
  useEffect(() => {
    if (!loadingQuiz && !loadingQuestions && session?.userId) {
      const tourKey = `tour_seen_active_quiz_${session.userId}`;
      const hasSeenTour = localStorage.getItem(tourKey);
      if (!hasSeenTour) {
        setTimeout(() => {
          startActiveQuizTour();
          localStorage.setItem(tourKey, 'true');
        }, 1000);
      }
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
      variables: currentQuestion.variables, // Store variables used
      timeSpent: elapsedTime, // Store current time
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
      isCorrect: false, // Needs manual grading or regex check
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
      // Calculate final score
      const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
      const earnedPoints = studentAnswers.reduce((sum, a) => {
        const question = questions?.find(q => q.id === a.questionId);
        return sum + (a.isCorrect ? (question?.points || 0) : 0);
      }, 0);

      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score: Math.round((earnedPoints / totalPoints) * 10),
        timeSpent: elapsedTime,
        completedAt: new Date().toISOString()
      };

      await createProgressMutation.mutateAsync(progressUpdate);

      const score = Math.round((earnedPoints / totalPoints) * 10);
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
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorQuestions || !questions || questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-4">Error al cargar las preguntas</h2>
        <p className="text-gray-600 mb-4">No se pudieron encontrar preguntas para este cuestionario.</p>
        <Button onClick={() => window.location.reload()}>Recargar</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return <div>No questions found</div>;

  // Calculate correct answers map for progress bar
  const correctAnswers = questions?.reduce((acc: Record<number, boolean>, question, index) => {
    const studentAnswer = studentAnswers.find(a => a.questionId === question.id);
    if (studentAnswer) {
      acc[index] = studentAnswer.isCorrect;
    }
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          <div className="flex items-center gap-2">
            <div id="tour-timer" className="flex items-center text-gray-500 mt-1">
              <Timer className="h-4 w-4 mr-1" />
              <span className={`font-mono ${elapsedTime > (quiz?.timeLimit || 0) * 0.9 ? 'text-red-500' : ''}`}>
                {formattedTime()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Pregunta {currentQuestionIndex + 1} / {questions.length}
          </Badge>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>{studentAnswers.filter(a => a.isCorrect).length}</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <XCircle className="w-4 h-4" />
            <span>{studentAnswers.filter(a => !a.isCorrect).length}</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm font-medium text-indigo-600">
            {studentAnswers.reduce((sum, a) => {
              const question = questions?.find(q => q.id === a.questionId);
              return sum + (a.isCorrect ? (question?.points || 0) : 0);
            }, 0)} pts
          </span>
        </div>



      </div>



      {/* Question Card */}
      < Card className="mb-6" >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <Badge variant={currentQuestion.difficulty === 'hard' ? 'destructive' : 'secondary'}>
                {currentQuestion.difficulty === 'hard' ? 'Difícil' :
                  currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
              </Badge>
            </div>
            <div className="bg-primary text-white text-sm px-3 py-1 rounded-full">
              {currentQuestion.points} puntos
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              {currentQuestion.type === 'equation'
                ? 'Resuelve la siguiente ecuación:'
                : currentQuestion.type === 'text'
                  ? 'Responde la siguiente pregunta:'
                  : 'Selecciona la respuesta correcta'}
            </h3>

            {currentQuestion.imageUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Imagen de la pregunta"
                  className="max-h-60 object-contain rounded"
                />
              </div>
            )}

            <QuestionContent content={currentQuestion.content} />

            {/* Hint Display */}
            {hintsRevealed[currentQuestion.id]?.map((hint, index) => (
              <div key={index} className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Pista {index + 1}
                </h4>
                <div className="text-yellow-900">
                  <ContentRenderer content={hint} />
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
              />
              {!answeredQuestions[currentQuestionIndex] && (
                <Button
                  onClick={handleTextAnswerSubmit}
                  disabled={!textAnswers[currentQuestion.id]?.trim()}
                >
                  Confirmar respuesta
                </Button>
              )}
              {answeredQuestions[currentQuestionIndex] && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                  <h4 className="font-medium mb-2">Tu respuesta:</h4>
                  <p>{textAnswers[currentQuestion.id]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {shuffledAnswers.map((answer, index) => {
                const existingAnswer = studentAnswers.find(sa =>
                  sa.questionId === currentQuestion.id && sa.answerId === answer.id
                );
                const isSelected = selectedAnswerId === answer.id || !!existingAnswer;
                const isAnswered = answeredQuestions[currentQuestionIndex];

                return (
                  <QuizOption
                    key={answer.id}
                    optionLabel={String.fromCharCode(65 + index)}
                    content={answer.content}
                    state={
                      isAnswered
                        ? answer.isCorrect
                          ? 'correct'
                          : isSelected
                            ? 'incorrect'
                            : 'default'
                        : isSelected
                          ? 'selected'
                          : 'default'
                    }
                    disabled={isAnswered}
                    onClick={() => !isAnswered && handleSelectAnswer(answer.id)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card >

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <Button
          id="tour-hint-button"
          variant="outline"
          size="sm"
          className="h-9 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          onClick={() => setIsHintDialogOpen(true)}
          disabled={!session?.userId || answeredQuestions[currentQuestionIndex]}
        >
          <Lightbulb className="mr-1 h-4 w-4" />
          ¿Una Pista?
        </Button>

        <Button
          onClick={handleNextQuestion}
          disabled={isNavigating || (currentQuestion.type === 'text' && !answeredQuestions[currentQuestionIndex])}
        >
          {isNavigating ? (
            'Procesando...'
          ) : (
            <>
              {currentQuestionIndex >= (questions?.length || 0) - 1 ? 'Finalizar' : 'Siguiente'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div id="tour-quiz-navigation" className="mt-6">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Pista</DialogTitle>
            <DialogDescription>
              ¿Qué tipo de pista necesitas?
              <br />
              <span className="text-sm text-gray-500">
                Créditos disponibles: {session?.hintCredits ?? 0}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {requestingHint ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center text-muted-foreground animate-pulse font-medium">
                  Déjame ver, déjame ver, qué pista te doy... ¡ya sé!
                </p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="justify-between h-auto py-4"
                  onClick={() => handleRequestHint('regular')}
                  disabled={requestingHint || (session?.hintCredits || 0) < 1}
                >
                  <div className="text-left">
                    <div className="font-semibold">Pista Regular</div>
                    <div className="text-sm text-gray-500">Ayuda sutil para guiarte</div>
                  </div>
                  <Badge variant="secondary">1 Crédito</Badge>
                </Button>

                <Button
                  variant="outline"
                  className="justify-between h-auto py-4 border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
                  onClick={() => handleRequestHint('super')}
                  disabled={requestingHint || (session?.hintCredits || 0) < 2}
                >
                  <div className="text-left">
                    <div className="font-semibold text-yellow-900">Súper Pista</div>
                    <div className="text-sm text-yellow-700">Muy reveladora (casi la respuesta)</div>
                  </div>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">2 Créditos</Badge>
                </Button>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsHintDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ActiveQuiz;