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
//import { insertStudentProgressSchema } from '@shared/schema'
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
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);

  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
  queryKey: [`/api/quizzes/${quizId}`],
  queryFn: async () => {
    const res = await fetch(`/api/quizzes/${quizId}`);
    if (!res.ok) throw new Error('Error fetching quiz');
    return res.json();
  },
  /*onSuccess: (data) => {
    console.log(data); // Log mínimo solicitado
  }*/
});

  // Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
  });

  // Fetch existing progress
  const { data: progress, isLoading: loadingProgress } = useQuery<Progress | null>({
    queryKey: [`/api/progress/${quizId}`],
  });

  // Create or update progress
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

  // Submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: StudentAnswer) => {
      return apiRequest('POST', '/api/answers', answerData);
    },
  });

  // Timer setup
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

  // Initialize or continue quiz
  useEffect(() => {
    if (!quiz || loadingProgress) return;

    if (progress) {
      if (progress.status === 'completed') {
        toast({
          title: 'Grandioso, has completado este cuestionario!',
          description: 'Ahora puedes ver los resultados en tu Dashboard',
        });
        setLocation(`/results/${progress.id}`);//Esta línea de codigo es la que dirige automáticamente a los resultados del cuestionario
        return;
      }

      // Set initial time based on progress
      const initialTime = progress.timeSpent !== undefined && quiz.timeLimit
        ? Math.max(0, quiz.timeLimit - progress.timeSpent)
        : quiz.timeLimit;

      resetTimer(initialTime);
      startTimer();

      if (progress.completedQuestions > 0) {
        setCurrentQuestionIndex(progress.completedQuestions);
      }
    } else {
      // No progress exists, initialize new quiz
      initializeProgress();
    }
  }, [quiz, progress, loadingProgress]);

  // Shuffle answers when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      setShuffledAnswers(shuffleArray(questions[currentQuestionIndex].answers));
      const currentAnswer = studentAnswers.find(a => a.questionId === questions[currentQuestionIndex].id);
      setSelectedAnswerId(currentAnswer?.answerId || null);
    }
  }, [questions, currentQuestionIndex]);

  // Initialize new quiz progress
  const initializeProgress = async () => {
    if (!quiz) return;

    try {
      await createProgressMutation.mutateAsync({
        quizId: parseInt(quizId),
        status: 'in_progress',
        completedQuestions: 0,
      });
      
      resetTimer(quiz.timeLimit);
      startTimer();
    } catch (error) {
      console.error('Error initializing quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el cuestionario.',
        variant: 'destructive',
      });
    }
  };

  // Handle answer selection and immediate validation
  const handleSelectAnswer = async (answerId: number) => {
    if (!questions || !progress?.id) return;
    if (session?.userId === 1) {
      return;
    }

    setSelectedAnswerId(answerId);

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    const isCorrect = selectedAnswer?.isCorrect || false;

    const studentAnswer: StudentAnswer = {
      progressId: progress.id,
      questionId: currentQuestion.id,
      answerId: answerId,
      isCorrect,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    try {
      await submitAnswerMutation.mutateAsync(studentAnswer);
      setStudentAnswers([
        ...studentAnswers.filter(a => a.questionId !== currentQuestion.id),
        studentAnswer
      ]);
      setAnsweredQuestions({
        ...answeredQuestions,
        [currentQuestionIndex]: true,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu respuesta.',
        variant: 'destructive',
      });
    }
  };

  // Move to next question
  const handleNextQuestion = async () => {
    if (!questions || !progress) return;
    if (session?.userId === 1) {
      return;
    }

    try {
      const newCompletedQuestions = Math.max(progress.completedQuestions, currentQuestionIndex + 1);
      
      await createProgressMutation.mutateAsync({
        ...progress,
        completedQuestions: newCompletedQuestions,
        timeSpent: elapsedTime,
      });
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        await handleFinishQuiz();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Move to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Finish quiz and calculate score
  const handleFinishQuiz = async () => {
    if (!progress || !questions) return;
    if (session?.userId === 1) {
      return;
    }

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
    } catch (error) {
      console.error('Error finishing quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al completar el cuestionario',
        variant: 'destructive',
      });
    }
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
      // Si hay historial, regresa a la página anterior
      window.history.back();
    } else {
      // Si no hay historial, redirige a una ruta predeterminada
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
                  : 'Responde la siguiente pregunta:'}
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

            <div className="space-y-3">
              {shuffledAnswers.map((answer, index) => (
                <QuizOption
                  key={answer.id}
                  optionLabel={String.fromCharCode(65 + index)}
                  content={answer.content}
                  state={
                    selectedAnswerId !== null || answeredQuestions[currentQuestionIndex]
                      ? answer.isCorrect
                        ? 'correct'
                        : selectedAnswerId === answer.id
                        ? 'incorrect'
                        : 'default'
                      : 'default'
                  }
                  disabled={answeredQuestions[currentQuestionIndex]}
                  onClick={() =>
                    !answeredQuestions[currentQuestionIndex] &&
                    session?.role !== 'parent' &&
                    handleSelectAnswer(answer.id)
                  }
                />
              ))}
            </div>
            
            {(selectedAnswerId !== null || answeredQuestions[currentQuestionIndex]) && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                <h4 className="font-medium mb-2">Explicación:</h4>
                <p>{currentQuestion.answers.find(a => a.id === (selectedAnswerId || studentAnswers.find(sa => sa.questionId === currentQuestion.id)?.answerId))?.explanation || 
                    "No hay explicación disponible para esta respuesta."}</p>
              </div>
            )}
            
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
  <Button onClick={handleNextQuestion}>
    {currentQuestionIndex >= (questions?.length || 0) - 1 ? 'Finalizar' : 'Siguiente'}
    {currentQuestionIndex < (questions?.length || 0) - 1 && (
      <ArrowRight className="ml-1 h-4 w-4" />
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
            onQuestionClick={(index) => {
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