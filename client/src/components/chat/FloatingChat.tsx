import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, User, Search, Trash2 } from "lucide-react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Friend {
  id: number;
  username: string;
  name: string;
  role?: string;
  isOnline?: boolean;
}

export function FloatingChat() {
  const { session } = useSession();
  const { sendMessage, lastChatMessage } = useDuel();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Clean up ALL old localStorage chat_cleared keys on mount (legacy pollution)
  useEffect(() => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_cleared')) keysToDelete.push(key);
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  }, []);

  const sessionUserIdRef = useRef<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionUserIdRef.current = session?.userId;
  }, [session?.userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/user/unread-messages"],
    enabled: !!session,
    refetchInterval: 5000,
  });

  const { data: unreadDetails = {} } = useQuery<Record<number, number>>({
    queryKey: ["/api/user/unread-messages/details"],
    enabled: isOpen && !selectedFriend,
    refetchInterval: 5000,
  });

  const { data: friends = [] } = useQuery<Friend[]>({
    queryKey: ["/api/social/friends"],
    enabled: isOpen && !selectedFriend,
  });

  // ── Fetch chat history (direct, bypass React Query cache) ──────────────────
  // Deps use selectedFriend?.id (primitive) to avoid reference equality issues.
  // session.userId is read from a ref so session loading doesn't re-trigger this.
  useEffect(() => {
    if (!selectedFriend) {
      setChatHistory([]);
      return;
    }

    const friendId = selectedFriend.id;

    fetch(`/api/social/chat/${friendId}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data: Message[]) => {
        // Read userId from ref – avoids session-loading race condition
        const userId = sessionUserIdRef.current;
        // Use sessionStorage (not localStorage) so clearing doesn't persist across page reloads
        const clearedKey = userId
          ? `chat_cleared_${userId}_${friendId}`
          : `chat_cleared_${friendId}`;
        const clearedAtStr = sessionStorage.getItem(clearedKey);
        const clearedAt = clearedAtStr ? parseInt(clearedAtStr, 10) : 0;

        setChatHistory(data.filter(m => new Date(m.createdAt).getTime() > clearedAt));

        // Mark as read & refresh notification counts
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
      })
      .catch(err => console.error("[Chat] Error fetching history:", err));
    // IMPORTANT: only selectedFriend.id (primitive) as dep – not the friend object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFriend?.id]);

  // ── Auto-clear phantom notifications when list opens ──────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const senders = Object.keys(unreadDetails);
    if (senders.length === 0) return;

    Promise.all(
      senders.map(senderId => fetch(`/api/social/chat/${senderId}`, { method: "GET" }))
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── External open-chat event ───────────────────────────────────────────────
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      const friend = e.detail?.friend;
      if (friend) {
        setSelectedFriend(friend);
        setIsOpen(true);
      }
    };
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  // ── Handle incoming WS messages ────────────────────────────────────────────
  useEffect(() => {
    if (!lastChatMessage) return;

    const msgSenderId = Number(lastChatMessage.senderId);
    const msgReceiverId = Number(lastChatMessage.receiverId);
    const currentFriendId = selectedFriend ? Number(selectedFriend.id) : null;

    if (currentFriendId && (msgSenderId === currentFriendId || msgReceiverId === currentFriendId)) {
      setChatHistory(prev => {
        if (prev.some(m => m.id === lastChatMessage.id)) return prev;
        return [...prev, lastChatMessage];
      });
      // Mark as read if we are the receiver
      if (msgReceiverId === Number(sessionUserIdRef.current)) {
        fetch(`/api/social/chat/${currentFriendId}`, { method: "GET" });
      }
    } else {
      // Message to someone not currently open – just refresh badge
      queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
    }
  }, [lastChatMessage]);

  // ── Scroll on new messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, isOpen, selectedFriend]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!messageText.trim() || !selectedFriend) return;
    sendMessage(selectedFriend.id, messageText.trim());
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClearChat = () => {
    if (!selectedFriend) return;
    if (confirm("¿Estás seguro de que quieres limpiar esta conversación? Solo afectará tu vista en este navegador.")) {
      const now = Date.now();
      const userId = sessionUserIdRef.current;
      const clearedKey = userId
        ? `chat_cleared_${userId}_${selectedFriend.id}`
        : `chat_cleared_${selectedFriend.id}`;
      sessionStorage.setItem(clearedKey, now.toString());
      setChatHistory([]);
      fetch(`/api/social/chat/${selectedFriend.id}`, { method: "GET" }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
      });
    }
  };

  if (!session) return null;

  return (
    <div className={`fixed bottom-[5.5rem] right-6 z-[999] flex flex-col items-end transition-all ${isMobile ? "right-3" : ""}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-80 sm:w-96 overflow-hidden h-[450px] sm:h-[500px] max-h-[75vh] flex flex-col"
          >
            <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col h-full w-full overflow-hidden">
              {/* Header */}
              <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0 bg-primary/5">
                <div className="flex items-center gap-2">
                  {selectedFriend ? (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedFriend(null)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedFriend.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold leading-none">{selectedFriend.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{selectedFriend.role === "admin" ? "Administrador" : selectedFriend.username}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <span className="font-bold">Chat de Amigos</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {selectedFriend && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleClearChat}
                      title="Limpiar chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
                <ScrollArea className="h-full p-4">
                  {selectedFriend ? (
                    <div className="space-y-4">
                      {chatHistory.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground italic text-sm">
                          No hay mensajes anteriores. ¡Dile hola!
                        </div>
                      )}
                      {chatHistory.map(msg => {
                        const isMe = Number(msg.senderId) === Number(session?.userId);
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[85%] rounded-[1.5rem] px-4 py-2.5 text-sm shadow-sm ${
                                isMe
                                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none"
                                  : "bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <span className={`text-[10px] opacity-50 block mt-1 ${isMe ? "text-right" : "text-left"}`}>
                                {format(new Date(msg.createdAt), "HH:mm")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.length > 0 && (
                        <div className="relative mb-4 px-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar contacto..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-muted/50 border-none rounded-full"
                          />
                        </div>
                      )}
                      {friends.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                          <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Agrega amigos para chatear</p>
                          <Button
                            variant="link"
                            className="text-xs"
                            onClick={() => { setIsOpen(false); window.location.href = "/social"; }}
                          >
                            Ir al Centro de Amigos
                          </Button>
                        </div>
                      ) : (
                        friends
                          .filter(f =>
                            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.username.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(friend => (
                            <div
                              key={friend.id}
                              onClick={() => setSelectedFriend(friend)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-primary/10"
                            >
                              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                  {friend.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{friend.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  @{friend.role === "admin" ? "Administrador" : friend.username}
                                </p>
                              </div>
                              {unreadDetails[friend.id] > 0 && (
                                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center font-bold text-[10px] animate-in zoom-in shrink-0">
                                  {unreadDetails[friend.id]}
                                </Badge>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Footer */}
              {selectedFriend && (
                <CardFooter className="p-3 border-t bg-muted/30">
                  <div className="flex w-full items-center gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-background rounded-full border-primary/20 focus-visible:ring-primary"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!messageText.trim()}
                      className="rounded-full h-10 w-10 shrink-0 shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
        {!isOpen && unreadData && unreadData.count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 min-w-[24px] flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background animate-pulse font-bold">
            {unreadData.count > 9 ? "+9" : unreadData.count}
          </Badge>
        )}
      </motion.div>
    </div>
  );
}
