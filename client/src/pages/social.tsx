import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  UserPlus, 
  Search, 
  Bell, 
  Check, 
  X, 
  UserCheck, 
  Sword, 
  Swords,
  Trophy,
  History,
  MessageSquare,
  Clock,
  Loader2,
  Trash2,
  AlertCircle,
  Coins,
  ShieldAlert,
  Minus,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDuel } from "@/hooks/use-duel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { FriendProfileDialog } from "@/components/social/FriendProfileDialog";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const { 
    sendChallenge, 
    sentChallenges, 
    onlineUsers, 
    setOnlineUsers, 
    setChallengingUser,
    setChallengeWager,
    setChallengeTopic,
    setIsRevengeMode 
  } = useDuel();

  const [searchQuery, setSearchQuery] = useState("");
  const [friendsFilter, setFriendsFilter] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<any>({ queryKey: ["/api/user"] });
  const { data: friends = [], isLoading: loadingFriends } = useQuery<any[]>({
    queryKey: ["/api/social/friends"],
  });

  const filteredFriends = useMemo(() => {
    if (!friendsFilter) return friends;
    const q = friendsFilter.toLowerCase();
    return friends.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.username.toLowerCase().includes(q)
    );
  }, [friends, friendsFilter]);

  // Sync online status from initial fetch
  useEffect(() => {
    if (friends) {
      const onlineIds = new Set(friends.filter(f => f.isOnline).map(f => f.id));
      setOnlineUsers(onlineIds);
    }
  }, [friends, setOnlineUsers]);
  const { data: pendingRequests, isLoading: loadingRequests } = useQuery<any[]>({
    queryKey: ["/api/social/pending-requests"],
  });
  const { data: allFriendships } = useQuery<any[]>({
    queryKey: ["/api/social/friendships"],
  });
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  const { data: searchResults, isLoading: searching } = useQuery<any[]>({
    queryKey: ["/api/social/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const res = await apiRequest("GET", `/api/social/search?q=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length > 2,
  });

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      await apiRequest("POST", "/api/social/request", { friendId });
    },
    onSuccess: () => {
      toast({ title: "Solicitud enviada", description: "Espera a que tu amigo la acepte." });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/search"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error al enviar solicitud", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("PATCH", `/api/social/request/${requestId}/accept`);
    },
    onSuccess: () => {
      toast({ title: "¡Solicitud aceptada!", description: "Ahora son amigos." });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("DELETE", `/api/social/request/${requestId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
      toast({ title: "Solicitud rechazada", description: "Has rechazado la solicitud de amistad." });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (targetId: number) => {
      await apiRequest("POST", `/api/social/block/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
      toast({ title: "Usuario bloqueado", description: "Ya no recibirás solicitudes de este usuario." });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (targetId: number) => {
      await apiRequest("DELETE", `/api/social/unblock/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/friendships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
      toast({ title: "Usuario desbloqueado", description: "Ahora puedes interactuar con este usuario nuevamente." });
    },
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Centro de Amigos
            </h1>
            <p className="text-slate-400 mt-2">Gestiona tus amistades y prepárate para el duelo.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center bg-slate-900/50 border border-white/10 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 uppercase font-bold">Créditos</span>
              <span className="text-2xl font-bold text-amber-400">{user?.hintCredits || 0}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-900/50 border border-white/10 p-4 rounded-2xl shadow-xl shadow-emerald-500/5">
              <span className="text-xs text-slate-500 uppercase font-bold">Victorias</span>
              <span className="text-3xl font-black text-emerald-400">{user?.duelWins || 0}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="friends" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6 overflow-x-auto">
            <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-blue-600">
                <Users className="w-4 h-4 mr-2" /> Amigos
                {friends && friends.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white/10 text-white border-0">
                    {friends.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-purple-600">
                <UserPlus className="w-4 h-4 mr-2" /> Solicitudes
                {pendingRequests && pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className="rounded-lg data-[state=active]:bg-slate-700">
                <Search className="w-4 h-4 mr-2" /> Buscar
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB: FRIENDS */}
            <TabsContent value="friends" className="mt-0">
              {loadingFriends ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : friends?.length === 0 ? (
                <EmptyState 
                  icon={Users} 
                  title="Aún no tienes amigos" 
                  description="Busca a tus compañeros para empezar a retarlos."
                  action={() => setActiveTab("search")}
                  actionLabel="Buscar Amigos"
                />
              ) : (
                <div className="space-y-6">
                  {/* Local Search Bar */}
                  <div className="relative group max-w-md">
                    <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within:text-blue-400" />
                    <Input 
                      placeholder="Filtrar amigos por nombre..." 
                      value={friendsFilter}
                      onChange={(e) => setFriendsFilter(e.target.value)}
                      className="pl-11 py-5 bg-slate-900/40 border-white/5 rounded-2xl text-sm focus:ring-blue-500/50 backdrop-blur-md placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {filteredFriends.length > 0 ? (
                      filteredFriends.map((friend) => (
                        <UserCard 
                          key={friend.id} 
                          user={friend} 
                          type="friend" 
                          onChallenge={() => setChallengingUser(friend)}
                          onProfile={() => setSelectedProfileId(friend.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center p-12 text-slate-500">No se encontraron amigos que coincidan con la búsqueda.</div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB: REQUESTS */}
            <TabsContent value="requests" className="mt-0">
              {loadingRequests ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
              ) : pendingRequests?.length === 0 ? (
                <EmptyState 
                  icon={Bell} 
                  title="Sin solicitudes pendientes" 
                  description="Aquí verás las invitaciones de amistad que recibas."
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {pendingRequests?.map((req) => (
                    <UserCard 
                      key={req.friendshipId} 
                      user={req.sender} 
                      type="request"
                      onAccept={() => acceptRequestMutation.mutate(req.friendshipId)}
                      onReject={() => rejectRequestMutation.mutate(req.friendshipId)}
                      onBlock={() => blockMutation.mutate(req.sender.id)}
                      onProfile={() => setSelectedProfileId(req.sender.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB: SEARCH */}
            <TabsContent value="search" className="mt-0">
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <Input 
                    placeholder="Busca por nombre o nombre de usuario..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 bg-slate-900/50 border-white/10 rounded-2xl text-lg focus:ring-blue-500"
                  />
                </div>

                {searching ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                   {searchResults.map((u) => {
                     const relationship = allFriendships?.find(f => f.userId === u.id || f.friendId === u.id);
                     const isFriend = relationship?.status === 'accepted';
                     const isPending = relationship?.status === 'pending';
                     
                     return (
                        <UserCard 
                          key={u.id} 
                          user={u} 
                          type="search" 
                          onAdd={() => sendRequestMutation.mutate(u.id)}
                          onBlock={() => blockMutation.mutate(u.id)}
                          onUnblock={() => unblockMutation.mutate(u.id)}
                          onProfile={() => setSelectedProfileId(u.id)}
                          disabled={isFriend || isPending}
                          status={relationship?.status || 'none'}
                          isBlocker={relationship?.userId === user?.id}
                        />
                     );
                   })}
                 </div>
                ) : searchQuery.length > 2 ? (
                  <div className="text-center p-12 text-slate-500 font-medium">No encontramos usuarios con ese nombre.</div>
                ) : (
                  <div className="text-center p-12 text-slate-500 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                    Escribe al menos 3 letras para empezar la búsqueda.
                  </div>
                )}
              </div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
       </motion.div>

        <FriendProfileDialog 
          userId={selectedProfileId}
          isOpen={!!selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onChallenge={(friend) => {
            setChallengingUser({ id: friend.id, name: friend.name });
            setChallengeWager(10);
            setChallengeTopic("");
            setIsRevengeMode(false);
          }}
        />

      </div>
    );
}

function UserCard({ user, type, onChallenge, onAccept, onReject, onAdd, onBlock, onUnblock, onProfile, disabled, status, isBlocker }: any) {
  const { 
    onlineUsers, 
    sentChallenges, 
    setChallengingUser, 
    setChallengeWager, 
    setChallengeTopic, 
    setIsRevengeMode 
  } = useDuel();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 5, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
      onClick={user.role === 'admin' ? undefined : onProfile}
      className={`bg-slate-900/40 border border-white/5 rounded-2xl p-3 px-5 flex items-center justify-between group backdrop-blur-sm ${user.role === 'admin' ? 'cursor-default' : 'cursor-pointer'} transition-all ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      {/* Left: Avatar & Identity */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${onlineUsers.has(user.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 truncate leading-tight">{user.name}</h3>
            {user.duelWins > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20" title="Victorias globales">
                <Trophy className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-400 leading-none">{user.duelWins}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">@{user.role === 'admin' ? 'Administrador' : user.username}</p>
        </div>
      </div>

      {/* Middle: Compact Record (Desktop only) */}
      {type === "friend" && (user.wins > 0 || user.losses > 0) && (
        <div className="hidden sm:flex items-center gap-4 mx-6 px-4 py-1.5 bg-slate-950/30 border border-white/5 rounded-xl group-hover:bg-slate-950/50 transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Ganes</span>
            <span className="text-sm font-black text-emerald-400 italic leading-none">{user.wins}V</span>
          </div>
          <div className="h-4 w-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">Pérdidas</span>
            <span className="text-sm font-black text-rose-400 italic leading-none">{user.losses}D</span>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {type === "friend" && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => { 
                e.stopPropagation(); 
                window.dispatchEvent(new CustomEvent('open-chat', { detail: { friend: user } }));
              }}
              className="rounded-xl border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all h-9 px-3 text-xs font-bold"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Chatear
            </Button>
            {user.role !== 'admin' && (
              <Button 
                size="sm" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setChallengingUser({ id: user.id, name: user.name });
                  setChallengeWager(10);
                  setChallengeTopic("");
                  setIsRevengeMode(false);
                }}
                disabled={sentChallenges.has(user.id)}
                className={`rounded-xl shadow-lg transition-all duration-300 h-9 px-3 text-xs font-bold ${
                  sentChallenges.has(user.id) 
                    ? 'bg-slate-800 text-slate-500 cursor-default shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/20 active:scale-95'
                }`}
              >
                <Sword className="w-3.5 h-3.5 mr-1.5" /> 
                {sentChallenges.has(user.id) ? 'Retado' : 'Retar'}
              </Button>
            )}
          </>
        )}

        {type === "request" && (
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="default" 
              onClick={(e) => { e.stopPropagation(); onAccept(); }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 h-9 px-4 font-bold text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" /> Aceptar
            </Button>
            <Button 
              size="icon"
              variant="destructive" 
              onClick={(e) => { e.stopPropagation(); onReject(); }}
              className="rounded-xl h-9 w-9"
              title="Rechazar"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

         {type === "search" && (
           <div className="flex gap-2">
             <Button 
               size="sm"
               onClick={(e) => { e.stopPropagation(); onAdd(); }}
               disabled={disabled}
               className={`rounded-xl h-9 px-4 font-bold text-xs transition-all ${disabled ? 'bg-slate-800' : 'bg-slate-100 text-slate-950 hover:bg-white'}`}
             >
               {status === "accepted" ? (
                 <><UserCheck className="w-3.5 h-3.5 mr-1.5" /> Amigo</>
               ) : status === "pending" ? (
                 <><Clock className="w-3.5 h-3.5 mr-1.5" /> Pendiente</>
               ) : (
                 <><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Agregar</>
               )}
             </Button>
             {status !== "accepted" && status !== "pending" && (
               <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onBlock(); }} title="Bloquear" className="rounded-xl text-slate-500 hover:text-red-400 h-9 w-9 hover:bg-red-500/10">
                 <ShieldAlert className="w-3.5 h-3.5" />
               </Button>
             )}
           </div>
         )}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, description, action, actionLabel }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-white/5 rounded-[40px] text-center">
      <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-300">{title}</h3>
      <p className="text-slate-500 mt-2 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action} variant="outline" className="mt-6 border-white/10 hover:bg-white/5 text-slate-300 rounded-xl">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
