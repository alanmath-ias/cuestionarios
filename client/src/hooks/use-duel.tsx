import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from './useSession';
import { useToast } from './use-toast';

interface DuelMessage {
  type: string;
  payload: any;
}

interface DuelContextType {
  duel: any;
  invite: any;
  sendChallenge: (receiverId: number, wager: number, topic?: string, isRevenge?: boolean, handicap?: any, receiverName?: string) => void;
  respondToInvite: (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number, handicap?: any) => void;
  submitAnswer: (duelId: number, questionIndex: number, answerId: number) => void;
  sendMessage: (receiverId: number, content: string) => void;
  editChatMessage: (messageId: number, content: string) => void;
  deleteChatMessage: (messageId: number) => void;
  lastChatMessage: any;
  isConnected: boolean;
  sentChallenges: Set<number>;
  isPreparing: boolean;
  onlineUsers: Set<number>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  // Global Challenge Dialog state
  challengingUser: { id: number; name: string } | null;
  setChallengingUser: (user: { id: number; name: string } | null) => void;
  challengeWager: number;
  setChallengeWager: (wager: number) => void;
  challengeTopic: string;
  setChallengeTopic: (topic: string) => void;
  challengeHandicap: { points: number, time: number };
  setChallengeHandicap: (h: { points: number, time: number }) => void;
  isRevengeMode: boolean;
  setIsRevengeMode: (mode: boolean) => void;
  refreshStats: () => void;
  resetDuel: () => void;
  leaveResults: (duelId: number) => void;
  activeDuels: any[];
  spectateDuel: (duelId: number) => void;
  sentChallengeInfo: any | null;
  setSentChallengeInfo: (info: any | null) => void;
  isResponding: boolean;
  speedBonusFlash: string | null;
  // Managed Group Challenges
  managedChallenge: any;
  setManagedChallenge: React.Dispatch<React.SetStateAction<any>>;
  managedInvite: any;
  setManagedInvite: React.Dispatch<React.SetStateAction<any>>;
  managedCancellation: any;
  setManagedCancellation: React.Dispatch<React.SetStateAction<any>>;
  createManagedChallenge: (payload: any) => void;
  respondToManagedInvite: (challengeId: number, action: 'accept' | 'abandon') => void;
  startManagedChallenge: (challengeId: number) => void;
  submitManagedAnswer: (challengeId: number, questionIndex: number, answerId: number) => void;
  spectateManagedChallenge: (challengeId: number) => void;
  activeManagedChallenges: any[];
  socket: WebSocket | null;
}

const DuelContext = createContext<DuelContextType | null>(null);

export function DuelProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const user = session;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [duel, setDuel] = useState<any>(null);
  const [invite, setInvite] = useState<any>(null);
  const [lastChatMessage, setLastChatMessage] = useState<any>(null);
  const [sentChallenges, setSentChallenges] = useState<Set<number>>(new Set());
  const [isPreparing, setIsPreparing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [speedBonusFlash, setSpeedBonusFlash] = useState<string | null>(null);
  
  // High-level Challenge Dialog State
  const [challengingUser, setChallengingUser] = useState<{ id: number; name: string } | null>(null);
  const [challengeWager, setChallengeWager] = useState<number>(10);
  const [challengeTopic, setChallengeTopic] = useState<string>("");
  const [challengeHandicap, setChallengeHandicap] = useState<{ points: number, time: number }>({ points: 0, time: 0 });
  const [isRevengeMode, setIsRevengeMode] = useState(false);
  const [activeDuels, setActiveDuels] = useState<any[]>([]);
  const [sentChallengeInfo, setSentChallengeInfo] = useState<any | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  
  // Managed Challenges State
  const [managedChallenge, setManagedChallenge] = useState<any>(null);
  const [managedInvite, setManagedInvite] = useState<any>(null);
  const [managedCancellation, setManagedCancellation] = useState<any>(null);
  const [activeManagedChallenges, setActiveManagedChallenges] = useState<any[]>([]);

  const reconnectTimeout = useRef<any>(null);
  const managedInviteRef = useRef<any>(null);
  const managedChallengeRef = useRef<any>(null);

  useEffect(() => {
    managedInviteRef.current = managedInvite;
    managedChallengeRef.current = managedChallenge;
  }, [managedInvite, managedChallenge]);

  const connect = useCallback(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/duels`;
    const ws = new WebSocket(wsUrl);

    let lastMessageTime = Date.now();
    const heartbeatCheck = setInterval(() => {
      // If we haven't heard from the server in 30s, the socket is likely "dead"
      if (Date.now() - lastMessageTime > 30000) {
        console.warn('⚠️ [SOCKET] No messages in 30s. Forcing reconnect...');
        clearInterval(heartbeatCheck);
        ws.close();
      }
    }, 5000);

    ws.onopen = () => {
      console.log('✅ Duel WebSocket connected');
      setIsConnected(true);
      lastMessageTime = Date.now();
    };

    ws.onmessage = (event) => {
      lastMessageTime = Date.now();
      const message: DuelMessage = JSON.parse(event.data);
      handleWsMessage(message);
    };

    ws.onclose = () => {
      console.log('❌ Duel WebSocket disconnected');
      clearInterval(heartbeatCheck);
      setIsConnected(false);
      setSocket(null);
      // Attempt reconnect after 2 seconds (faster than 5s)
      reconnectTimeout.current = setTimeout(connect, 2000);
    };

    setSocket(ws);
  }, [user]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socket?.close();
    };
  }, [user]);

  const handleWsMessage = (message: DuelMessage) => {
    const { type, payload } = message;
    const myId = user?.userId;
    console.log(`📩 [WS MESSAGE] ${type}:`, payload);

    switch (type) {
      case 'duel:invited':
        // Always clear any stale duel state when a new invitation arrives
        setDuel(null);
        setIsResponding(false);
        setIsPreparing(false);
        setInvite({
            ...payload,
            challengerId: payload.challengerId,
            receiverId: payload.receiverId
        });
        break;
      case 'duel:start':
        setIsPreparing(false);
        setIsResponding(false);
        setInvite(null); // Ensure invite banner is gone before setting new duel
        setSentChallengeInfo(null); // Clear waiting state
        setDuel({
          status: 'in_progress',
          duelId: payload.duelId,
          opponentName: payload.opponentName,
          questionsCount: payload.questionsCount,
          currentQuestion: { index: 0, content: '', options: [] },
          scores: payload.scores || {},
          topic: payload.topic,
          handicap: payload.handicap,
          allWrongAnswers: [],
        });
        break;
      case 'duel:preparing':
        setIsPreparing(true);
        break;
      case 'duel:question':
        setIsPreparing(false);
        setDuel((prev: any) => prev ? { 
            ...prev, 
            currentQuestion: { ...payload, startTime: payload.startTime },
            scores: payload.scores || prev.scores, 
            lastFeedback: undefined,
            allWrongAnswers: [],   
        } : null);
        setSpeedBonusFlash(null); 
        break;
      case 'duel:answer_feedback':
        setIsPreparing(false); // Safety
        // Accumulate wrong answers so multiple failures stay visible
        setDuel((prev: any) => prev ? { 
            ...prev, 
            lastFeedback: payload,
            allWrongAnswers: [
                ...(prev.allWrongAnswers || []),
                { userId: payload.userId, answerId: payload.answerId, userName: payload.userName }
            ]
        } : null);
        break;
      case 'duel:round_result':
        setIsPreparing(false); // Safety
        if (payload.winnerId) {
          toast({
              title: "⚡ " + payload.winnerName + " acertó!",
              description: "Prepárate para la siguiente...",
          });
        } else if (payload.correctAnswerId) {
          toast({
              title: "⌛ Nadie acertó",
              description: "Se mostrará la respuesta correcta...",
              variant: "destructive"
          });
        }
        setDuel((prev: any) => ({ 
            ...prev, 
            scores: payload.scores, 
            lastFeedback: { 
                userId: payload.winnerId, 
                userName: payload.winnerName, 
                answerId: payload.answerId, 
                correctAnswerId: payload.correctAnswerId,
                speedBonus: payload.speedBonus,
                isCorrect: payload.winnerId !== null 
            } 
        }));

        if (payload.speedBonus) {
            setSpeedBonusFlash(payload.winnerId === myId ? "Tú" : payload.winnerName);
            setTimeout(() => setSpeedBonusFlash(null), 3500);
        }
        break;
      case 'duel:end':
        setDuel((prev: any) => ({ 
            ...prev, 
            status: 'finished', 
            finalResults: payload,
            history: payload.history, // Match history for review
            lastFeedback: undefined // Clear feedback on end
        }));
        // Invalidate queries to refresh credits and wins
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        break;
      case 'duel:error':
        setIsPreparing(false);
        setIsResponding(false);
        setSentChallengeInfo(null);
        toast({
          title: "Error en el duelo",
          description: payload.message,
          variant: "destructive",
        });
        break;
      case 'duel:rejected':
          toast({ title: "Reto rechazado", description: "El desafío ha sido cancelado o rechazado." });
          setDuel(null);
          setSentChallengeInfo(null);
          setInvite(null);
          setIsResponding(false);
          // Remove from sent challenges
          if (payload.receiverId) {
             setSentChallenges(prev => {
                const next = new Set(prev);
                next.delete(payload.receiverId);
                return next;
             });
          }
          break;
      case 'duel:countered':
          // The other user wants to negotiate
          setDuel(null); // Safety
          setIsResponding(false);
          setInvite((prev: any) => ({
              ...(prev || {}),
              duelId: payload.duelId,
              challengerId: payload.challengerId,
              receiverId: payload.receiverId,
              wager: payload.wager,
              handicap: payload.handicap,
              challengerName: payload.challengerName || prev?.challengerName || "Retador",
              receiverName: payload.receiverName || prev?.receiverName || "Oponente",
              topic: payload.topic || prev?.topic || "Matemáticas"
          }));
          toast({ 
              title: "Nueva propuesta recibida", 
              description: `El oponente ha actualizado las condiciones del duelo.` 
          });
          break;
      case 'social:status_update':
          setOnlineUsers(prev => {
              const next = new Set(prev);
              if (payload.online) next.add(payload.userId);
              else next.delete(payload.userId);
              return next;
          });
          break;
      case 'social:refresh':
          // Invalidate all social queries to sync state instantly
          queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
          break;
      case 'duel:sync':
          setIsPreparing(false);
          setDuel(payload);
          break;
      case 'chat:receive':
          // IMPROVEMENT: Use Custom Event to prevent race conditions when multiple messages arrive
          window.dispatchEvent(new CustomEvent('chat-message', { detail: payload }));
          setLastChatMessage(payload); // Keep for legacy if needed
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.senderId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.receiverId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
          break;
      case 'chat:edited':
          window.dispatchEvent(new CustomEvent('chat-edited', { detail: payload }));
          break;
      case 'chat:deleted':
          window.dispatchEvent(new CustomEvent('chat-deleted', { detail: payload }));
          break;
      case 'chat:error':
          toast({
              title: "Error en el chat",
              description: payload.message,
              variant: "destructive"
          });
          break;
      case 'admin:duel_list':
          setActiveDuels(payload);
          break;
      case 'admin:managed_list':
          setActiveManagedChallenges(payload);
          break;
      case 'managed:invited':
          setManagedChallenge(null); // Clear any previous finished challenge (podium/results)
          setManagedInvite(payload);
          setIsResponding(false);
          setIsPreparing(false);
          setManagedCancellation(null);
          toast({
              title: "¡RETO DEL PROFESOR!",
              description: `${payload.adminName} te ha invitado a un reto de ${payload.topic}.`,
              variant: "default"
          });
          break;
      case 'managed:started':
          setManagedInvite(null);
          setIsPreparing(true); // Trigger rotating tips transition
          setManagedCancellation(null);
          setManagedChallenge({
              status: 'in_progress',
              challengeId: payload.challengeId,
              questionsCount: payload.questionsCount,
              topic: payload.topic,
              currentQuestion: { index: 0, content: '', options: [] },
              players: payload.players || [],
              scores: payload.players?.reduce((acc: any, p: any) => ({ ...acc, [p.userId]: p.score }), {}) || {}
          });
          break;
      case 'managed:player_update':
          setManagedChallenge((prev: any) => {
              if (!prev) return null;
              const newPlayers = [...(prev.players || [])];
              const idx = newPlayers.findIndex(p => p.userId === payload.userId);
              if (idx >= 0) newPlayers[idx] = { ...newPlayers[idx], status: payload.status };
              else newPlayers.push({ userId: payload.userId, status: payload.status, username: payload.username });
              return { ...prev, players: newPlayers };
          });
          break;
      case 'managed:player_progress':
          setManagedChallenge((prev: any) => {
              if (!prev) return null;
              const newScores = { ...(prev.scores || {}) };
              newScores[payload.userId] = payload.score;
              return { ...prev, scores: newScores };
          });
          break;
      case 'managed:results':
          setManagedChallenge((prev: any) => ({ ...prev, status: 'finished', results: payload }));
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          break;
      case 'managed:sync':
          setManagedChallenge(payload);
          setIsPreparing(false); // Clear preparing state on sync

          // NEW RECOVERY: If I haven't accepted and it's still pending, restore the invite UI
          if (payload.status === 'pending' && payload.myStatus === 'pending') {
              setManagedInvite({
                  challengeId: payload.challengeId,
                  adminName: payload.adminName || "El Profesor",
                  topic: payload.topic,
                  wager: payload.wager,
                  questionsCount: payload.questionsCount
              });
              setManagedCancellation(null);
          }
          break;
      case 'managed:preparing':
          setIsPreparing(true);
          setManagedInvite(null); // Clear invite so preparing cards render immediately
          break;
      case 'managed:question':
          setIsPreparing(false);
          setManagedChallenge((prev: any) => prev ? { 
              ...prev, 
              currentQuestion: { ...payload, startTime: payload.startTime },
              scores: payload.scores || prev.scores,
              lastFeedback: undefined,
              allWrongAnswers: []
          } : null);
          break;
      case 'managed:answer_feedback':
          setManagedChallenge((prev: any) => prev ? { 
              ...prev, 
              scores: payload.scores || prev.scores,
              lastFeedback: payload,
              allWrongAnswers: payload.isCorrect ? [] : [
                  ...(prev.allWrongAnswers || []).filter((w: any) => w.userId !== payload.userId),
                  { userId: payload.userId, answerId: payload.answerId, userName: payload.userName || "Alguien" }
              ]
          } : null);
          break;
      case 'managed:round_result':
          setIsPreparing(false);
          setManagedChallenge((prev: any) => prev ? { 
              ...prev, 
              scores: payload.scores, 
              lastFeedback: payload 
          } : null);
          break;
      case 'managed:completed':
          setManagedChallenge((prev: any) => prev ? { ...prev, myStatus: 'finished' } : null);
          break;
      case 'managed:speed_bonus':
          setSpeedBonusFlash(payload.userName);
          setTimeout(() => setSpeedBonusFlash(null), 3000);
          break;
       case 'managed:deleted':
            const currentChallengeId = managedChallengeRef.current?.challengeId || managedInviteRef.current?.challengeId;
            // Clear if it matches our active challenge or if we don't have a specific ID (safety)
            if (!payload.challengeId || Number(currentChallengeId) === Number(payload.challengeId)) {
                setManagedInvite(null);
                setManagedChallenge(null);
                setIsPreparing(false);
                setIsResponding(false);
                // Only show cancellation overlay if we were actually part of it and not admin (admin manages it)
                if (user?.role !== 'admin') {
                    setManagedCancellation({
                        adminName: payload.adminName || "El Administrador",
                        message: payload.message
                    });
                }
            }
            break;
      case 'managed:error':
          setManagedInvite(null);
          toast({ title: "Aviso", description: payload.message || "Ocurrió un error en el reto.", variant: "destructive" });
          break;
    }
  };

  const sendChallenge = async (receiverId: number, wager: number, topic?: string, isRevenge?: boolean, handicap?: any, receiverName?: string) => {
    // CRITICAL: Fully wipe all duel related states before a new challenge
    setDuel(null);
    setInvite(null);
    setSentChallengeInfo(null);
    setManagedInvite(null);
    setIsPreparing(false);
    setIsResponding(false);
    setManagedCancellation(null);

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor de duelos.",
        variant: "destructive",
      });
      return;
    }

    const payload = { receiverId, wager, topic, isRevenge, handicap };
    socket.send(JSON.stringify({ type: 'duel:challenge', payload }));
    
    setSentChallenges(prev => new Set(prev).add(receiverId));

    // Save info for the "Sent Challenge" card
    setSentChallengeInfo({
        receiverId,
        receiverName: receiverName || "Oponente",
        topic: topic || "Matemáticas",
        wager,
        handicap: {
            points: handicap?.points?.value || 0,
            time: handicap?.time?.value || 0,
            targetId: handicap?.points?.targetId || handicap?.time?.targetId || null
        }
    });
  };

  const respondToInvite = (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number, handicap?: any) => {
    setIsResponding(true);
    if (action === 'accept') {
        setIsPreparing(true);
    }
    socket?.send(JSON.stringify({ type: 'duel:respond', payload: { duelId, action, wager, handicap } }));
    if (action !== 'counter') {
        setInvite(null);
        setSentChallengeInfo(null);
    }
  };

  const submitAnswer = (duelId: number, questionIndex: number, answerId: number) => {
    socket?.send(JSON.stringify({ type: 'duel:submit_answer', payload: { duelId, questionIndex, answerId } }));
  };

  const sendMessage = (receiverId: number, content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({ type: 'chat:send', payload: { receiverId, content } }));
  };

  const editChatMessage = (messageId: number, content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'chat:edit', payload: { messageId, content } }));
  };

  const deleteChatMessage = (messageId: number) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'chat:delete', payload: { messageId } }));
  };

  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }, [queryClient]);

  const resetDuel = useCallback(() => {
    if (duel?.duelId && !duel.isSpectator && duel.status !== 'finished') {
        socket?.send(JSON.stringify({ type: 'duel:abandon', payload: { duelId: duel.duelId } }));
    } else if (invite?.duelId && !duel?.duelId) {
        socket?.send(JSON.stringify({ type: 'duel:abandon', payload: { duelId: invite.duelId } }));
    }
    setDuel(null);
    setInvite(null);
    setSentChallengeInfo(null);
  }, [socket, duel?.duelId, duel?.isSpectator, invite?.duelId]);
  
  const leaveResults = useCallback((id: number) => {
    // Determine if it's a regular duel or a managed challenge
    if (managedChallenge && managedChallenge.challengeId === id) {
        setManagedChallenge(null);
    } else {
        socket?.send(JSON.stringify({ type: 'duel:leave_results', payload: { duelId: id } }));
        setDuel(null);
    }
    // Invalidate queries to refresh rankings and social status
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
  }, [socket, queryClient, managedChallenge]);

  const spectateDuel = useCallback((duelId: number) => {
    socket?.send(JSON.stringify({ type: 'admin:spectate', payload: { duelId } }));
  }, [socket]);

  // Managed Challenge Actions
  const createManagedChallenge = (payload: any) => {
      socket?.send(JSON.stringify({ type: 'managed:create', payload }));
  };

   const respondToManagedInvite = (challengeId: number, action: 'accept' | 'abandon') => {
       if (action === 'accept') setIsResponding(true);
       socket?.send(JSON.stringify({ type: 'managed:respond', payload: { challengeId, action } }));
       if (action === 'abandon') setManagedInvite(null);
   };

  const startManagedChallenge = (challengeId: number) => {
      socket?.send(JSON.stringify({ type: 'managed:start', payload: { challengeId } }));
  };

  const submitManagedAnswer = (challengeId: number, questionIndex: number, answerId: number) => {
      socket?.send(JSON.stringify({ type: 'managed:submit_answer', payload: { challengeId, questionIndex, answerId } }));
  };

  const spectateManagedChallenge = (challengeId: number) => {
      socket?.send(JSON.stringify({ type: 'managed:spectate', payload: { challengeId } }));
  };

  // AUTO-JOIN EFFECT: If a student refreshes and there is an active/pending managed challenge, notify them or sync
  useEffect(() => {
      if (!user || user.role === 'admin' || !isConnected || !activeManagedChallenges.length || managedChallenge || managedInvite) return;
      
      const pending = activeManagedChallenges.find(c => c.status === 'pending' || c.status === 'in_progress');
      if (pending) {
          console.log(`📡 [AUTO-JOIN] Student joining active managed challenge ${pending.id}`);
          socket?.send(JSON.stringify({ type: 'managed:spectate', payload: { challengeId: pending.id } }));
      }
  }, [user, isConnected, activeManagedChallenges, managedChallenge, managedInvite]);

  const value = useMemo(() => ({
    duel,
    invite,
    sendChallenge,
    respondToInvite,
    submitAnswer,
    sendMessage,
    editChatMessage,
    deleteChatMessage,
    lastChatMessage,
    isConnected,
    sentChallenges,
    isPreparing,
    onlineUsers,
    setOnlineUsers,
    challengingUser,
    setChallengingUser,
    challengeWager,
    setChallengeWager,
    challengeTopic,
    setChallengeTopic,
    challengeHandicap,
    setChallengeHandicap,
    isRevengeMode,
    setIsRevengeMode,
    refreshStats,
    resetDuel,
    leaveResults,
    activeDuels,
    spectateDuel,
    sentChallengeInfo,
    setSentChallengeInfo,
    isResponding,
    speedBonusFlash,
    managedChallenge,
    setManagedChallenge,
    managedInvite,
    setManagedInvite,
    managedCancellation,
    setManagedCancellation,
    createManagedChallenge,
    respondToManagedInvite,
    startManagedChallenge,
    submitManagedAnswer,
    spectateManagedChallenge,
    activeManagedChallenges,
    socket
  }), [
    duel, invite, sendChallenge, respondToInvite, submitAnswer, 
    sendMessage, editChatMessage, deleteChatMessage, lastChatMessage, isConnected, sentChallenges, 
    isPreparing, onlineUsers, challengingUser, challengeWager, 
    challengeTopic, challengeHandicap, isRevengeMode, refreshStats, resetDuel, 
    leaveResults, activeDuels, spectateDuel, sentChallengeInfo, isResponding,
    speedBonusFlash, managedChallenge, managedInvite, setManagedInvite, managedCancellation, setManagedCancellation, createManagedChallenge,
    respondToManagedInvite, startManagedChallenge, submitManagedAnswer,
    spectateManagedChallenge, activeManagedChallenges, socket, setManagedChallenge
  ]);

  return (
    <DuelContext.Provider value={value}>
      {children}
    </DuelContext.Provider>
  );
}

export function useDuel() {
  const context = useContext(DuelContext);
  if (!context) throw new Error('useDuel must be used within a DuelProvider');
  return context;
}
