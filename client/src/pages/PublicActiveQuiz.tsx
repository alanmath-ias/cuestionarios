import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizOption } from '@/components/ui/quiz-option';
import { QuestionProgress } from '@/components/ui/question-progress';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { shuffleArray } from '@/lib/mathUtils';
import { Badge } from '@/components/ui/badge';
import { QuestionContent } from '@/components/QuestionContent';
import { Textarea } from '@/components/ui/textarea';

// IDs de quizzes públicos
const PUBLIC_QUIZ_IDS = [68, 69, 73, 72, 278];

/* Lista de cuestionarios públicos, ojo se debe cambiar abajo tambien 
  const isLanguageTest = [64, 52],

  El componente activepublicquiz tambíen requiere cambio:
  const PUBLIC_QUIZ_IDS = [64, 52, 3, 5];

  así como publicquizresult:
  const fieldToUpdate = [64, 52].includes(quizId) ? 'G1' : 'G2';
  const testType = [64, 52].includes(quizId) ? 'Lenguaje' : 'Matemáticas';

  Routes:
  const publicQuizIds = [64, 52, 3, 5]; // IDs de cuestionarios públicos - cuestionarios para encuesta modelo tests
  
*/

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
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, boolean>>({});
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [isNavigating, setIsNavigating] = useState(false);



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
        // Intento normal
        const res = await fetch(`/api/quizzes/${quizId}/questions`);

        const data = await res.json();

        // Filtrar preguntas inapropiadas para menores
        return ageGroup === 'child'
          ? data.filter((q: Question) => !q.content.includes('alcohol'))
          : data;


        // Si es quiz público y falla por autenticación, reintentar sin credenciales
        if (res.status === 401 && PUBLIC_QUIZ_IDS.includes(numericQuizId)) {
          const publicRes = await fetch(`/api/quizzes/${quizId}/questions`, {
            credentials: 'omit' // No enviar cookies de autenticación
          });
          if (!publicRes.ok) throw new Error('Error fetching public quiz questions');
          return await publicRes.json();
        }

        if (!res.ok) throw new Error('Error fetching questions');
        return await res.json();
      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Reintentar solo si es quiz público
      return PUBLIC_QUIZ_IDS.includes(numericQuizId) && failureCount < 2;
    }
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

  // Initialize timer
  useEffect(() => {
    if (quiz && !loadingQuiz) {
      resetTimer(quiz.timeLimit);
      startTimer();
    }
  }, [quiz, loadingQuiz]);

  // Log errors
  useEffect(() => {
    if (questionsError) {
      console.error('Error loading questions:', questionsError);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las preguntas del cuestionario',
        variant: 'destructive',
      });
    }
  }, [questionsError]);

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

  // Answer selection
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
    setCorrectAnswers({ ...correctAnswers, [currentQuestionIndex]: isCorrect });
  };

  // Navigation
  const handleNextQuestion = async () => {
    if (!questions || isNavigating) return;

    setIsNavigating(true);

    try {
      if (currentQuestionIndex < questions.length - 1) {
        if (selectedAnswerId !== null && !answeredQuestions[currentQuestionIndex]) {
          submitCurrentAnswer();
        }

        await new Promise(resolve => setTimeout(resolve, 500));
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

  // Text answer handler
  const handleTextAnswerSubmit = () => {
    if (!questions || !textAnswers[questions[currentQuestionIndex].id]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    const studentAnswer: StudentAnswer = {
      questionId: currentQuestion.id,
      answerId: null,
      textAnswer: answerText,
      isCorrect: false,
      timeSpent: elapsedTime,
    };

    setStudentAnswers([...studentAnswers, studentAnswer]);
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestionIndex]: true });
  };

  // Finish quiz
  const handleFinishQuiz = async () => {
    if (!questions || !quiz) return;

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = studentAnswers
      .filter(a => a.isCorrect)
      .reduce((sum, a) => sum + (questions.find(q => q.id === a.questionId)?.points || 0), 0);

    const resultsParams = new URLSearchParams({
      score: earnedPoints.toString(),
      total: totalPoints.toString(),
      correct: studentAnswers.filter(a => a.isCorrect).length.toString(),
      totalQuestions: questions.length.toString(),
      quizTitle: quiz.title,
      quizId: quiz.id.toString(),
      source: 'encuesta', // Identificar que viene de la encuesta
      ageGroup: ageGroup || '', // Agregar ageGroup
    });
    console.log('[DEBUG] Redirigiendo a PublicQuizResults con params:', resultsParams.toString());

    setLocation(`/public-quiz-results?${resultsParams.toString()}`);
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLoading = loadingQuiz || loadingQuestions;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={() => {
              pauseTimer();
              setLocation(`/encuestapage?ageGroup=${ageGroup || ''}`); // Redirigir explícitamente sin reset=true
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {quiz?.title || 'Cuestionario Público'}
            <Badge className="ml-2" variant="secondary">Público</Badge>
          </h2>
        </div>
        {quiz?.timeLimit && (
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
            <Timer className="text-gray-500 mr-1 h-5 w-5" />
            <span className="text-gray-700 font-medium">
              {formattedTime()}
            </span>
          </div>
        )}
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
                Pregunta {currentQuestionIndex + 1} de {questions?.length}
              </div>
              <div className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                {currentQuestion.points} puntos
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                {currentQuestion.type === 'text'
                  ? 'Responde la siguiente pregunta:'
                  : 'Selecciona la respuesta correcta:'}
              </h3>

              {currentQuestion.imageUrl && (
                <div className="mb-4 max-w-2xl mx-auto">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Imagen de la pregunta"
                    className="max-h-60 object-contain rounded"
                  />
                </div>
              )}

              <QuestionContent content={currentQuestion.content} />
            </div>

            {currentQuestion.type === 'text' ? (
              <div className="space-y-4">
                <Textarea
                  value={textAnswers[currentQuestion.id] || ''}
                  onChange={(e) => setTextAnswers({
                    ...textAnswers,
                    [currentQuestion.id]: e.target.value
                  })}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={4}
                  disabled={answeredQuestions[currentQuestionIndex]}
                />
                <Button
                  onClick={handleTextAnswerSubmit}
                  disabled={!textAnswers[currentQuestion.id]?.trim() || answeredQuestions[currentQuestionIndex]}
                >
                  {answeredQuestions[currentQuestionIndex] ? 'Respuesta enviada' : 'Confirmar respuesta'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {shuffledAnswers.map((answer, index) => {
                  const isSelected = selectedAnswerId === answer.id;
                  const isAnswered = answeredQuestions[currentQuestionIndex];
                  const isCorrect = answer.isCorrect;

                  return (
                    <QuizOption
                      key={answer.id}
                      optionLabel={String.fromCharCode(65 + index)}
                      content={answer.content}
                      state={
                        isAnswered
                          ? isCorrect
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

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={
                  isNavigating ||
                  (currentQuestion.type === 'multiple_choice' &&
                    !selectedAnswerId &&
                    !answeredQuestions[currentQuestionIndex])
                }
              >
                {isNavigating ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">↻</span>
                    Procesando...
                  </span>
                ) : (
                  currentQuestionIndex >= (questions?.length || 0) - 1
                    ? 'Ver resultados'
                    : 'Siguiente'
                )}
                {!isNavigating && currentQuestionIndex < (questions?.length || 0) - 1 && (
                  <ArrowRight className="ml-1 h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p>No hay preguntas disponibles en este cuestionario.</p>
            <Button
              variant="link"
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Volver atrás
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-4">Progreso</h3>
          <QuestionProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions?.length || 0}
            answeredQuestions={answeredQuestions}
            correctAnswers={correctAnswers}
            onQuestionClick={(index) => setCurrentQuestionIndex(index)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default PublicActiveQuiz;