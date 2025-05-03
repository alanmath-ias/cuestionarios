import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { QuizResult } from '@/shared/quiz-types';
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

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Enviando feedback para progressId:", progressId);

      const res = await fetch('/api/quiz-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          text: feedbackText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar feedback');
      }
    },
    onSuccess: () => {
      toast.success('Feedback enviado correctamente');
      setFeedbackText('');
    },
    onError: (error) => {
      toast.error('Error al enviar el feedback: ' + error.message);
    },
  });
  

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      toast.warning('Escribe algo de feedback antes de enviarlo');
      return;
    }
    mutation.mutate();
  };

  useEffect(() => {
    console.log("🧩 Admin Review Results:", results);
    console.log("🧩 Admin Review Questions:", quizQuestions);
  }, [results, quizQuestions]);

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

  const renderQuestionContent = (content: string) => {
    return content.split('*').map((part, i) => (
      i % 2 === 0 ? <span key={i}>{part}</span> : <MathDisplay key={i} math={part.trim()} inline />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" className="mr-3" onClick={() => setLocation('/admin/calificar')}>
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
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Puntuación</div>
                <div className="text-3xl font-bold text-primary">{results.progress.score?.toFixed(1)}/10</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Correctas</div>
                <div className="text-3xl font-bold text-green-500">{correctAnswers}/{totalQuestions}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-gray-500 mb-1">Tiempo promedio</div>
                <div className="text-3xl font-bold text-teal-500">
                  {Math.floor((results.progress.timeSpent || 0) / totalQuestions / 60)}:
                  {(Math.floor((results.progress.timeSpent || 0) / totalQuestions % 60)).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500">por pregunta</div>
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
                        <div className="text-green-500 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Correcta
                        </div>
                      ) : (
                        <div className="text-red-500 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> Incorrecta
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        {question ? renderQuestionContent(question.content) : 'Contenido no disponible'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`border rounded p-3 ${answer.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                          <div className="text-sm font-medium mb-1">Respuesta del estudiante:</div>
                          {answer.answerDetails ? (
                            <MathDisplay math={answer.answerDetails.content} />
                          ) : (
                            <span className="text-gray-500">No respondida</span>
                          )}
                        </div>

                        {!answer.isCorrect && (
                          <div className="border rounded p-3 bg-green-50 border-green-500">
                            <div className="text-sm font-medium mb-1">Respuesta correcta:</div>
                            {correctContent ? (
                              <MathDisplay math={correctContent} />
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
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Escribe aquí tu retroalimentación general para el estudiante..."
              className="mb-4"
            />
            <Button onClick={handleSendFeedback} disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>No se encontraron resultados.</div>
      )}
    </div>
  );
}

export default AdminQuizReview;
