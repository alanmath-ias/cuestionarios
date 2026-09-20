import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, BookOpen, AlertCircle, Loader2, Bot, Check } from 'lucide-react';
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
  difficulty: number;
  points: number;
  imageUrl?: string;
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
  const clean = text.replace(/\\frac|\\{|\\}|\$|!/g, '');
  if (clean.length < 50) return 'text-2xl md:text-3xl font-bold';
  if (clean.length < 100) return 'text-xl md:text-2xl';
  return 'text-lg md:text-xl';
}

// Helper para copiar texto al portapapeles con fallback seguro
const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
};

export default function PreviewQuiz() {
  const { quizId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
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
      md += `---\n\n`;
    });

    const success = await copyTextToClipboard(md.trim());
    if (success) {
      setCopiedAI(true);
      setTimeout(() => setCopiedAI(false), 2500);
      toast({
        title: "🤖 Copiado para IA",
        description: `${questions.length} preguntas con respuestas y distractores listos para pegar.`,
      });
    } else {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el contenido al portapapeles.",
        variant: "destructive",
      });
    }
  };

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

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

  // Keyboard navigation: Left/Right to change question, Up/Down to scroll
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, total, goNext, goPrev, scrollByAmount]);

  // Reset scroll position to top when question changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm">Cargando vista previa...</p>
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
              ? 'Este cuestionario no está habilitado para vista pública. Solo el administrador puede activar esta opción.'
              : 'No se encontró el cuestionario solicitado.'}
          </p>
        </div>
      </div>
    );
  }

  const { quiz, questions } = data;
  const current = questions[currentIndex];

  if (!current) return null;

  return (
    <div className="h-screen max-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
        <Eye className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase truncate">
          Vista Previa — Solo lectura · {quiz.title}
        </span>
      </div>

      <header className="bg-slate-900/80 border-b border-white/5 px-4 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="h-5 w-5 text-blue-400 shrink-0" />
          <h1 className="font-bold text-white text-sm truncate">{quiz.title}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAllForAI}
          className="h-7 px-2.5 text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
          title="Copiar todas las preguntas con respuestas correctas y distractores para IA (ChatGPT, Claude, etc.)"
        >
          {copiedAI ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bot className="w-3.5 h-3.5 text-purple-400" />}
          <span className="hidden sm:inline">Copiar para IA</span>
          <span className="sm:hidden">Para IA</span>
        </Button>
        <div className="text-xs text-slate-500 shrink-0 font-medium">
          {currentIndex + 1} / {total}
        </div>
      </header>

      <div className="h-1 bg-slate-800 shrink-0">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      <main
        ref={mainRef}
        tabIndex={0}
        className="flex-1 flex flex-col items-center px-4 py-6 md:py-10 overflow-y-auto focus:outline-none"
      >
        <div className="w-full max-w-2xl space-y-6">
          <div className="bg-slate-900 border border-white/8 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pregunta {currentIndex + 1}
              </span>
            </div>

            {current.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <ZoomableImage
                  src={current.imageUrl}
                  alt={`Imagen pregunta ${currentIndex + 1}`}
                  className="w-full max-h-72 object-contain bg-slate-800"
                />
              </div>
            )}

            <div
              className={cn(
                'text-slate-200 leading-relaxed',
                getQuestionSizeClass(current.content)
              )}
            >
              <ContentRenderer content={current.content} />
            </div>

            {current.answers && current.answers.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {current.answers.map((answer, idx) => (
                  <div
                    key={answer.id}
                    className="flex items-start gap-3 p-4 rounded-xl border bg-slate-800/50 border-white/8 text-slate-300 cursor-default select-none"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1 min-w-0 text-sm leading-relaxed pt-0.5">
                      <ContentRenderer content={answer.content} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="border-white/10 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      idx === currentIndex
                        ? 'bg-blue-500 scale-125 ring-2 ring-blue-500/30'
                        : 'bg-slate-600 hover:bg-slate-500'
                    )}
                    aria-label={`Ir a pregunta ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={goNext}
                disabled={currentIndex === total - 1}
                className="border-white/10 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 gap-2"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Atajos de teclado informativos */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-500 select-none pt-1">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">→</kbd>
                <span className="ml-1 text-slate-400">Navegar</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">↓</kbd>
                <span className="ml-1 text-slate-400">Subir / Bajar</span>
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 pb-6">
            Modo solo lectura · Para realizar el cuestionario inicia sesión en la plataforma
          </p>
        </div>
      </main>
    </div>
  );
}
