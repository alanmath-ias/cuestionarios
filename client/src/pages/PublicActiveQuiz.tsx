import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionProgress } from '@/components/QuestionProgress';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Timer, Lightbulb, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { shuffleArray } from '@/lib/mathUtils';
import { Badge } from '@/components/ui/badge';
import { ContentRenderer } from '@/components/ContentRenderer';
import { AIMarkdown } from '@/components/ui/ai-markdown';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// IDs de quizzes públicos
const PUBLIC_QUIZ_IDS = [68, 69, 73, 72, 278];

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
}

interface Question {
  id: number;
  quizId: number;
  content: string;
  type: 'text' | 'multiple_choice' | 'equation';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  answers: Answer[];
  variables: Record<string, number>;
  imageUrl?: string;
}

interface Answer {
  id: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

interface StudentAnswer {
  questionId: number;
  answerId: number | null;
  textAnswer?: string;
  isCorrect: boolean;
  timeSpent: number;
}

function PublicActiveQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const ageGroup = searchParams.get('ageGroup') as 'child' | 'teen' | null;

  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const numericQuizId = parseInt(quizId || '0');

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [isIncompleteDialogOpen, setIsIncompleteDialogOpen] = useState(false);

  // Hint State
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, string[]>>({});
  const [requestingHint, setRequestingHint] = useState(false);

  // Fetch quiz data
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error('Error fetching quiz');
      return await res.json();
    },
  });

  // Fetch questions with public quiz handling
  const { data: questions, isLoading: loadingQuestions, error: questionsError } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/questions`);

        // Si es quiz público y falla por autenticación, reintentar sin credenciales (aunque el backend ya debería permitirlo)
        if (res.status === 401 && PUBLIC_QUIZ_IDS.includes(numericQuizId)) {
          const publicRes = await fetch(`/api/quizzes/${quizId}/questions`, {
            credentials: 'omit'
          });
          if (!publicRes.ok) throw new Error('Error fetching public quiz questions');
          const data = await publicRes.json();
          return ageGroup === 'child'
            ? data.filter((q: Question) => !q.content.includes('alcohol'))
            : data;
        }

        if (!res.ok) throw new Error('Error fetching questions');
        const data = await res.json();
        return ageGroup === 'child'
          ? data.filter((q: Question) => !q.content.includes('alcohol'))
          : data;
      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      return PUBLIC_QUIZ_IDS.includes(numericQuizId) && failureCount < 2;
    }
  });

  // Timer
  const {
    formattedTime,
    elapsedTime,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer
  } = useTimer({
    initialTime: quiz?.timeLimit ?? 1800,
    onTimeUp: () => handleFinishQuiz(),
  });

  // Initialize timer
  useEffect(() => {
    if (quiz && !loadingQuiz) {
      resetTimer(quiz.timeLimit);
      startTimer();
    }
  }, [quiz, loadingQuiz]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.type === 'multiple_choice') {
        setShuffledAnswers(shuffleArray(currentQuestion.answers));
      }

      const currentAnswer = studentAnswers.find(a => a.questionId === currentQuestion.id);
      setSelectedAnswerId(currentAnswer?.answerId || null);
    }
  }, [questions, currentQuestionIndex]);

  const handleSelectAnswer = (answerId: number) => {
    if (!questions || answeredQuestions[currentQuestionIndex]) return;
    setSelectedAnswerId(answerId);
  };

  const submitCurrentAnswer = () => {
    if (!questions || !selectedAnswerId || answeredQuestions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId);
    const isCorrect = selectedAnswer?.isCorrect || false;

    const studentAnswer: StudentAnswer = {
      questionId: currentQuestion.id,
      answerId: selectedAnswerId,
      isCorrect,
      timeSpent: elapsedTime,
    };

    setStudentAnswers([...studentAnswers, studentAnswer]);
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestionIndex]: true });
  };

  const handleTextAnswerSubmit = () => {
    if (!questions || !textAnswers[questions[currentQuestionIndex].id]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    const studentAnswer: StudentAnswer = {
      questionId: currentQuestion.id,
      answerId: null,
      textAnswer: answerText,
      isCorrect: false, // Text answers usually need manual grading or specific logic
      timeSpent: elapsedTime,
    };

    setStudentAnswers([...studentAnswers, studentAnswer]);
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestionIndex]: true });
  };

  const handleFinishQuiz = async (finalAnswer?: StudentAnswer) => {
    if (!questions) return;

    // Save final state
    const answersToSave = [...studentAnswers];
    if (finalAnswer) {
      answersToSave.push(finalAnswer);
    }

    // Calculate score
    const correctCount = answersToSave.filter(a => a.isCorrect).length;
    const score = (correctCount / questions.length) * 10;

    const results = {
      quizId: quiz?.id || 0,
      studentAnswers: answersToSave,
      timestamp: Date.now()
    };

    sessionStorage.setItem('publicQuizResults', JSON.stringify(results));

    // Redirect to results
    setLocation(`/public-quiz-results?score=${score}&total=10&correct=${correctCount}&totalQuestions=${questions.length}&quizTitle=${encodeURIComponent(quiz?.title || '')}&quizId=${quiz?.id}`);
  };

  const checkCompletionAndFinish = async (extraCount = 0) => {
    if (!questions) return;
    const answeredCount = Object.keys(answeredQuestions).length + extraCount;
    if (answeredCount < questions.length) {
      setIsIncompleteDialogOpen(true);
      setIsNavigating(false); // Reset navigation state if blocked
      return;
    }
    await handleFinishQuiz();
  };

  const handleNextQuestion = async () => {
    if (!questions) return;

    // If not answered yet, submit the current selection and SHOW FEEDBACK
    if (!answeredQuestions[currentQuestionIndex]) {
      let isSubmitting = false;
      if (questions[currentQuestionIndex].type === 'text') {
        if (textAnswers[questions[currentQuestionIndex].id]) {
          handleTextAnswerSubmit();
          isSubmitting = true;
        }
      } else if (selectedAnswerId) {
        submitCurrentAnswer();
        isSubmitting = true;
      }

      // Auto-advance after 1.5 seconds
      setIsNavigating(true); // Show processing state
      setTimeout(() => {
        // If this was the last unanswered question, finish the quiz
        // Or if we are on the last question index
        const totalAnswered = Object.keys(answeredQuestions).length + (isSubmitting ? 1 : 0);
        if (totalAnswered >= questions.length || currentQuestionIndex >= questions.length - 1) {
          checkCompletionAndFinish(isSubmitting ? 1 : 0);
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswerId(null);
          setIsNavigating(false);
        }
      }, 1500);

      return;
    }

    // If already answered (e.g. user clicked quickly or logic fell through), move immediately
    // Check if we should finish instead of moving next
    if (Object.keys(answeredQuestions).length >= questions.length) {
      await checkCompletionAndFinish();
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerId(null);
    } else {
      // Finish quiz
      await checkCompletionAndFinish();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRequestHint = async (type: 'regular' | 'super') => {
    if (!questions) return;

    const currentQuestion = questions[currentQuestionIndex];

    setRequestingHint(true);
    try {
      const res = await fetch('/api/hints/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          hintType: type,
          hintIndex: (hintsRevealed[currentQuestion.id] || []).length + 1,
          progressId: 0 // Public users don't have progressId
        })
      });

      if (!res.ok) throw new Error('Error fetching hint');

      const data = await res.json();

      setHintsRevealed(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), data.content]
      }));

      toast({
        title: 'Pista revelada',
        description: '¡Aquí tienes una ayuda!',
      });
      setIsHintDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener la pista.',
        variant: 'destructive',
      });
    } finally {
      setRequestingHint(false);
    }
  };

  if (questionsError || !questions || questions.length === 0) {
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
  const correctAnswersMap = questions.reduce((acc: Record<number, boolean>, q, index) => {
    const ans = studentAnswers.find(a => a.questionId === q.id);
    if (ans) acc[index] = ans.isCorrect;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
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
              <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/50">Público</Badge>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <Badge
                className={`${currentQuestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  } border-none`}
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

            <div className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">
              <ContentRenderer content={currentQuestion.content} />
            </div>

            {hintsRevealed[currentQuestion.id]?.map((hint, index) => (
              <div key={index} className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Pista {index + 1}
                </h4>
                <div className="text-slate-300">
                  <AIMarkdown content={hint} className="text-slate-200 prose-invert" />
                </div>
              </div>
            ))}
          </div>

          {/* Answers */}
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
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {shuffledAnswers.map((answer, index) => {
                const isSelected = selectedAnswerId === answer.id;
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

        {/* Footer Actions */}
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
            variant="outline"
            size="sm"
            className="h-10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-yellow-500/5 backdrop-blur-sm"
            onClick={() => setIsHintDialogOpen(true)}
            disabled={answeredQuestions[currentQuestionIndex]}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            ¿Una Pista?
          </Button>

          <Button
            onClick={handleNextQuestion}
            disabled={isNavigating || (currentQuestion.type === 'text' && !answeredQuestions[currentQuestionIndex])}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20"
          >
            {isNavigating ? (
              'Procesando...'
            ) : (
              <>
                {/* Show Finalize if we are on the last question OR if all questions have been answered */}
                {(currentQuestionIndex >= (questions?.length || 0) - 1) || (Object.keys(answeredQuestions).length === (questions?.length || 0)) || (Object.keys(answeredQuestions).length === (questions?.length || 0) - 1 && !answeredQuestions[currentQuestionIndex]) ? 'Finalizar' : 'Siguiente'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 bg-slate-900/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <QuestionProgress
            totalQuestions={questions?.length || 0}
            completedQuestions={Object.keys(answeredQuestions).length}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionClick={(index) => setCurrentQuestionIndex(index)}
            disabled={false}
            correctAnswers={correctAnswersMap}
          />
        </div>

        {/* Hints Dialog */}
        <Dialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Solicitar Pista</DialogTitle>
              <DialogDescription className="text-slate-400">
                ¿Qué tipo de pista necesitas?
                <br />
                <span className="text-sm text-blue-400 font-medium mt-2 block">
                  ¡Gratis para este diagnóstico!
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
                    disabled={requestingHint}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-200 group-hover:text-white">Pista Regular</div>
                      <div className="text-sm text-slate-500 group-hover:text-slate-400">Ayuda sutil para guiarte</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">Gratis</Badge>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-between h-auto py-4 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 group"
                    onClick={() => handleRequestHint('super')}
                    disabled={requestingHint}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-yellow-400 group-hover:text-yellow-300">Súper Pista</div>
                      <div className="text-sm text-yellow-500/70 group-hover:text-yellow-500/90">Muy reveladora (casi la respuesta)</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">Gratis</Badge>
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
      </div>
    </div>
  );
}

export default PublicActiveQuiz;