import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, BookOpen, Trophy, Timer, Target, Loader2, Lock, Video, Sparkles, MessageCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { ExplanationModal } from './explicacion';
import { ContentRenderer } from '@/components/ContentRenderer';
import { Badge } from '@/components/ui/badge';
import { FaWhatsapp } from 'react-icons/fa';

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
  const numericScore = parseFloat(preciseScore);

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

  // --- CTA Logic ---
  const hasErrors = correctCount < totalQuestionsCount;
  const [aiDiagnosis, setAiDiagnosis] = useState<any | null>(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);

  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (!hasErrors || !sessionResults || !questions || aiDiagnosis) return;

      setLoadingDiagnosis(true);
      try {
        const wrongAnswers = questions
          .filter(q => {
            const answer = sessionResults.studentAnswers.find(a => a.questionId === q.id);
            return !answer || !answer.isCorrect;
          })
          .map(q => ({ question: q.content }));

        const res = await fetch('/api/generate-diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizTitle,
            score: numericScore,
            totalQuestions: totalQuestionsCount,
            wrongAnswers
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.diagnosis) {
            setAiDiagnosis(data.diagnosis);
          }
        }
      } catch (error) {
        console.error("Error fetching diagnosis:", error);
      } finally {
        setLoadingDiagnosis(false);
      }
    };

    if (sessionResults && questions && hasErrors) {
      fetchDiagnosis();
    }
  }, [sessionResults, questions, hasErrors, numericScore, quizTitle, totalQuestionsCount]);

  const getDiagnosisContent = (score: number) => {
    if (score >= 8) {
      return {
        level: "Avanzado",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        message: "¡Excelente nivel! Tienes bases sólidas.",
        prescription: aiDiagnosis || "Estás listo para retos mayores. Te recomendamos profundizar con temas avanzados y asegurar tu excelencia académica.",
        icon: <Trophy className="w-8 h-8 text-green-400" />
      };
    } else if (score >= 5) {
      return {
        level: "En Desarrollo",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        message: "Vas por buen camino, pero falta consistencia.",
        prescription: aiDiagnosis || "Detectamos algunos conceptos que necesitan refuerzo. Con práctica constante y explicaciones claras, subirás de nivel rápidamente.",
        icon: <Target className="w-8 h-8 text-yellow-400" />
      };
    } else {
      return {
        level: "Necesita Refuerzo",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        message: "Detectamos vacíos fundamentales.",
        prescription: aiDiagnosis || "Es crucial fortalecer tus bases ahora para evitar dificultades futuras. Un plan de estudio personalizado es la mejor solución.",
        icon: <BookOpen className="w-8 h-8 text-red-400" />
      };
    }
  };

  const diagnosis = getDiagnosisContent(numericScore);

  const whatsappMessage = encodeURIComponent(
    `Hola, acabo de hacer el diagnóstico de Aritmética y saqué ${preciseScore}/10. Tengo mi reporte de resultados, ¿podemos revisarlo en una clase?`
  );
  const whatsappUrl = `https://wa.me/573208056799?text=${whatsappMessage}`;

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

          {/* Diagnosis & Next Steps Section (New CTA) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Diagnosis */}
            <Card className={`lg:col-span-1 ${diagnosis.bg} ${diagnosis.border} backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${diagnosis.color}`}>
                  {diagnosis.icon}
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className={`text-lg font-bold ${diagnosis.color} mb-2`}>{diagnosis.level}</h4>
                  <p className="text-slate-200 font-medium">{diagnosis.message}</p>
                </div>

                <div className="text-slate-400 text-sm leading-relaxed">
                  {loadingDiagnosis ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Estamos analizando tus respuestas, un momento por favor...
                    </span>
                  ) : Array.isArray(aiDiagnosis) ? (
                    <div className="space-y-3 mt-4">
                      <p className="text-slate-300 font-medium border-b border-white/10 pb-2">Áreas a reforzar:</p>
                      {aiDiagnosis.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                          {item.status === 'danger' ? (
                            <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <div className="text-slate-200 font-bold text-sm">{item.topic}</div>
                            <div className="text-slate-400 text-xs mt-1">{item.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{typeof aiDiagnosis === 'string' ? aiDiagnosis : diagnosis.prescription}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold shadow-lg shadow-white/10"
                    onClick={handleDownloadResults}
                    disabled={!sessionResults}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Informe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Next Steps (Upsell) */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Tu Ruta de Aprendizaje Recomendada
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: App Subscription */}
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Video className="w-6 h-6 text-purple-400" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-none">
                      Recomendado
                    </Badge>
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    {hasErrors ? "¡Convierte tus errores en aprendizaje!" : "¡Potencia tu Talento!"}
                  </h4>
                  <div className="text-slate-400 text-sm mb-4 space-y-2">
                    {hasErrors ? (
                      <>
                        <p>Vemos que fallaste algunas preguntas. Regístrate GRATIS y obtén:</p>
                        <ul className="space-y-1 mt-2">
                          <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-purple-400" /> Explicaciones inteligentes (Créditos de regalo)</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-purple-400" /> Videos de refuerzo por tema</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-purple-400" /> Acceso a cuestionarios esenciales</li>
                        </ul>
                      </>
                    ) : (
                      <p>Ya dominas lo básico. Regístrate para acceder a retos avanzados, seguimiento de progreso y contenido exclusivo para expertos.</p>
                    )}
                  </div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      // Construct full import data
                      // Note: sessionResults only has answers and timestamp, so we combine with current scope vars
                      const importData = {
                        quizId: quizId,
                        score: score,
                        totalQuestionsCount: totalQuestionsCount,
                        answers: sessionResults?.studentAnswers || [],
                        aiDiagnosis: aiDiagnosis // Save the AI report for the dashboard
                      };

                      sessionStorage.setItem('publicQuizResults', JSON.stringify(importData));

                      // We rely on welcome.tsx to derive the category from this data

                      setLocation('/auth?mode=register');
                    }}
                  >
                    Crear Cuenta Gratis
                  </Button>
                </div>

                {/* Option 2: Private Classes (WhatsApp) */}
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-8 -mt-8" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <FaWhatsapp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">Clase de Refuerzo</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Analiza tus errores con un profesor y asegura tu aprendizaje.
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                    onClick={() => window.open(whatsappUrl, '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Agendar Clase
                  </Button>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    *Recuerda descargar tu informe para compartirlo con el profe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center justify-center mt-12 text-slate-500 animate-bounce">
            <p className="text-sm font-medium mb-2">Desliza para ver el detalle</p>
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* Detailed Review */}
          {sessionResults && questions && !loadingQuestions ? (
            <>
              <h4 className="font-bold text-xl text-white px-2 mt-8">Revisión Detallada</h4>
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