import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { QuizOption } from '@/components/ui/quiz-option';
import { QuestionProgress } from '@/components/ui/question-progress';
import { Progress } from '@/components/ui/progress';
import { useTimer } from '@/hooks/use-timer';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { shuffleArray } from '@/lib/mathUtils';
import { Badge } from '@/components/ui/badge';
import { QuestionContent } from '@/components/QuestionContent';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '../hooks/useSession';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

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
  content: string;
  type: string;
  difficulty: number;
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

interface Progress {
  id?: number;
  userId?: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: string | Date;
}

interface StudentAnswer {
  progressId: number;
  questionId: number;
  answerId: number | null;
  textAnswer?: string;
  isCorrect: boolean;
  variables: Record<string, number>;
  timeSpent: number;
}

function ActiveQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { session } = useSession();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, boolean>>({});
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  // Fetch quiz data
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    queryFn: async () => {
      console.log('[DATA] Fetching quiz data...');
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error('Error fetching quiz');
      const data = await res.json();
      console.log('[DATA] Quiz loaded:', data);
      return data;
    },
  });

  // Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    queryFn: async () => {
      console.log('[DATA] Fetching questions...');
      const res = await fetch(`/api/quizzes/${quizId}/questions`);
      if (!res.ok) throw new Error('Error fetching questions');
      const data = await res.json();
      console.log(`[DATA] Questions loaded (count: ${data.length})`);
      return data;
    },
  });

  // Fetch progress
  const { data: progress, isLoading: loadingProgress } = useQuery<Progress | null>({
    queryKey: [`/api/progress/${quizId}`],
    queryFn: async () => {
      console.log('[DATA] Fetching progress...');
      const res = await fetch(`/api/progress/${quizId}`);
      if (!res.ok) return null;
      const data = await res.json();
      console.log('[DATA] Progress loaded:', data);
      return data;
    },
  });

  // Mutations
  const createProgressMutation = useMutation({
    mutationFn: async (progressData: Progress) => {
      const dataToSend = {
        ...progressData,
        completedAt: progressData.completedAt instanceof Date
          ? progressData.completedAt.toISOString()
          : progressData.completedAt
      };
      return apiRequest('POST', '/api/progress', dataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${quizId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: StudentAnswer) => {
      return apiRequest('POST', '/api/answers', answerData);
    },
  });

  // Timer
  const {
    timeRemaining,
    elapsedTime,
    formattedTime,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer
  } = useTimer({
    initialTime: quiz?.timeLimit ?? 1800,
    onTimeUp: () => handleFinishQuiz(),
  });

  // Load existing answers function
  const loadExistingAnswers = async (progressId: number, questions: Question[]) => {
    console.log(`[LOAD] Loading answers for progress ${progressId}`);
    try {
      const res = await fetch(`/api/progress/${progressId}/answers`);
      if (!res.ok) throw new Error('Failed to load answers');
      
      const existingAnswers = await res.json();
      console.log(`[LOAD] Found ${existingAnswers.length} existing answers`);
      
      const answered: Record<number, boolean> = {};
      const correct: Record<number, boolean> = {};
      const studentAnswersData: StudentAnswer[] = [];
      const textAnswersData: Record<number, string> = {};
      
      existingAnswers.forEach((answer: any) => {
        const questionIndex = questions.findIndex(q => q.id === answer.questionId);
        if (questionIndex >= 0) {
          answered[questionIndex] = true;
          correct[questionIndex] = answer.isCorrect;
          studentAnswersData.push({
            progressId: answer.progressId,
            questionId: answer.questionId,
            answerId: answer.answerId,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            variables: answer.variables,
            timeSpent: answer.timeSpent
          });

          if (answer.textAnswer) {
            textAnswersData[answer.questionId] = answer.textAnswer;
          }
        }
      });
      
      return { answered, correct, studentAnswersData, textAnswersData };
    } catch (error) {
      console.error('[ERROR] Error loading answers:', error);
      return null;
    }
  };

  // Initialize quiz progress
  const initializeProgress = async () => {
    if (!quiz) return;

    try {
      console.log('[INIT] Initializing new progress');
      await createProgressMutation.mutateAsync({
        quizId: parseInt(quizId),
        status: 'in_progress',
        completedQuestions: 0,
      });
      
      resetTimer(quiz.timeLimit);
      startTimer();
    } catch (error) {
      console.error('[ERROR] Error initializing quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el cuestionario.',
        variant: 'destructive',
      });
    }
  };

  // Initialize or continue quiz
  useEffect(() => {
    if (!quiz || loadingProgress || !questions) return;
    
    console.log('[INIT] Initializing quiz session');
    

    
    const initializeQuiz = async () => {
      if (progress) {
        if (progress.status === 'completed') {
          console.log('[INIT] Quiz already completed');
          toast({
            title: 'Grandioso, has completado este cuestionario!',
            description: 'Ahora puedes ver los resultados en tu Dashboard',
          });
          setLocation(`/results/${progress.id}`);
          return;
        }

        // Set initial time
        const initialTime = progress.timeSpent !== undefined && quiz.timeLimit
          ? Math.max(0, quiz.timeLimit - progress.timeSpent)
          : quiz.timeLimit;

        resetTimer(initialTime);
        startTimer();

        if (progress.completedQuestions > 0) {
          console.log(`[INIT] Resuming at question ${progress.completedQuestions}`);
          setCurrentQuestionIndex(progress.completedQuestions);
        }

        // Load existing answers
        if (progress?.id) { // Esto verifica que progress no sea null/undefined y que id exista
          const answersData = await loadExistingAnswers(progress.id, questions);
          // ...
        
        if (answersData) {
          setAnsweredQuestions(answersData.answered);
          setCorrectAnswers(answersData.correct);
          setStudentAnswers(answersData.studentAnswersData);
          setTextAnswers(answersData.textAnswersData);
          console.log('[INIT] Existing answers loaded');
        }
        }  
      } else {
        await initializeProgress();
      }
    };

    initializeQuiz();
  }, [quiz, progress, loadingProgress, questions]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.type === 'multiple_choice') {
        setShuffledAnswers(shuffleArray(currentQuestion.answers));
      }
      
      // Find existing answer for current question
      const currentAnswer = studentAnswers.find(a => a.questionId === currentQuestion.id);
      setSelectedAnswerId(currentAnswer?.answerId || null);
      
      console.log(`[NAV] Changed to question ${currentQuestionIndex}`, {
        questionId: currentQuestion.id,
        hasAnswer: answeredQuestions[currentQuestionIndex],
        selectedAnswerId: currentAnswer?.answerId
      });
    }
  }, [questions, currentQuestionIndex]);

  // Answer selection handlers
  const handleSelectAnswer = (answerId: number) => {
    if (!questions || answeredQuestions[currentQuestionIndex]) {
      console.log('[WARN] Attempt to answer already answered question');
      return;
    }
    
    console.log(`[ANSWER] Selected answer ${answerId} for question ${currentQuestionIndex}`);
    setSelectedAnswerId(answerId);
  };

  const submitCurrentAnswer = async () => {
    if (!questions || !progress?.id || !selectedAnswerId || answeredQuestions[currentQuestionIndex]) {
      console.log('[WARN] Cannot submit answer - missing data or already answered');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId);
    const isCorrect = selectedAnswer?.isCorrect || false;

    console.log(`[ANSWER] Submitting answer for question ${currentQuestion.id}`, {
      answerId: selectedAnswerId,
      isCorrect
    });

    const studentAnswer: StudentAnswer = {
      progressId: progress.id,
      questionId: currentQuestion.id,
      answerId: selectedAnswerId,
      isCorrect,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    try {
      await submitAnswerMutation.mutateAsync(studentAnswer);
      setStudentAnswers([...studentAnswers, studentAnswer]);
      setAnsweredQuestions({...answeredQuestions, [currentQuestionIndex]: true});
      setCorrectAnswers({...correctAnswers, [currentQuestionIndex]: isCorrect});
      
      console.log('[ANSWER] Answer submitted successfully');
    } catch (error) {
      console.error('[ERROR] Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu respuesta.',
        variant: 'destructive',
      });
    }
  };

  // Navigation handlers
  /*const handleNextQuestion = async () => {
    if (!questions || !progress || session?.userId === 1) return;

    console.log('[NAV] Moving to next question');

    // Submit current answer if not already submitted
    if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
      await submitCurrentAnswer();
    }

    // Update progress
    try {
      await createProgressMutation.mutateAsync({
        ...progress,
        completedQuestions: Math.max(progress.completedQuestions, currentQuestionIndex + 1),
        timeSpent: elapsedTime,
      });
    } catch (error) {
      console.error('[ERROR] Error updating progress:', error);
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerId(null);
    } else {
      await handleFinishQuiz();
    }
  };*/

  const [isNavigating, setIsNavigating] = useState(false);

const handleNextQuestion = async () => {
  if (!questions || !progress || session?.userId === 1 || isNavigating) return;

  setIsNavigating(true);
  console.log('[NAV] Moving to next question');

  try {
    // Guardar respuesta actual si es necesario (solo si no es la última pregunta)
    if (currentQuestionIndex < questions.length - 1) {
      if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
        await submitCurrentAnswer();
      }

      // Esperar 2 segundos mostrando los resultados
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar progreso
      await createProgressMutation.mutateAsync({
        ...progress,
        completedQuestions: Math.max(progress.completedQuestions, currentQuestionIndex + 1),
        timeSpent: elapsedTime,
      });

      // Avanzar a siguiente pregunta
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerId(null);
    } else {
      await handleFinishQuiz();
    }
  } catch (error) {
    console.error('[ERROR] Error in navigation:', error);
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
      console.log('[NAV] Moving to previous question');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Text answer handler
  const handleTextAnswerSubmit = async () => {
    if (!questions || !progress?.id || !textAnswers[questions[currentQuestionIndex].id]) {
      console.log('[WARN] Cannot submit text answer - missing data');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    console.log(`[ANSWER] Submitting text answer for question ${currentQuestion.id}`);

    const studentAnswer: StudentAnswer = {
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
      setAnsweredQuestions({...answeredQuestions, [currentQuestionIndex]: true});
      
      // Update progress
      await createProgressMutation.mutateAsync({
        ...progress,
        completedQuestions: Math.max(progress.completedQuestions, currentQuestionIndex + 1),
        timeSpent: elapsedTime,
      });
      
      console.log('[ANSWER] Text answer submitted successfully');
    } catch (error) {
      console.error('[ERROR] Error submitting text answer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu respuesta.',
        variant: 'destructive',
      });
    }
  };

  // Finish quiz
  /*const handleFinishQuiz = async () => {
    if (!progress || !questions || session?.userId === 1) return;

    console.log('[QUIZ] Finishing quiz');

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = studentAnswers
      .filter(a => a.isCorrect)
      .reduce((sum, a) => sum + (questions.find(q => q.id === a.questionId)?.points || 0), 0);

    try {
      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score: Math.round((earnedPoints / totalPoints) * 10),
        timeSpent: elapsedTime,
        completedAt: new Date()
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

      setQuizResults({
        score: earnedPoints,
        totalPoints,
        percentage: Math.round((earnedPoints / totalPoints) * 100),
        correctAnswers: studentAnswers.filter(a => a.isCorrect).length,
        totalQuestions: questions.length
      });
      
      console.log('[QUIZ] Quiz completed successfully');
    } catch (error) {
      console.error('[ERROR] Error finishing quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al completar el cuestionario',
        variant: 'destructive',
      });
    }
  };*/

  const handleFinishQuiz = async () => {
    if (!progress || !questions || session?.userId === 1) return;
  
    console.log('[QUIZ] Finishing quiz');
  
    // 1. Primero guardar la respuesta de la última pregunta si no está guardada
    if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
      console.log('[QUIZ] Saving last question answer before finishing');
      await submitCurrentAnswer();
    }
  
    // 2. Calcular puntuación
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = studentAnswers
      .filter(a => a.isCorrect)
      .reduce((sum, a) => sum + (questions.find(q => q.id === a.questionId)?.points || 0), 0);
  
    try {
      // 3. Actualizar progreso como completado
      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score: Math.round((earnedPoints / totalPoints) * 10),
        timeSpent: elapsedTime,
        completedAt: new Date()
      };
  
      await createProgressMutation.mutateAsync(progressUpdate);
      
      // 4. Enviar submission del quiz
      const score = Math.round((earnedPoints / totalPoints) * 10);
      const submissionResponse = await fetch("/api/quiz-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.userId,
          quizId: quiz?.id,
          score,
          progressId: progress.id,
        }),
      });
  
      if (!submissionResponse.ok) {
        throw new Error('Failed to submit quiz results');
      }
  
      // 5. Actualizar estado local
      setQuizResults({
        score: earnedPoints,
        totalPoints,
        percentage: Math.round((earnedPoints / totalPoints) * 100),
        correctAnswers: studentAnswers.filter(a => a.isCorrect).length,
        totalQuestions: questions.length
      });
      
      console.log('[QUIZ] Quiz completed successfully');
    } catch (error) {
      console.error('[ERROR] Error finishing quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al completar el cuestionario',
        variant: 'destructive',
      });
      // No redirigir si hay error
      return;
    }
  
    // Redirigir a resultados solo si todo salió bien
    setLocation(`/results/${progress.id}`);
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLoading = loadingQuiz || loadingQuestions || loadingProgress;

  return (
    <div id="activeQuiz">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={() => {
              pauseTimer();
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation(`/category/${quiz?.categoryId}`);
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {loadingQuiz ? 'Cargando...' : quiz?.title}
          </h2>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
          <Timer className="text-gray-500 mr-1 h-5 w-5" />
          <span id="quizTimer" className="text-gray-700 font-medium">
            {formattedTime()}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      ) : currentQuestion ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium text-gray-500">
                Pregunta <span>{currentQuestionIndex + 1}</span> de <span>{questions?.length}</span>
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
                  : 'Selecciona la respuesta correcta y da click en SIGUIENTE'}
              </h3>
              
              {currentQuestion.imageUrl && (
                <Card className="mb-4 max-w-2xl mx-auto">
                  <CardContent className="p-4 flex justify-center">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Imagen de la pregunta" 
                      className="max-h-60 object-contain rounded"
                    />
                  </CardContent>
                </Card>
              )}
              
              <QuestionContent content={currentQuestion.content} />
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
            {/*
            {(selectedAnswerId !== null || answeredQuestions[currentQuestionIndex]) && currentQuestion.type !== 'text' && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                <h4 className="font-medium mb-2">Explicación:</h4>
                <p>
                  {currentQuestion.answers.find(a => a.id === (
                    selectedAnswerId || 
                    studentAnswers.find(sa => sa.questionId === currentQuestion.id)?.answerId
                  ))?.explanation || "No hay explicación disponible para esta respuesta."}
                </p>
              </div>
            )}
            */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              
              {session?.role === 'parent' && currentQuestionIndex >= (questions?.length || 0) - 1 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button disabled>
                          Finalizar
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Los padres no pueden finalizar cuestionarios.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (


                <Button 
  id="nextButton"
  onClick={handleNextQuestion}
  disabled={isNavigating || (currentQuestion.type === 'text' 
    ? !answeredQuestions[currentQuestionIndex]
    : false)}
>
  {isNavigating ? (
    <span className="flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Procesando...
    </span>
  ) : (
    <>
      {currentQuestionIndex >= (questions?.length || 0) - 1 ? 'Finalizar' : 'Siguiente'}
      {currentQuestionIndex < (questions?.length || 0) - 1 && (
        <ArrowRight className="ml-1 h-4 w-4" />
      )}
    </>
  )}
</Button>


              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p>No hay preguntas disponibles.</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-4">Tu progreso</h3>
          <QuestionProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions?.length || 0}
            answeredQuestions={answeredQuestions}
            correctAnswers={correctAnswers}
            onQuestionClick={(index) => {
              console.log(`[PROGRESS] Clicked on question ${index}`);
              setCurrentQuestionIndex(index);
            }}
            disabled={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ActiveQuiz;