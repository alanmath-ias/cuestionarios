import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseLiveQuizProps {
  quizId?: number;
  quizTitle?: string;
  timeLimit?: number;
  questions?: any[];
  currentQuestionIndex: number;
  selectedAnswerId: number | null;
  directResponse: string;
  studentAnswers: any[];
  elapsedTime: number;
  hintsRevealed?: Record<number, string[]>;
}

export function useLiveQuiz({
  quizId,
  quizTitle,
  timeLimit,
  questions,
  currentQuestionIndex,
  selectedAnswerId,
  directResponse,
  studentAnswers,
  elapsedTime,
  hintsRevealed,
}: UseLiveQuizProps) {
  const { toast } = useToast();
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevSpectatorCountRef = useRef(0);

  const isSharingRef = useRef(false);
  const shareCodeRef = useRef<string | null>(null);

  useEffect(() => {
    isSharingRef.current = isSharing;
  }, [isSharing]);

  useEffect(() => {
    shareCodeRef.current = shareCode;
  }, [shareCode]);

  // Helper to send message through WebSocket safely
  const sendWsMessage = useCallback((msg: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Connect student to live quiz WebSocket
  const connectWs = useCallback((code: string) => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {
        // ignore
      }
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live-quiz?code=${code}&role=student`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('📡 [LiveQuiz Broadcaster] WebSocket connected for code:', code);
      ws.send(JSON.stringify({
        type: 'student:join',
        shareCode: code
      }));

      // Application heartbeat
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 20000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'student:joined') {
          setSpectatorCount(data.spectatorCount || 0);
          prevSpectatorCountRef.current = data.spectatorCount || 0;
        } else if (data.type === 'quiz:spectator_count') {
          const newCount = data.count || 0;
          setSpectatorCount(newCount);

          // Notify student when someone joins
          if (newCount > prevSpectatorCountRef.current && data.joinedName) {
            toast({
              title: '👁️ Nuevo espectador',
              description: `${data.joinedName} está viendo tu cuestionario en vivo.`,
            });
          }
          prevSpectatorCountRef.current = newCount;
        }
      } catch (err) {
        console.error('[LiveQuiz WS] Message parse error:', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 [LiveQuiz Broadcaster] WebSocket closed');
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

      // Auto-reconnect if broadcast is still active
      if (isSharingRef.current && shareCodeRef.current) {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isSharingRef.current && shareCodeRef.current) {
            console.log('🔄 [LiveQuiz Broadcaster] Attempting to reconnect WS...');
            connectWs(shareCodeRef.current);
          }
        }, 2500);
      }
    };

    ws.onerror = (err) => {
      console.error('❌ [LiveQuiz Broadcaster] WebSocket error:', err);
    };
  }, [toast]);

  // Start live quiz sharing session
  const startSharing = useCallback(async () => {
    if (!quizId || !questions || questions.length === 0) {
      toast({
        title: 'Error al compartir',
        description: 'El cuestionario aún se está cargando.',
        variant: 'destructive',
      });
      return null;
    }

    setIsConnecting(true);
    try {
      const res = await fetch('/api/live-quiz/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quizId,
          quizTitle: quizTitle || 'Cuestionario en Vivo',
          timeLimit: timeLimit || 0,
          totalQuestions: questions.length,
          questions,
          currentQuestionIndex,
          selectedAnswerId,
          directResponse,
          studentAnswers,
          elapsedTime,
          hintsRevealed,
          existingCode: shareCode || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error en el servidor al inicializar la transmisión');
      }

      const data = await res.json();
      const code = data.shareCode;

      setShareCode(code);
      setIsSharing(true);
      setSpectatorCount(data.spectatorCount || 0);

      try {
        sessionStorage.setItem(`active_quiz_live_code_${quizId}`, code);
      } catch (e) {
        // ignore
      }

      connectWs(code);

      toast({
        title: '🔴 Transmisión iniciada',
        description: 'Tu enlace en tiempo real está listo para compartir.',
      });

      return code;
    } catch (err: any) {
      console.error('[LiveQuiz] Start error:', err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudo iniciar la transmisión en vivo.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [
    quizId,
    quizTitle,
    timeLimit,
    questions,
    currentQuestionIndex,
    selectedAnswerId,
    directResponse,
    studentAnswers,
    elapsedTime,
    hintsRevealed,
    shareCode,
    connectWs,
    toast,
  ]);

  // Stop live quiz sharing session
  const stopSharing = useCallback(async () => {
    if (!shareCode) return;

    try {
      sendWsMessage({ type: 'student:stop', shareCode });
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      await fetch(`/api/live-quiz/${shareCode}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (quizId) {
        try {
          sessionStorage.removeItem(`active_quiz_live_code_${quizId}`);
        } catch (e) {}
      }

      setShareCode(null);
      setIsSharing(false);
      setSpectatorCount(0);

      toast({
        title: 'Transmisión finalizada',
        description: 'Se ha detenido la transmisión en vivo de este cuestionario.',
      });
    } catch (err) {
      console.error('[LiveQuiz] Stop error:', err);
    }
  }, [shareCode, quizId, sendWsMessage, toast]);

  // Auto-restore active session from sessionStorage on mount
  useEffect(() => {
    if (!quizId || isSharing) return;

    try {
      const savedCode = sessionStorage.getItem(`active_quiz_live_code_${quizId}`);
      if (savedCode) {
        // Validate if room still exists on server
        fetch(`/api/live-quiz/${savedCode}`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error('Not found');
          })
          .then((data) => {
            if (data.status !== 'stopped') {
              setShareCode(savedCode);
              setIsSharing(true);
              setSpectatorCount(data.spectatorCount || 0);
              connectWs(savedCode);
              console.log('🔄 [LiveQuiz] Auto-reconnected to existing session:', savedCode);
            } else {
              sessionStorage.removeItem(`active_quiz_live_code_${quizId}`);
            }
          })
          .catch(() => {
            sessionStorage.removeItem(`active_quiz_live_code_${quizId}`);
          });
      }
    } catch (e) {
      // ignore
    }
  }, [quizId, isSharing, connectWs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Sync Question Change
  const broadcastQuestionChange = useCallback((newIndex: number, currentAnsId?: number | null, directResp?: string, currentAnswers?: any[]) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:change_question',
      shareCode,
      questionIndex: newIndex,
      selectedAnswerId: currentAnsId ?? null,
      directResponse: directResp ?? '',
      studentAnswers: currentAnswers,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Option Selection
  const broadcastAnswerSelected = useCallback((answerId: number | null) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:select_answer',
      shareCode,
      answerId,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Text Input (debounced for smooth network traffic)
  const broadcastResponseTyped = useCallback((response: string) => {
    if (!isSharing || !shareCode) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      sendWsMessage({
        type: 'student:input_response',
        shareCode,
        response,
      });
    }, 150);
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Answer Submitted
  const broadcastAnswerSubmitted = useCallback((answer: any, allStudentAnswers: any[], qIndex: number) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:answer_submitted',
      shareCode,
      answer,
      studentAnswers: allStudentAnswers,
      currentQuestionIndex: qIndex,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Hint Revealed
  const broadcastHintRevealed = useCallback((questionId: number, hint: string) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:hint_revealed',
      shareCode,
      questionId,
      hint,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Timer (called periodically or on state change)
  const broadcastTimerSync = useCallback((time: number) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:timer_sync',
      shareCode,
      elapsedTime: time,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  // Sync Finish
  const broadcastFinished = useCallback((score: number, totalTime: number, finalAnswers: any[]) => {
    if (!isSharing || !shareCode) return;
    sendWsMessage({
      type: 'student:finish',
      shareCode,
      score,
      totalTime,
      finalAnswers,
    });
  }, [isSharing, shareCode, sendWsMessage]);

  return {
    shareCode,
    isSharing,
    spectatorCount,
    isConnecting,
    startSharing,
    stopSharing,
    broadcastQuestionChange,
    broadcastAnswerSelected,
    broadcastResponseTyped,
    broadcastAnswerSubmitted,
    broadcastHintRevealed,
    broadcastTimerSync,
    broadcastFinished,
  };
}
