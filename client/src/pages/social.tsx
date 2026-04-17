import { useState } from "react";
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
  Trophy,
  History,
  MessageSquare,
  Clock,
  Loader2,
  Trash2,
  AlertCircle,
  Coins,
  ShieldAlert
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
  const [searchQuery, setSearchQuery] = useState("");
  const { sendChallenge } = useDuel();
  const [challengingUser, setChallengingUser] = useState<any>(null);
  const [wager, setWager] = useState<number>(10);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: user } = useQuery({ queryKey: ["/api/user"] });
  const { data: friends, isLoading: loadingFriends } = useQuery<any[]>({
    queryKey: ["/api/social/friends"],
  });
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
            <div className="flex flex-col items-center bg-slate-900/50 border border-white/10 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 uppercase font-bold">Victorias</span>
              <span className="text-2xl font-bold text-emerald-400">0</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends?.map((friend) => (
                    <UserCard 
                      key={friend.id} 
                      user={friend} 
                      type="friend" 
                      onChallenge={(e: any) => { e.stopPropagation(); setChallengingUser(friend); }}
                      onProfile={() => setSelectedProfileId(friend.id)}
                    />
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests?.map((req) => (
                    <UserCard 
                      key={req.friendshipId} 
                      user={req.sender} 
                      type="request"
                      onAccept={(e: any) => { e.stopPropagation(); acceptRequestMutation.mutate(req.friendshipId); }}
                      onReject={(e: any) => { e.stopPropagation(); rejectRequestMutation.mutate(req.friendshipId); }}
                      onBlock={(e: any) => { e.stopPropagation(); blockMutation.mutate(req.sender.id); }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {searchResults.map((u) => {
                     const relationship = allFriendships?.find(f => f.userId === u.id || f.friendId === u.id);
                     const isFriend = relationship?.status === 'accepted';
                     const isPending = relationship?.status === 'pending';
                     
                     return (
                        <UserCard 
                          key={u.id} 
                          user={u} 
                          type="search" 
                          onAdd={(e: any) => { e.stopPropagation(); sendRequestMutation.mutate(u.id); }}
                          onBlock={(e: any) => { e.stopPropagation(); blockMutation.mutate(u.id); }}
                          onUnblock={(e: any) => { e.stopPropagation(); unblockMutation.mutate(u.id); }}
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
        />

        {/* Duel Wager Dialog */}
        <Dialog open={!!challengingUser} onOpenChange={(open) => !open && setChallengingUser(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-white shadow-2xl shadow-blue-900/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-black text-blue-400">
                <Sword className="h-6 w-6" />
                LANZAR DESAFÍO
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Retarás a <span className="text-white font-bold">{challengingUser?.name}</span> a un duelo matemático rápido.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
               <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 text-yellow-500">
                    <Coins className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Apuesta de Créditos</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setWager(Math.max(5, wager - 5))}
                      className="rounded-xl border-white/10 hover:bg-white/5"
                    >
                      -
                    </Button>
                    <span className="text-5xl font-black">{wager}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setWager(wager + 5)}
                      className="rounded-xl border-white/10 hover:bg-white/5"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">*El perdedor entregará estos créditos al ganador.</p>
               </div>
            </div>

            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setChallengingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-500 px-8 rounded-xl font-bold"
                onClick={() => {
                  sendChallenge(challengingUser.id, wager);
                  setChallengingUser(null);
                }}
              >
                Retar ahora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}

function UserCard({ user, type, onChallenge, onAccept, onReject, onAdd, onBlock, onUnblock, onProfile, disabled, status, isBlocker }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={onProfile}
      className={`bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex items-center justify-between group backdrop-blur-sm cursor-pointer hover:bg-slate-900/60 transition-colors ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-slate-100">{user.name}</h3>
          <p className="text-xs text-slate-500">@{user.role === 'admin' ? 'Administrador' : user.username}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {type === "friend" && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => { 
                e.stopPropagation(); 
                // Custom event to open chat
                window.dispatchEvent(new CustomEvent('open-chat', { detail: { friend: user } }));
              }}
              className="rounded-xl border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Chatear
            </Button>
            <Button 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onChallenge(); }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500"
            >
              <Sword className="w-4 h-4 mr-2" /> Retar
            </Button>
          </>
        )}

        {type === "request" && (
          <>
            <Button 
              size="icon" 
              variant="default" 
              onClick={(e) => { e.stopPropagation(); onAccept(); }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="destructive" 
              onClick={(e) => { e.stopPropagation(); onReject(); }}
              className="rounded-xl"
              title="Rechazar"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button 
               size="icon" 
               variant="secondary" 
               onClick={(e) => { e.stopPropagation(); onBlock(); }}
               className="rounded-xl bg-slate-800 text-slate-400 hover:text-red-400"
               title="Bloquear"
             >
               <ShieldAlert className="w-4 h-4" />
             </Button>
          </>
        )}

         {type === "search" && (
           <div className="flex gap-2">
             {status === "blocked" ? (
               isBlocker ? (
                 <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onUnblock(); }} className="rounded-xl border-red-500/50 text-red-500 hover:bg-red-500/10">
                   Desbloquear
                 </Button>
               ) : (
                 <Badge variant="outline" className="text-slate-500 border-slate-800">Bloqueado</Badge>
               )
             ) : (
               <>
                 <Button 
                   size="sm" 
                   onClick={(e) => { e.stopPropagation(); onAdd(); }}
                   disabled={disabled}
                   className={`rounded-xl ${disabled ? 'bg-slate-800' : 'bg-slate-200 text-slate-900 hover:bg-white'}`}
                 >
                   {status === "accepted" ? (
                     <><UserCheck className="w-4 h-4 mr-2" /> Amigo</>
                   ) : status === "pending" ? (
                     <><Clock className="w-4 h-4 mr-2" /> Pendiente</>
                   ) : (
                     <><UserPlus className="w-4 h-4 mr-2" /> Agregar</>
                   )}
                 </Button>
                 {status !== "accepted" && status !== "pending" && (
                   <Button size="icon" variant="ghost" onClick={onBlock} title="Bloquear" className="rounded-xl text-slate-500 hover:text-red-400">
                     <ShieldAlert className="w-4 h-4" />
                   </Button>
                 )}
               </>
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
