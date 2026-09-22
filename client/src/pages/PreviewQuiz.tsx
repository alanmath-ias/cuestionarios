import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  BookOpen,
  AlertCircle,
  Loader2,
  Bot,
  Check,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Home,
  CheckCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentRenderer } from '@/components/ContentRenderer';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { cn } from '@/lib/utils';

interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  content: string;
  type: string;
  difficulty: number | string;
  points: number;
  imageUrl?: string;
  explanation?: string;
  answers: Answer[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  difficulty: string;
  timeLimit: number;
}

interface PreviewData {
  quiz: Quiz;
  questions: Question[];
}

function getQuestionSizeClass(text: string) {
  const clean = text.replace(/\\frac|\\{|\\}|\$|¡/g, '');
  if (clean.length < 60) return 'text-xl sm:text-2xl md:text-3xl font-bold';
  if (clean.length < 140) return 'text-lg sm:text-xl md:text-2xl font-semibold';
  return 'text-base sm:text-lg md:text-xl font-normal';
}

function getAnswerSizeClass(text: string) {
  const clean = text.replace(/\\frac|\\{|\\}|\$|¡/g, '');
  if (clean.length < 40) return 'text-base sm:text-lg';
  if (clean.length < 90) return 'text-sm sm:text-base';
  return 'text-xs sm:text-sm';
}

// Helper para copiar texto al portapapeles con fallback seguro
const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
};

export default function PreviewQuiz() {
  const { quizId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const [copiedAI, setCopiedAI] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/preview/${quizId}`],
    queryFn: async () => {
      const res = await fetch(`/api/preview/${quizId}`, { credentials: 'omit' });
      if (res.status === 403) throw new Error('NO_PREVIEW');
      if (res.status === 404) throw new Error('NOT_FOUND');
      if (!res.ok) throw new Error('ERROR');
      return res.json() as Promise<PreviewData>;
    },
    retry: false,
  });

  const total = data?.questions?.length ?? 0;

  const handleCopyAllForAI = async () => {
    if (!data?.quiz || !data?.questions || data.questions.length === 0) return;
    const { quiz, questions } = data;

    let md = `# CUESTIONARIO: ${quiz.title}\n`;
    if (quiz.description) md += `**Descripción:** ${quiz.description}\n`;
    md += `**Total de preguntas:** ${questions.length}\n`;
    if (quiz.timeLimit) md += `**Tiempo sugerido:** ${Math.round(quiz.timeLimit / 60)} minutos\n`;
    md += `\nInstrucciones para el asistente de IA:\n`;
    md += `1. Evalúa la precisión matemática, la formulación pedagógica y la calidad de este cuestionario (claridad de enunciados, corrección de la respuesta marcada como correcta y pertinencia de los distractores).\n`;
    md += `2. Al final, muestra en un resumen solo las preguntas que deben ser revisadas o corregidas dado algún problema con la pregunta o las respuestas (indicando el motivo o la corrección sugerida), para no tener que leer el diagnóstico de cada pregunta si no se desea.\n\n`;
    md += `---\n\n`;

    questions.forEach((q, idx) => {
      md += `### Pregunta ${idx + 1}\n`;
      md += `**Enunciado:**\n${q.content}\n\n`;
      if (q.imageUrl) {
        md += `*Imagen de referencia:* ${q.imageUrl}\n\n`;
      }
      if (q.answers && q.answers.length > 0) {
        md += `**Opciones de respuesta:**\n`;
        q.answers.forEach((ans: any, aIdx: number) => {
          const letter = String.fromCharCode(65 + aIdx);
          if (ans.isCorrect) {
            md += `- [x] **Opción ${letter} (CORRECTA):** ${ans.content}\n`;
          } else {
            md += `- [ ] **Opción ${letter} (Distractor):** ${ans.content}\n`;
          }
        });
        md += `\n`;
      }
      if (q.explanation) {
        md += `**Explicación:**\n${q.explanation}\n\n`;
      }
      md += `---\n\n`;
    });

    const success = await copyTextToClipboard(md.trim());
    if (success) {
      setCopiedAI(true);
      setTimeout(() => setCopiedAI(false), 2500);
      toast({
        title: '🤖 Copiado para IA',
        description: `${questions.length} preguntas con respuestas y distractores listos para pegar.`,
      });
    } else {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido al portapapeles.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectAnswer = (qIndex: number, answerId: number) => {
    if (selectedAnswers[qIndex] !== undefined) return; // Ya respondida, no permitir cambiar
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: answerId,
    }));
  };

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowResults(true);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const scrollByAmount = useCallback((amount: number, isRepeat: boolean) => {
    if (mainRef.current) {
      mainRef.current.scrollBy({
        top: amount,
        behavior: isRepeat ? 'auto' : 'smooth',
      });
    }
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!data || total === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollByAmount(140, e.repeat);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollByAmount(-140, e.repeat);
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        scrollByAmount(window.innerHeight * 0.7, false);
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        scrollByAmount(-window.innerHeight * 0.7, false);
      } else if (e.key === 'Home') {
        e.preventDefault();
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        if (mainRef.current) {
          mainRef.current.scrollTo({
            top: mainRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      } else {
        // Responder con teclado: 1, 2, 3, 4 o A, B, C, D
        const key = e.key.toUpperCase();
        let optionIndex = -1;
        if (['1', '2', '3', '4'].includes(e.key)) {
          optionIndex = parseInt(e.key, 10) - 1;
        } else if (['A', 'B', 'C', 'D'].includes(key)) {
          optionIndex = key.charCodeAt(0) - 65;
        }

        if (optionIndex >= 0 && data.questions[currentIndex]) {
          const answers = data.questions[currentIndex].answers;
          if (answers && answers[optionIndex]) {
            handleSelectAnswer(currentIndex, answers[optionIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, total, currentIndex, goNext, goPrev, scrollByAmount]);

  // Reset scroll position to top when question changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentIndex, showResults]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm">Cargando cuestionario interactivo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isNoPreview = (error as Error)?.message === 'NO_PREVIEW';
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {isNoPreview ? 'Vista previa no disponible' : 'Cuestionario no encontrado'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isNoPreview
              ? 'Este cuestionario no está habilitado para acceso público. Solo el administrador puede habilitar esta opción.'
              : 'No se encontró el cuestionario solicitado.'}
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="border-white/10 text-slate-300 hover:bg-slate-800"
          >
            Ir al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const { quiz, questions } = data;
  const current = questions[currentIndex];

  // Cálculo de estadísticas locales
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  let totalPointsEarned = 0;
  let totalPossiblePoints = 0;

  questions.forEach((q, idx) => {
    const qPoints = q.points || 10;
    totalPossiblePoints += qPoints;
    const chosenAnswerId = selectedAnswers[idx];
    if (chosenAnswerId !== undefined) {
      const isCorrect = q.answers?.find((a) => a.id === chosenAnswerId)?.isCorrect;
      if (isCorrect) {
        correctCount++;
        totalPointsEarned += qPoints;
      }
    }
  });

  const incorrectCount = answeredCount - correctCount;
  const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-blue-300 text-xs font-semibold tracking-wide uppercase truncate">
            Práctica Pública Interactiva · Sin registro requerido
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Aciertos:{' '}
            <strong className="text-emerald-400 font-bold">{correctCount}</strong> / {total}
          </span>
          {answeredCount === total && !showResults && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResults(true)}
              className="h-6 px-2.5 bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold rounded-full gap-1"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              Ver Resultados
            </Button>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-slate-900/80 border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/')}
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-white/10 -ml-1 text-xs font-semibold"
            title="Ir a la página principal"
          >
            <Home className="h-4 w-4 mr-1 text-slate-400" />
            <span className="hidden sm:inline">Inicio</span>
          </Button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
            <h1 className="font-bold text-white text-sm sm:text-base truncate">
              {quiz.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAllForAI}
            className="h-8 px-2.5 text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Copiar todas las preguntas con respuestas correctas y distractores para IA (ChatGPT, Claude, etc.)"
          >
            {copiedAI ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span className="hidden sm:inline">Copiar para IA</span>
            <span className="sm:hidden">Para IA</span>
          </Button>

          <div className="bg-slate-800/80 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
            {currentIndex + 1} / {total}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 shrink-0 z-20">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main
        ref={mainRef}
        tabIndex={0}
        className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 md:py-8 overflow-y-auto focus:outline-none z-10 w-full"
      >
        {showResults ? (
          /* =========================================================================
             PANTALLA DE RESULTADOS FINALES (ESTILO ACTIVE QUIZ)
             ========================================================================= */
          <div className="w-full max-w-3xl my-auto bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300 backdrop-blur-xl">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-500/10">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Práctica Completada
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¡Has completado el cuestionario!
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                Resultados obtenidos para <strong className="text-slate-200">{quiz.title}</strong>
              </p>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correctas
                </span>
                <div className="text-3xl font-extrabold text-emerald-300">{correctCount}</div>
                <span className="text-[11px] text-slate-500">de {total} preguntas</span>
              </div>

              <div className="bg-slate-950/60 border border-rose-500/30 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Incorrectas
                </span>
                <div className="text-3xl font-extrabold text-rose-300">{incorrectCount}</div>
                <span className="text-[11px] text-slate-500">con oportunidad de mejora</span>
              </div>

              <div className="bg-slate-950/60 border border-blue-500/30 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs uppercase tracking-wider text-blue-400 font-bold flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Efectividad
                </span>
                <div className="text-3xl font-extrabold text-blue-300">{scorePercentage}%</div>
                <span className="text-[11px] text-slate-500">
                  {totalPointsEarned} / {totalPossiblePoints} pts
                </span>
              </div>
            </div>

            {/* Desglose Interactivo de Preguntas */}
            <div className="space-y-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Desglose por pregunta (haz clic para revisar):
                </h4>
                <span className="text-xs text-slate-500">
                  {answeredCount} de {total} respondidas
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const chosenId = selectedAnswers[idx];
                  const isCorrect =
                    isAnswered && q.answers?.find((a) => a.id === chosenId)?.isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setShowResults(false);
                        setCurrentIndex(idx);
                      }}
                      className={cn(
                        'h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all border shadow-sm',
                        !isAnswered &&
                          'bg-slate-800/50 border-white/10 text-slate-500 hover:bg-slate-700',
                        isAnswered &&
                          isCorrect &&
                          'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30',
                        isAnswered &&
                          !isCorrect &&
                          'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      )}
                      title={`Pregunta ${idx + 1}: ${
                        isCorrect ? 'Correcta' : isAnswered ? 'Incorrecta' : 'Sin responder'
                      }`}
                    >
                      <span className="text-[11px]">P{idx + 1}</span>
                      <span className="text-xs font-extrabold">
                        {isCorrect ? '✓' : isAnswered ? '✗' : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mensaje Pedagógico de Retroalimentación */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-center">
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                {scorePercentage >= 80
                  ? '🌟 ¡Excelente desempeño! Tienes un sólido dominio conceptual de este tema.'
                  : scorePercentage >= 50
                  ? '💪 ¡Buen trabajo! Revisa las preguntas erróneas para afianzar tus conocimientos y pulir detalles.'
                  : '📚 Sigue practicando. Puedes hacer clic en cada pregunta para leer la explicación matemática detallada.'}
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentIndex(0);
                  setShowResults(false);
                }}
                className="w-full sm:w-auto border-white/10 bg-slate-800/80 hover:bg-slate-700 text-slate-200 gap-2 h-11 px-5 rounded-xl font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar y reintentar
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(0);
                  }}
                  className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800 gap-2 h-11 px-4 rounded-xl font-semibold"
                >
                  <BookOpen className="w-4 h-4" />
                  Revisar preguntas
                </Button>

                <Button
                  onClick={() => (window.location.href = '/auth')}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear cuenta gratis
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VISTA DE PREGUNTA INTERACTIVA (CARD ANCHA ESTILO ACTIVE QUIZ: max-w-5xl)
             ========================================================================= */
          <div className="w-full max-w-4xl lg:max-w-5xl space-y-6">
            {/* Tarjeta Principal de la Pregunta */}
            <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-2xl backdrop-blur-md">
              {/* Encabezado Superior de la Pregunta */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    Pregunta {currentIndex + 1} de {total}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-white/10 text-slate-400 text-xs font-semibold px-2.5 py-0.5"
                  >
                    {current.difficulty === 'hard' || current.difficulty === 3
                      ? 'Nivel Avanzado'
                      : current.difficulty === 'medium' || current.difficulty === 2
                      ? 'Nivel Medio'
                      : 'Nivel Básico'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white text-xs px-3.5 py-1 rounded-full font-bold shadow-md shadow-blue-500/10">
                    {current.points || 10} puntos
                  </div>
                  {isCurrentAnswered && (
                    <Badge
                      className={cn(
                        'border-none font-bold text-xs px-2.5 py-0.5',
                        current.answers?.find(
                          (a) => a.id === selectedAnswers[currentIndex]
                        )?.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      )}
                    >
                      {current.answers?.find(
                        (a) => a.id === selectedAnswers[currentIndex]
                      )?.isCorrect
                        ? 'Correcta ✓'
                        : 'Incorrecta ✗'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Subtítulo de instrucción */}
              <h3 className="text-sm font-semibold text-slate-400">
                Selecciona la respuesta correcta:
              </h3>

              {/* Imagen de la Pregunta (si existe) */}
              {current.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex justify-center p-2 shadow-inner">
                  <ZoomableImage
                    src={current.imageUrl}
                    alt={`Imagen de la pregunta ${currentIndex + 1}`}
                    className="w-full max-h-80 object-contain"
                  />
                </div>
              )}

              {/* Enunciado de la Pregunta (Con ancho suficiente para no apilar) */}
              <div
                className={cn(
                  'text-slate-100 leading-relaxed tracking-wide',
                  getQuestionSizeClass(current.content)
                )}
              >
                <ContentRenderer content={current.content} />
              </div>

              {/* Opciones de Respuesta Interactivas */}
              {current.answers && current.answers.length > 0 && (
                <div className="space-y-3 pt-2">
                  {current.answers.map((answer, idx) => {
                    const isAnswered = selectedAnswers[currentIndex] !== undefined;
                    const isSelected = selectedAnswers[currentIndex] === answer.id;
                    const isCorrect = answer.isCorrect;

                    let containerStyle =
                      'bg-slate-800/40 border-white/10 hover:bg-slate-800/80 hover:border-blue-500/40 text-slate-200 cursor-pointer shadow-sm';
                    let letterStyle =
                      'bg-slate-800 border-white/15 text-slate-400 group-hover:text-blue-300 group-hover:border-blue-500/40';

                    if (isAnswered) {
                      if (isCorrect) {
                        containerStyle =
                          'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-default';
                        letterStyle =
                          'bg-emerald-500/30 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        containerStyle =
                          'bg-rose-500/15 border-rose-500/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)] cursor-default';
                        letterStyle =
                          'bg-rose-500/30 border-rose-500 text-rose-200 font-bold';
                      } else {
                        containerStyle =
                          'opacity-40 border-white/5 bg-slate-950/40 text-slate-500 cursor-default';
                        letterStyle = 'bg-slate-900 border-white/5 text-slate-600';
                      }
                    }

                    return (
                      <button
                        key={answer.id}
                        type="button"
                        onClick={() => handleSelectAnswer(currentIndex, answer.id)}
                        disabled={isAnswered}
                        className={cn(
                          'w-full text-left py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden',
                          containerStyle
                        )}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 relative z-10 w-full min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center border text-sm font-bold shrink-0 transition-colors shadow-sm',
                              letterStyle
                            )}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div
                            className={cn(
                              'font-medium flex-1 min-w-0 overflow-x-auto py-0.5 leading-relaxed',
                              getAnswerSizeClass(answer.content)
                            )}
                          >
                            <ContentRenderer content={answer.content} tight={true} />
                          </div>
                        </div>

                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0 ml-3" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-6 w-6 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0 ml-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Explicación Pedagógica Inmediata al Responder */}
              {isCurrentAnswered && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-blue-500/30 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {current.answers?.find(
                          (a) => a.id === selectedAnswers[currentIndex]
                        )?.isCorrect
                          ? '¡Excelente! Respuesta Correcta'
                          : 'Explicación Pedagógica:'}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                        current.answers?.find(
                          (a) => a.id === selectedAnswers[currentIndex]
                        )?.isCorrect
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      )}
                    >
                      {current.answers?.find(
                        (a) => a.id === selectedAnswers[currentIndex]
                      )?.isCorrect
                        ? '+1 Acierto'
                        : 'Retroalimentación'}
                    </span>
                  </div>

                  {current.explanation ? (
                    <div className="text-slate-300 text-sm md:text-base leading-relaxed pt-1">
                      <ContentRenderer content={current.explanation} />
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">
                      {current.answers?.find(
                        (a) => a.id === selectedAnswers[currentIndex]
                      )?.isCorrect
                        ? 'Has seleccionado la opción correcta para esta pregunta.'
                        : 'La opción marcada en verde es la respuesta matemáticamente correcta.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Barra Inferior de Navegación y Círculos de Pregunta (Estilo Active Quiz) */}
            <div className="space-y-4 pt-2">
              {/* Fila de Botones Anterior / Siguiente / Ver Resultados */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="border-white/10 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 gap-2 h-11 px-5 rounded-2xl font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {currentIndex < total - 1 ? (
                    <Button
                      onClick={goNext}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2 h-11 px-6 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowResults(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-2 h-11 px-6 rounded-2xl font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Trophy className="h-4 w-4 text-amber-300" />
                      Ver Resultados
                    </Button>
                  )}
                </div>
              </div>

              {/* Panel de Navegación de Preguntas con Círculos Espaciosos (Idéntico a Active Quiz) */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Preguntas del Cuestionario
                  </span>
                  <span>
                    {Object.keys(selectedAnswers).length} de {total} respondidas ({total > 0 ? Math.round((Object.keys(selectedAnswers).length / total) * 100) : 0}%)
                  </span>
                </div>

                {/* Barra de progreso sutil */}
                <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{
                      width: `${total > 0 ? (Object.keys(selectedAnswers).length / total) * 100 : 0}%`,
                    }}
                  />
                </div>

                {/* Círculos de Preguntas Espaciosos, Perfectamente Redondos y con Animación */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 pt-2">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const chosenId = selectedAnswers[idx];
                    const isCorrect =
                      isAnswered && q.answers?.find((a) => a.id === chosenId)?.isCorrect;
                    const isCurrent = idx === currentIndex;

                    let stateClasses =
                      'bg-slate-800/60 text-slate-400 border-white/10 hover:bg-slate-700/80 hover:text-slate-200 hover:border-white/20';

                    if (isAnswered) {
                      if (isCorrect) {
                        stateClasses =
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-extrabold';
                      } else {
                        stateClasses =
                          'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)] font-extrabold';
                      }
                    } else if (isCurrent) {
                      stateClasses = 'bg-blue-600/30 text-blue-200 border-blue-400 font-extrabold';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          'w-10 h-10 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center border shrink-0 cursor-pointer shadow-sm',
                          isCurrent
                            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-110 z-10 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                            : 'hover:scale-105 active:scale-95',
                          stateClasses
                        )}
                        aria-label={`Ir a pregunta ${idx + 1}`}
                        title={`Pregunta ${idx + 1}${
                          isAnswered ? (isCorrect ? ' (Correcta)' : ' (Incorrecta)') : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atajos de teclado informativos */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-500 select-none pt-1">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">
                    ←
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">
                    →
                  </kbd>
                  <span className="ml-1 text-slate-400">Navegar</span>
                </span>
                <span className="text-slate-700">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">
                    A-D
                  </kbd>
                  <span className="ml-1 text-slate-400">Responder</span>
                </span>
                <span className="text-slate-700">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">
                    ↓
                  </kbd>
                  <span className="ml-1 text-slate-400">Desplazar</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
