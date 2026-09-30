import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentRenderer } from '@/components/ContentRenderer';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  Radio,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Copy,
  Sparkles,
  Wifi,
  WifiOff,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface Answer {
  id: number;
  content: string;
  isCorrect?: boolean;
}

interface Question {
  id: number;
  content: string;
  type: string;
  difficulty: number | string;
  points: number;
  imageUrl?: string;
  explanation?: string;
  answers?: Answer[];
}

interface LiveQuizState {
  shareCode: string;
  quizId: number;
  quizTitle: string;
  studentName: string;
  timeLimit: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedAnswerId: number | null;
  directResponse: string;
  studentAnswers: any[];
  elapsedTime: number;
  hintsRevealed: Record<number, string[]>;
  status: 'in_progress' | 'completed' | 'stopped';
  score?: number | null;
  isStudentOnline: boolean;
  spectatorCount: number;
  questions: Question[];
}

export default function LiveQuizSpectator() {
  const params = useParams<{ shareCode: string }>();
  const shareCode = params?.shareCode || '';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<LiveQuizState | null>(null);

  // Spectator's locally viewed question index (can differ from student's if spectator browses)
  const [viewedIndex, setViewedIndex] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const autoFollowRef = useRef(true);

  useEffect(() => {
    autoFollowRef.current = autoFollow;
  }, [autoFollow]);

  // Local timer that ticks and syncs with student's time
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [copiedLink, setCopiedLink] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Connect to Live Quiz WebSocket
  const connectSpectatorWs = useCallback((code: string) => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live-quiz?code=${code}&role=spectator`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('📡 [Spectator WS] Connected to live room:', code);
      ws.send(JSON.stringify({
        type: 'spectator:join',
        shareCode: code,
        name: 'Espectador',
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'quiz:sync_state': {
            const data = msg.payload as LiveQuizState;
            setLiveState(data);
            setTimerSeconds(data.elapsedTime || 0);
            if (autoFollowRef.current) {
              setViewedIndex(data.currentQuestionIndex || 0);
            }
            if (data.status === 'completed') {
              try {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              } catch (e) {}
            }
            break;
          }

          case 'quiz:question_changed': {
            setLiveState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                currentQuestionIndex: msg.questionIndex,
                selectedAnswerId: msg.selectedAnswerId ?? null,
                directResponse: msg.directResponse ?? '',
                studentAnswers: msg.studentAnswers || prev.studentAnswers,
                questions: msg.questions || prev.questions,
              };
            });

            if (autoFollowRef.current) {
              setViewedIndex(msg.questionIndex);
            }
            break;
          }

          case 'quiz:answer_selected': {
            setLiveState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                selectedAnswerId: msg.answerId,
              };
            });
            break;
          }

          case 'quiz:response_typed': {
            setLiveState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                directResponse: msg.response,
              };
            });
            break;
          }

          case 'quiz:answer_submitted': {
            setLiveState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                studentAnswers: msg.studentAnswers || prev.studentAnswers,
                questions: msg.questions || prev.questions,
                selectedAnswerId: null,
                directResponse: '',
              };
            });
            break;
          }

          case 'quiz:hint_revealed': {
            setLiveState((prev) => {
              if (!prev) return prev;
              const updatedHints = { ...prev.hintsRevealed };
              if (!updatedHints[msg.questionId]) updatedHints[msg.questionId] = [];
              if (!updatedHints[msg.questionId].includes(msg.hint)) {
                updatedHints[msg.questionId].push(msg.hint);
              }
              return {
                ...prev,
                hintsRevealed: updatedHints,
              };
            });
            break;
          }

          case 'quiz:timer_sync': {
            setTimerSeconds(msg.elapsedTime);
            setLiveState((prev) => (prev ? { ...prev, elapsedTime: msg.elapsedTime } : prev));
            break;
          }

          case 'quiz:spectator_count': {
            setLiveState((prev) => (prev ? { ...prev, spectatorCount: msg.count } : prev));
            break;
          }

          case 'student:status': {
            setLiveState((prev) => (prev ? { ...prev, isStudentOnline: msg.isOnline } : prev));
            break;
          }

          case 'quiz:finished': {
            setLiveState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: 'completed',
                score: msg.score,
                studentAnswers: msg.finalAnswers || prev.studentAnswers,
              };
            });

            try {
              confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}

            toast({
              title: '🎉 ¡Cuestionario finalizado!',
              description: `El estudiante ha completado el cuestionario con una nota de ${msg.score}/10.`,
            });
            break;
          }

          case 'quiz:stopped': {
            setLiveState((prev) => (prev ? { ...prev, status: 'stopped' } : prev));
            toast({
              title: 'Transmisión finalizada',
              description: msg.message || 'El estudiante detuvo la transmisión.',
              variant: 'destructive',
            });
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[Spectator WS] Parse error:', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 [Spectator WS] Connection closed');
      // Auto-reconnect if live state is not finished or stopped
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (code) {
          console.log('🔄 [Spectator WS] Attempting to reconnect to room:', code);
          connectSpectatorWs(code);
        }
      }, 2500);
    };

    ws.onerror = (err) => {
      console.error('❌ [Spectator WS] Socket error:', err);
    };
  }, [toast]);

  // Initial HTTP Fetch
  useEffect(() => {
    if (!shareCode) {
      setError('Código de transmisión no válido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/live-quiz/${shareCode}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Transmisión no disponible o ya finalizada.');
        }
        return res.json();
      })
      .then((data) => {
        setLiveState(data);
        setViewedIndex(data.currentQuestionIndex || 0);
        setTimerSeconds(data.elapsedTime || 0);
        setLoading(false);
        connectSpectatorWs(shareCode);
      })
      .catch((err) => {
        console.error('[Spectator] Fetch error:', err);
        setError(err.message || 'No se pudo cargar la transmisión en vivo.');
        setLoading(false);
      });

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [shareCode, connectSpectatorWs]);

  // Local ticker for smooth timer updates between syncs
  useEffect(() => {
    if (liveState?.status === 'in_progress' && liveState.isStudentOnline) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [liveState?.status, liveState?.isStudentOnline]);

  // Copy spectator link
  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    toast({
      title: 'Enlace copiado',
      description: 'Comparte el enlace con otros espectadores.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Jump back to student's active question
  const handleFollowStudent = () => {
    if (!liveState) return;
    setViewedIndex(liveState.currentQuestionIndex);
    setAutoFollow(true);
  };

  // Switch viewed question manually
  const handleSelectQuestionIndex = (index: number) => {
    setViewedIndex(index);
    if (index !== liveState?.currentQuestionIndex) {
      setAutoFollow(false);
    } else {
      setAutoFollow(true);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="relative mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
          <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800 text-rose-400">
            <Radio className="w-10 h-10 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Conectando a la transmisión en vivo...</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Sintonizando el desarrollo del cuestionario en tiempo real.
        </p>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !liveState || liveState.status === 'stopped') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 animate-bounce">
          <Radio className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Transmisión no disponible
        </h1>
        <p className="text-slate-400 max-w-md mb-6 text-sm leading-relaxed">
          {error || 'La sesión de transmisión en vivo ha finalizado o el enlace ya no es válido.'}
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Ir al Inicio
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const {
    quizTitle,
    studentName,
    questions,
    currentQuestionIndex: studentActiveIndex,
    selectedAnswerId: studentSelectedAnswerId,
    directResponse: studentDirectResponse,
    studentAnswers,
    isStudentOnline,
    spectatorCount,
    status,
    score,
    hintsRevealed,
  } = liveState;

  const currentQ = questions?.[viewedIndex];
  const isViewingStudentActiveQuestion = viewedIndex === studentActiveIndex;

  // Real-time score and answer statistics
  const correctCount = (studentAnswers || []).filter((a: any) => a.isCorrect === true).length;
  const incorrectCount = (studentAnswers || []).filter((a: any) => a.isCorrect === false).length;
  const totalScorePoints = (studentAnswers || []).reduce((sum: number, a: any) => {
    if (a.isCorrect === true) {
      const q = questions?.find((quest: any) => Number(quest.id) === Number(a.questionId));
      return sum + (q?.points || 10);
    }
    return sum;
  }, 0);

  // Check if current question has an answer recorded
  const recordedAnswer = studentAnswers?.find(
    (a: any) => Number(a.questionId) === Number(currentQ?.id) || a.questionIndex === viewedIndex
  );
  const isCurrentQAnswered = !!recordedAnswer;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30">
      {/* ── Top Header / Live Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Branding & Student Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-rose-500/30 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse text-rose-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 tracking-wider uppercase animate-pulse">
                  EN VIVO
                </Badge>
                <span className="text-xs font-semibold text-slate-400">Modo Espectador</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[240px] sm:max-w-md">
                {quizTitle}
              </h1>
            </div>
          </div>

          {/* Right: Live Status, Spectator Counter & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
            {/* Student online / offline status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isStudentOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              title={isStudentOnline ? 'El estudiante está resolviendo ahora' : 'Estudiante desconectado'}
            >
              {isStudentOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">En línea:</span>
                  <span className="font-bold text-white">{studentName}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desconectado</span>
                </>
              )}
            </div>

            {/* Spectator count */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{spectatorCount}</span>
            </div>

            {/* Live Score Counter: Aciertos & Errores */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold" title="Respuestas correctas del estudiante">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{correctCount}</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-rose-400 font-bold" title="Respuestas incorrectas del estudiante">
                <XCircle className="w-3.5 h-3.5" />
                <span>{incorrectCount}</span>
              </div>
              {totalScorePoints > 0 && (
                <>
                  <div className="h-3 w-px bg-slate-700" />
                  <span className="text-blue-400 font-bold">{totalScorePoints} pts</span>
                </>
              )}
            </div>

            {/* Live Synchronized Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-rose-300">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{formatTime(timerSeconds)}</span>
            </div>

            {/* Share button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyLink}
              className="h-8 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-sm rounded-lg flex items-center gap-1.5"
              title="Copiar enlace de esta transmisión"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden md:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Completed Banner if Quiz is Finished */}
        {status === 'completed' && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-3">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              ¡Cuestionario Completado!
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto mb-4">
              <strong>{studentName}</strong> ha finalizado este cuestionario en un tiempo de{' '}
              <span className="font-mono text-emerald-400 font-bold">{formatTime(timerSeconds)}</span>.
            </p>
            {score !== null && score !== undefined && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-lg font-bold text-white shadow-xl">
                <span>Nota final:</span>
                <span className="text-2xl font-black text-emerald-400">{score.toFixed(1)}</span>
                <span className="text-slate-400 text-sm">/ 10</span>
              </div>
            )}
          </div>
        )}

        {/* ── Question Progress Bubbles Bar ─────────────────────────────── */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2 font-bold text-slate-200">
              Pregunta {viewedIndex + 1} de {questions.length}
              {!isViewingStudentActiveQuestion && (
                <span className="text-amber-400/90 font-medium italic">
                  (Explorando pregunta {viewedIndex + 1})
                </span>
              )}
            </span>

            {/* Quick jump to student's active question if exploring another */}
            {!isViewingStudentActiveQuestion && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFollowStudent}
                className="h-7 px-3 text-xs text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Volver al estudiante (Pregunta {studentActiveIndex + 1})</span>
              </Button>
            )}
          </div>

          {/* Bubbles scroll container */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-slate-700">
            {questions.map((q, idx) => {
              const ans = studentAnswers?.find(
                (a: any) => Number(a.questionId) === Number(q.id) || a.questionIndex === idx
              );
              const isAnswered = !!ans;
              const isCorrect = ans?.isCorrect === true;
              const isIncorrect = ans?.isCorrect === false;
              const isStudentHere = studentActiveIndex === idx;
              const isCurrentlyViewed = viewedIndex === idx;

              let circleClass = "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-700 hover:text-slate-200";
              if (isAnswered) {
                if (isCorrect) {
                  circleClass = "bg-green-500/20 text-green-400 border-green-500/60 shadow-[0_0_10px_rgba(34,197,94,0.25)] font-bold";
                } else if (isIncorrect) {
                  circleClass = "bg-red-500/20 text-red-400 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.25)] font-bold";
                } else {
                  circleClass = "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.25)] font-bold";
                }
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => handleSelectQuestionIndex(idx)}
                  className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all border shrink-0 ${circleClass} ${
                    isCurrentlyViewed
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-110 z-10'
                      : ''
                  }`}
                  title={`Pregunta ${idx + 1}${
                    isAnswered ? (isCorrect ? ' (Correcta)' : isIncorrect ? ' (Incorrecta)' : ' (Respondida)') : ' (Sin responder)'
                  }${isStudentHere ? ' • El estudiante está aquí' : ''}`}
                >
                  <span>{idx + 1}</span>

                  {/* Pulsing indicator when student is currently on this question */}
                  {isStudentHere && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-2 ring-slate-950"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Question Card ─────────────────────────────────────────── */}
        {currentQ && (
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Question Header: Difficulty, Points & Real-time status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${
                    currentQ.difficulty === 'hard'
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : currentQ.difficulty === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                  } border-none font-bold transition-colors`}
                >
                  {currentQ.difficulty === 'hard'
                    ? 'Difícil'
                    : currentQ.difficulty === 'medium'
                    ? 'Medio'
                    : 'Fácil'}
                </Badge>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm px-3.5 py-1 rounded-full font-medium shadow-lg shadow-blue-500/20">
                  {currentQ.points || 10} puntos
                </div>
              </div>

              {/* Status Indicator for this question */}
              {isViewingStudentActiveQuestion ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span>Estudiante en esta pregunta</span>
                </div>
              ) : (
                <Badge variant="outline" className="border-slate-800 text-slate-400 text-xs">
                  Pregunta {viewedIndex + 1} de {questions.length}
                </Badge>
              )}
            </div>

            {/* Question Image if present */}
            {currentQ.imageUrl && (
              <div className="flex justify-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <ZoomableImage
                  src={currentQ.imageUrl}
                  alt="Diagrama de la pregunta"
                  className="max-h-[300px] object-contain rounded-xl"
                />
              </div>
            )}

            {/* Question Content */}
            <div className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
              <ContentRenderer content={currentQ.content} />
            </div>

            {/* Hints revealed by student for this question */}
            {hintsRevealed?.[currentQ.id]?.map((hint, hIdx) => (
              <div
                key={hIdx}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm animate-in fade-in"
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Pista {hIdx + 1} utilizada por el estudiante:</span>
                </div>
                <ContentRenderer content={hint} />
              </div>
            ))}

            {/* ── Answer Options / Inputs ─────────────────────────────────── */}
            <div className="space-y-3 pt-2">
              {currentQ.type === 'text' || currentQ.type === 'direct_input' ? (
                /* Direct Text / Math Response Display */
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Respuesta del estudiante</span>
                    {isViewingStudentActiveQuestion && !isCurrentQAnswered && (
                      <span className="text-rose-400 animate-pulse font-normal lowercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> escribiendo en tiempo real...
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-base sm:text-lg text-white">
                    {isCurrentQAnswered
                      ? recordedAnswer?.userResponse || 'Sin respuesta'
                      : isViewingStudentActiveQuestion
                      ? studentDirectResponse || <span className="text-slate-500 italic">Esperando que el estudiante escriba...</span>
                      : 'Pregunta no respondida aún'}
                  </div>
                </div>
              ) : (
                /* Multiple Choice Options List */
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.answers?.map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);

                    // Check if this option was selected by the student
                    const isStudentSelection =
                      recordedAnswer?.answerId != null &&
                      Number(recordedAnswer.answerId) === Number(option.id);
                    const isSelectedByStudent =
                      (isViewingStudentActiveQuestion &&
                        studentSelectedAnswerId != null &&
                        Number(studentSelectedAnswerId) === Number(option.id)) ||
                      isStudentSelection;

                    // Did student answer this question correctly?
                    const wasStudentCorrect = recordedAnswer?.isCorrect === true;
                    // Is this specific option the correct one?
                    const isOptionCorrect = option.isCorrect === true || (isStudentSelection && wasStudentCorrect);

                    let cardClass = 'bg-slate-950/50 border-slate-800 text-slate-200';
                    let letterClass = 'bg-slate-900/50 border-white/10 text-slate-400';
                    let badgeContent = null;

                    if (isCurrentQAnswered) {
                      if (isOptionCorrect) {
                        cardClass = 'bg-green-500/10 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
                        letterClass = 'bg-green-500/20 border-green-500/40 text-green-300 font-bold';
                        badgeContent = (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            {isStudentSelection ? 'Marcada por estudiante (Correcta)' : 'Respuesta correcta'}
                          </span>
                        );
                      } else if (isStudentSelection) {
                        cardClass = 'bg-red-500/10 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
                        letterClass = 'bg-red-500/20 border-red-500/40 text-red-300 font-bold';
                        badgeContent = (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase shrink-0">
                            <XCircle className="w-4 h-4 text-red-400" /> Marcada por estudiante (Incorrecta)
                          </span>
                        );
                      } else {
                        cardClass = 'opacity-40 border-slate-800/50 bg-slate-900/20 text-slate-500';
                        letterClass = 'bg-slate-900/30 border-white/5 text-slate-600';
                      }
                    } else if (isViewingStudentActiveQuestion && isSelectedByStudent) {
                      // Student is currently hovering/selecting this before submitting
                      cardClass = 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50 animate-pulse';
                      letterClass = 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold';
                      badgeContent = (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase shrink-0">
                          👉 Marcada por estudiante
                        </span>
                      );
                    }

                    return (
                      <div
                        key={option.id}
                        className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all ${cardClass}`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl border text-sm font-bold shrink-0 transition-colors ${letterClass}`}>
                          {letter}
                        </div>

                        <div className="flex-1 text-sm sm:text-base font-medium">
                          <ContentRenderer content={option.content} tight={true} />
                        </div>

                        {badgeContent}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Explanation if question was answered and explanation exists */}
            {isCurrentQAnswered && currentQ.explanation && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm animate-in fade-in space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Explicación / Solución:</span>
                </div>
                <ContentRenderer content={currentQ.explanation} />
              </div>
            )}

            {/* Bottom Navigator between questions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <Button
                variant="ghost"
                size="sm"
                disabled={viewedIndex <= 0}
                onClick={() => handleSelectQuestionIndex(viewedIndex - 1)}
                className="bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs h-9 px-3.5 rounded-lg transition-all shadow-sm flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 text-slate-400" />
                Anterior
              </Button>

              <div className="text-xs text-slate-400 font-medium">
                Pregunta {viewedIndex + 1} de {questions.length}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={viewedIndex >= questions.length - 1}
                onClick={() => handleSelectQuestionIndex(viewedIndex + 1)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:from-slate-900/90 disabled:to-slate-900/90 disabled:border-slate-800 text-white text-xs h-9 px-4 rounded-lg font-medium transition-all shadow-sm border border-transparent flex items-center"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
