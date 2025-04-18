import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizOption } from '@/components/ui/quiz-option';
import { MathDisplay } from '@/components/ui/math-display';
import { QuestionProgress } from '@/components/ui/question-progress';
import { useTimer } from '@/hooks/use-timer';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { shuffleArray } from '@/lib/mathUtils';

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
  completedAt?: string;
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
  
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  
  // Fetch quiz details
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
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
      return apiRequest('POST', '/api/progress', progressData);
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
    initialTime: quiz?.timeLimit ? quiz.timeLimit * 60 : 1800, // Default 30 minutes
    onTimeUp: () => handleFinishQuiz(),
  });
  
  // Initialize or continue quiz
  useEffect(() => {
    if (quiz && progress && !loadingProgress) {
      if (progress.status === 'completed') {
        // If quiz was already completed, redirect to results
        toast({
          title: 'Cuestionario completado',
          description: 'Ya has completado este cuestionario anteriormente.',
        });
        setLocation(`/results/${progress.id}`);
      } else if (progress.status === 'in_progress') {
        // Continue progress
        if (progress.completedQuestions > 0) {
          setCurrentQuestionIndex(progress.completedQuestions - 1);
        }
        
        // Reset timer with remaining time if available
        if (progress.timeSpent && quiz.timeLimit) {
          const remainingTime = Math.max(0, quiz.timeLimit * 60 - progress.timeSpent);
          resetTimer(remainingTime);
        }
        
        // Start timer
        startTimer();
      } else {
        // Start new quiz
        initializeProgress();
      }
    } else if (quiz && !progress && !loadingProgress) {
      // No existing progress, initialize new
      initializeProgress();
    }
  }, [quiz, progress, loadingProgress]);
  
  // Shuffle answers when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      setShuffledAnswers(shuffleArray(questions[currentQuestionIndex].answers));
      setSelectedAnswerId(null);
      setShowAnswer(false);
    }
  }, [questions, currentQuestionIndex]);
  
  // Initialize new quiz progress
  const initializeProgress = async () => {
    if (!quiz) return;
    
    try {
      const response = await createProgressMutation.mutateAsync({
        quizId: parseInt(quizId),
        status: 'in_progress',
        completedQuestions: 0,
      });
      
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
  
  // Handle answer selection
  const handleSelectAnswer = (answerId: number) => {
    if (showAnswer) return; // Prevent selection after showing answer
    setSelectedAnswerId(answerId);
  };
  
  // Check answer and show result
  const handleCheckAnswer = async () => {
    if (!selectedAnswerId || !questions || !progress?.id) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === selectedAnswerId);
    
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer.isCorrect;
    
    // Record student answer
    const studentAnswer: StudentAnswer = {
      progressId: progress.id,
      questionId: currentQuestion.id,
      answerId: selectedAnswerId,
      isCorrect,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };
    
    // Save answer
    try {
      await submitAnswerMutation.mutateAsync(studentAnswer);
      
      // Update local state
      setStudentAnswers([...studentAnswers, studentAnswer]);
      setAnsweredQuestions({
        ...answeredQuestions,
        [currentQuestionIndex]: true,
      });
      
      // Show answer result
      setShowAnswer(true);
      
      // Toast message
      toast({
        title: isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta',
        description: isCorrect 
          ? '¡Muy bien! Has seleccionado la respuesta correcta.' 
          : `La respuesta correcta era: ${currentQuestion.answers.find(a => a.isCorrect)?.content}`,
        variant: isCorrect ? 'default' : 'destructive',
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
    
    // Only allow navigation if answer has been checked
    if (!showAnswer && selectedAnswerId) {
      await handleCheckAnswer();
      return;
    }
    
    // Update progress
    const newCompletedQuestions = currentQuestionIndex + 1;
    
    try {
      await createProgressMutation.mutateAsync({
        ...progress,
        completedQuestions: newCompletedQuestions,
        timeSpent: elapsedTime,
      });
      
      // If this was the last question, finish quiz
      if (currentQuestionIndex >= questions.length - 1) {
        handleFinishQuiz();
      } else {
        // Go to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
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
  
  // Jump to specific question
  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  // Finish quiz and calculate score
  const handleFinishQuiz = async () => {
    if (!progress || !questions) return;
    
    try {
      // Calculate score (0-100)
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = studentAnswers
        .filter(a => a.isCorrect)
        .reduce((sum, a) => {
          const question = questions.find(q => q.id === a.questionId);
          return sum + (question?.points || 0);
        }, 0);
      
      // Scale to 10
      const scoreOutOf10 = totalPoints > 0 ? (earnedPoints / totalPoints) * 10 : 0;
      
      // Update progress as completed
      await createProgressMutation.mutateAsync({
        ...progress,
        status: 'completed',
        score: scoreOutOf10,
        timeSpent: elapsedTime,
        completedAt: new Date().toISOString(),
      });
      
      // Navigate to results
      toast({
        title: '¡Cuestionario completado!',
        description: `Tu puntuación: ${scoreOutOf10.toFixed(1)}/10`,
      });
      
      setLocation(`/results/${progress.id}`);
    } catch (error) {
      console.error('Error finishing quiz:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar el cuestionario.',
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
              setLocation(`/category/${quiz?.categoryId}`);
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
                {currentQuestion.type === 'equation' ? 'Resuelve la siguiente ecuación:' : 'Responde la siguiente pregunta:'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <MathDisplay math={currentQuestion.content} display={true} className="text-xl" />
              </div>
            </div>
            
            <div className="space-y-3">
              {shuffledAnswers.map((answer, index) => (
                <QuizOption
                  key={answer.id}
                  optionLabel={String.fromCharCode(65 + index)} // A, B, C, D...
                  content={answer.content}
                  state={
                    showAnswer
                      ? answer.isCorrect
                        ? 'correct'
                        : selectedAnswerId === answer.id
                        ? 'incorrect'
                        : 'default'
                      : selectedAnswerId === answer.id
                      ? 'selected'
                      : 'default'
                  }
                  disabled={showAnswer}
                  onClick={() => handleSelectAnswer(answer.id)}
                />
              ))}
            </div>
            
            {showAnswer && selectedAnswerId && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                <h4 className="font-medium mb-2">Explicación:</h4>
                <p>{currentQuestion.answers.find(a => a.id === selectedAnswerId)?.explanation || 
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
              
              {!showAnswer ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswerId === null}
                >
                  Verificar
                </Button>
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
            onQuestionClick={handleQuestionClick}
            disabled={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ActiveQuiz;
