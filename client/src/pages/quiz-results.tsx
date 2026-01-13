import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, BookOpen, Trophy, Timer, Target } from 'lucide-react';
import { startQuizResultsTour } from "@/lib/tour";
import type { QuizResult } from '@shared/quiz-types.js';
import { ExplanationModal } from './explicacion';
import { useSession } from "@/hooks/useSession";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

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
  const [_, setLocation] = useLocation();
  const { session } = useSession();

  const searchParams = new URLSearchParams(window.location.search);
  const userId = searchParams.get('user_id');

  const handleGoBack = () => {
    // Si hay un userId en los params, es un admin viendo resultados de otro usuario.
    // En este caso, el historial suele ser seguro (vino de una lista).
    if (userId) {
      window.history.back();
      return;
    }

    // Para el estudiante que acaba de terminar, history.back() lo lleva al Quiz,
    // el cual lo redirige de nuevo aquí (bucle). Por eso forzamos ir al dashboard.
    setLocation('/dashboard');
  };

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
    enabled: !!progressId,
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

  const isLoading = loadingResults || loadingQuestions;

  useEffect(() => {
    if (!isLoading && session?.userId && !session.tourStatus?.quizResults) {
      setTimeout(() => {
        startQuizResultsTour();
        fetch('/api/user/tour-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourType: 'quizResults' })
        });
      }, 1000);
    }
  }, [isLoading, session]);

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

  const renderContent = (content: string) => {
    if (!content) return null;
    // Split by both symmetric ¡...¡ and asymmetric ¡...! delimiters
    const parts = content.split(/(¡.*?¡|¡.*?!)/g);
    return parts.map((part, i) => {
      if (part.startsWith('¡') && (part.endsWith('¡') || part.endsWith('!'))) {
        // Extract content inside delimiters
        const mathContent = part.slice(1, -1);
        return <MathDisplay key={i} math={mathContent.trim()} inline />;
      } else {
        return <span key={i}>{part}</span>;
      }
    });
  };

  const preciseScore = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 10).toFixed(1) : "0.0";

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
      `Puntuación: ${preciseScore}/10`,
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

  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<{
    questionId: number;
    question: string;
    correctAnswer: string;
  } | null>(null);

  const handleRequestExplanation = (questionId: number, question: string, correctAnswer: string) => {
    setCurrentExplanation({ questionId, question, correctAnswer });
    setShowExplanation(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div id="quizResults" className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-3xl font-bold text-white">Resultados</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse">
            <Card className="mb-6 bg-slate-900/50 border-white/10">
              <CardContent className="p-6">
                <div className="h-64 bg-slate-800/50 rounded-xl"></div>
              </CardContent>
            </Card>
          </div>
        ) : results ? (
          <div className="space-y-8">
            {/* Header Card */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 text-white">{results.quiz.title}</h3>
                  <div className="inline-flex items-center bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-sm border border-blue-500/20">
                    <Clock className="mr-2 h-4 w-4" />
                    Completado en {formatTimeSpent(results.progress.timeSpent)} minutos
                  </div>
                </div>

                <div id="tour-score-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5 hover:border-blue-500/30 transition-colors group">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                        <Trophy className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-400 mb-1">Puntuación</div>
                    <div className="text-4xl font-bold text-white">
                      {preciseScore}<span className="text-xl text-slate-500">/10</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5 hover:border-green-500/30 transition-colors group">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                        <Target className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-400 mb-1">Aciertos</div>
                    <div className="text-4xl font-bold text-white">
                      {correctAnswers}<span className="text-xl text-slate-500">/{totalQuestions}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5 hover:border-purple-500/30 transition-colors group">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
                        <Timer className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-400 mb-1">Tiempo/Pregunta</div>
                    <div className="text-4xl font-bold text-white">
                      {Math.floor((results.progress.timeSpent || 0) / totalQuestions / 60)}
                      <span className="text-xl text-slate-500">
                        :{Math.floor((results.progress.timeSpent || 0) / totalQuestions % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h4 className="font-bold text-xl text-white px-2">Revisión de Preguntas</h4>

            <div className="space-y-6">
              {results.answers.map((answer, index) => {
                const correctContent = getCorrectAnswerContent(answer);

                return (
                  <div key={answer.id} className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="bg-slate-900/80 p-4 flex justify-between items-center border-b border-white/5">
                      <div className="font-medium text-slate-300">Pregunta {index + 1}</div>
                      {answer.isCorrect ? (
                        <div className="text-green-400 font-medium flex items-center bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Correcta
                        </div>
                      ) : (
                        <div className="text-red-400 font-medium flex items-center bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                          <XCircle className="h-4 w-4 mr-2" />
                          Incorrecta
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-6 text-lg text-slate-200">
                        {renderContent(answer.question.content)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`border rounded-xl p-4 ${answer.isCorrect
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                          }`}>
                          <div className={`text-sm font-medium mb-2 ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            Tu respuesta:
                          </div>
                          {answer.answerDetails ? (
                            <div className="text-slate-200">
                              {renderContent(answer.answerDetails.content)}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No respondida</span>
                          )}
                        </div>

                        {!answer.isCorrect && (
                          <div className="border rounded-xl p-4 bg-green-500/10 border-green-500/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium mb-2 text-green-400">Respuesta correcta:</div>
                                {correctContent ? (
                                  <div className="text-slate-200">
                                    {renderContent(correctContent)}
                                  </div>
                                ) : (
                                  <span className="text-slate-500">
                                    {loadingQuestions ? 'Cargando...' : 'No disponible'}
                                  </span>
                                )}
                              </div>
                              <Button
                                id="tour-explanation-button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestExplanation(
                                  answer.question.id,
                                  answer.question.content,
                                  correctContent || ''
                                )}
                                className="ml-2 border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Explicación
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {(answer.answerDetails?.explanation || answer.correctAnswer?.explanation) && (
                        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm">
                          <strong className="text-blue-400 block mb-1">Explicación:</strong>
                          <span className="text-slate-300">
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
              <Card className="mt-8 border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-3 text-purple-400">Retroalimentación del profesor</h4>
                  {feedback?.feedback ? (
                    <div className="text-slate-300 whitespace-pre-wrap bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                      {feedback.feedback}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Tu profesor aún no ha enviado comentarios.</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center mt-8 pb-8">
              <Button
                className="flex items-center bg-white text-slate-900 hover:bg-slate-200 px-6 py-6 text-lg h-auto rounded-xl shadow-lg transition-all transform hover:scale-105"
                onClick={handleDownloadResults}
              >
                <Download className="mr-3 h-5 w-5" />
                Descargar resultados
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No se encontraron resultados.
          </div>
        )}

        {showExplanation && currentExplanation && (
          <ExplanationModal
            questionId={currentExplanation.questionId}
            question={currentExplanation.question}
            correctAnswer={currentExplanation.correctAnswer}
            quizTitle={results?.quiz.title || 'Matemáticas'}
            onClose={() => setShowExplanation(false)}
          />
        )}
      </div>
      <FloatingWhatsApp
        message="Hola, acabo de terminar un cuestionario y me gustaría cotizar clases de refuerzo."
        tooltip="Cotizar Clases de Refuerzo"
      />
    </div>
  );
}

export default QuizResults;