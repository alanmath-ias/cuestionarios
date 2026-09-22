import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Timer, Lightbulb, Flag, Clock, Trophy, Home, BookOpen, ShieldCheck, ShieldOff, Brain, Zap, Pencil, Save, Trash2, Check, X as CloseIcon, Eye, EyeOff, Copy, Power, Link2, Bot, Crown, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { startActiveQuizTour } from "@/lib/tour";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTimer } from "@/hooks/use-timer";
import { QuestionProgress } from "@/components/QuestionProgress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "@/hooks/useSession";
import { ContentRenderer } from "@/components/ContentRenderer";
import { AIMarkdown } from "@/components/ui/ai-markdown";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { ExplanationModal } from "./explicacion";
import { PremiumUpgradeModal } from "@/components/dialogs/PremiumUpgradeModal";
import { MathDisplay } from "@/components/ui/math-display";
import MathKeyboard from "@/components/MathKeyboard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SURVEY_QUIZ_IDS = [68, 69, 73, 72];

// Interfaces
interface Quiz {
  id: number;
  title: string;
  timeLimit: number;
  description?: string;
  categoryId: number;
  isPublic?: boolean;
  theoryNotes?: string | null;
}

interface Question {
  id: number;
  quizId: number;
  type: 'text' | 'multiple_choice' | 'equation';
  content: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  answers?: any[];
  variables?: any;
  explanation?: string;
}

interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent: number;
  completedAt?: string;
  responseMode?: 'multiple_choice' | 'direct_input';
  answers?: any[];
}

// Componente para renderizar contenido con saltos de línea y matemáticas
const QuestionContent = ({
  content,
  canCopy = false,
  onCopy,
  isCopied = false
}: {
  content: string;
  canCopy?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}) => {
  // Helper to determine font size class based on question content length
  const getQuestionSizeClass = (text: string) => {
    // Remove LaTeX delimiters to estimate "visual" length more accurately
    const cleanContent = text.replace(/\\frac|\\{|\\}|\$|¡/g, '');
    const length = cleanContent.length;

    if (length < 50) return "text-2xl md:text-3xl font-bold"; // Short questions (e.g. "Simplificar:")
    if (length < 100) return "text-xl md:text-2xl"; // Medium questions
    return "text-lg md:text-xl"; // Long questions (maintain readability)
  };

  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className={`text-slate-200 leading-relaxed transition-all duration-300 flex-1 min-w-0 ${getQuestionSizeClass(content)}`}>
        <ContentRenderer content={content} />
      </div>
      {canCopy && onCopy && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-800/80 h-8 px-2.5 rounded-lg border border-white/10 hover:border-white/25 transition-all flex items-center gap-1.5 text-xs font-medium"
          title="Copiar texto de la pregunta (formato LaTeX/delimitadores)"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-bold">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copiar</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// Helper para copiar al portapapeles con fallback seguro
const copyPreviewUrlToClipboard = async (text: string): Promise<boolean> => {
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

// Componente para alternar Vista Previa pública desde dentro del cuestionario (Admin)
function ActiveQuizPreviewToggle({ quiz }: { quiz: Quiz }) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(!!quiz.isPublic);
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPublic(!!quiz.isPublic);
  }, [quiz.isPublic]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const nextState = !isPublic;
    const previewUrl = `${window.location.origin}/preview/${quiz.id}`;

    // 1. Actualización optimista de estado local
    setIsPublic(nextState);

    // 2. Actualización optimista en caché de React Query
    queryClient.setQueryData([`/api/quizzes/${quiz.id}`], (old: Quiz | undefined) => {
      if (!old) return old;
      return { ...old, isPublic: nextState };
    });
    queryClient.setQueryData(["/api/quizzes"], (old: Quiz[] | undefined) => {
      if (!old) return old;
      return old.map((q) => (q.id === quiz.id ? { ...q, isPublic: nextState } : q));
    });

    // 3. Copiado automático e instantáneo al portapapeles al encender
    if (nextState) {
      copyPreviewUrlToClipboard(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "👁 Vista previa activada",
        description: `Enlace copiado al portapapeles: /preview/${quiz.id}`,
      });
    } else {
      toast({
        title: "Vista previa desactivada",
        description: "El cuestionario ahora es privado.",
      });
    }

    // 4. Llamada al backend en segundo plano
    setIsPending(true);
    try {
      const res = await apiRequest("PATCH", `/api/admin/quizzes/${quiz.id}/toggle-preview`);
      if (!res.ok) throw new Error("Error al cambiar modo vista previa");
      const data = await res.json();
      if (data.isPublic !== nextState) {
        setIsPublic(data.isPublic);
        queryClient.setQueryData([`/api/quizzes/${quiz.id}`], (old: Quiz | undefined) => {
          if (!old) return old;
          return { ...old, isPublic: data.isPublic };
        });
      }
    } catch {
      // Revertir optimismo si hay error
      setIsPublic(!nextState);
      queryClient.setQueryData([`/api/quizzes/${quiz.id}`], (old: Quiz | undefined) => {
        if (!old) return old;
        return { ...old, isPublic: !nextState };
      });
      toast({
        title: "Error",
        description: "No se pudo actualizar el modo vista previa.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const previewUrl = `${window.location.origin}/preview/${quiz.id}`;
    await copyPreviewUrlToClipboard(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Enlace copiado",
      description: previewUrl,
    });
  };

  return (
    <div className="flex items-center gap-1.5 ml-1" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        title={isPublic ? "Desactivar vista previa pública" : "Activar vista previa pública (copia enlace automáticamente)"}
        className={cn(
          "h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm",
          isPublic
            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 hover:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            : "bg-slate-800/80 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-700"
        )}
      >
        <Power className={cn("w-3.5 h-3.5", isPublic ? "text-amber-400" : "text-slate-400")} />
        <span>{isPublic ? "Preview ON" : "Preview OFF"}</span>
      </Button>

      {isPublic && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          title="Copiar enlace de vista previa"
          className="h-7 w-7 p-0 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30 transition-colors flex items-center justify-center"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
        </Button>
      )}
    </div>
  );
}

const ActiveQuiz = () => {
  const { quizId, categoryId } = useParams();
  const isChiqui = !!categoryId;
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode');
  const { toast } = useToast();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<any[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<any[]>([]);
  const [hideAnswersMode, setHideAnswersMode] = useState<boolean>(() => {
    return localStorage.getItem("quiz_hide_answers_mode") === "true";
  });

  const toggleHideAnswersMode = () => {
    setHideAnswersMode(prev => {
      const next = !prev;
      localStorage.setItem("quiz_hide_answers_mode", String(next));
      return next;
    });
  };
  const { session, loading: sessionLoading } = useSession();
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, string[]>>({});
  const [requestingHint, setRequestingHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIncompleteDialogOpen, setIsIncompleteDialogOpen] = useState(false);
  const [showChiquiResult, setShowChiquiResult] = useState(() => {
    // Skip the flash by immediately showing results if coming from 'Ver Detalles'
    return new URLSearchParams(window.location.search).get('results') === '1';
  });
  const [chiquiScore, setChiquiScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<{
    questionId: number;
    question: string;
    correctAnswer: string;
  } | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalData, setPremiumModalData] = useState<{
    title: string;
    description: string;
  }>({
    title: "Desbloquea las Explicaciones Detalladas",
    description: "Accede al paso a paso con explicaciones matemáticas formales y resolución guiada suscribiéndote a AlanMath Premium."
  });
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  const handleOpenExplanation = () => {
    if (!questions || !questions[currentQuestionIndex]) return;
    if (!session?.isPremium) {
      setPremiumModalData({
        title: "Desbloquea las Explicaciones Detalladas",
        description: "Accede al paso a paso con explicaciones matemáticas formales y resolución guiada suscribiéndote a AlanMath Premium."
      });
      setShowPremiumModal(true);
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    const correctAns = currentQ.answers?.find((a: any) => a.isCorrect)?.content || '';
    setCurrentExplanation({
      questionId: currentQ.id,
      question: currentQ.content,
      correctAnswer: correctAns,
    });
    setShowExplanation(true);
  };

  const handleOpenTheory = () => {
    if (!session?.isPremium) {
      setPremiumModalData({
        title: "Desbloquea Fórmulas y Conceptos Clave",
        description: "Accede a las fórmulas, resúmenes teóricos y propiedades del tema en tiempo real mientras resuelves cada cuestionario con AlanMath Premium."
      });
      setShowPremiumModal(true);
      return;
    }
    setIsTheoryOpen(true);
  };

  // New state for cumulative time
  const [previousTimeSpent, setPreviousTimeSpent] = useState<number>(0);

  // Report Error State
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  // Track used hint types per question
  const [usedHintTypes, setUsedHintTypes] = useState<Record<number, ('regular' | 'super')[]>>({});

  const [directResponse, setDirectResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSyncQuestionId = useRef<number | null>(null);

  // Admin Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editAnswers, setEditAnswers] = useState<any[]>([]);

  // Admin Quiz Title & Time Edit State
  const [isEditingQuizMeta, setIsEditingQuizMeta] = useState(false);
  const [editQuizTitle, setEditQuizTitle] = useState("");
  const [editQuizTimeMinutes, setEditQuizTimeMinutes] = useState<number>(0);

  const isAdmin = session?.role === 'admin' && !session?.isImpersonating;
  const canCopyRawContent = isAdmin || session?.userId === 2;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAI, setCopiedAI] = useState(false);

  const handleCopyAllForAI = async () => {
    if (!quiz || !questions || questions.length === 0) {
      toast({
        title: "Sin preguntas",
        description: "No hay preguntas cargadas para copiar.",
        variant: "destructive",
      });
      return;
    }

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
        md += `*Explicación/Solución:* ${q.explanation}\n\n`;
      }
      md += `---\n\n`;
    });

    const success = await copyPreviewUrlToClipboard(md.trim());
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

  const handleCopyRaw = (text: string, key: string, label: string = "Pregunta") => {
    if (!navigator?.clipboard?.writeText) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedKey(key);
        toast({
          title: "Copiado",
          description: `${label} copiada al portapapeles.`,
        });
        setTimeout(() => {
          setCopiedKey(prev => prev === key ? null : prev);
        }, 2000);
      } catch (err) {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el texto.",
          variant: "destructive"
        });
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      toast({
        title: "Copiado",
        description: `${label} copiada al portapapeles.`,
      });
      setTimeout(() => {
        setCopiedKey(prev => prev === key ? null : prev);
      }, 2000);
    }).catch((err) => {
      console.error("Error al copiar:", err);
      toast({
        title: "Error al copiar",
        description: "No se pudo acceder al portapapeles.",
        variant: "destructive"
      });
    });
  };

  const updateQuizMetaMutation = useMutation({
    mutationFn: async ({ title, timeLimit }: { title: string; timeLimit: number }) => {
      const res = await apiRequest("PUT", `/api/admin/quizzes/${quizId}`, {
        ...quiz,
        title: title.trim(),
        timeLimit,
      });
      if (!res.ok) throw new Error("Error al actualizar el cuestionario");
      return res.json();
    },
    onSuccess: (updatedQuiz) => {
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}`] });
      queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      if (updatedQuiz?.timeLimit) {
        reset(updatedQuiz.timeLimit);
      }
      setIsEditingQuizMeta(false);
      toast({
        title: "Cuestionario actualizado",
        description: "El título y tiempo límite se han guardado correctamente.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el cuestionario",
        variant: "destructive",
      });
    },
  });

  const formatMaxTime = (timeInSeconds?: number) => {
    if (!timeInSeconds) return "0:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Queries — esperan a que la sesión esté confirmada para evitar 401 al iniciar
  const { data: quiz, isLoading: loadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !sessionLoading && !isChiqui && !!quizId,
    placeholderData: (prev) => prev,
  });

  const { data: questions, isLoading: loadingQuestions, error: errorQuestions } = useQuery<Question[]>({
    queryKey: isChiqui
      ? [`/api/chiquitest/questions/${categoryId}`, searchParams.get('user_id'), new Date().toISOString().split('T')[0]]
      : [`/api/quizzes/${quizId}/questions`, mode],
    queryFn: async () => {
      const userIdStr = searchParams.get('user_id');
      const url = isChiqui
        ? `/api/chiquitest/questions/${categoryId}${userIdStr ? `?user_id=${userIdStr}` : ''}`
        : `/api/quizzes/${quizId}/questions${mode ? `?mode=${mode}` : ''}`;
      // Usar fetch directo para poder interceptar 401 antes del throw
      const res = await fetch(url, { credentials: 'include' });
      // Si la sesión todavía no estaba lista, reintentar una vez en silencio
      if (res.status === 401) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const retry = await fetch(url, { credentials: 'include' });
        if (!retry.ok) throw new Error(`${retry.status}: Error al cargar preguntas`);
        return retry.json();
      }
      if (!res.ok) throw new Error(`${res.status}: Error al cargar preguntas`);
      return res.json();
    },
    // Esperar a que la sesión esté confirmada antes de disparar el fetch
    enabled: !sessionLoading && (!!quizId || !!categoryId),
    placeholderData: (prev) => prev,
  });

  const hasUnevaluatedAnswers = studentAnswers.some(a => a.userResponse !== undefined && a.isCorrect === null);

  const { data: progress, isLoading: loadingProgress } = useQuery<Progress>({
    queryKey: isChiqui ? ["chiqui-progress-placeholder"] : [`/api/progress/${quizId}`],
    enabled: !isChiqui && !!quizId && !!session?.userId,
    refetchInterval: hasUnevaluatedAnswers ? 3000 : false,
    placeholderData: (prev) => prev,
  });

  const isDirectInput = progress?.responseMode === 'direct_input' || mode === 'direct_input';

  const { data: chiquiResults } = useQuery<any[]>({
    queryKey: ["chiqui-results", searchParams.get('user_id')],
    queryFn: async () => {
      const userIdStr = searchParams.get('user_id');
      const url = userIdStr ? `/api/chiquitest/results?user_id=${userIdStr}` : "/api/chiquitest/results";
      const res = await apiRequest("GET", url);
      return res.json();
    },
    enabled: isChiqui && (!!session?.userId || !!searchParams.get('user_id')),
  });

  // Mutations
  const reportErrorMutation = useMutation({
    mutationFn: async (data: { quizId: number; questionId: number; description: string }) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mejorar.",
      });
      setIsReportDialogOpen(false);
      setReportDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte.",
        variant: "destructive",
      });
    },
  });

  const createProgressMutation = useMutation({
    mutationFn: async (newProgress: any) => {
      const res = await apiRequest("POST", "/api/progress", newProgress);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${quizId}`] });
      queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: any) => {
      const res = await apiRequest("POST", "/api/answers", answer);
      return res.json();
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const res = await apiRequest("PUT", `/api/admin/questions/${id}`, payload);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar la pregunta");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: isChiqui ? [`/api/chiquitest/questions/${categoryId}`] : [`/api/quizzes/${quizId}/questions`] });
      setIsEditing(false);
      toast({
        title: "Pregunta actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la pregunta",
        variant: "destructive",
      });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/questions/${id}`);
      if (!res.ok) {
        throw new Error("Error al eliminar la pregunta");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: isChiqui ? [`/api/chiquitest/questions/${categoryId}`] : [`/api/quizzes/${quizId}/questions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizId}`] });
      
      setIsEditing(false);
      toast({
        title: "Pregunta eliminada",
        description: "La pregunta ha sido eliminada correctamente.",
      });

      // Si no es la primera pregunta, retroceder una. Si es la primera, quedarse ahí (o el refetch hará lo suyo)
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la pregunta",
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleReportSubmit = () => {
    if (!questions || !reportDescription.trim()) return;
    const currentQuestion = questions[currentQuestionIndex];

    reportErrorMutation.mutate({
      quizId: currentQuestion.quizId,
      questionId: currentQuestion.id,
      description: reportDescription,
    });
  };

  const handleStartEdit = () => {
    if (!questions) return;
    const currentQ = questions[currentQuestionIndex];
    setEditContent(currentQ.content);
    setEditImageUrl(currentQ.imageUrl || "");
    setEditAnswers(currentQ.answers || []);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!questions) return;
    const currentQ = questions[currentQuestionIndex];

    // Basic validation
    if (!editContent.trim()) {
      toast({ title: "Error", description: "El contenido no puede estar vacío", variant: "destructive" });
      return;
    }

    updateQuestionMutation.mutate({
      id: currentQ.id,
      payload: {
        quizId: currentQ.quizId,
        content: editContent,
        type: currentQ.type,
        difficulty: currentQ.difficulty === 'hard' ? 3 : currentQ.difficulty === 'medium' ? 2 : 1, // Mapping if necessary, but PUT expects number for some fields. Actually questions.tsx uses difficulty as string then parseInt
        points: currentQ.points,
        answers: editAnswers,
        imageUrl: editImageUrl || null,
      }
    });
  };

  // Timer
  // IMPORTANT: initialElapsedTime is set to 0 to restart the visual timer for this session.
  // The total time will be calculated as previousTimeSpent + elapsedTime.
  const { formattedTime, elapsedTime, start, pause, reset } = useTimer({
    initialTime: isChiqui ? 1200 : (quiz?.timeLimit || 0),
    initialElapsedTime: 0,
    autoStart: false, // We will manually start it to ensure it catches the loaded time
    onTimeUp: () => handleFinishQuiz()
  });

  // Sync background AI evaluation results when progress is refetched via polling
  useEffect(() => {
    if (progress?.answers && isInitialized) {
      setStudentAnswers(prev => {
        let updated = [...prev];
        let changed = false;
        for (const serverAns of progress.answers as any[]) {
          const localIdx = updated.findIndex(a => a.questionId === serverAns.questionId);
          if (localIdx >= 0 && updated[localIdx].isCorrect === null && serverAns.isCorrect !== null) {
            updated[localIdx] = { ...updated[localIdx], isCorrect: serverAns.isCorrect };
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }
  }, [progress?.answers, isInitialized]);

  // Helper to calculate total cumulative time
  const getTotalTime = () => {
    return previousTimeSpent + elapsedTime;
  };

  const formatTotalTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Effects
  useEffect(() => {
    if (!isInitialized && questions) {
      if (progress) {
        if (progress.status === 'completed' && mode !== 'readonly') {
          setLocation(`/results/${progress.id}`, { replace: true });
          return;
        }

        // Initialize previousTimeSpent from the server
        setPreviousTimeSpent(progress.timeSpent || 0);

        const completedCount = progress.completedQuestions || 0;
        if (completedCount > 0 && completedCount < questions.length) {
          setCurrentQuestionIndex(completedCount);
        }

        if (progress.answers && Array.isArray(progress.answers)) {
          const restoredAnswers = progress.answers.map((ans: any) => {
            if (ans.isCorrect === null && ans.answerId) {
              const question = questions.find(q => q.id === ans.questionId);
              const answerDef = question?.answers?.find((a: any) => a.id === ans.answerId);
              if (answerDef) {
                return { ...ans, isCorrect: answerDef.isCorrect };
              }
            }
            return ans;
          });
          setStudentAnswers(restoredAnswers);

          const answeredMap: Record<number, boolean> = {};
          restoredAnswers.forEach((ans: any) => {
            const qIndex = questions.findIndex(q => q.id === ans.questionId);
            if (qIndex !== -1) {
              answeredMap[qIndex] = true;
            }
          });
          setAnsweredQuestions(answeredMap);
        }
        setIsInitialized(true);
        if (quiz?.timeLimit) {
          reset(quiz.timeLimit);
          if (!isAdmin) {
            start();
          }
        }
      } else if (isChiqui && questions) {
        // Check if there is already a result for today
        const todayCategoryResult = chiquiResults?.find(r =>
          r.categoryId === parseInt(categoryId!) &&
          new Date(r.lastDate).toDateString() === new Date().toDateString()
        );

        if (todayCategoryResult) {
          setChiquiScore(todayCategoryResult.lastScore);
          setStudentAnswers(todayCategoryResult.lastAnswers || []);
          setShowChiquiResult(true);
        } else {
          // Restore partial progress from LocalStorage
          const savedPartial = localStorage.getItem(`chiqui_partial_${categoryId}`);
          if (savedPartial) {
            try {
              const { answers, index } = JSON.parse(savedPartial);
              if (answers && Array.isArray(answers)) {
                setStudentAnswers(answers);
                const answeredMap: Record<number, boolean> = {};
                answers.forEach((ans: any) => {
                  const qId = ans.questionId;
                  const qidx = questions.findIndex(q => q.id === qId);
                  if (qidx !== -1) answeredMap[qidx] = true;
                });
                setAnsweredQuestions(answeredMap);
                setCurrentQuestionIndex(Math.min(index, questions.length - 1));
              }
            } catch (err) {
              console.error("Error restoring Chiqui progress State:", err);
            }
          }
        }
        setIsInitialized(true);
        if (session?.userId !== 1) {
          reset(1200);
          start();
        }
      } else if (mode === 'readonly') {
        // If readonly and NO progress, just initialize empty state
        setIsInitialized(true);
      }
    }
  }, [progress, questions, setLocation, isInitialized, mode, isChiqui, chiquiResults, categoryId]);

  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentQ = questions[currentQuestionIndex];
      if (currentQ.answers && Array.isArray(currentQ.answers)) {
        const shuffled = [...currentQ.answers].sort(() => Math.random() - 0.5);
        setShuffledAnswers(shuffled);
      }
      const existing = studentAnswers.find(sa => sa.questionId === currentQ.id);
      setSelectedAnswerId(existing?.answerId ?? null);
    }
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    // Sync directResponse when question changes or on initial load
    if (questions && questions[currentQuestionIndex]) {
      const qId = questions[currentQuestionIndex].id;
      const isFocused = document.activeElement === inputRef.current;

      // Sincronizar SIEMPRE si cambiamos de pregunta
      if (lastSyncQuestionId.current !== qId) {
        const existing = studentAnswers.find(sa => sa.questionId === qId);
        setDirectResponse(existing?.userResponse || "");
        lastSyncQuestionId.current = qId;
      }
      // Si es la misma pregunta, solo sincronizar si no hay nada escrito y no hay foco,
      // para evitar pisar lo que el usuario está escribiendo.
      else if (!directResponse && !isFocused) {
        const existing = studentAnswers.find(sa => sa.questionId === qId);
        if (existing?.userResponse) {
          setDirectResponse(existing.userResponse);
        }
      }
    }
  }, [currentQuestionIndex, questions, studentAnswers]);

  // Helper to determine font size class based on answer content length
  const getAnswerSizeClass = (content: string) => {
    // Detect if it contains a fraction which adds height
    const hasFraction = content.includes('\\frac');

    // Remove LaTeX delimiters to estimate "visual" length more accurately
    const cleanContent = content.replace(/\\frac|\\{|\\}|\$|¡/g, '');
    const length = cleanContent.length;

    if (length < 10) {
      return hasFraction ? "text-lg md:text-xl" : "text-xl md:text-2xl";
    }
    if (length < 40) return "text-xl md:text-2xl";
    if (length < 70) return "text-lg md:text-xl";
    return "text-sm md:text-base";
  };

  const isReadOnly = mode === 'readonly';

  useEffect(() => {
    if (!isChiqui && quiz && session?.userId && !loadingProgress && !progress && session.userId !== 1 && !isReadOnly) {
      createProgressMutation.mutate({
        userId: session.userId,
        quizId: parseInt(quizId!),
        status: 'in_progress',
        completedQuestions: 0,
        timeSpent: 0,
        mode: mode || 'standard'
      });
    }
  }, [quiz, session, progress, loadingProgress, quizId, isReadOnly, isChiqui]);

  // Save Partial Chiqui progress
  useEffect(() => {
    if (isChiqui && isInitialized && !showChiquiResult) {
      if (studentAnswers.length > 0) {
        localStorage.setItem(`chiqui_partial_${categoryId}`, JSON.stringify({
          answers: studentAnswers,
          index: currentQuestionIndex
        }));
      }
    }
  }, [studentAnswers, currentQuestionIndex, isChiqui, isInitialized, categoryId, showChiquiResult]);

  useEffect(() => {
    if (!loadingQuiz && !loadingQuestions && session?.userId && !session.tourStatus?.activeQuiz) {
      setTimeout(() => {
        startActiveQuizTour();
        fetch('/api/user/tour-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourType: 'activeQuiz' })
        });
      }, 1000);
    }
  }, [loadingQuiz, loadingQuestions, session]);

  // Navegación por Teclado (PC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No navegar si hay diálogos abiertos o si el cuestionario terminó
      const isModalOpen = isReportDialogOpen || isHintDialogOpen || isIncompleteDialogOpen || showExplanation || showChiquiResult;
      if (isModalOpen) return;

      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Si estamos en un input (que no sea el de respuesta matemática), ignorar flechas/enter
      if (isInputFocused && activeElement !== inputRef.current) return;

      if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < (questions?.length || 0) - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        }
      } else if (e.key === 'Enter') {
        const currentQuestion = questions?.[currentQuestionIndex];
        const isTextType = currentQuestion?.type === 'text';

        // Solo avanzar con Enter si hay alguna respuesta seleccionada o escrita
        const hasValue = selectedAnswerId !== null ||
          (isDirectInput && directResponse.trim() !== "") ||
          (isTextType && textAnswers[currentQuestion?.id!]?.trim() !== "");

        if (hasValue || answeredQuestions[currentQuestionIndex]) {
          handleNextQuestion();
        }
      } else {
        // Seleccionar opción con teclado: 1, 2, 3, 4 o A, B, C, D si no es modo entrada directa
        if (progress?.responseMode !== 'direct_input' && !answeredQuestions[currentQuestionIndex] && !isReadOnly) {
          const key = e.key.toUpperCase();
          let optionIndex = -1;
          if (['1', '2', '3', '4'].includes(e.key)) {
            optionIndex = parseInt(e.key, 10) - 1;
          } else if (['A', 'B', 'C', 'D'].includes(key)) {
            optionIndex = key.charCodeAt(0) - 65;
          }

          if (optionIndex >= 0 && shuffledAnswers[optionIndex]) {
            handleSelectAnswer(shuffledAnswers[optionIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentQuestionIndex, questions, selectedAnswerId, isDirectInput,
    directResponse, textAnswers, isReportDialogOpen, isHintDialogOpen,
    isIncompleteDialogOpen, showExplanation, showChiquiResult, shuffledAnswers,
    answeredQuestions, isReadOnly, progress?.responseMode
  ]);

  // Gestos Táctiles (Swipe para Móvil)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;

      // Deshabilitar gestos de deslizado si hay una imagen ampliada (modal) o un diálogo abierto
      const isModalOpen =
        isReportDialogOpen ||
        isHintDialogOpen ||
        isIncompleteDialogOpen ||
        showExplanation ||
        showChiquiResult ||
        !!document.querySelector('[role="dialog"]');

      if (isModalOpen || target?.closest('[role="dialog"]')) {
        touchStartX = 0;
        touchStartY = 0;
        return;
      }

      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === 0) return; // Si inició con modal abierto o ampliado, ignorar
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const isModalOpen =
        isReportDialogOpen ||
        isHintDialogOpen ||
        isIncompleteDialogOpen ||
        showExplanation ||
        showChiquiResult ||
        !!document.querySelector('[role="dialog"]');

      if (isModalOpen) return;

      const swipeThreshold = 50; // Umbral táctil para deslizar en móvil
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Verificar desplazamiento horizontal predominante frente al desplazamiento vertical
      if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
        if (diffX > 0) {
          // Swipe Izquierda -> Siguiente pregunta
          handleNextQuestion();
        } else {
          // Swipe Derecha -> Pregunta anterior
          handlePreviousQuestion();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    currentQuestionIndex, questions, selectedAnswerId, isDirectInput,
    directResponse, textAnswers, isReportDialogOpen, isHintDialogOpen,
    isIncompleteDialogOpen, showExplanation, showChiquiResult, answeredQuestions
  ]);

  const handleMathInput = (value: string, offset = 0) => {
    if (answeredQuestions[currentQuestionIndex]) return;

    const input = inputRef.current;
    if (!input) {
      setDirectResponse(prev => prev + value);
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = directResponse;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + value + after;
    setDirectResponse(newText);

    // Reposicionar cursor tras el render
    setTimeout(() => {
      const newPos = start + value.length + offset;
      input.focus();
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const submitCurrentAnswer = async (overrideAnswerId?: number) => {
    if (!questions || (!isChiqui && !progress?.id)) return;

    const isDirectInput = progress?.responseMode === 'direct_input';
    const effectiveAnswerId = overrideAnswerId ?? selectedAnswerId;
    if (!isDirectInput && effectiveAnswerId === null) return;
    if (isDirectInput && !directResponse.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers?.find((a: any) => a.id === effectiveAnswerId);

    const studentAnswer: any = {
      progressId: progress?.id || 0,
      questionId: currentQuestion.id,
      answerId: effectiveAnswerId,
      isCorrect: selectedAnswer?.isCorrect || false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime, // This tracks time for this specific answer in this session
    };

    if (isDirectInput) {
      studentAnswer.userResponse = directResponse;
      studentAnswer.answerId = null;
      studentAnswer.isCorrect = null; // Important: null means pending evaluation
    }

    // Actualización optimista inmediata del estado local para iluminar de inmediato verde/rojo
    setStudentAnswers((prev) => {
      const filtered = prev.filter((ans) => ans.questionId !== studentAnswer.questionId);
      return [...filtered, studentAnswer];
    });
    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestionIndex]: true }));

    try {
      if (!isChiqui) {
        // Enviar al servidor en segundo plano
        submitAnswerMutation.mutate(studentAnswer);
      }
    } catch (error: any) {
      console.error("[Quiz] Error al guardar respuesta (asíncrono):", error);
    }

    return studentAnswer;
  };

  const handleSelectAnswer = (answerId: number) => {
    if (answeredQuestions[currentQuestionIndex] || isNavigating || isReadOnly) return;
    setSelectedAnswerId(answerId);
  };

  const handleNextQuestion = async () => {
    if (!questions || (!isChiqui && !progress)) return;

    setIsNavigating(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const isTextType = currentQuestion.type === 'text';
      const hasUnconfirmedAnswer = !answeredQuestions[currentQuestionIndex] && (
        selectedAnswerId !== null ||
        (isDirectInput && directResponse.trim() !== "") ||
        (isTextType && textAnswers[currentQuestion.id]?.trim() !== "")
      );

      // Autosave if proceeding with an unconfirmed answer
      let lastAnswer = null;
      if (hasUnconfirmedAnswer) {
        if (isTextType && !answeredQuestions[currentQuestionIndex]) {
          lastAnswer = await handleTextAnswerSubmit();
        } else {
          lastAnswer = await submitCurrentAnswer();
        }
      }

      // Re-calculate counts after potential save
      const updatedAnsweredQuestions = { ...answeredQuestions };
      if (hasUnconfirmedAnswer) updatedAnsweredQuestions[currentQuestionIndex] = true;

      // Solo finalizar si estamos en la última pregunta del array
      const isFinishing = currentQuestionIndex >= questions.length - 1;

      if (!isFinishing) {
        // En modo opción múltiple, solo hacemos la pequeña pausa de 800ms si el usuario acaba de seleccionar/confirmar una respuesta nueva
        if (!isDirectInput && hasUnconfirmedAnswer) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Enviar actualización de progreso en segundo plano sin bloquear la UI
        if (!isChiqui && progress) {
          createProgressMutation.mutate({
            ...progress,
            completedQuestions: Math.max(progress.completedQuestions ?? 0, currentQuestionIndex + 1),
            timeSpent: getTotalTime(),
          });
        }

        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerId(null);
      } else {
        const answeredCount = Object.keys(updatedAnsweredQuestions).length;
        if (questions && answeredCount < questions.length) {
          setIsIncompleteDialogOpen(true);
          return;
        }

        // IMPORTANT: Calculate final answers including the one we just processed
        const finalAnswersList = lastAnswer
          ? [...studentAnswers.filter((a) => a.questionId !== lastAnswer.questionId), lastAnswer]
          : studentAnswers;

        await handleFinishQuiz(finalAnswersList);
      }
    } catch (error: any) {
      if (error.message?.includes("401")) {
        // Sesión expirada — redirigir después de un breve aviso
        console.warn("[Quiz] Sesión expirada al navegar preguntas.");
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
        return;
      }
      // Errores de red o transitorios: no interrumpir, solo logear
      console.error("[Quiz] Error al avanzar pregunta:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTextAnswerSubmit = async () => {
    if (!questions || (!isChiqui && !progress?.id) || !textAnswers[questions[currentQuestionIndex].id]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerText = textAnswers[currentQuestion.id];

    const studentAnswer: any = {
      progressId: progress?.id || 0,
      questionId: currentQuestion.id,
      answerId: null,
      userResponse: answerText,
      isCorrect: false,
      variables: currentQuestion.variables,
      timeSpent: elapsedTime,
    };

    // Actualización optimista del estado local
    setStudentAnswers(prev => {
      const filtered = prev.filter(ans => ans.questionId !== studentAnswer.questionId);
      return [...filtered, studentAnswer];
    });
    setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));

    try {
      if (!isChiqui) {
        submitAnswerMutation.mutate(studentAnswer);
      }
    } catch (error) {
      console.error("[Quiz] Error al guardar respuesta de texto:", error);
    }

    return studentAnswer;
  };

  const handleRequestHint = async (type: 'regular' | 'super') => {
    if (!questions || (!isChiqui && !progress?.id)) return;

    const currentQuestion = questions[currentQuestionIndex];
    const cost = type === 'regular' ? 1 : 2;

    // Prevent duplicate hint type for the same question
    if (usedHintTypes[currentQuestion.id]?.includes(type)) {
      toast({
        title: 'Pista ya utilizada',
        description: `Ya has utilizado una pista de tipo "${type === 'regular' ? 'Regular' : 'Súper'}" para esta pregunta.`,
        variant: 'destructive',
      });
      return;
    }

    if ((session?.hintCredits || 0) < cost) {
      toast({
        title: 'Créditos insuficientes',
        description: `Necesitas ${cost} créditos para esta pista.`,
        variant: 'destructive',
      });
      return;
    }

    setRequestingHint(true);
    try {
      const res = await apiRequest('POST', '/api/hints/request', {
        questionId: currentQuestion.id,
        hintType: type,
        hintIndex: (hintsRevealed[currentQuestion.id] || []).length + 1,
        progressId: progress?.id || 0
      });

      const data = await res.json();

      setHintsRevealed(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), data.content]
      }));

      setUsedHintTypes(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), type]
      }));

      toast({
        title: 'Pista revelada',
        description: 'Se ha descontado el costo de tus créditos.',
      });
      setIsHintDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener la pista.',
        variant: 'destructive',
      });
    } finally {
      setRequestingHint(false);
    }
  };

  const handleFinishQuiz = async (finalAnswers?: any[]) => {
    pause();
    const answersToUse = finalAnswers || studentAnswers;
    if (isChiqui) {
      try {
        const score = answersToUse.filter(a => a.isCorrect).length;

        await apiRequest("POST", "/api/chiquitest/result", {
          categoryId: parseInt(categoryId!),
          score: score,
          answers: answersToUse
        });

        localStorage.removeItem(`chiqui_partial_${categoryId}`);

        toast({
          title: "¡Repasito completado!",
          description: `Has acertado ${score} de 5 preguntas. ¡Sigue así!`,
        });

        queryClient.invalidateQueries({ queryKey: ["chiqui-results"] });
        queryClient.invalidateQueries({ queryKey: ["chiqui-history"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setChiquiScore(score);
        setShowChiquiResult(true);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el resultado del Repasito.',
          variant: 'destructive',
        });
      }
      return;
    }

    if (!progress || !quiz) return;

    try {
      // Deduplicar respuestas por ID de pregunta para asegurar conteo exacto
      const uniqueAnswers = Array.from(
        new Map(answersToUse.map(a => [a.questionId, a])).values()
      );

      const totalQ = questions?.length || 0;
      const correctQ = uniqueAnswers.filter(a => a.isCorrect).length;

      // Calcular nota sobre 10 usando el total real de preguntas como denominador
      // Asegurar que la nota no exceda el máximo de 10.0 ante posibles cambios de metadata
      const rawScore = totalQ > 0 ? (correctQ / totalQ) * 10 : 0;
      const score = Number(Math.min(rawScore, 10).toFixed(1));
      const totalTime = getTotalTime();

      const progressUpdate = {
        ...progress,
        status: 'completed' as const,
        score,
        timeSpent: totalTime, // Save cumulative time
        completedAt: new Date().toISOString(),
        finalAnswers: uniqueAnswers, // Enviar respuestas para evitar race condition
      };

      await createProgressMutation.mutateAsync(progressUpdate);

      // El servidor ya guarda quizSubmission dentro de POST /api/progress cuando status='completed'.
      // No se llama a /api/quiz-submission por separado para evitar race condition con el score autoritativo.

      setLocation(`/results/${progress.id}?source=quiz`, { replace: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo finalizar el cuestionario.',
        variant: 'destructive',
      });
    }
  };

  const handleExit = async () => {
    if (progress) {
      try {
        await createProgressMutation.mutateAsync({
          ...progress,
          timeSpent: getTotalTime(),
        });
      } catch (e) {
        console.error("Error saving progress on exit", e);
      }
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation(session?.role === 'admin' ? "/admin/quizzes" : "/dashboard");
    }
  };

  // Prevent flashing by waiting for progress initialization (creation or fetch)
  if (sessionLoading || (!isChiqui && loadingQuiz) || loadingQuestions || (!isInitialized && session?.userId !== 1 && !isReadOnly)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (errorQuestions || !questions || questions.length === 0) {
    if (isChiqui) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center bg-slate-950 text-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px]" />
          </div>

          <div className="bg-amber-500/10 p-4 rounded-full mb-4 border border-amber-500/20 relative z-10 animate-bounce">
            <Zap className="h-12 w-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent relative z-10">¡Aún no hay Repasitos disponibles!</h2>
          <p className="text-slate-300 max-w-sm mb-3 leading-relaxed relative z-10 text-sm">
            La sección de <strong>Repasitos</strong> sirve para repasar conceptos que ya has estudiado.
          </p>
          <p className="text-slate-400 max-w-sm mb-6 text-xs relative z-10">
            Como todavía no has realizado cuestionarios de esta materia, la inteligencia artificial no tiene preguntas para repasar. ¡Te invitamos a realizar cuestionarios primero!
          </p>
          <Button onClick={() => setLocation("/dashboard")} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 font-bold relative z-10">
            Volver al Inicio
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-slate-950 text-slate-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Error al cargar las preguntas</h2>
        <p className="text-slate-400 mb-4">No se pudieron encontrar preguntas para este cuestionario.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">Recargar</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">No questions found</div>;

  const correctAnswers = questions?.reduce((acc: Record<number, boolean | null>, question, index) => {
    const studentAnswer = studentAnswers.find(a => a.questionId === question.id);
    if (studentAnswer) {
      acc[index] = studentAnswer.isCorrect;
    }
    return acc;
  }, {}) || {};

  if (showChiquiResult && isChiqui) {
    const correctCount = studentAnswers.filter(a => a.isCorrect).length;
    const totalCount = questions?.length || 0;
    const failedAnswers = studentAnswers.filter(a => !a.isCorrect);

    const handleRequestExplanation = (questionId: number, question: string, correctAnswer: string) => {
      setCurrentExplanation({ questionId, question, correctAnswer });
      setShowExplanation(true);
    };

    return (
      <div className="min-h-screen bg-[#0a0b14] p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8 text-left">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-5 rounded-3xl shadow-lg shadow-yellow-500/20 transform hover:scale-110 transition-transform duration-300 mb-6">
                  <Trophy className="w-12 h-12 text-slate-900" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">¡Repasito Completado!</h2>
                <p className="text-slate-400">Has fortalecido tus conocimientos hoy</p>
              </div>

              <div className="flex justify-center">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-center min-w-[200px]">
                  <div className="text-4xl font-black text-emerald-400 mb-1">{chiquiScore}/5</div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Aciertos</div>
                </div>
              </div>


              {failedAnswers.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Revisión de Errores ({failedAnswers.length})
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {failedAnswers.map((answer, index) => {
                      const question = questions.find(q => q.id === answer.questionId);
                      if (!question) return null;
                      const correctAnswer = question.answers?.find(a => a.isCorrect);

                      return (
                        <div key={index} className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                          <div className="text-sm text-slate-300 font-medium">
                            <ContentRenderer content={question.content} />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-2 border-t border-white/5">
                            <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block mb-0.5">Correcta:</span>
                              <div className="text-xs text-white font-medium">
                                <ContentRenderer content={correctAnswer?.content || ''} />
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
                              className="border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white h-9 px-4 rounded-xl transition-all"
                            >
                              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                              Explicación
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <Home className="mr-2 w-5 h-5" />
                  Volver al Inicio
                </Button>

                <p className="text-slate-500 text-sm text-center">
                  Tus resultados han sido guardados y se verán reflejados en tu tablero.
                </p>
              </div>
            </div>
          </div>
        </div>

        {showExplanation && currentExplanation && (
          <ExplanationModal
            questionId={currentExplanation.questionId}
            question={currentExplanation.question}
            correctAnswer={currentExplanation.correctAnswer}
            quizTitle="Repasito Diario"
            onClose={() => setShowExplanation(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2"
                onClick={handleExit}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Atrás
              </Button>
            </div>

            {isEditingQuizMeta ? (
              <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-4 my-2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 w-full max-w-2xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-white/10 pb-2">
                  <Pencil className="w-4 h-4" />
                  <span>Editar Título y Tiempo del Cuestionario</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Título del Cuestionario</label>
                    <Input
                      value={editQuizTitle}
                      onChange={(e) => setEditQuizTitle(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white font-bold text-base h-10 focus:border-amber-500/60"
                      placeholder="Título del cuestionario..."
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Tiempo Máximo (minutos)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="180"
                        value={editQuizTimeMinutes}
                        onChange={(e) => setEditQuizTimeMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bg-slate-950 border-slate-700 text-amber-400 font-mono font-bold text-base h-10 focus:border-amber-500/60"
                      />
                      <span className="text-xs font-bold text-slate-400">min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingQuizMeta(false)}
                    disabled={updateQuizMetaMutation.isPending}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50 transition-colors"
                  >
                    <CloseIcon className="w-4 h-4 mr-1.5" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editQuizTitle.trim() && editQuizTimeMinutes > 0) {
                        updateQuizMetaMutation.mutate({
                          title: editQuizTitle.trim(),
                          timeLimit: editQuizTimeMinutes * 60,
                        });
                      }
                    }}
                    disabled={updateQuizMetaMutation.isPending || !editQuizTitle.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {updateQuizMetaMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1.5" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-white flex-wrap">
                  <span>{isChiqui ? "⚡ Repasito Diario" : quiz?.title}</span>
                  {isAdmin && !isChiqui && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                      Modo Admin - Sin Guardar
                    </Badge>
                  )}
                  {isAdmin && !isChiqui && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditQuizTitle(quiz?.title || "");
                        setEditQuizTimeMinutes(Math.round((quiz?.timeLimit || 0) / 60));
                        setIsEditingQuizMeta(true);
                      }}
                      className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-1"
                      title="Editar título y tiempo del cuestionario"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Button>
                  )}
                  {isAdmin && !isChiqui && quiz && (
                    <ActiveQuizPreviewToggle quiz={quiz} />
                  )}
                  {isAdmin && !isChiqui && quiz && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAllForAI}
                      className="h-7 px-2.5 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 border border-purple-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-1 transition-all shadow-sm"
                      title="Copiar todas las preguntas, respuestas y distractores formateados para IA (ChatGPT, Claude, etc.)"
                    >
                      {copiedAI ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bot className="w-3.5 h-3.5 text-purple-400" />}
                      <span>Copiar para IA</span>
                    </Button>
                  )}
                  {isReadOnly && (
                    <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-500/10 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Modo Solo Lectura
                    </Badge>
                  )}
                </h1>

                {!isReadOnly && (
                  <div className="flex items-center gap-2 mt-2">
                    {isAdmin ? (
                      <div
                        id="tour-timer"
                        onClick={() => {
                          if (!isChiqui) {
                            setEditQuizTitle(quiz?.title || "");
                            setEditQuizTimeMinutes(Math.round((quiz?.timeLimit || 0) / 60));
                            setIsEditingQuizMeta(true);
                          }
                        }}
                        className="flex items-center text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 cursor-pointer transition-colors group"
                        title="Tiempo máximo del cuestionario (Pausado para Admin). Haz clic para editar."
                      >
                        <Timer className="h-4 w-4 mr-2 text-amber-400" />
                        <span className="font-mono font-bold text-amber-300">
                          {formatMaxTime(quiz?.timeLimit)}
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-bold uppercase ml-2">
                          (Tiempo Máx.)
                        </span>
                        <Pencil className="h-3 w-3 ml-2 text-amber-400 opacity-60 group-hover:opacity-100" />
                      </div>
                    ) : (
                      <div id="tour-timer" className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                        <Timer className="h-4 w-4 mr-2 text-blue-400" />
                        <span className={`font-mono font-medium ${elapsedTime > (quiz?.timeLimit || 0) * 0.9 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                          {formattedTime()}
                        </span>
                      </div>
                    )}

                    {/* Cumulative Time Display */}
                    <div className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5" title="Tiempo total acumulado">
                      <Clock className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="font-mono font-medium text-slate-200">
                        {formatTotalTime(getTotalTime())}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-none">
              Pregunta {currentQuestionIndex + 1} / {questions.length}
            </Badge>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{studentAnswers.filter(a => a.isCorrect).length}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-sm font-medium text-red-400">
              <XCircle className="w-4 h-4" />
              <span>{studentAnswers.filter(a => !a.isCorrect).length}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-medium text-blue-400 px-2">
              {studentAnswers.reduce((sum, a) => {
                const question = questions?.find(q => q.id === a.questionId);
                return sum + (a.isCorrect ? (question?.points || 0) : 0);
              }, 0)} pts
            </span>
            <div className="h-4 w-px bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHideAnswersMode}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                hideAnswersMode
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  : "bg-slate-800/80 text-slate-400 border border-white/10 hover:text-white hover:bg-slate-700"
              )}
              title={hideAnswersMode ? "Modo Clase Activo: Las respuestas están ocultas" : "Activar Modo Clase para ocultar las opciones de respuesta"}
            >
              {hideAnswersMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Modo Clase (Oculto)</span>
                  <span className="sm:hidden">Oculto</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modo Clase</span>
                  <span className="sm:hidden">Clase</span>
                </>
              )}
            </Button>
            <div className="h-4 w-px bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenTheory}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative group",
                isTheoryOpen
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                  : session?.isPremium
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 hover:text-white hover:border-indigo-400/50 shadow-sm"
                    : "bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 text-amber-300/90 border border-amber-500/30 hover:border-amber-400 hover:text-amber-200 hover:bg-amber-500/20"
              )}
              title={session?.isPremium ? "Consultar fórmulas y conceptos clave del tema" : "Fórmulas y conceptos clave (Función Premium)"}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="hidden sm:inline">Fórmulas</span>
              <span className="sm:hidden">Teoría</span>
              {!session?.isPremium && (
                <Crown className="w-3 h-3 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)] ml-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area - No Card Wrapper */}
        <div className="mb-8">
          {isEditing ? (
            <div className="space-y-6 bg-slate-900/80 p-6 rounded-2xl border border-blue-500/30 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                  <Pencil className="h-5 w-5" /> Modo Edición de Pregunta
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.")) {
                        deleteQuestionMutation.mutate(questions[currentQuestionIndex].id);
                      }
                    }} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    disabled={deleteQuestionMutation.isPending}
                  >
                    {deleteQuestionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Eliminar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-400 hover:text-white hover:bg-slate-800">
                    <CloseIcon className="h-4 w-4 mr-2" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={updateQuestionMutation.isPending} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                    {updateQuestionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-400 flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
                    Contenido de la pregunta
                    <span className="text-[10px] lowercase font-normal opacity-70">(usa ¡ para fórmulas)</span>
                  </Label>
                  <Textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-200 text-lg min-h-[120px] focus:border-blue-500/50"
                    placeholder="Escribe la pregunta..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider font-bold">URL de la imagen (opcional)</Label>
                  <Input
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500/50"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider font-bold">Opciones de respuesta</Label>
                  {currentQuestion.type === 'text' ? (
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-white/5 italic text-slate-500 text-sm">
                      Las preguntas de tipo texto se califican automáticamente por coincidencia o IA.
                    </div>
                  ) : (editAnswers.map((answer, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-slate-950/50 p-3 rounded-lg border border-white/5 transition-colors hover:border-white/10">
                      <div className="flex flex-col items-center gap-1">
                        <Checkbox
                          checked={answer.isCorrect}
                          onCheckedChange={(checked) => {
                            const newAnsws = [...editAnswers];
                            newAnsws[idx] = { ...newAnsws[idx], isCorrect: !!checked };
                            setEditAnswers(newAnsws);
                          }}
                          className="data-[state=checked]:bg-green-600 border-slate-600"
                        />
                        <span className={`text-[10px] font-bold uppercase ${answer.isCorrect ? 'text-green-500' : 'text-slate-600'}`}>
                          {answer.isCorrect ? 'Correcta' : 'Inc.'}
                        </span>
                      </div>
                      <Input
                        value={answer.content}
                        onChange={(e) => {
                          const newAnsws = [...editAnswers];
                          newAnsws[idx] = { ...newAnsws[idx], content: e.target.value };
                          setEditAnswers(newAnsws);
                        }}
                        className="bg-slate-950 border-slate-700 text-slate-200 flex-1 focus:border-blue-500/50"
                        placeholder={`Opción ${idx + 1}`}
                      />
                    </div>
                  )))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-2">
                  <Badge
                    className={`${currentQuestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' :
                        'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      } border-none transition-colors`}
                  >
                    {currentQuestion.difficulty === 'hard' ? 'Difícil' :
                      currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-1 rounded-full font-medium shadow-lg shadow-blue-500/20">
                  {currentQuestion.points} puntos
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-slate-400">
                  {currentQuestion.type === 'equation'
                    ? 'Resuelve la siguiente ecuación:'
                    : currentQuestion.type === 'text'
                      ? 'Responde la siguiente pregunta:'
                      : isDirectInput
                        ? 'Escribe la respuesta correcta:'
                        : 'Selecciona la respuesta correcta'}
                </h3>

                {currentQuestion.imageUrl && (
                  <div className="mb-6 flex justify-center">
                    <ZoomableImage
                      src={currentQuestion.imageUrl}
                      alt="Imagen de la pregunta"
                    />
                  </div>
                )}

                {/* Admin: Show Correct Answer */}
                {isAdmin && (
                  <div className={cn(
                    "mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-300 text-sm flex items-start gap-3 transition-all duration-300",
                    hideAnswersMode && !answeredQuestions[currentQuestionIndex] && "filter blur-md select-none opacity-30 hover:filter-none hover:opacity-100 cursor-pointer"
                  )}>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold block text-green-400">Respuesta Correcta (Solo Admin):</span>
                        {hideAnswersMode && !answeredQuestions[currentQuestionIndex] && (
                          <span className="text-[10px] text-amber-400/90 font-medium italic bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 select-none">
                            🙈 Oculta por Modo Clase (Pasa el cursor)
                          </span>
                        )}
                      </div>
                      {currentQuestion.type === 'text' ? (
                        <span className="font-mono bg-slate-950/50 px-2 py-1 rounded border border-green-500/20 block w-full">
                          {currentQuestion.answers?.map(a => a.content).join(' O ')}
                        </span>
                      ) : (
                        <div className="font-medium space-y-1">
                          {currentQuestion.answers?.filter((a: any) => a.isCorrect).map((a: any) => (
                            <div key={a.id} className="flex items-center gap-2">
                              <span>•</span> <ContentRenderer content={a.content} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <QuestionContent
                  content={currentQuestion.content}
                  canCopy={canCopyRawContent}
                  onCopy={() => handleCopyRaw(currentQuestion.content, `question-${currentQuestion.id}`, "Pregunta")}
                  isCopied={copiedKey === `question-${currentQuestion.id}`}
                />

                {hintsRevealed[currentQuestion.id]?.map((hint, index) => (
                  <div key={index} className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Pista {index + 1}
                    </h4>
                    <div className="text-slate-300">
                      <AIMarkdown content={hint} className="prose-invert [&_*]:text-slate-200" />
                    </div>
                  </div>
                ))}
              </div>

              {currentQuestion.type === 'text' ? (
                <div className="space-y-4">
                  <Textarea
                    value={textAnswers[currentQuestion.id] || ''}
                    onChange={(e) => !answeredQuestions[currentQuestionIndex] && setTextAnswers({
                      ...textAnswers,
                      [currentQuestion.id]: e.target.value
                    })}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={4}
                    disabled={answeredQuestions[currentQuestionIndex]}
                    className="bg-slate-900/50 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none disabled:opacity-50"
                  />
                  {answeredQuestions[currentQuestionIndex] && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/10">
                      <h4 className="font-medium mb-2 text-slate-400">Tu respuesta:</h4>
                      <p className="text-slate-200">{textAnswers[currentQuestion.id]}</p>
                    </div>
                  )}
                </div>
              ) : isDirectInput ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                    <div className="relative">
                      <Input
                        ref={inputRef}
                        value={directResponse}
                        onChange={(e) => !answeredQuestions[currentQuestionIndex] && setDirectResponse(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        className="bg-slate-900 border-white/10 text-xl py-6 h-auto text-slate-100 placeholder:text-slate-600 focus:ring-blue-500/50 rounded-2xl transition-all"
                        disabled={answeredQuestions[currentQuestionIndex]}
                      />
                    </div>
                  </div>

                  {!answeredQuestions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <MathKeyboard
                        onInput={handleMathInput}
                        onDelete={() => {
                          const input = inputRef.current;
                          if (!input) {
                            setDirectResponse(prev => prev.slice(0, -1));
                            return;
                          }
                          const start = input.selectionStart || 0;
                          const end = input.selectionEnd || 0;
                          if (start === end) {
                            setDirectResponse(prev => prev.substring(0, start - 1) + prev.substring(start));
                            setTimeout(() => {
                              input.focus();
                              input.setSelectionRange(start - 1, start - 1);
                            }, 0);
                          } else {
                            setDirectResponse(prev => prev.substring(0, start) + prev.substring(end));
                            setTimeout(() => {
                              input.focus();
                              input.setSelectionRange(start, start);
                            }, 0);
                          }
                        }}
                        className="max-w-md mx-auto"
                      />
                    </div>
                  )}

                  {answeredQuestions[currentQuestionIndex] && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-center gap-3 text-blue-400 mb-2 font-medium">
                        <Brain className="h-5 w-5" />
                        Evaluación por IA en progreso...
                      </div>
                      <p className="text-slate-400 text-sm">Tu respuesta: <span className="text-slate-100 font-mono bg-slate-950 px-2 py-1 rounded ml-2">{directResponse}</span></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {hideAnswersMode && !answeredQuestions[currentQuestionIndex] && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 text-xs sm:text-sm animate-in fade-in duration-300 shadow-lg">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
                        <span>
                          <strong>Modo Clase Activo:</strong> Respuestas difuminadas para obligar al trabajo independiente. Pasa el cursor sobre una opción o haz clic en <strong>Mostrar</strong>.
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleHideAnswersMode}
                        className="h-7 px-3 text-xs text-amber-300 hover:bg-amber-500/20 hover:text-amber-100 border border-amber-500/30 shrink-0 font-bold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Mostrar
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    {(() => {
                      const hasMathContent = shuffledAnswers.some(a =>
                        a.content && (a.content.includes('¡') || a.content.includes('\\'))
                      );
                      const isBlurActive = hideAnswersMode && !answeredQuestions[currentQuestionIndex];

                      return shuffledAnswers.map((answer, index) => {
                        const existingAnswer = studentAnswers.find(sa =>
                          sa.questionId === currentQuestion.id && sa.answerId === answer.id
                        );
                        const isSelected = selectedAnswerId === answer.id || !!existingAnswer;
                        const isAnswered = answeredQuestions[currentQuestionIndex];

                        let variantClass = "bg-slate-800/30 border-white/5 hover:bg-slate-800/60 hover:border-blue-500/30 text-slate-300";

                        if (isAnswered) {
                          if (answer.isCorrect) {
                            variantClass = "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                          } else if (isSelected) {
                            variantClass = "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                          } else {
                            variantClass = "opacity-60 border-white/5 bg-slate-900/20 text-slate-500";
                          }
                        } else if (isSelected) {
                          variantClass = "bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                        }

                        return (
                          <button
                            key={answer.id}
                            onClick={() => !isAnswered && !isReadOnly && handleSelectAnswer(answer.id)}
                            disabled={isAnswered || isReadOnly}
                            className={`w-full text-left ${hasMathContent ? 'py-3' : 'py-4'} px-5 rounded-xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${variantClass} ${isReadOnly ? 'cursor-default opacity-80' : ''}`}
                          >
                            <div className="flex items-center gap-4 relative z-10 w-full min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold shrink-0 transition-colors
                                      ${isSelected || (isAnswered && answer.isCorrect)
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'bg-slate-900/50 border-white/10 text-slate-500 group-hover:text-slate-300 group-hover:border-white/20'
                                }
                                    `}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <div className={cn(
                                "font-medium flex-1 min-w-0 overflow-x-auto overflow-y-hidden custom-scrollbar py-0.5 transition-all duration-300",
                                getAnswerSizeClass(answer.content),
                                isBlurActive && "filter blur-md select-none opacity-30 group-hover:filter-none group-hover:opacity-100 group-hover:select-text"
                              )}>
                                <ContentRenderer content={answer.content} tight={true} />
                              </div>
                              {isBlurActive && (
                                <span className="text-[11px] text-amber-400/80 font-medium italic group-hover:hidden shrink-0 ml-2 select-none bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  🙈 Oculta
                                </span>
                              )}
                              {canCopyRawContent && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleCopyRaw(answer.content, `answer-${answer.id}`, `Opción ${String.fromCharCode(65 + index)}`);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleCopyRaw(answer.content, `answer-${answer.id}`, `Opción ${String.fromCharCode(65 + index)}`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors opacity-60 hover:opacity-100 cursor-pointer shrink-0 ml-2 z-20 flex items-center justify-center"
                                  title={`Copiar texto de la opción ${String.fromCharCode(65 + index)}`}
                                >
                                  {copiedKey === `answer-${answer.id}` ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </span>
                              )}
                            </div>
                            {isAnswered && answer.isCorrect && <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0 ml-4" />}
                            {isAnswered && isSelected && !answer.isCorrect && <XCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0 ml-4" />}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        <div className="relative flex flex-wrap justify-between items-center mb-8 gap-3">
          <Button
            variant="outline"
            className="flex items-center border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/50 z-10 h-10 px-3 sm:px-4"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || isEditing}
          >
            <ArrowLeft className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {/* Centro: Botones de Pista y Explicación (Sutil, elegante y discreto) */}
          <div
            className={`flex items-center gap-2.5 z-10 ${
              session?.canReport
                ? 'px-2'
                : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          >
            <Button
              variant="outline"
              className={`flex items-center border-yellow-500/50 text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500 hover:text-slate-900 hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-all duration-300 scale-100 hover:scale-105 h-10 px-3 sm:px-4 ${
                isReadOnly
                  ? 'opacity-50 cursor-not-allowed hover:bg-yellow-500/5 hover:text-yellow-400 hover:scale-100 hover:shadow-none'
                  : ''
              }`}
              onClick={() => {
                if (isReadOnly) {
                  toast({
                    title: 'Función de Estudiante',
                    description: 'Solo tu hij@ puede ver las pistas.',
                    variant: 'default',
                  });
                } else {
                  setIsHintDialogOpen(true);
                }
              }}
            >
              <Lightbulb className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Pista</span>
            </Button>

            {/* Botón de Explicación/Procedimiento: Sutil y discreto al lado de Pista, visible solo tras responder */}
            {answeredQuestions[currentQuestionIndex] && (() => {
              const currentQ = questions?.[currentQuestionIndex];
              const existingAns = currentQ
                ? studentAnswers.find((sa) => sa.questionId === currentQ.id)
                : null;
              const chosen = currentQ?.answers?.find(
                (a: any) => a.id === (existingAns?.answerId || selectedAnswerId)
              );
              const isCorrect =
                existingAns?.isCorrect === true || (chosen && chosen.isCorrect);

              return (
                <Button
                  variant="outline"
                  onClick={handleOpenExplanation}
                  title={
                    isCorrect
                      ? 'Ver procedimiento matemático paso a paso (Premium)'
                      : 'Ver explicación detallada de la solución (Premium)'
                  }
                  className={cn(
                    'flex items-center h-10 px-3 sm:px-4 transition-all duration-300 font-semibold shadow-sm animate-in fade-in zoom-in-95',
                    isCorrect
                      ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25 hover:text-emerald-200'
                      : 'border-blue-500/50 text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 hover:text-blue-200'
                  )}
                >
                  <BookOpen className="sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isCorrect ? 'Procedimiento' : 'Explicación'}
                  </span>
                  {!session?.isPremium && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 sm:ml-1.5" />
                  )}
                </Button>
              );
            })()}
          </div>

          <div className="flex items-center gap-2 z-10 ml-auto flex-wrap sm:flex-nowrap">
            {isAdmin && (
              <Button
                variant="outline"
                className={`flex items-center transition-all h-10 px-3 sm:px-4 ${(quiz as any)?.isVerified
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300'
                  : 'border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white bg-slate-900/50'
                  }`}
                onClick={async () => {
                  if (!quiz?.id) return;
                  try {
                    const res = await fetch(`/api/quizzes/${quiz.id}/verify`, {
                      method: 'PATCH',
                      credentials: 'include',
                    });
                    if (res.ok) {
                      const data = await res.json();
                      queryClient.setQueryData([`/api/quizzes/${quiz.id}`], (old: any) =>
                        old ? { ...old, isVerified: data.isVerified } : old
                      );
                      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
                    }
                  } catch (e) {
                    console.error('Error toggling verify:', e);
                  }
                }}
              >
                {(quiz as any)?.isVerified ? (
                  <><ShieldCheck className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Verificado</span></>
                ) : (
                  <><ShieldOff className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Verificar</span></>
                )}
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                className="flex items-center border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 bg-amber-500/5 h-10 px-3 sm:px-4"
                onClick={handleStartEdit}
                disabled={isEditing}
              >
                <Pencil className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Editar Pregunta</span>
              </Button>
            )}
            {session?.canReport && (
              <Button
                variant="outline"
                className="flex items-center border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-red-500/5 h-10 px-3 sm:px-4"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <Flag className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Reportar</span>
              </Button>
            )}

            <Button
              onClick={handleNextQuestion}
              disabled={isNavigating || isEditing || (
                !answeredQuestions[currentQuestionIndex] &&
                selectedAnswerId === null &&
                (progress?.responseMode !== 'direct_input' || !directResponse.trim()) &&
                (currentQuestion.type !== 'text' || !textAnswers[currentQuestion.id]?.trim())
              )}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20 h-10 px-4 sm:px-6"
            >
              {isNavigating ? (
                'Procesando...'
              ) : (
                <>
                  {(currentQuestionIndex >= (questions?.length || 0) - 1) || (Object.keys(answeredQuestions).length === (questions?.length || 0)) || (Object.keys(answeredQuestions).length === (questions?.length || 0) - 1 && !answeredQuestions[currentQuestionIndex]) ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div id="tour-quiz-navigation" className="mt-8 bg-slate-900/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <QuestionProgress
            totalQuestions={questions?.length || 0}
            completedQuestions={Object.keys(answeredQuestions).length}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionClick={(index) => {
              console.log(`[PROGRESS] Clicked on question ${index}`);
              setCurrentQuestionIndex(index);
            }}
            disabled={false}
            correctAnswers={correctAnswers}
            responseMode={progress?.responseMode}
          />
        </div>

        <Dialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Solicitar Pista</DialogTitle>
              <DialogDescription className="text-slate-400">
                ¿Qué tipo de pista necesitas?
                <br />
                <span className="text-sm text-blue-400 font-medium mt-2 block">
                  Créditos disponibles: {session?.hintCredits ?? 0}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {requestingHint ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-center text-slate-400 animate-pulse font-medium">
                    Consultando a los sabios matemáticos...
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="justify-between h-auto py-4 border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:text-white group"
                    onClick={() => handleRequestHint('regular')}
                    disabled={requestingHint || (session?.hintCredits || 0) < 1}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-200 group-hover:text-white">Pista Regular</div>
                      <div className="text-sm text-slate-500 group-hover:text-slate-400">Ayuda sutil para guiarte</div>
                    </div>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">1 Crédito</Badge>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-between h-auto py-4 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 group"
                    onClick={() => handleRequestHint('super')}
                    disabled={requestingHint || (session?.hintCredits || 0) < 2}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-yellow-400 group-hover:text-yellow-300">Súper Pista</div>
                      <div className="text-sm text-yellow-500/70 group-hover:text-yellow-500/90">Muy reveladora (casi la respuesta)</div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">2 Créditos</Badge>
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isIncompleteDialogOpen} onOpenChange={setIsIncompleteDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Preguntas sin contestar
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Aún tienes {questions ? questions.length - Object.keys(answeredQuestions).length : 0} preguntas sin contestar.
                <br />
                Debes contestar todas las preguntas para poder finalizar el cuestionario.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsIncompleteDialogOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Volver al cuestionario
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Reportar un error</DialogTitle>
              <DialogDescription className="text-slate-400">
                Describe el problema que encontraste en esta pregunta.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Opciones comunes</Label>
                <Select onValueChange={(value) => setReportDescription(prev => prev ? `${prev}\n${value}` : value)}>
                  <SelectTrigger className="bg-slate-800 border-white/10 text-slate-200">
                    <SelectValue placeholder="Selecciona un error común..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="La pregunta está mal redactada">La pregunta está mal redactada</SelectItem>
                    <SelectItem value="Errores de escritura en la pregunta">Errores de escritura en la pregunta</SelectItem>
                    <SelectItem value="Errores matemáticos en la pregunta">Errores matemáticos en la pregunta</SelectItem>
                    <SelectItem value="No está la respuesta correcta">No está la respuesta correcta</SelectItem>
                    <SelectItem value="Hay dos respuestas correcta">Hay dos respuestas correcta</SelectItem>
                    <SelectItem value="Errores de escritura en la respuesta">Errores de escritura en la respuesta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Descripción detallada</Label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe el error..."
                  className="bg-slate-800 border-white/10 text-slate-200 min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} disabled={reportErrorMutation.isPending}>Cancelar</Button>
              <Button
                onClick={handleReportSubmit}
                disabled={!reportDescription.trim() || reportErrorMutation.isPending}
                className="min-w-[120px]"
              >
                {reportErrorMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  'Enviar Reporte'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Explicación Detallada */}
        {showExplanation && currentExplanation && (
          <ExplanationModal
            questionId={currentExplanation.questionId}
            question={currentExplanation.question}
            correctAnswer={currentExplanation.correctAnswer}
            quizTitle={quiz?.title || 'Matemáticas'}
            onClose={() => setShowExplanation(false)}
          />
        )}

        {/* Modal de Invitación a Premium */}
        <PremiumUpgradeModal
          open={showPremiumModal}
          onOpenChange={setShowPremiumModal}
          title={premiumModalData.title}
          description={premiumModalData.description}
        />

        {/* Panel Lateral Deslizable: Fórmulas y Conceptos Clave */}
        <Sheet open={isTheoryOpen} onOpenChange={setIsTheoryOpen}>
          <SheetContent 
            side="right" 
            overlayClassName="bg-black/40 backdrop-blur-[2px]"
            className="w-full sm:max-w-xl md:max-w-2xl bg-slate-950/95 border-l border-white/10 text-slate-100 p-0 flex flex-col shadow-2xl backdrop-blur-2xl z-[70]"
          >
            {/* Header del Sheet */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      Fórmulas y Conceptos Clave
                    </h3>
                    <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0 font-medium">
                      Guía Rápida
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {quiz?.title || "Cuestionario de Matemáticas"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {quiz?.theoryNotes && quiz.theoryNotes.trim().length > 0 ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      Usa este resumen teórico para orientarte en cualquier duda mientras respondes las preguntas. No perderás tu progreso ni el tiempo acumulado.
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-inner">
                    <ContentRenderer content={quiz.theoryNotes} />
                  </div>
                </div>
              ) : (
                /* Estado Amigable cuando aún no hay fórmulas cargadas */
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-6">
                  {/* Glowing Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-amber-500/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-500/30 flex items-center justify-center shadow-xl">
                      <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Próximamente disponible
                    </div>
                    <h4 className="text-xl font-bold text-white">
                      Fórmulas y Conceptos en Preparación
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Estamos redactando el formulario condensado, las definiciones teóricas y los trucos de resolución para este cuestionario (<span className="text-indigo-300 font-medium">{quiz?.title}</span>).
                    </p>
                  </div>

                  {/* Tarjeta de lo que incluirá */}
                  <div className="w-full max-w-md bg-slate-900/70 border border-white/10 rounded-2xl p-5 text-left space-y-3.5 shadow-lg">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                      Lo que encontrarás en esta sección:
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-indigo-400" />
                        </div>
                        <span><strong>Formularios y Teoremas:</strong> Todas las ecuaciones clave y fórmulas directas que necesitas tener a mano.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-indigo-400" />
                        </div>
                        <span><strong>Conceptos y Propiedades:</strong> Explicaciones concisas del tema para refrescar tu memoria al instante.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-indigo-400" />
                        </div>
                        <span><strong>Estrategias de Resolución:</strong> Consejos para identificar patrones y evitar trampas algebraicas.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 max-w-md">
                    💡 <span className="text-slate-300 font-medium">Tip de estudio:</span> Mientras tanto, recuerda que puedes usar las pistas individuales de cada pregunta para recibir orientación paso a paso.
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Sheet */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80 flex justify-end shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTheoryOpen(false)}
                className="bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700 hover:text-white text-xs"
              >
                Cerrar panel
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ActiveQuiz;