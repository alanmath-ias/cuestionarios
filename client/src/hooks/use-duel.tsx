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
  sendChallenge: (receiverId: number, wager: number, topic?: string, isRevenge?: boolean, handicap?: any) => void;
  respondToInvite: (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number, handicap?: any) => void;
  submitAnswer: (duelId: number, questionIndex: number, answerId: number) => void;
  sendMessage: (receiverId: number, content: string) => void;
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
  challengeHandicap: { type: 'points' | 'time' | 'none', value: number, targetId: number | null };
  setChallengeHandicap: (h: { type: 'points' | 'time' | 'none', value: number, targetId: number | null }) => void;
  isRevengeMode: boolean;
  setIsRevengeMode: (mode: boolean) => void;
  refreshStats: () => void;
  resetDuel: () => void;
  leaveResults: (duelId: number) => void;
  activeDuels: any[];
  spectateDuel: (duelId: number) => void;
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
  
  // High-level Challenge Dialog State
  const [challengingUser, setChallengingUser] = useState<{ id: number; name: string } | null>(null);
  const [challengeWager, setChallengeWager] = useState<number>(10);
  const [challengeTopic, setChallengeTopic] = useState<string>("");
  const [challengeHandicap, setChallengeHandicap] = useState<{ type: 'points' | 'time' | 'none', value: number, targetId: number | null }>({ type: 'none', value: 0, targetId: null });
  const [isRevengeMode, setIsRevengeMode] = useState(false);
  const [activeDuels, setActiveDuels] = useState<any[]>([]);

  const reconnectTimeout = useRef<any>(null);

  const connect = useCallback(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/duels`;
    const ws = new WebSocket(wsUrl);

    let lastMessageTime = Date.now();
    const heartbeatCheck = setInterval(() => {
      // If we haven't heard from the server in 20s, the socket is likely "dead" (intermediary proxy cut it)
      if (Date.now() - lastMessageTime > 20000) {
        console.warn('⚠️ [SOCKET] No messages in 20s. Forcing reconnect...');
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
    console.log(`📩 [WS MESSAGE] ${type}:`, payload);

    switch (type) {
      case 'duel:invited':
        // Always clear any stale duel state when a new invitation arrives
        setDuel(null);
        setInvite({
            ...payload,
            challengerId: payload.challengerId,
            receiverId: payload.receiverId
        });
        break;
      case 'duel:start':
        setIsPreparing(false);
        setInvite(null); // Ensure invite banner is gone before setting new duel
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
            currentQuestion: payload,
            scores: payload.scores || prev.scores, // Safety sync from server
            lastFeedback: undefined,
            allWrongAnswers: [],   // clear per-round wrong answers on each new question
        } : null);
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
                isCorrect: true 
            } 
        }));
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
        toast({
          title: "Error en el duelo",
          description: payload.message,
          variant: "destructive",
        });
        break;
      case 'duel:rejected':
          toast({ title: "Reto rechazado", description: "El oponente no aceptó el duelo." });
          setDuel(null);
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
          break;
      case 'duel:sync':
          setIsPreparing(false);
          setDuel(payload);
          break;
      case 'chat:receive':
          setLastChatMessage(payload);
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.senderId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.receiverId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
          break;
      case 'admin:duel_list':
          setActiveDuels(payload);
          break;
    }
  };

  const sendChallenge = (receiverId: number, wager: number, topic?: string, isRevenge?: boolean, handicap?: any) => {
    socket?.send(JSON.stringify({ type: 'duel:challenge', payload: { receiverId, wager, topic, isRevenge, handicap } }));
    setSentChallenges(prev => new Set(prev).add(receiverId));
    toast({ 
        title: isRevenge ? "Revancha enviada" : "Reto enviado", 
        description: "Esperando respuesta de tu amigo..." 
    });
  };

  const respondToInvite = (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number, handicap?: any) => {
    socket?.send(JSON.stringify({ type: 'duel:respond', payload: { duelId, action, wager, handicap } }));
    if (action !== 'counter') setInvite(null);
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

  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }, [queryClient]);

  const resetDuel = useCallback(() => {
    if (duel?.duelId) {
        socket?.send(JSON.stringify({ type: 'duel:abandon', payload: { duelId: duel.duelId } }));
    } else if (invite?.duelId) {
        socket?.send(JSON.stringify({ type: 'duel:abandon', payload: { duelId: invite.duelId } }));
    }
    setDuel(null);
    setInvite(null);
  }, [socket, duel?.duelId, invite?.duelId]);
  
  const leaveResults = useCallback((duelId: number) => {
    socket?.send(JSON.stringify({ type: 'duel:leave_results', payload: { duelId } }));
    setDuel(null);
    // Invalidate queries to refresh rankings and social status
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
    queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
  }, [socket, queryClient]);

  const spectateDuel = useCallback((duelId: number) => {
    socket?.send(JSON.stringify({ type: 'admin:spectate', payload: { duelId } }));
  }, [socket]);

  const value = useMemo(() => ({
    duel,
    invite,
    sendChallenge,
    respondToInvite,
    submitAnswer,
    sendMessage,
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
    spectateDuel
  }), [
    duel, invite, sendChallenge, respondToInvite, submitAnswer, 
    sendMessage, lastChatMessage, isConnected, sentChallenges, 
    isPreparing, onlineUsers, challengingUser, challengeWager, 
    challengeTopic, challengeHandicap, isRevengeMode, refreshStats, resetDuel, 
    leaveResults, activeDuels, spectateDuel
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
