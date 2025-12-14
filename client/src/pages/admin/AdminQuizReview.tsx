import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { QuizResult } from '@shared/quiz-types';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function AdminQuizReview() {
  const { progressId } = useParams<{ progressId: string }>();
  const [_, setLocation] = useLocation();
  const [feedbackText, setFeedbackText] = useState('');

  const { data: results, isLoading: loadingResults } = useQuery<QuizResult>({
    queryKey: [`/api/results/${progressId}`],
  });

  const { data: quizQuestions, isLoading: loadingQuestions } = useQuery<any[]>({
    queryKey: [`/api/quizzes/${results?.quiz.id}/questions`],
    enabled: !!results?.quiz.id,
  });

  const { data: existingFeedback, refetch: refetchFeedback } = useQuery({
    queryKey: ['quiz-feedback', progressId],
    queryFn: async () => {
      const res = await fetch(`/api/quiz-feedback/${progressId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!progressId,
  });


  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/quiz-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          text: feedbackText,
          quizSubmissionId: results?.progress.id
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar feedback');
      }

      const submissionRes = await fetch('/api/update-quiz-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          feedback: feedbackText
        }),
      });

      if (!submissionRes.ok) {
        throw new Error('Error al actualizar la submission');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Feedback enviado correctamente');
      setFeedbackText('');
      refetchFeedback();
    },
    onError: (error) => {
      toast.error('Error al enviar el feedback: ' + error.message);
    },
  });
  const isLoading = mutation.status === "pending";
  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      toast.warning('Escribe algo de feedback antes de enviarlo');
      return;
    }
    mutation.mutate();
  };

  useEffect(() => {
    if (existingFeedback?.feedback) {
      setFeedbackText(existingFeedback.feedback);
    }
  }, [existingFeedback]);

  const correctAnswers = results?.answers.filter(a => a.isCorrect).length || 0;
  const totalQuestions = results?.answers.length || 0;

  const formatTimeSpent = (seconds?: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswerContent = (answer: any): string | undefined => {
    if (!quizQuestions) return undefined;
    const fullQuestion = quizQuestions.find(q => q.id === answer.question.id);
    const correctAnswer = fullQuestion?.answers.find((a: any) => a.isCorrect);
    return correctAnswer?.content;
  };

  // Función mejorada para parsear contenido
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


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-semibold">Revisión de Cuestionario</h2>
      </div>

      {loadingResults || loadingQuestions ? (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                <div className="text-sm font-medium text-blue-600 mb-1">Puntuación</div>
                <div className="text-3xl font-bold text-blue-700">
                  {results.progress.score?.toFixed(1)}<span className="text-lg text-blue-400">/10</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                <div className="text-sm font-medium text-green-600 mb-1">Correctas</div>
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
                <div className="text-xs text-teal-500">por pregunta</div>
              </div>
            </div>

            <h4 className="font-semibold text-lg mb-4">Resumen de preguntas</h4>

            <div className="space-y-4 mb-10">
              {results.answers.map((answer, index) => {
                const correctContent = getCorrectAnswerContent(answer);
                const question = quizQuestions?.find((q) => q.id === answer.question.id);
                return (
                  <div key={answer.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 flex justify-between items-center">
                      <div className="font-medium">Pregunta {index + 1}</div>
                      {answer.isCorrect ? (
                        <div className="text-green-600 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Correcta
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> Incorrecta
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        {question?.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={question.imageUrl}
                              alt="Imagen de la pregunta"
                              className="max-h-40 object-contain rounded border"
                            />
                          </div>
                        )}
                        {question ? renderContent(question.content) : 'Contenido no disponible'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`border rounded p-3 ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="text-sm font-medium mb-1">Respuesta del estudiante:</div>
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
                            <div className="text-sm font-medium mb-1">Respuesta correcta:</div>
                            {correctContent ? (
                              <div className="text-gray-700">
                                {renderContent(correctContent)}
                              </div>
                            ) : (
                              <span className="text-gray-500">No disponible</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="font-semibold text-lg mb-2">Retroalimentación para el estudiante</h4>

            {existingFeedback?.feedback && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800 mb-1">Feedback existente:</h5>
                <p className="text-purple-700 whitespace-pre-wrap">{existingFeedback.feedback}</p>
              </div>
            )}

            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Escribe aquí tu retroalimentación general para el estudiante..."
              className="mb-4 min-h-[120px]"
            />

            <Button
              onClick={handleSendFeedback}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? 'Enviando...' : existingFeedback?.feedback ? 'Actualizar Feedback' : 'Enviar Feedback'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No se encontraron resultados para revisar.
        </div>
      )}
    </div>
  );
}

export default AdminQuizReview;