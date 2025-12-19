import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import { startQuizResultsTour } from "@/lib/tour";
import type { QuizResult } from '@shared/quiz-types.js';
// En la parte superior del archivo QuizResults.tsx, añade:
import { useState } from 'react';
import { ExplanationModal } from './explicacion'; // Asegúrate de crear este componente


interface Question {
  id: number;
  content: string;
  answers: {
    id: number;
    content: string;
    isCorrect: boolean;
  }[];
}


function QuizResults() {
  const { progressId } = useParams<{ progressId: string }>();
  //const [_, setLocation] = useLocation();

  const handleGoBack = () => {
    // Verificamos si hay historial previo
    if (window.history.state && window.history.state.idx > 0) {
      window.history.back();
    } else {
      // Si no hay historial, redirigimos a una ruta por defecto
      window.location.href = '/';
    }
  };


  // Obtener el parámetro `user_id` de la URL
  const searchParams = new URLSearchParams(window.location.search);
  const userId = searchParams.get('user_id');

  const { data: results, isLoading: loadingResults } = useQuery<QuizResult>({
    queryKey: [`/api/results/${progressId}`, userId],
    queryFn: async () => {
      const url = userId
        ? `/api/results/${progressId}?user_id=${userId}`
        : `/api/results/${progressId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error fetching results');
      return res.json();
    },
    enabled: !!progressId, // Solo depende de `progressId`
  });

  const { data: quizQuestions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${results?.quiz.id}/questions`],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${results?.quiz.id}/questions`);
      if (!res.ok) throw new Error('Error fetching quiz questions');
      return res.json();
    },
    enabled: !!results?.quiz.id,
  });

  const { data: feedback, isLoading: loadingFeedback } = useQuery({
    queryKey: ['quiz-feedback', progressId],
    queryFn: async () => {
      const res = await fetch(`/api/quiz-feedback/${progressId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!progressId,
  });

  useEffect(() => {
    if (results) {
      console.log('Quiz results data:', results);
    }
    if (quizQuestions) {
      console.log('Quiz questions data:', quizQuestions);
    }
  }, [results, quizQuestions]);

  const isLoading = loadingResults || loadingQuestions;

  // Auto-start tour for new users
  useEffect(() => {
    if (!isLoading && results?.progress?.userId) {
      const tourKey = `tour_seen_quiz_results_${results.progress.userId}`;
      const hasSeenTour = localStorage.getItem(tourKey);
      if (!hasSeenTour) {
        setTimeout(() => {
          startQuizResultsTour();
          localStorage.setItem(tourKey, 'true');
        }, 1000);
      }
    }
  }, [isLoading, results]);

  const correctAnswers = results?.answers.filter((a) => a.isCorrect).length || 0;
  const totalQuestions = results?.answers.length || 0;

  const formatTimeSpent = (seconds?: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswerContent = (answer: any): string | undefined => {
    if (!quizQuestions) return undefined;
    const fullQuestion = quizQuestions.find((q: any) => q.id === answer.question.id);
    const correctAnswer = fullQuestion?.answers.find((a: any) => a.isCorrect);
    return correctAnswer?.content;
  };

  // Función mejorada para parsear contenido (preguntas y respuestas)
  const renderContent = (content: string) => {
    if (!content) return null;

    return content.split('¡').map((part, i) => {
      if (i % 2 === 0) {
        return <span key={i}>{part}</span>;
      } else {
        return <MathDisplay key={i} math={part.trim()} inline />;
      }
    });
  };

  //Puntaje preciso:
  const preciseScore = ((correctAnswers / totalQuestions) * 10).toFixed(1);

  const handleDownloadResults = () => {
    if (!results) return;

    const headers = ['Pregunta', 'Tu Respuesta', 'Respuesta Correcta', 'Tiempo'];
    const rows = results.answers.map((answer, index) => [
      `Pregunta ${index + 1}`,
      answer.answerDetails?.content || 'No respondida',
      getCorrectAnswerContent(answer) || 'No disponible',
      formatTimeSpent(answer.timeSpent)
    ]);

    rows.push([
      `Puntuación: ${preciseScore}/10`,  // Usar el mismo cálculo
      `Correctas: ${correctAnswers}/${totalQuestions}`,
      `Tiempo total: ${formatTimeSpent(results.progress.timeSpent)}`,
      ''
    ]);

    const csvContent = [
      `Resultados: ${results.quiz.title}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_${results.quiz.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dentro del componente QuizResults, añade este estado:
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<{
    question: string;
    correctAnswer: string;
  } | null>(null);

  // Añade esta función para manejar la solicitud de explicación
  const handleRequestExplanation = (question: string, correctAnswer: string) => {
    setCurrentExplanation({ question, correctAnswer });
    setShowExplanation(true);
  };

  return (
    <div id="quizResults" className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold">Resultados del Cuestionario</h2>
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
      ) : results ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">{results.quiz.title}</h3>
              <div className="inline-flex items-center bg-blue-100 text-primary px-3 py-1.5 rounded-full text-sm">
                <Clock className="text-primary mr-1 h-4 w-4" />
                Completado en {formatTimeSpent(results.progress.timeSpent)} minutos
              </div>
            </div>

            <div id="tour-score-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                <div className="text-sm font-medium text-blue-600 mb-1">Puntuación</div>
                <div className="text-3xl font-bold text-blue-700">
                  {preciseScore}<span className="text-lg text-blue-400">/10</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                <div className="text-sm font-medium text-green-600 mb-1">Preguntas Correctas</div>
                <div className="text-3xl font-bold text-green-700">
                  {correctAnswers}<span className="text-lg text-green-400">/{totalQuestions}</span>
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4 text-center border border-teal-100">
                <div className="text-sm font-medium text-teal-600 mb-1">Tiempo promedio</div>
                <div className="text-3xl font-bold text-teal-700">
                  {Math.floor((results.progress.timeSpent || 0) / totalQuestions / 60)}
                  <span className="text-lg text-teal-400">
                    :{Math.floor((results.progress.timeSpent || 0) / totalQuestions % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-xs text-teal-500">minutos por pregunta</div>
              </div>
            </div>

            <h4 className="font-semibold text-lg mb-4">Resumen de preguntas</h4>

            <div className="space-y-4 mb-6">
              {results.answers.map((answer, index) => {
                const correctContent = getCorrectAnswerContent(answer);

                return (
                  <div key={answer.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 flex justify-between items-center">
                      <div className="font-medium">Pregunta {index + 1}</div>
                      {answer.isCorrect ? (
                        <div className="text-green-600 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Correcta
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Incorrecta
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        {renderContent(answer.question.content)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`border rounded p-3 ${answer.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                          }`}>
                          <div className="text-sm font-medium mb-1">Tu respuesta:</div>
                          {answer.answerDetails ? (
                            <div className="text-gray-700">
                              {renderContent(answer.answerDetails.content)}
                            </div>
                          ) : (
                            <span className="text-gray-500">No respondida</span>
                          )}
                        </div>

                        {!answer.isCorrect && (
                          <div className="border rounded p-3 bg-green-50 border-green-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium mb-1">Respuesta correcta:</div>
                                {correctContent ? (
                                  <div className="text-gray-700">
                                    {renderContent(correctContent)}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">
                                    {loadingQuestions ? 'Cargando...' : 'No disponible'}
                                  </span>
                                )}
                              </div>
                              <Button
                                id="tour-explanation-button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestExplanation(
                                  answer.question.content,
                                  correctContent || ''
                                )}
                                className="ml-2"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Ver Explicación
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {(answer.answerDetails?.explanation || answer.correctAnswer?.explanation) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                          <strong className="text-blue-700">Explicación:</strong>
                          <span className="text-gray-700 ml-1">
                            {answer.answerDetails?.explanation || answer.correctAnswer?.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!loadingFeedback && (
              <Card className="mt-6 border border-purple-100">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-2 text-purple-700">Retroalimentación del profesor</h4>
                  {feedback?.feedback ? (
                    <div className="text-gray-700 whitespace-pre-wrap bg-purple-50 p-3 rounded">
                      {feedback.feedback}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Tu profesor aún no ha enviado comentarios.</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="flex items-center bg-white hover:bg-gray-50 border-gray-300"
                onClick={handleDownloadResults}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar resultados
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No se encontraron resultados.
        </div>
      )}

      {showExplanation && currentExplanation && (
        <ExplanationModal
          question={currentExplanation.question}
          correctAnswer={currentExplanation.correctAnswer}
          quizTitle={results?.quiz.title || 'Matemáticas'} // Asegúrate de pasar el título
          onClose={() => setShowExplanation(false)}
        />
      )}

    </div>

  );




}

export default QuizResults;