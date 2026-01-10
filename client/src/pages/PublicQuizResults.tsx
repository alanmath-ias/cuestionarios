import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, BookOpen, Trophy, Timer, Target, Loader2 } from 'lucide-react';
import { ExplanationModal } from './explicacion';
import { ContentRenderer } from '@/components/ContentRenderer';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  content: string;
  points: number;
  answers: {
    id: number;
    content: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  explanation?: string;
}

interface StudentAnswer {
  questionId: number;
  answerId: number | null;
  textAnswer?: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface SessionResults {
  quizId: number;
  studentAnswers: StudentAnswer[];
  timestamp: number;
}

function PublicQuizResults() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  // URL Params for summary
  const score = parseFloat(searchParams.get('score') || '0');
  const totalPoints = parseFloat(searchParams.get('total') || '0');
  const correctCount = parseInt(searchParams.get('correct') || '0');
  const totalQuestionsCount = parseInt(searchParams.get('totalQuestions') || '0');
  const quizTitle = searchParams.get('quizTitle') || 'Cuestionario';
  const quizIdParam = searchParams.get('quizId');

  // Session Storage Data for detailed review
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('publicQuizResults');
      if (stored) {
        setSessionResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error parsing session results", e);
    }
  }, []);

  const quizId = sessionResults?.quizId || (quizIdParam ? parseInt(quizIdParam) : 0);

  // Fetch questions to render details
  const { data: questions, isLoading: loadingQuestions } = useQuery<Question[]>({
    queryKey: [`/api/quizzes/${quizId}/questions`],
    queryFn: async () => {
      if (!quizId) return [];
      // Try public fetch
      const res = await fetch(`/api/quizzes/${quizId}/questions`, { credentials: 'omit' });
      if (!res.ok) {
        // Fallback to regular fetch if needed (though public should work)
        const res2 = await fetch(`/api/quizzes/${quizId}/questions`);
        if (!res2.ok) throw new Error('Error fetching questions');
        return res2.json();
      }
      return res.json();
    },
    enabled: !!quizId,
  });

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

  const handleGoBack = () => {
    setLocation('/');
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalTimeSpent = sessionResults?.studentAnswers.reduce((acc, curr) => acc + curr.timeSpent, 0) || 0;
  const preciseScore = totalPoints > 0 ? ((score / totalPoints) * 10).toFixed(1) : "0.0";

  const handleDownloadResults = () => {
    if (!sessionResults || !questions) return;

    const headers = ['Pregunta', 'Tu Respuesta', 'Respuesta Correcta', 'Tiempo'];
    const rows = sessionResults.studentAnswers.map((answer, index) => {
      const question = questions.find(q => q.id === answer.questionId);
      const selectedAnswer = question?.answers.find(a => a.id === answer.answerId);
      const correctAnswer = question?.answers.find(a => a.isCorrect);

      return [
        `Pregunta ${index + 1}`,
        selectedAnswer?.content || answer.textAnswer || 'No respondida',
        correctAnswer?.content || 'No disponible',
        formatTimeSpent(answer.timeSpent)
      ];
    });

    rows.push([
      `Puntuación: ${preciseScore}/10`,
      `Correctas: ${correctCount}/${totalQuestionsCount}`,
      `Tiempo total: ${formatTimeSpent(totalTimeSpent)}`,
      ''
    ]);

    const csvContent = [
      `Resultados: ${quizTitle}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_${quizTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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

        <div className="space-y-8">
          {/* Header Card */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3 text-white">{quizTitle}</h3>
                <div className="inline-flex items-center bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-sm border border-blue-500/20">
                  <Clock className="mr-2 h-4 w-4" />
                  Completado en {formatTimeSpent(totalTimeSpent)} minutos
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {correctCount}<span className="text-xl text-slate-500">/{totalQuestionsCount}</span>
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
                    {totalQuestionsCount > 0 ? Math.floor(totalTimeSpent / totalQuestionsCount / 60) : 0}
                    <span className="text-xl text-slate-500">
                      :{totalQuestionsCount > 0 ? Math.floor((totalTimeSpent / totalQuestionsCount) % 60).toString().padStart(2, '0') : '00'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Review */}
          {sessionResults && questions && !loadingQuestions ? (
            <>
              <h4 className="font-bold text-xl text-white px-2">Revisión de Preguntas</h4>
              <div className="space-y-6">
                {sessionResults.studentAnswers.map((answer, index) => {
                  const question = questions.find(q => q.id === answer.questionId);
                  if (!question) return null;

                  const selectedAnswer = question.answers.find(a => a.id === answer.answerId);
                  const correctAnswer = question.answers.find(a => a.isCorrect);

                  return (
                    <div key={index} className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
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
                          <ContentRenderer content={question.content} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className={`border rounded-xl p-4 ${answer.isCorrect
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <div className={`text-sm font-medium mb-2 ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              Tu respuesta:
                            </div>
                            <div className="text-slate-200">
                              {selectedAnswer ? (
                                <ContentRenderer content={selectedAnswer.content} />
                              ) : answer.textAnswer ? (
                                answer.textAnswer
                              ) : (
                                <span className="text-slate-500 italic">No respondida</span>
                              )}
                            </div>
                          </div>

                          {!answer.isCorrect && (
                            <div className="border rounded-xl p-4 bg-green-500/10 border-green-500/30">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-medium mb-2 text-green-400">Respuesta correcta:</div>
                                  <div className="text-slate-200">
                                    {correctAnswer ? (
                                      <ContentRenderer content={correctAnswer.content} />
                                    ) : (
                                      <span className="text-slate-500">No disponible</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRequestExplanation(
                                    question.id,
                                    question.content,
                                    correctAnswer?.content || ''
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : loadingQuestions ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-white/5">
              <p>No hay detalles disponibles para esta sesión.</p>
              <p className="text-sm mt-2">Los detalles se pierden si recargas la página.</p>
            </div>
          )}

          <div className="flex justify-center mt-8 pb-8">
            <Button
              className="flex items-center bg-white text-slate-900 hover:bg-slate-200 px-6 py-6 text-lg h-auto rounded-xl shadow-lg transition-all transform hover:scale-105"
              onClick={handleDownloadResults}
              disabled={!sessionResults}
            >
              <Download className="mr-3 h-5 w-5" />
              Descargar resultados
            </Button>
          </div>
        </div>

        {showExplanation && currentExplanation && (
          <ExplanationModal
            questionId={currentExplanation.questionId}
            question={currentExplanation.question}
            correctAnswer={currentExplanation.correctAnswer}
            quizTitle={quizTitle}
            onClose={() => setShowExplanation(false)}
          />
        )}
      </div>
    </div>
  );
}

export default PublicQuizResults;