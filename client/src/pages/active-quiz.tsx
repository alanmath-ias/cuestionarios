import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Timer, Lightbulb, Flag, Clock, Trophy, Home, BookOpen, ShieldCheck, ShieldOff, Brain, Zap } from "lucide-react";
import { startActiveQuizTour } from "@/lib/tour";
import { useState, useEffect, useRef } from "react";
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
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { ExplanationModal } from "./explicacion";
import { MathDisplay } from "@/components/ui/math-display";
import MathKeyboard from "@/components/MathKeyboard";
import { Input } from "@/components/ui/input";

const SURVEY_QUIZ_IDS = [68, 69, 73, 72];

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
  responseMode?: 'multiple_choice' | 'direct_input';
  answers?: any[];
}

// Componente para renderizar contenido con saltos de línea y matemáticas
const QuestionContent = ({ content }: { content: string }) => {
  // Helper to determine font size class based on question content length
  const getQuestionSizeClass = (text: string) => {
    // Remove LaTeX delimiters to estimate "visual" length more accurately
    const cleanContent = text.replace(/\\frac|\\{|\\}|\$|¡/g, '');
    const length = cleanContent.length;

    if (length < 50) return "text-2xl md:text-3xl font-bold"; // Short questions (e.g. "Simplificar:")
    if (length < 100) return "text-xl md:text-2xl"; // Medium questions
    return "text-lg md:text-xl"; // Long questions (maintain readability)
  };

  return (
    <div className={`mb-8 text-slate-200 leading-relaxed transition-all duration-300 ${getQuestionSizeClass(content)}`}>
      <ContentRenderer content={content} />
    </div>
  );
};

const ActiveQuiz = () => {
  const { quizId, categoryId } = useParams();
  const isChiqui = !!categoryId;
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
  const { session, loading: sessionLoading } = useSession();
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, string[]>>({});
  const [requestingHint, setRequestingHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIncompleteDialogOpen, setIsIncompleteDialogOpen] = useState(false);
  const [showChiquiResult, setShowChiquiResult] = useState(() => {
    // Skip the flash by immediately showing results if coming from 'Ver Detalles'
    return new URLSearchParams(window.location.search).get('results') === '1';
  });
  const [chiquiScore, setChiquiScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<{
    questionId: number;
    question: string;
    correctAnswer: string;
  } | null>(null);

  // New state for cumulative time
  const [previousTimeSpent, setPreviousTimeSpent] = useState<number>(0);

  // Report Error State
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  // Track used hint types per question
  const [usedHintTypes, setUsedHintTypes] = useState<Record<number, ('regular' | 'super')[]>>({});

  const [directResponse, setDirectResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSyncQuestionId = useRef<number | null>(null);

  // Queries — esperan a que la sesión esté confirmada para evitar 401 al iniciar
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !sessionLoading && !isChiqui && !!quizId,
    placeholderData: (prev) => prev,
  });

  const { data: questions, isLoading: loadingQuestions, error: errorQuestions } = useQuery<Question[]>({
    queryKey: isChiqui
      ? [`/api/chiquitest/questions/${categoryId}`, searchParams.get('user_id'), new Date().toISOString().split('T')[0]]
      : [`/api/quizzes/${quizId}/questions`, mode],
    queryFn: async () => {
      const userIdStr = searchParams.get('user_id');
      const url = isChiqui
        ? `/api/chiquitest/questions/${categoryId}${userIdStr ? `?user_id=${userIdStr}` : ''}`
        : `/api/quizzes/${quizId}/questions${mode ? `?mode=${mode}` : ''}`;
      // Usar fetch directo para poder interceptar 401 antes del throw
      const res = await fetch(url, { credentials: 'include' });
      // Si la sesión todavía no estaba lista, reintentar una vez en silencio
      if (res.status === 401) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const retry = await fetch(url, { credentials: 'include' });
        if (!retry.ok) throw new Error(`${retry.status}: Error al cargar preguntas`);
        return retry.json();
      }
      if (!res.ok) throw new Error(`${res.status}: Error al cargar preguntas`);
      return res.json();
    },
    // Esperar a que la sesión esté confirmada antes de disparar el fetch
    enabled: !sessionLoading && (!!quizId || !!categoryId),
    placeholderData: (prev) => prev,
  });

  const hasUnevaluatedAnswers = studentAnswers.some(a => a.userResponse !== undefined && a.isCorrect === null);

  const { data: progress, isLoading: loadingProgress } = useQuery<Progress>({
    queryKey: isChiqui ? ["chiqui-progress-placeholder"] : [`/api/progress/${quizId}`],
    enabled: !isChiqui && !!quizId && !!session?.userId,
    refetchInterval: hasUnevaluatedAnswers ? 3000 : false,
    placeholderData: (prev) => prev,
  });

  const isDirectInput = progress?.responseMode === 'direct_input' || mode === 'direct_input';

  const { data: chiquiResults } = useQuery<any[]>({
    queryKey: ["chiqui-results", searchParams.get('user_id')],
    queryFn: async () => {
      const userIdStr = searchParams.get('user_id');
      const url = userIdStr ? `/api/chiquitest/results?user_id=${userIdStr}` : "/api/chiquitest/results";
      const res = await apiRequest("GET", url);
      return res.json();
    },
    enabled: isChiqui && (!!session?.userId || !!searchParams.get('user_id')),
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
    if (!questions || !reportDescription.trim()) return;
    const currentQuestion = questions[currentQuestionIndex];

    reportErrorMutation.mutate({
      quizId: currentQuestion.quizId,
      questionId: currentQuestion.id,
      description: reportDescription,
    });
  };

  // Timer
  // IMPORTANT: initialElapsedTime is set to 0 to restart the visual timer for this session.
  // The total time will be calculated as previousTimeSpent + elapsedTime.
  const { formattedTime, elapsedTime, start, pause, reset } = useTimer({
    initialTime: isChiqui ? 1200 : (quiz?.timeLimit || 0),
    initialElapsedTime: 0,
    autoStart: false, // We will manually start it to ensure it catches the loaded time
    onTimeUp: () => handleFinishQuiz()
  });

  // Sync background AI evaluation results when progress is refetched via polling
  useEffect(() => {
    if (progress?.answers && isInitialized) {
      setStudentAnswers(prev => {
        let updated = [...prev];
        let changed = false;
        for (const serverAns of progress.answers as any[]) {
          const localIdx = updated.findIndex(a => a.questionId === serverAns.questionId);
          if (localIdx >= 0 && updated[localIdx].isCorrect === null && serverAns.isCorrect !== null) {
            updated[localIdx] = { ...updated[localIdx], isCorrect: serverAns.isCorrect };
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }
  }, [progress?.answers, isInitialized]);

  // Helper to calculate total cumulative time
  const getTotalTime = () => {
    return previousTimeSpent + elapsedTime;
  };

  const formatTotalTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Effects
  useEffect(() => {
    if (!isInitialized && questions) {
      if (progress) {
        if (progress.status === 'completed' && mode !== 'readonly') {
          setLocation(`/results/${progress.id}`, { replace: true });
          return;
        }

        // Initialize previousTimeSpent from the server
        setPreviousTimeSpent(progress.timeSpent || 0);

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
        if (session?.userId !== 1 && quiz?.timeLimit) {
          reset(quiz.timeLimit);
          start();
        }
      } else if (isChiqui && questions) {
        // Check if there is already a result for today
        const todayCategoryResult = chiquiResults?.find(r =>
          r.categoryId === parseInt(categoryId!) &&
          new Date(r.lastDate).toDateString() === new Date().toDateString()
        );

        if (todayCategoryResult) {
          setChiquiScore(todayCategoryResult.lastScore);
          setStudentAnswers(todayCategoryResult.lastAnswers || []);
          setShowChiquiResult(true);
        } else {
          // Restore partial progress from LocalStorage
          const savedPartial = localStorage.getItem(`chiqui_partial_${categoryId}`);
          if (savedPartial) {
            try {
              const { answers, index } = JSON.parse(savedPartial);
              if (answers && Array.isArray(answers)) {
                setStudentAnswers(answers);
                const answeredMap: Record<number, boolean> = {};
                answers.forEach((ans: any) => {
                  const qId = ans.questionId;
                  const qidx = questions.findIndex(q => q.id === qId);
                  if (qidx !== -1) answeredMap[qidx] = true;
                });
                setAnsweredQuestions(answeredMap);
                setCurrentQuestionIndex(Math.min(index, questions.length - 1));
              }
            } catch (err) {
              console.error("Error restoring Chiqui progress State:", err);
            }
          }
        }
        setIsInitialized(true);
        if (session?.userId !== 1) {
          reset(1200);
          start();
        }
      } else if (mode === 'readonly') {
        // If readonly and NO progress, just initialize empty state
        setIsInitialized(true);
      }
    }
  }, [progress, questions, setLocation, isInitialized, mode, isChiqui, chiquiResults, categoryId]);

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
    // Sync directResponse when question changes or on initial load
    if (questions && questions[currentQuestionIndex]) {
      const qId = questions[currentQuestionIndex].id;
      const isFocused = document.activeElement === inputRef.current;

      // Sincronizar SIEMPRE si cambiamos de pregunta
      if (lastSyncQuestionId.current !== qId) {
        const existing = studentAnswers.find(sa => sa.questionId === qId);
        setDirectResponse(existing?.userResponse || "");
        lastSyncQuestionId.current = qId;
      }
      // Si es la misma pregunta, solo sincronizar si no hay nada escrito y no hay foco,
      // para evitar pisar lo que el usuario está escribiendo.
      else if (!directResponse && !isFocused) {
        const existing = studentAnswers.find(sa => sa.questionId === qId);
        if (existing?.userResponse) {
          setDirectResponse(existing.userResponse);
        }
      }
    }
  }, [currentQuestionIndex, questions, studentAnswers]);

  // Helper to determine font size class based on answer content length
  const getAnswerSizeClass = (content: string) => {
    // Detect if it contains a fraction which adds height
    const hasFraction = content.includes('\\frac');

    // Remove LaTeX delimiters to estimate "visual" length more accurately
    const cleanContent = content.replace(/\\frac|\\{|\\}|\$|¡/g, '');
    const length = cleanContent.length;

    if (length < 10) {
      return hasFraction ? "text-lg md:text-xl" : "text-2xl md:text-3xl";
    }
    if (length < 40) return "text-xl md:text-2xl";
    if (length < 70) return "text-lg md:text-xl";
    return "text-sm md:text-base";
  };

  const isReadOnly = mode === 'readonly';

  useEffect(() => {
    if (!isChiqui && quiz && session?.userId && !loadingProgress && !progress && session.userId !== 1 && !isReadOnly) {
      createProgressMutation.mutate({
        userId: session.userId,
        quizId: parseInt(quizId!),
        status: 'in_progress',
        completedQuestions: 0,
        timeSpent: 0,
        mode: mode || 'standard'
      });
    }
  }, [quiz, session, progress, loadingProgress, quizId, isReadOnly, isChiqui]);

  // Save Partial Chiqui progress
  useEffect(() => {
    if (isChiqui && isInitialized && !showChiquiResult) {
      if (studentAnswers.length > 0) {
        localStorage.setItem(`chiqui_partial_${categoryId}`, JSON.stringify({
          answers: studentAnswers,
          index: currentQuestionIndex
        }));
      }
    }
  }, [studentAnswers, currentQuestionIndex, isChiqui, isInitialized, categoryId, showChiquiResult]);

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

  // Navegación por Teclado (PC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No navegar si hay diálogos abiertos o si el cuestionario terminó
      const isModalOpen = isReportDialogOpen || isHintDialogOpen || isIncompleteDialogOpen || showExplanation || showChiquiResult;
      if (isModalOpen) return;

      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Si estamos en un input (que no sea el de respuesta matemática), ignorar flechas/enter
      if (isInputFocused && activeElement !== inputRef.current) return;

      if (e.key === 'ArrowRight') {
        handleNextQuestion();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousQuestion();
      } else if (e.key === 'Enter') {
        const currentQuestion = questions?.[currentQuestionIndex];
        const isTextType = currentQuestion?.type === 'text';

        // Solo avanzar con Enter si hay alguna respuesta seleccionada o escrita
        const hasValue = selectedAnswerId !== null ||
          (isDirectInput && directResponse.trim() !== "") ||
          (isTextType && textAnswers[currentQuestion?.id!]?.trim() !== "");

        if (hasValue) {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentQuestionIndex, questions, selectedAnswerId, isDirectInput,
    directResponse, textAnswers, isReportDialogOpen, isHintDialogOpen,
    isIncompleteDialogOpen, showExplanation, showChiquiResult
  ]);

  // Gestos Táctiles (Swipe para Móvil)
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const isModalOpen = isReportDialogOpen || isHintDialogOpen || isIncompleteDialogOpen || showExplanation || showChiquiResult;
      if (isModalOpen) return;

      const swipeThreshold = 80; // Umbral para evitar disparos accidentales
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe Izquierda -> Siguiente
          handleNextQuestion();
        } else {
          // Swipe Derecha -> Anterior
          handlePreviousQuestion();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    currentQuestionIndex, questions, selectedAnswerId, isDirectInput,
    directResponse, textAnswers, isReportDialogOpen, isHintDialogOpen,
    isIncompleteDialogOpen, showExplanation, showChiquiResult
  ]);

  const handleMathInput = (value: string, offset = 0) => {
    if (answeredQuestions[currentQuestionIndex]) return;

    const input = inputRef.current;
    if (!input) {
      setDirectResponse(prev => prev + value);
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = directResponse;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + value + after;
    setDirectResponse(newText);

    // Reposicionar cursor tras el render
    setTimeout(() => {
      const newPos = start + value.length + offset;
      input.focus();
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSelectAnswer = (answerId: number) => {
    if (answeredQuestions[currentQuestionIndex]) return;
    setSelectedAnswerId(answerId);
  };

  const submitCurrentAnswer = async () => {
    if (!questions || (!isChiqui && !progress?.id)) return;

    const isDirectInput = progress?.responseMode === 'direct_input';
    if (!isDirectInput && selectedAnswerId === null) return;
    if (isDirectInput && !directResponse.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers?.find((a: any) => a.id === selectedAnswerId);

    const studentAnswer: any = {
      progressId: progress?.id || 0,
      questionId: currentQuestion.id,
      answerId: selectedAnswerId,
      isCorrect: selectedAnswer?.isCorrect || false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime, // This tracks time for this specific answer in this session
    };

    if (isDirectInput) {
      studentAnswer.userResponse = directResponse;
      studentAnswer.answerId = null;
      studentAnswer.isCorrect = null; // Important: null means pending evaluation
    }

    // Actualización optimista del estado local para navegación instantánea
    setStudentAnswers(prev => [...prev, studentAnswer]);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));

    try {
      if (!isChiqui) {
        // Enviar al servidor en segundo plano
        submitAnswerMutation.mutate(studentAnswer);
      }
    } catch (error: any) {
      console.error("[Quiz] Error al guardar respuesta (asíncrono):", error);
    }

    return studentAnswer;
  };

  const handleNextQuestion = async () => {
    if (!questions || (!isChiqui && !progress)) return;

    setIsNavigating(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const isTextType = currentQuestion.type === 'text';
      const hasUnconfirmedAnswer = !answeredQuestions[currentQuestionIndex] && (
        selectedAnswerId !== null ||
        (isDirectInput && directResponse.trim() !== "") ||
        (isTextType && textAnswers[currentQuestion.id]?.trim() !== "")
      );

      // Autosave if proceeding with an unconfirmed answer
      let lastAnswer = null;
      if (hasUnconfirmedAnswer) {
        if (isTextType && !answeredQuestions[currentQuestionIndex]) {
          lastAnswer = await handleTextAnswerSubmit();
        } else {
          lastAnswer = await submitCurrentAnswer();
        }
      }

      // Re-calculate counts after potential save
      const updatedAnsweredQuestions = { ...answeredQuestions };
      if (hasUnconfirmedAnswer) updatedAnsweredQuestions[currentQuestionIndex] = true;

      // Check if we are finishing the quiz
      const isFinishing = (currentQuestionIndex >= questions.length - 1) ||
        (Object.keys(updatedAnsweredQuestions).length >= questions.length);

      if (!isFinishing) {
        // En modo opción múltiple, añadimos una pequeña pausa para que el usuario vea si acertó
        if (!isDirectInput) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Enviar actualización de progreso en segundo plano sin bloquear la UI
        if (!isChiqui && progress) {
          createProgressMutation.mutate({
            ...progress,
            completedQuestions: Math.max(progress.completedQuestions ?? 0, currentQuestionIndex + 1),
            timeSpent: getTotalTime(),
          });
        }

        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerId(null);
      } else {
        const answeredCount = Object.keys(updatedAnsweredQuestions).length;
        if (questions && answeredCount < questions.length) {
          setIsIncompleteDialogOpen(true);
          return;
        }

        // IMPORTANT: Calculate final answers including the one we just processed
        const finalAnswersList = lastAnswer
          ? [...studentAnswers, lastAnswer]
          : studentAnswers;

        await handleFinishQuiz(finalAnswersList);
      }
    } catch (error: any) {
      if (error.message?.includes("401")) {
        // Sesión expirada — redirigir después de un breve aviso
        console.warn("[Quiz] Sesión expirada al navegar preguntas.");
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
        return;
      }
      // Errores de red o transitorios: no interrumpir, solo logear
      console.error("[Quiz] Error al avanzar pregunta:", error);
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
    if (!questions || (!isChiqui && !progress?.id) || !textAnswers[questions[currentQuestionIndex].id]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    const studentAnswer: any = {
      progressId: progress?.id || 0,
      questionId: currentQuestion.id,
      answerId: null,
      userResponse: answerText,
      isCorrect: false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    // Actualización optimista del estado local
    setStudentAnswers(prev => [...prev, studentAnswer]);
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));

    try {
      if (!isChiqui) {
        submitAnswerMutation.mutate(studentAnswer);
      }
    } catch (error) {
      console.error("[Quiz] Error al guardar respuesta de texto:", error);
    }

    return studentAnswer;
  };

  const handleRequestHint = async (type: 'regular' | 'super') => {
    if (!questions || (!isChiqui && !progress?.id)) return;

    const currentQuestion = questions[currentQuestionIndex];
    const cost = type === 'regular' ? 1 : 2;

    // Prevent duplicate hint type for the same question
    if (usedHintTypes[currentQuestion.id]?.includes(type)) {
      toast({
        title: 'Pista ya utilizada',
        description: `Ya has utilizado una pista de tipo "${type === 'regular' ? 'Regular' : 'Súper'}" para esta pregunta.`,
        variant: 'destructive',
      });
      return;
    }

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
        progressId: progress?.id || 0
      });

      const data = await res.json();

      setHintsRevealed(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), data.content]
      }));

      setUsedHintTypes(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), type]
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

  const handleFinishQuiz = async (finalAnswers?: any[]) => {
    pause();
    const answersToUse = finalAnswers || studentAnswers;
    if (isChiqui) {
      try {
        const score = answersToUse.filter(a => a.isCorrect).length;

        await apiRequest("POST", "/api/chiquitest/result", {
          categoryId: parseInt(categoryId!),
          score: score,
          answers: answersToUse
        });

        localStorage.removeItem(`chiqui_partial_${categoryId}`);

        toast({
          title: "¡Repasito completado!",
          description: `Has acertado ${score} de 5 preguntas. ¡Sigue así!`,
        });

        queryClient.invalidateQueries({ queryKey: ["chiqui-results"] });
        queryClient.invalidateQueries({ queryKey: ["chiqui-history"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setChiquiScore(score);
        setShowChiquiResult(true);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el resultado del Repasito.',
          variant: 'destructive',
        });
      }
      return;
    }

    if (!progress || !quiz) return;

    try {
      const score = answersToUse.length > 0 ? Number(((answersToUse.filter(a => a.isCorrect).length / answersToUse.length) * 10).toFixed(1)) : 0;
      const totalTime = getTotalTime();

      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score,
        timeSpent: totalTime, // Save cumulative time
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

      setLocation(`/results/${progress.id}`, { replace: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo finalizar el cuestionario.',
        variant: 'destructive',
      });
    }
  };

  const handleExit = async () => {
    if (progress) {
      try {
        await createProgressMutation.mutateAsync({
          ...progress,
          timeSpent: getTotalTime(),
        });
      } catch (e) {
        console.error("Error saving progress on exit", e);
      }
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation(session?.role === 'admin' ? "/admin/quizzes" : "/dashboard");
    }
  };

  // Prevent flashing by waiting for progress initialization (creation or fetch)
  if (sessionLoading || (!isChiqui && loadingQuiz) || loadingQuestions || (!isInitialized && session?.userId !== 1 && !isReadOnly)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (errorQuestions || !questions || questions.length === 0) {
    if (isChiqui) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center bg-slate-950 text-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px]" />
          </div>

          <div className="bg-amber-500/10 p-4 rounded-full mb-4 border border-amber-500/20 relative z-10 animate-bounce">
            <Zap className="h-12 w-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent relative z-10">¡Aún no hay Repasitos disponibles!</h2>
          <p className="text-slate-300 max-w-sm mb-3 leading-relaxed relative z-10 text-sm">
            La sección de <strong>Repasitos</strong> sirve para repasar conceptos que ya has estudiado.
          </p>
          <p className="text-slate-400 max-w-sm mb-6 text-xs relative z-10">
            Como todavía no has realizado cuestionarios de esta materia, la inteligencia artificial no tiene preguntas para repasar. ¡Te invitamos a realizar cuestionarios primero!
          </p>
          <Button onClick={() => setLocation("/dashboard")} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 font-bold relative z-10">
            Volver al Inicio
          </Button>
        </div>
      );
    }

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

  const correctAnswers = questions?.reduce((acc: Record<number, boolean | null>, question, index) => {
    const studentAnswer = studentAnswers.find(a => a.questionId === question.id);
    if (studentAnswer) {
      acc[index] = studentAnswer.isCorrect;
    }
    return acc;
  }, {}) || {};

  if (showChiquiResult && isChiqui) {
    const correctCount = studentAnswers.filter(a => a.isCorrect).length;
    const totalCount = questions?.length || 0;
    const failedAnswers = studentAnswers.filter(a => !a.isCorrect);

    const handleRequestExplanation = (questionId: number, question: string, correctAnswer: string) => {
      setCurrentExplanation({ questionId, question, correctAnswer });
      setShowExplanation(true);
    };

    return (
      <div className="min-h-screen bg-[#0a0b14] p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8 text-left">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-5 rounded-3xl shadow-lg shadow-yellow-500/20 transform hover:scale-110 transition-transform duration-300 mb-6">
                  <Trophy className="w-12 h-12 text-slate-900" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">¡Repasito Completado!</h2>
                <p className="text-slate-400">Has fortalecido tus conocimientos hoy</p>
              </div>

              <div className="flex justify-center">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-center min-w-[200px]">
                  <div className="text-4xl font-black text-emerald-400 mb-1">{chiquiScore}/5</div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Aciertos</div>
                </div>
              </div>


              {failedAnswers.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Revisión de Errores ({failedAnswers.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {failedAnswers.map((answer, index) => {
                      const question = questions.find(q => q.id === answer.questionId);
                      if (!question) return null;
                      const correctAnswer = question.answers?.find(a => a.isCorrect);

                      return (
                        <div key={index} className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                          <div className="text-sm text-slate-300 font-medium">
                            <ContentRenderer content={question.content} />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2 border-t border-white/5">
                            <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block mb-0.5">Correcta:</span>
                              <div className="text-xs text-white font-medium">
                                <ContentRenderer content={correctAnswer?.content || ''} />
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestExplanation(
                                question.id,
                                question.content,
                                correctAnswer?.content || ''
                              )}
                              className="border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white h-9 px-4 rounded-xl transition-all"
                            >
                              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                              Explicación
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <Home className="mr-2 w-5 h-5" />
                  Volver al Inicio
                </Button>

                <p className="text-slate-500 text-sm text-center">
                  Tus resultados han sido guardados y se verán reflejados en tu tablero.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showExplanation && currentExplanation && (
          <ExplanationModal
            questionId={currentExplanation.questionId}
            question={currentExplanation.question}
            correctAnswer={currentExplanation.correctAnswer}
            quizTitle="Repasito Diario"
            onClose={() => setShowExplanation(false)}
          />
        )}
      </div>
    );
  }

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
                onClick={handleExit}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Atrás
              </Button>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              {isChiqui ? "⚡ Repasito Diario" : quiz?.title}
              {session?.userId === 1 && !isChiqui && (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                  Modo Admin - Sin Guardar
                </Badge>
              )}
              {isReadOnly && (
                <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-500/10 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Modo Solo Lectura
                </Badge>
              )}
            </h1>
            {!isReadOnly && (
              <div className="flex items-center gap-2 mt-2">
                <div id="tour-timer" className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                  <Timer className="h-4 w-4 mr-2 text-blue-400" />
                  <span className={`font- mono font - medium ${elapsedTime > (quiz?.timeLimit || 0) * 0.9 ? 'text-red-400 animate-pulse' : 'text-slate-200'} `}>
                    {formattedTime()}
                  </span>
                </div>

                {/* New Cumulative Time Display */}
                <div className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5" title="Tiempo total acumulado">
                  <Clock className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="font-mono font-medium text-slate-200">
                    {formatTotalTime(getTotalTime())}
                  </span>
                </div>
              </div>
            )}
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
                  } border - none transition - colors`}
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
                  : isDirectInput
                    ? 'Escribe la respuesta correcta:'
                    : 'Selecciona la respuesta correcta'}
            </h3>

            {currentQuestion.imageUrl && (
              <div className="mb-6 flex justify-center">
                <ZoomableImage
                  src={currentQuestion.imageUrl}
                  alt="Imagen de la pregunta"
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
                  <AIMarkdown content={hint} className="prose-invert [&_*]:text-slate-200" />
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
                className="bg-slate-900/50 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none disabled:opacity-50"
              />
              {answeredQuestions[currentQuestionIndex] && (
                <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/10">
                  <h4 className="font-medium mb-2 text-slate-400">Tu respuesta:</h4>
                  <p className="text-slate-200">{textAnswers[currentQuestion.id]}</p>
                </div>
              )}
            </div>
          ) : isDirectInput ? null : (
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
                    onClick={() => !isAnswered && !isReadOnly && handleSelectAnswer(answer.id)}
                    disabled={isAnswered || isReadOnly}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${variantClass} ${isReadOnly ? 'cursor-default opacity-80' : ''}`}
                  >
                    <div className="flex items-center gap-4 relative z-10 w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold shrink-0 transition-colors
                          ${isSelected || (isAnswered && answer.isCorrect)
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-slate-900/50 border-white/10 text-slate-500 group-hover:text-slate-300 group-hover:border-white/20'
                        }
                        `}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className={`font-medium flex-1 ${getAnswerSizeClass(answer.content)}`}>
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

          {isDirectInput && !isReadOnly && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={directResponse}
                    onChange={(e) => !answeredQuestions[currentQuestionIndex] && setDirectResponse(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="bg-slate-900 border-white/10 text-xl py-6 h-auto text-slate-100 placeholder:text-slate-600 focus:ring-blue-500/50 rounded-2xl transition-all"
                    disabled={answeredQuestions[currentQuestionIndex]}
                  />
                </div>
              </div>

              {!answeredQuestions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <MathKeyboard
                    onInput={handleMathInput}
                    onDelete={() => {
                      const input = inputRef.current;
                      if (!input) {
                        setDirectResponse(prev => prev.slice(0, -1));
                        return;
                      }
                      const start = input.selectionStart || 0;
                      const end = input.selectionEnd || 0;
                      if (start === end) {
                        setDirectResponse(prev => prev.substring(0, start - 1) + prev.substring(start));
                        setTimeout(() => {
                          input.focus();
                          input.setSelectionRange(start - 1, start - 1);
                        }, 0);
                      } else {
                        setDirectResponse(prev => prev.substring(0, start) + prev.substring(end));
                        setTimeout(() => {
                          input.focus();
                          input.setSelectionRange(start, start);
                        }, 0);
                      }
                    }}
                    className="max-w-md mx-auto"
                  />

                </div>
              )}

              {answeredQuestions[currentQuestionIndex] && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-center gap-3 text-blue-400 mb-2 font-medium">
                    <Brain className="h-5 w-5" />
                    Evaluación por IA en progreso...
                  </div>
                  <p className="text-slate-400 text-sm">Tu respuesta: <span className="text-slate-100 font-mono bg-slate-950 px-2 py-1 rounded ml-2">{directResponse}</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative flex flex-wrap justify-between items-center mb-8 gap-3">
          <Button
            variant="outline"
            className="flex items-center border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/50 z-10 h-10 px-3 sm:px-4"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {/* Hint Button: Disabled for parents (mode=readonly) with tooltip */}
          <div className={session?.canReport ? "z-0 px-2" : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"}>
            <Button
              variant="outline"
              className={`flex items-center border-yellow-500/50 text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500 hover:text-slate-900 hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-all duration-300 scale-100 hover:scale-110 h-10 px-3 sm:px-4 ${isReadOnly ? 'opacity-50 cursor-not-allowed hover:bg-yellow-500/5 hover:text-yellow-400 hover:scale-100 hover:shadow-none' : ''}`}
              onClick={() => {
                if (isReadOnly) {
                  toast({
                    title: "Función de Estudiante",
                    description: "Solo tu hij@ puede ver las pistas.",
                    variant: "default",
                  });
                } else {
                  setIsHintDialogOpen(true);
                }
              }}
            >
              <Lightbulb className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Pista</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 z-10 ml-auto flex-wrap sm:flex-nowrap">
            {session?.userId === 1 && (
              <Button
                variant="outline"
                className={`flex items-center transition-all h-10 px-3 sm:px-4 ${(quiz as any)?.isVerified
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300'
                  : 'border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
                  }`}
                onClick={async () => {
                  if (!quiz?.id) return;
                  try {
                    const res = await fetch(`/api/quizzes/${quiz.id}/verify`, {
                      method: 'PATCH',
                      credentials: 'include',
                    });
                    if (res.ok) {
                      const data = await res.json();
                      queryClient.setQueryData([`/api/quizzes/${quiz.id}`], (old: any) =>
                        old ? { ...old, isVerified: data.isVerified } : old
                      );
                      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
                    }
                  } catch (e) {
                    console.error('Error toggling verify:', e);
                  }
                }}
              >
                {(quiz as any)?.isVerified ? (
                  <><ShieldCheck className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Verificado</span></>
                ) : (
                  <><ShieldOff className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Verificar</span></>
                )}
              </Button>
            )}
            {session?.canReport && (
              <Button
                variant="outline"
                className="flex items-center border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-red-500/5 h-10 px-3 sm:px-4"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <Flag className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Reportar</span>
              </Button>
            )}

            <Button
              onClick={handleNextQuestion}
              disabled={isNavigating || (
                !answeredQuestions[currentQuestionIndex] &&
                selectedAnswerId === null &&
                (progress?.responseMode !== 'direct_input' || !directResponse.trim()) &&
                (currentQuestion.type !== 'text' || !textAnswers[currentQuestion.id]?.trim())
              )}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20 h-10 px-4 sm:px-6"
            >
              {isNavigating ? (
                'Procesando...'
              ) : (
                <>
                  {(currentQuestionIndex >= (questions?.length || 0) - 1) || (Object.keys(answeredQuestions).length === (questions?.length || 0)) || (Object.keys(answeredQuestions).length === (questions?.length || 0) - 1 && !answeredQuestions[currentQuestionIndex]) ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
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
            responseMode={progress?.responseMode}
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
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">2 Créditos</Badge>
                  </Button>
                </>
              )}
            </div>
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
                Debes contestar todas las preguntas para poder finalizar el cuestionario.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsIncompleteDialogOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Volver al cuestionario
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Reportar un error</DialogTitle>
              <DialogDescription className="text-slate-400">
                Describe el problema que encontraste en esta pregunta.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe el error..."
                className="bg-slate-800 border-white/10 text-slate-200"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} disabled={reportErrorMutation.isPending}>Cancelar</Button>
              <Button
                onClick={handleReportSubmit}
                disabled={!reportDescription.trim() || reportErrorMutation.isPending}
                className="min-w-[120px]"
              >
                {reportErrorMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  'Enviar Reporte'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ActiveQuiz;