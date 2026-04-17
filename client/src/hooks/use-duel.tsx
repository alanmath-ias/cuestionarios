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
  sendChallenge: (receiverId: number, wager: number, topic?: string) => void;
  respondToInvite: (duelId: number, action: 'accept' | 'reject' | 'counter', wager?: number) => void;
  submitAnswer: (duelId: number, questionIndex: number, answerId: number) => void;
  sendMessage: (receiverId: number, content: string) => void;
  lastChatMessage: any;
  isConnected: boolean;
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

    switch (type) {
      case 'duel:invited':
        setInvite(payload);
        break;
      case 'duel:start':
        setInvite(null);
        setDuel({ ...payload, status: 'playing', scores: {}, currentQuestion: null });
        break;
      case 'duel:question':
        setDuel(prev => ({ ...prev, currentQuestion: payload, status: 'playing' }));
        break;
      case 'duel:round_result':
        toast({
            title: payload.winnerName + " acertó!",
            description: "Prepárate para la siguiente...",
        });
        setDuel(prev => ({ ...prev, scores: payload.scores }));
        break;
      case 'duel:end':
        setDuel(prev => ({ ...prev, status: 'finished', finalResults: payload }));
        break;
      case 'duel:error':
        toast({
          title: "Error en el duelo",
          description: payload.message,
          variant: "destructive",
        });
        break;
      case 'duel:rejected':
          toast({ title: "Reto rechazado", description: "El oponente no aceptó el duelo." });
          setDuel(null);
          break;
      case 'social:refresh':
          // Invalidate all social queries to sync state instantly
          queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
          queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
          break;
      case 'chat:receive':
          setLastChatMessage(payload);
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
          break;
    }
  };

  const sendChallenge = (receiverId: number, wager: number, topic?: string) => {
    socket?.send(JSON.stringify({ type: 'duel:challenge', payload: { receiverId, wager, topic } }));
    toast({ title: "Reto enviado", description: "Esperando respuesta de tu amigo..." });
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

  return (
    <DuelContext.Provider value={{ duel, invite, sendChallenge, respondToInvite, submitAnswer, sendMessage, lastChatMessage, isConnected }}>
      {children}
    </DuelContext.Provider>
  );
}

export function useDuel() {
  const context = useContext(DuelContext);
  if (!context) throw new Error('useDuel must be used within a DuelProvider');
  return context;
}
