import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  sendChallenge: (receiverId: number, wager: number, topic?: string, isRevenge?: boolean) => void;
  respondToInvite: (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number) => void;
  submitAnswer: (duelId: number, questionIndex: number, answerId: number) => void;
  currentQuestion: {
    index: number;
    content: string;
    options: any[];
  } | null;
  lastFeedback?: {
    userId: number;
    userName: string;
    answerId: number;
    isCorrect: boolean;
  };
  scores: Record<number, number>;
  isConnected: boolean;
  sentChallenges: Set<number>;
  isPreparing: boolean;
  onlineUsers: Set<number>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  revengeRequest: { opponentId: number; opponentName: string } | null;
  setRevengeRequest: (req: { opponentId: number; opponentName: string } | null) => void;
  refreshStats: () => void;
  resetDuel: () => void;
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
  const [revengeRequest, setRevengeRequest] = useState<{ opponentId: number; opponentName: string } | null>(null);
  const reconnectTimeout = useRef<any>(null);

  const connect = useCallback(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/duels`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Duel WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message: DuelMessage = JSON.parse(event.data);
      handleWsMessage(message);
    };

    ws.onclose = () => {
      console.log('❌ Duel WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
      // Attempt reconnect after 5 seconds
      reconnectTimeout.current = setTimeout(connect, 5000);
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
        // If we are looking at a results screen, clear it so the invitation shows up clean
        setDuel(prev => (prev?.status === 'finished' ? null : prev));
        setInvite(payload);
        break;
      case 'duel:start':
        setIsPreparing(false);
        setDuel({
          status: 'in_progress',
          duelId: payload.duelId,
          opponentName: payload.opponentName,
          questionsCount: payload.questionsCount,
          currentQuestion: { index: 0, content: '', options: [] },
          scores: {},
          topic: payload.topic,
          allWrongAnswers: [],
        });
        setInvite(null);
        break;
      case 'duel:preparing':
        setIsPreparing(true);
        break;
      case 'duel:question':
        setIsPreparing(false);
        setDuel(prev => prev ? { 
            ...prev, 
            currentQuestion: payload,
            lastFeedback: undefined,
            allWrongAnswers: [],   // clear per-round wrong answers on each new question
        } : null);
        break;
      case 'duel:answer_feedback':
        // Accumulate wrong answers so multiple failures stay visible
        setDuel(prev => prev ? { 
            ...prev, 
            lastFeedback: payload,
            allWrongAnswers: [
                ...(prev.allWrongAnswers || []),
                { userId: payload.userId, answerId: payload.answerId, userName: payload.userName }
            ]
        } : null);
        break;
      case 'duel:round_result':
        if (payload.winnerId) {
          toast({
              title: "⚡ " + payload.winnerName + " acertó!",
              description: "Prepárate para la siguiente...",
          });
        }
        setDuel(prev => ({ 
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
        setDuel(prev => ({ 
            ...prev, 
            status: 'finished', 
            finalResults: payload,
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
          setInvite(prev => prev ? { ...prev, wager: payload.wager } : { 
              duelId: payload.duelId, 
              wager: payload.wager, 
              challengerName: "Oponente", 
              topic: payload.topic || "Matemáticas" 
          });
          toast({ 
              title: "Contra-oferta recibida", 
              description: `El oponente propone una apuesta de ${payload.wager} créditos.` 
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
      case 'chat:receive':
          setLastChatMessage(payload);
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.senderId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/chat", Number(payload.receiverId)] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
          break;
    }
  };

  const sendChallenge = (receiverId: number, wager: number, topic?: string, isRevenge?: boolean) => {
    socket?.send(JSON.stringify({ type: 'duel:challenge', payload: { receiverId, wager, topic, isRevenge } }));
    setSentChallenges(prev => new Set(prev).add(receiverId));
    toast({ 
        title: isRevenge ? "Revancha enviada" : "Reto enviado", 
        description: "Esperando respuesta de tu amigo..." 
    });
  };

  const respondToInvite = (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number) => {
    socket?.send(JSON.stringify({ type: 'duel:respond', payload: { duelId, action, wager } }));
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

  const value = {
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
    revengeRequest,
    setRevengeRequest,
    refreshStats,
    resetDuel: () => setDuel(null),
  };

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
