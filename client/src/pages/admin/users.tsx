import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Trash2, Eye, Search, BookOpen, Coins, LogIn, Gift, Trophy, ChevronRight, MessageCircle } from "lucide-react";
import { AwardsDialog } from "@/components/dashboard/AwardsDialog";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCategoriesDialog } from "@/components/admin/UserCategoriesDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserProgressDetails } from "@/components/admin/UserProgressDetails";
import { Switch } from "@/components/ui/switch";

export default function UsersAdmin() {
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { toast } = useToast();
  const searchString = useSearch();
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const highlight = params.get("highlight");
    if (highlight) {
      setHighlightId(parseInt(highlight));
    }

    const viewProgress = params.get("viewProgress");
    if (viewProgress && users) {
      const user = users.find((u: any) => u.id === parseInt(viewProgress));
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [searchString, users]);

  // Sort users alphabetically by username
  const sortedUsers = users ? [...users].sort((a: any, b: any) =>
    (a.username || "").localeCompare(b.username || "")
  ) : [];

  const filteredUsers = sortedUsers.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toString().includes(searchQuery)
  );

  useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, sortedUsers]);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/admin/impersonate/${userId}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sesión iniciada",
        description: `Ahora estás viendo como ${data.user.username}`,
      });
      // Force reload to update session context
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión como este usuario.",
        variant: "destructive",
      });
    },
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [managingCategoriesUser, setManagingCategoriesUser] = useState<any>(null);
  const [managingCreditsUser, setManagingCreditsUser] = useState<any>(null);
  const [chestUser, setChestUser] = useState<any>(null);
  const [selectedAwardsCategory, setSelectedAwardsCategory] = useState<any>(null);
  const [creditsAmount, setCreditsAmount] = useState<string>("");
  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: number; credits: number }) => {
      await apiRequest("PATCH", `/api/users/${userId}/credits`, { credits });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setManagingCreditsUser(null);
      setCreditsAmount("");
      toast({
        title: "Créditos actualizados",
        description: "Los créditos del usuario han sido actualizados.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAiPermissionMutation = useMutation({
    mutationFn: async ({ userId, canCreateAiQuizzes }: { userId: number; canCreateAiQuizzes: boolean }) => {
      await apiRequest("PATCH", `/api/users/${userId}/ai-permission`, { canCreateAiQuizzes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Permiso actualizado",
        description: "El permiso de Cuestionarios Mágicos ha sido actualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleReportPermissionMutation = useMutation({
    mutationFn: async ({ userId, canReport }: { userId: number; canReport: boolean }) => {
      await apiRequest("PATCH", `/api/users/${userId}/report-permission`, { canReport });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Permiso actualizado",
        description: "El permiso de reporte ha sido actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Query to fetch the full profile for chest viewing
  const { data: chestProfile, isLoading: loadingChestProfile } = useQuery({
    queryKey: [`/api/social/profile/${chestUser?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/social/profile/${chestUser.id}`);
      if (!res.ok) throw new Error("Error fetching profile");
      return res.json();
    },
    enabled: !!chestUser?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (selectedUser) {
    return (
      <UserProgressDetails
        userId={selectedUser.id}
        username={selectedUser.username}
        onBack={() => {
          setSelectedUser(null);
          const params = new URLSearchParams(window.location.search);
          params.delete("viewProgress");
          window.history.pushState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        </div>

        <Card className="bg-slate-900 border border-white/10 shadow-xl">
          <CardHeader className="border-b border-white/5 bg-slate-900/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-200">Usuarios Registrados</CardTitle>
              <CardDescription className="text-slate-400">
                Lista de todos los usuarios y sus roles.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-slate-950 border-slate-800 text-slate-200 focus:ring-blue-500/50"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Usuario</TableHead>
                  <TableHead className="text-slate-400">Rol</TableHead>
                  <TableHead className="text-slate-400">Créditos</TableHead>
                  <TableHead className="text-slate-400">Total Reportes</TableHead>
                  <TableHead className="text-slate-400">Permiso Reportar</TableHead>
                  <TableHead className="text-slate-400">Permiso IA</TableHead>
                  <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user: any) => (
                  <TableRow
                    key={user.id}
                    ref={(el) => (rowRefs.current[user.id] = el)}
                    className={`border-white/5 hover:bg-white/5 transition-colors ${highlightId === user.id ? "bg-blue-500/20" : ""
                      }`}
                  >
                    <TableCell className="font-mono text-slate-500">#{user.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-200">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email || "Sin email"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={
                          user.role === "admin"
                            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{user.hintCredits || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          onClick={() => {
                            setManagingCreditsUser(user);
                            setCreditsAmount(user.hintCredits?.toString() || "0");
                          }}
                          title="Gestionar créditos"
                        >
                          <Coins className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge variant="outline" className="bg-slate-800 text-slate-300 border-white/10">
                          {user.totalReports || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={user.canReport}
                          disabled={toggleReportPermissionMutation.isPending}
                          onCheckedChange={(checked) => {
                            toggleReportPermissionMutation.mutate({
                              userId: user.id,
                              canReport: checked,
                            });
                          }}
                          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500 border-2 border-slate-800"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={user.canCreateAiQuizzes}
                          disabled={toggleAiPermissionMutation.isPending}
                          onCheckedChange={(checked) => {
                            toggleAiPermissionMutation.mutate({
                              userId: user.id,
                              canCreateAiQuizzes: checked,
                            });
                          }}
                          className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-slate-700 border-2 border-slate-800"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => impersonateMutation.mutate(user.id)}
                          title="Iniciar sesión como este usuario"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <LogIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            const params = new URLSearchParams(window.location.search);
                            params.set("viewProgress", String(user.id));
                            window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                          }}
                          title="Ver progreso detallado"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setManagingCategoriesUser(user)}
                          title="Gestionar materias"
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setChestUser(user)}
                          title="Ver cofre de tesoros"
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-chat', { 
                              detail: { 
                                friend: {
                                  id: user.id,
                                  username: user.username,
                                  name: user.name || user.username,
                                  role: user.role
                                } 
                              } 
                            }));
                          }}
                          title="Chatear con usuario"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        {user.id !== 1 && user.id !== 2 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                disabled={user.role === "admin"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                                  y todos sus datos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <UserCategoriesDialog
          userId={managingCategoriesUser?.id ?? null}
          username={managingCategoriesUser?.username ?? null}
          isOpen={!!managingCategoriesUser}
          onClose={() => setManagingCategoriesUser(null)}
        />

        <Dialog open={!!managingCreditsUser} onOpenChange={(open) => !open && setManagingCreditsUser(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle>Gestionar Créditos</DialogTitle>
              <DialogDescription>
                Asigna o modifica los créditos de pistas para {managingCreditsUser?.username}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">
                  Créditos
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  className="col-span-3 bg-slate-950 border-slate-800"
                  placeholder="Cantidad de créditos"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setManagingCreditsUser(null)}
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (managingCreditsUser && creditsAmount) {
                    updateCreditsMutation.mutate({
                      userId: managingCreditsUser.id,
                      credits: parseInt(creditsAmount),
                    });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Admin Chest Selection Dialog */}
        <Dialog open={!!chestUser} onOpenChange={(open) => !open && setChestUser(null)}>
          <DialogContent className="max-w-md bg-slate-950 border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-black text-white uppercase italic tracking-tight">
                  Cofres de {chestUser?.username}
                </DialogTitle>
                <DialogDescription>
                  Selecciona una materia para ver sus logros.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh] p-6 pt-2">
                {loadingChestProfile ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Abriendo almacén...</p>
                  </div>
                ) : chestProfile?.assignedCategories && chestProfile.assignedCategories.length > 0 ? (
                  <div className="space-y-3">
                    {chestProfile.assignedCategories.map((cat: any) => (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileActive={{ scale: 0.98 }}
                        onClick={() => setSelectedAwardsCategory(cat)}
                        className="w-full flex items-center justify-between p-5 rounded-[1.8rem] bg-slate-900/40 border border-white/5 hover:bg-slate-900/80 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-amber-500 group-hover:text-amber-400 transition-colors">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h5 className="text-sm font-black text-white uppercase italic tracking-tight">{cat.name}</h5>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Ver Logros Completos</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-500 italic">Este usuario no tiene materias asignadas.</p>
                  </div>
                )}
              </ScrollArea>
              
              <DialogFooter className="p-6 bg-slate-900/50">
                <Button variant="ghost" className="w-full" onClick={() => setChestUser(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Awards Dialog for Admin (with full access) */}
        {selectedAwardsCategory && chestProfile && (
          <AwardsDialog 
            isOpen={!!selectedAwardsCategory}
            onClose={() => setSelectedAwardsCategory(null)}
            category={selectedAwardsCategory}
            quizzes={chestProfile.allProgress || []}
            username={chestUser?.name || chestUser?.username || "Usuario"}
            wonDuels={chestProfile.wonDuels || 0}
            hintCredits={chestUser?.hintCredits || 0}
            isPublicView={false} // Admin has full access
          />
        )}
      </div>
    </div>
  );
}