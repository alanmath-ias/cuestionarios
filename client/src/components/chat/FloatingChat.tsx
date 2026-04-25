import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, User, Search, Trash2, Pencil, Check } from "lucide-react";
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
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
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
  const { 
    sendMessage, 
    lastChatMessage, 
    editChatMessage, 
    deleteChatMessage,
    onlineUsers 
  } = useDuel();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

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

        const newHistory = data.filter(m => new Date(m.createdAt).getTime() > clearedAt);
        setChatHistory(prev => {
            // Merge existing messages (from WebSocket) with fetched ones
            const merged = [...prev];
            newHistory.forEach(msg => {
                if (!merged.some(m => m.id === msg.id)) {
                    merged.push(msg);
                }
            });
            // Sort chronologically
            return merged.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });

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

  // ── Handle incoming messages via Event (Robust against rapid-fire) ─────────────
  useEffect(() => {
    const handleMessageEvent = (e: any) => {
      const msg = e.detail;
      if (!msg) return;

      const msgSenderId = Number(msg.senderId);
      const msgReceiverId = Number(msg.receiverId);
      const currentFriendId = selectedFriend ? Number(selectedFriend.id) : null;

      if (currentFriendId && (msgSenderId === currentFriendId || msgReceiverId === currentFriendId)) {
        setChatHistory(prev => {
          // 1. Check if we already have this message (by server ID)
          if (prev.some(m => m.id === msg.id)) return prev;

          // 2. Optimistic Sync: If this is my own echo, find the temporary message and "upgrade" it
          if (msgSenderId === Number(sessionUserIdRef.current)) {
              // Look for a message with the same content that was sent in the last 10 seconds
              const tempIndex = prev.findIndex(m => 
                  m.id < 0 && // temporary IDs are negative
                  m.content === msg.content 
              );
              if (tempIndex !== -1) {
                  const next = [...prev];
                  next[tempIndex] = msg;
                  return next;
              }
          }

          // 3. Just append if not found
          return [...prev, msg];
        });

        // Mark as read if we are the receiver
        if (msgReceiverId === Number(sessionUserIdRef.current)) {
          fetch(`/api/social/chat/${currentFriendId}`, { method: "GET" });
        }
      } else {
        // Message to someone not open - refresh badges
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/unread-messages/details"] });
      }
    };

    window.addEventListener("chat-message", handleMessageEvent);
    return () => window.removeEventListener("chat-message", handleMessageEvent);
  }, [selectedFriend?.id]);

  // ── Handle Edited/Deleted messages via Events ──────────────────────────────
  useEffect(() => {
    const handleEdited = (e: any) => {
      const updated = e.detail;
      setChatHistory(prev => prev.map(m => m.id === updated.id ? updated : m));
    };
    const handleDeleted = (e: any) => {
      const { id } = e.detail;
      setChatHistory(prev => prev.filter(m => m.id !== id));
    };

    window.addEventListener("chat-edited", handleEdited);
    window.addEventListener("chat-deleted", handleDeleted);
    return () => {
      window.removeEventListener("chat-edited", handleEdited);
      window.removeEventListener("chat-deleted", handleDeleted);
    };
  }, []);

  // ── Scroll on new messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, isOpen, selectedFriend]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!messageText.trim() || !selectedFriend) return;
    const text = messageText.trim();
    const friendId = selectedFriend.id;
    const myId = sessionUserIdRef.current;

    // OPTIMISTIC UPDATE: Add to history immediately
    if (myId) {
        const tempMsg: Message = {
            id: -Date.now(), // Temporary negative ID
            senderId: myId,
            receiverId: friendId,
            content: text,
            read: true,
            createdAt: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, tempMsg]);
    }

    sendMessage(friendId, text);
    setMessageText("");
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditText(msg.content);
  };

  const handleSaveEdit = () => {
    if (!editingMessageId || !editText.trim()) return;
    editChatMessage(editingMessageId, editText.trim());
    setEditingMessageId(null);
    setEditText("");
  };

  const handleDelete = (messageId: number) => {
    if (confirm("¿Estás seguro de borrar este mensaje?")) {
        deleteChatMessage(messageId);
    }
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
        {isOpen && session && (
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsOpen(false); setSelectedFriend(null); }}>
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
                        const myId = Number(session?.userId);
                        const isMe = Number(msg.senderId) === myId;
                        const isEditing = editingMessageId === msg.id;

                        // Improved logic: A message can be edited only if the OTHER person hasn't responded yet
                        const msgTime = new Date(msg.createdAt).getTime();
                        const hasReply = !isMe ? false : chatHistory.some(m => {
                            const otherId = Number(m.senderId);
                            const mTime = new Date(m.createdAt).getTime();
                            return otherId !== myId && mTime > msgTime;
                        });
                        const canEdit = isMe && !hasReply && msg.id > 0;

                        return (
                          <div key={msg.id} className={`group flex flex-col ${isMe ? "items-end" : "items-start"} mb-2`}>
                            <div className="flex w-full relative">
                              {!isMe && (
                                <Avatar className="h-6 w-6 mt-auto mr-2 shrink-0">
                                  <AvatarFallback className="text-[10px]">{selectedFriend?.name[0]}</AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`relative flex flex-col ${isMe ? "items-end ml-auto max-w-[85%]" : "items-start mr-auto max-w-[85%]"}`}>
                                <div
                                  className={`rounded-[1.2rem] px-4 py-2.5 text-sm shadow-sm relative w-full ${
                                    isMe
                                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none"
                                      : "bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none"
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                      <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="bg-white/10 text-white border-none focus:ring-1 ring-white/30 rounded p-1 text-sm outline-none resize-none"
                                        rows={2}
                                        autoFocus
                                      />
                                      <div className="flex justify-end gap-1">
                                        <button onClick={() => setEditingMessageId(null)} className="p-1 hover:bg-white/20 rounded">
                                          <X className="w-3 h-3" />
                                        </button>
                                        <button onClick={handleSaveEdit} className="p-1 bg-white/20 hover:bg-white/30 rounded">
                                          <Check className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="whitespace-pre-wrap">{msg.content}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        {msg.isEdited && (
                                          <span className="text-[9px] opacity-60 italic">editado</span>
                                        )}
                                        <span className="text-[10px] opacity-50 ml-auto">
                                          {format(new Date(msg.createdAt), "HH:mm")}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                                
                                {isMe && canEdit && !isEditing && (
                                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-10">
                                    <button 
                                      onClick={() => handleStartEdit(msg)} 
                                      className="p-1.5 bg-white border border-slate-200 shadow-md rounded-full text-slate-900 hover:text-blue-600 transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(msg.id)} 
                                      className="p-1.5 bg-white border border-slate-200 shadow-md rounded-full text-red-600 hover:text-red-700 transition-colors"
                                      title="Borrar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
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
          onClick={() => {
            if (isOpen) {
              // Closing: reset to friend list so next open shows contacts
              setIsOpen(false);
              setSelectedFriend(null);
            } else {
              setIsOpen(true);
            }
          }}
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
