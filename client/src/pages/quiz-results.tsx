import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MathDisplay } from '@/components/ui/math-display';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, BookOpen, Trophy, Timer, Target, ShieldCheck, ShieldOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startQuizResultsTour } from "@/lib/tour";
import type { QuizResult } from '@shared/quiz-types.js';
import { ExplanationModal } from './explicacion';
import { useSession } from "@/hooks/useSession";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { Brain, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { arithmeticMapNodes } from "@/data/arithmetic-map-data";
import { algebraMapNodes } from "@/data/algebra-map-data";
import { calculusMapNodes } from "@/data/calculus-map-data";
import { integralCalculusMapNodes } from "@/data/integral-calculus-map-data";
import { statisticsMapNodes } from "@/data/statistics-map-data";

interface Question {
  id: number;
  content: string;
  imageUrl?: string | null;
  answers: {
    id: number;
    content: string;
    isCorrect: boolean;
  }[];
}

function QuizResults() {
  const params = useParams();
  const progressId = params.progressId || params.categoryId;
  const [_, setLocation] = useLocation();
  const { session } = useSession();

  const searchParams = new URLSearchParams(window.location.search);
  const userId = searchParams.get('user_id');
  const queryClient = useQueryClient();
  console.log('[QuizResults] Render. progressId:', progressId, 'userId param:', userId);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);


  const isTraining = window.location.pathname.includes('/results/training/');

  const { data: results, isLoading: loadingResults, error } = useQuery<QuizResult>({
    queryKey: [isTraining ? `/api/results/training/${progressId}` : `/api/results/${progressId}`, userId],
    queryFn: async () => {
      const baseUrl = isTraining 
        ? `/api/results/training/${progressId}`
        : `/api/results/${progressId}`;
      const url = userId ? `${baseUrl}?user_id=${userId}` : baseUrl;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Error fetching results');
      return res.json();
    },
    enabled: !!progressId,
    refetchInterval: (query) => {
      if (isTraining) return false;
      const data = query.state.data as QuizResult;
      const hasPending = data?.answers.some(a => a.userResponse && a.answerId === null && !a.aiEvaluation);
      return hasPending ? 3000 : false;
    }
  });

  const { data: quizQuestions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${results?.quiz?.id}/questions`],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${results?.quiz?.id}/questions`);
      if (!res.ok) throw new Error('Error fetching quiz questions');
      return res.json();
    },
    enabled: !!results?.quiz?.id && !isTraining,
  });

  const { data: allUserQuizzes } = useQuery<any[]>({
    queryKey: ["user-quizzes"],
    queryFn: async () => {
      const res = await fetch("/api/user/quizzes", { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching all quizzes");
      return res.json();
    },
    enabled: !!results && session?.role === 'student',
  });

  // Memoized current node detection for cross-component use (navigation & celebration)
  const currentNode = useMemo(() => {
    if (!results) return null;

    const categoryId = results.quiz?.categoryId;
    const categoryName = (results.quiz as any)?.categoryName?.toLowerCase() || "";
    let nodes: any[] = [];

    if (categoryId === 1 || categoryName.includes("aritmética")) nodes = arithmeticMapNodes;
    else if (categoryId === 2 || categoryName.includes("álgebra")) nodes = algebraMapNodes;
    else if (categoryId === 4 || categoryName.includes("diferencial")) nodes = calculusMapNodes;
    else if (categoryId === 5 || categoryName.includes("integral")) nodes = integralCalculusMapNodes;
    else if (categoryId === 19 || categoryName.includes("estadística")) nodes = statisticsMapNodes;

    if (nodes.length === 0) return null;

    return nodes.find(n => {
      const isSubMatch = n.subcategoryId === results.quiz?.subcategoryId ||
        (n.additionalSubcategories && n.additionalSubcategories.includes(results.quiz?.subcategoryId));

      if (!isSubMatch) return false;

      // Match by keywords if present
      if (n.filterKeywords?.length) {
        const kw = n.filterKeywords.map((k: string) => k.toLowerCase());
        const matches = kw.some((k: string) => results.quiz?.title.toLowerCase().includes(k));
        if (!matches) return false;
      }

      if (n.excludeKeywords?.length) {
        const ex = n.excludeKeywords.map((k: string) => k.toLowerCase());
        const excluded = ex.some((k: string) => results.quiz?.title.toLowerCase().includes(k));
        if (excluded) return false;
      }

      return true;
    });
  }, [results]);

  const handleGoBack = () => {
    // Invalidate queries to ensure map progress is fresh
    queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });

    if (userId) {
      setLocation(`/admin/users?viewProgress=${userId}`);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const isFreshQuiz = searchParams.get('source') === 'quiz';

      if (isFreshQuiz) {
        const categoryId = results?.quiz?.categoryId || params.categoryId;
        let p = '';
        if (currentNode) {
          p = `&focusNode=${currentNode.id}&source=quiz`;
        }
        setLocation(`/category/${categoryId}?view=roadmap${p}`);
      } else if (isTraining && results?.quiz?.categoryId) {
        // Redirigir al dashboard con parámetro para reabrir el diálogo de entrenamiento
        setLocation(`/dashboard?reopenTraining=${results.quiz.categoryId}`);
      } else {
        // Si no venimos de un quiz recién terminado, usamos el comportamiento normal de "atrás"
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Fallback si no hay historial previo
          setLocation('/dashboard');
        }
      }
    }
  };

  // Sync isVerified state from quiz data when results load
  useEffect(() => {
    if (results?.quiz && isVerified === null) {
      setIsVerified((results.quiz as any).isVerified ?? false);
    }
  }, [results?.quiz]);

  const verifyMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const res = await fetch(`/api/quizzes/${quizId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !isVerified }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al verificar');
      return res.json();
    },
    onSuccess: (data) => {
      setIsVerified(data.isVerified);
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
    },
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

  const isLoading = loadingResults || loadingQuestions || loadingFeedback;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Invalidate queries on mount as well to ensure latest progress if navigating via URL
    queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
  }, [queryClient]);

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

  // Mark feedback as read when viewed by student
  useEffect(() => {
    if (results && feedback?.feedback && session?.userId && session.role === 'student' && !userId) {
      fetch(`/api/quiz-submissions/${progressId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      }).catch(err => console.error('Error marking feedback as read:', err));
    }
  }, [results, feedback, session, progressId, userId]);

  const correctAnswers = results?.answers.filter((a) => a.isCorrect).length || 0;
  const totalQuestions = results?.answers.length || 0;
  const hasPendingAI = results?.answers.some(a => a.userResponse && a.answerId === null && !a.aiEvaluation);

  const formatTimeSpent = (seconds?: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswerContent = (answer: any): string | undefined => {
    // For training results, the options are embedded in the answer.question object
    if (isTraining && answer.question?.options) {
      const correctAnswer = answer.question.options.find((o: any) => o.isCorrect);
      return correctAnswer?.text;
    }
    
    if (!quizQuestions) return undefined;
    const fullQuestion = quizQuestions.find((q: any) => q.id === answer.question?.id);
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
      `Resultados: ${results.quiz?.title || 'Entrenamiento'}`,
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

          {/* Botón Verificar — visible solo para Alan (id=2) */}
          {session?.userId === 2 && results?.quiz.id && (
            <button
              onClick={() => verifyMutation.mutate(results.quiz.id)}
              disabled={verifyMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isVerified
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
            >
              {isVerified ? (
                <><ShieldCheck className="h-4 w-4" /> Verificado</>
              ) : (
                <><ShieldOff className="h-4 w-4" /> Verificar cuestionario</>
              )}
            </button>
          )}
          {[68, 69, 72, 73].includes(results?.quiz.id || 0) && (
            <Button
              onClick={() => {
                if (!results) return;

                // Calcular puntaje en escala 0-20 (el quiz es sobre 10)
                const score = (results.answers.filter(a => a.isCorrect).length / results.answers.length) * 20;

                // Determinar si es G1 (Lenguaje) o G2 (Matemáticas)
                const field = [68, 69].includes(results.quiz.id) ? 'G1' : 'G2';

                // Guardar resultado para que la encuesta lo procese
                sessionStorage.setItem('quizResult', JSON.stringify({
                  field,
                  value: Math.round(score), // Redondear a entero
                  quizId: results.quiz.id
                }));

                // Volver a la encuesta
                setLocation('/encuestapage');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Volver a la Encuesta
            </Button>
          )}
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
            {hasPendingAI && (
              <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-blue-500/20 p-3 rounded-full mb-3 relative">
                  <Brain className="h-8 w-8 text-blue-400" />
                  <div className="absolute -top-1 -right-1">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-blue-300 mb-2">¡Cuestionario en revisión!</h3>
                <p className="text-slate-400 max-w-md">
                  Nuestra inteligencia artificial está evaluando tus respuestas abiertas.
                  Los resultados se actualizarán automáticamente en unos segundos.
                </p>
              </div>
            )}

            {/* Header Card */}
            <Card className={`bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl transition-opacity duration-500 ${hasPendingAI ? 'opacity-50' : 'opacity-100'}`}>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 text-white">{results.quiz.title}</h3>
                  <div className="inline-flex items-center bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-sm border border-blue-500/20">
                    <Clock className="mr-2 h-4 w-4" />
                    Completado en {results.progress ? formatTimeSpent(results.progress.timeSpent) : '--'} minutos
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
                      {results.progress ? Math.floor((results.progress.timeSpent || 0) / totalQuestions / 60) : 0}
                      <span className="text-xl text-slate-500">
                        :{results.progress ? Math.floor((results.progress.timeSpent || 0) / totalQuestions % 60).toString().padStart(2, '0') : '00'}
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
                        {/* Display image if the question has one */}
                        {(() => {
                           const qId = answer.question?.id;
                           const fullQuestion = quizQuestions?.find((q: any) => q.id === qId);
                           const imageUrl = fullQuestion?.imageUrl || answer.question?.imageUrl;
                          if (imageUrl) {
                            return (
                              <div className="mt-4 flex justify-center">
                                <img src={imageUrl} alt="Imagen de la pregunta" className="max-w-full h-auto max-h-64 rounded-lg shadow-md border border-white/10" />
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                          ) : answer.userResponse ? (
                            <div className="text-slate-200 italic">
                              {renderContent(answer.userResponse)}
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

                      {answer.aiEvaluation && (
                        <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                            <BookOpen className="h-4 w-4" />
                            Evaluación por IA
                          </div>
                          <div className="text-slate-300 text-sm italic">
                            {renderContent(answer.aiEvaluation.feedback || answer.aiEvaluation.explanation || (typeof answer.aiEvaluation === 'string' ? answer.aiEvaluation : ''))}
                          </div>
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
                  <h4 className="text-lg font-semibold mb-3 text-purple-400">Comentarios del profesor</h4>
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