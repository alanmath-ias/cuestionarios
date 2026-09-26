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
import { Loader2, ArrowLeft, Trash2, Eye, Search, BookOpen, Coins, LogIn, Gift, Trophy, ChevronRight, MessageCircle, Sparkles, MoreVertical, Crown, Calendar, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TreasureChestIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 9A3 3 0 0 1 7 6h10a3 3 0 0 1 3 3v2H4V9z" opacity="0.8"/>
    <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9zm9 2a1.5 1.5 0 0 0-1.5 1.5c0 .54.29 1.01.72 1.27v1.46a.78.78 0 0 0 1.56 0v-1.46a1.49 1.49 0 0 0 .72-1.27A1.5 1.5 0 0 0 12 13z"/>
  </svg>
);

function UserActionsDropdown({
  user,
  onManageCategories,
  onViewChest,
  onGiveBonus,
  onSendMessage,
  onDeleteUser,
  canDelete,
}: {
  user: any;
  onManageCategories: () => void;
  onViewChest: () => void;
  onGiveBonus: () => void;
  onSendMessage: () => void;
  onDeleteUser: () => void;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8"
          title="Más opciones"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-slate-900 border-white/10 text-slate-200 w-52 shadow-2xl z-50 p-1.5"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onManageCategories();
          }}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded text-slate-300 hover:text-green-300 hover:bg-green-500/10 focus:bg-green-500/10 focus:text-green-300"
        >
          <BookOpen className="h-4 w-4 text-green-400" />
          <span>Gestionar materias</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onViewChest();
          }}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-300"
        >
          <TreasureChestIcon className="h-4 w-4 text-amber-400" />
          <span>Ver cofre</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onGiveBonus();
          }}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/10 focus:bg-yellow-500/10 focus:text-yellow-300"
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span>Otorgar Bonus</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onSendMessage();
          }}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 focus:bg-blue-500/10 focus:text-blue-300"
        >
          <MessageCircle className="h-4 w-4 text-blue-400" />
          <span>Mensaje</span>
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                onDeleteUser();
              }}
              className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
              <span>Papelera</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
  const [bonusUser, setBonusUser] = useState<any>(null);
  const [bonusCredits, setBonusCredits] = useState<number>(50);
  const [bonusReason, setBonusReason] = useState<string>("");
  const [selectedAwardsCategory, setSelectedAwardsCategory] = useState<any>(null);
  const [creditsAmount, setCreditsAmount] = useState<string>("");
  const [subscriptionUser, setSubscriptionUser] = useState<any>(null);
  const [subStatus, setSubStatus] = useState<string>("free");
  const [subPlan, setSubPlan] = useState<string>("Gratis");
  const [subEndDate, setSubEndDate] = useState<string>("");
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({
      userId,
      subscriptionStatus,
      subscriptionPlan,
      subscriptionEndDate,
    }: {
      userId: number;
      subscriptionStatus: string;
      subscriptionPlan: string;
      subscriptionEndDate: string | null;
    }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/subscription`, {
        subscriptionStatus,
        subscriptionPlan,
        subscriptionEndDate,
      });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Suscripción actualizada 🎉",
        description: `Se actualizó la suscripción de ${subscriptionUser?.username} a ${updatedUser.subscriptionPlan || (updatedUser.subscriptionStatus === "active" ? "Premium" : "Gratis")}.`,
      });
      setSubscriptionUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar suscripción",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyPreset = (preset: 'free' | '1m' | '3m' | '1y' | 'unlimited') => {
    const now = new Date();
    if (preset === 'free') {
      setSubStatus('free');
      setSubPlan('Gratis');
      setSubEndDate('');
      setIsUnlimited(false);
    } else if (preset === '1m') {
      setSubStatus('active');
      setSubPlan('Premium Mensual');
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      setSubEndDate(d.toISOString().split('T')[0]);
      setIsUnlimited(false);
    } else if (preset === '3m') {
      setSubStatus('active');
      setSubPlan('Premium Trimestral');
      const d = new Date(now);
      d.setMonth(d.getMonth() + 3);
      setSubEndDate(d.toISOString().split('T')[0]);
      setIsUnlimited(false);
    } else if (preset === '1y') {
      setSubStatus('active');
      setSubPlan('Premium Anual');
      const d = new Date(now);
      d.setFullYear(d.getFullYear() + 1);
      setSubEndDate(d.toISOString().split('T')[0]);
      setIsUnlimited(false);
    } else if (preset === 'unlimited') {
      setSubStatus('active');
      setSubPlan('Premium Vitalicio');
      setSubEndDate('');
      setIsUnlimited(true);
    }
  };

  const handleOpenSubscription = (u: any) => {
    setSubscriptionUser(u);
    const status = u.subscriptionStatus === 'active' ? 'active' : 'free';
    setSubStatus(status);
    setSubPlan(u.subscriptionPlan || (status === 'active' ? 'Premium Mensual' : 'Gratis'));
    if (u.subscriptionEndDate) {
      const d = new Date(u.subscriptionEndDate);
      if (!isNaN(d.getTime())) {
        setSubEndDate(d.toISOString().split('T')[0]);
        setIsUnlimited(false);
      } else {
        setSubEndDate('');
        setIsUnlimited(true);
      }
    } else {
      setSubEndDate('');
      setIsUnlimited(status === 'active');
    }
  };

  const sendBonusMutation = useMutation({
    mutationFn: async ({ userId, credits, message }: { userId: number; credits: number; message: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/bonus`, { credits, message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "¡Bonus enviado con éxito! 🎉",
        description: `Se han otorgado ${bonusCredits} créditos de premio a ${bonusUser?.username}.`,
      });
      setBonusUser(null);
      setBonusCredits(50);
      setBonusReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar bonus",
        description: error.message,
        variant: "destructive",
      });
    },
  });
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
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition-all"
            >
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
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[880px]">
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="w-12 text-center text-slate-400 px-2">ID</TableHead>
                    <TableHead className="min-w-[160px] text-slate-400 px-2">Usuario</TableHead>
                    <TableHead className="w-20 text-center text-slate-400 px-2">Rol</TableHead>
                    <TableHead className="w-24 text-center text-slate-400 px-2">Créditos</TableHead>
                    <TableHead className="w-24 text-center text-slate-400 px-2">Total Reportes</TableHead>
                    <TableHead className="w-28 text-center text-slate-400 px-2">Permiso Reportar</TableHead>
                    <TableHead className="w-24 text-center text-slate-400 px-2">Permiso IA</TableHead>
                    <TableHead className="w-44 text-right text-slate-400 pr-3">Acciones</TableHead>
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
                    <TableCell className="font-mono text-slate-500 text-center px-2">#{user.id}</TableCell>
                    <TableCell className="px-2 py-2.5">
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-2 flex-wrap">
                          <span>{user.username}</span>
                          {user.subscriptionStatus === "active" && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              {user.subscriptionPlan || "Premium"}
                            </span>
                          )}
                          {(user.tourStatus?.completedMaps?.[1] || user.tourStatus?.completedMaps?.['1']) && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-black animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                              🏆 Aritmética 100%
                            </span>
                          )}
                          {(user.tourStatus?.completedMaps?.[2] || user.tourStatus?.completedMaps?.['2']) && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                              🏆 Álgebra 100%
                            </span>
                          )}
                          {(user.tourStatus?.completedMaps?.[4] || user.tourStatus?.completedMaps?.['4']) && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              🏆 Cálculo Dif. 100%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{user.email || "Sin email"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-2">
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
                    <TableCell className="text-center px-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-slate-300 font-semibold">{user.hintCredits || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 p-0"
                          onClick={() => {
                            setManagingCreditsUser(user);
                            setCreditsAmount(user.hintCredits?.toString() || "0");
                          }}
                          title="Gestionar créditos"
                        >
                          <Coins className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-2">
                      <div className="flex justify-center">
                        <Badge variant="outline" className="bg-slate-800 text-slate-300 border-white/10">
                          {user.totalReports || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-2">
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
                    <TableCell className="text-center px-2">
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
                    <TableCell className="text-right pr-3 whitespace-nowrap px-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => impersonateMutation.mutate(user.id)}
                          title="Iniciar sesión como este usuario"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 w-8"
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
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenSubscription(user)}
                          title={`Suscripción: ${user.subscriptionStatus === 'active' ? (user.subscriptionPlan || 'Premium') : 'Gratis'} - Clic para ver y cambiar`}
                          className={`h-8 w-8 transition-colors ${
                            user.subscriptionStatus === 'active'
                              ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                              : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                          }`}
                        >
                          <Crown className="h-4 w-4" />
                        </Button>
                        <UserActionsDropdown
                          user={user}
                          onManageCategories={() => setManagingCategoriesUser(user)}
                          onViewChest={() => setChestUser(user)}
                          onGiveBonus={() => {
                            setBonusUser(user);
                            setBonusCredits(50);
                            setBonusReason("");
                          }}
                          onSendMessage={() => {
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
                          onDeleteUser={() => setUserToDelete(user)}
                          canDelete={user.id !== 1 && user.id !== 2 && user.role !== "admin"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
                        whileTap={{ scale: 0.98 }}
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
            tourStatus={chestUser?.tourStatus}
          />
        )}

        {/* Bonus Dialog */}
        <Dialog open={!!bonusUser} onOpenChange={(open) => !open && setBonusUser(null)}>
          <DialogContent className="bg-slate-900 border border-amber-500/30 text-slate-200 rounded-[2rem] max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Otorgar Bonus a {bonusUser?.username}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Premia a este estudiante enviándole créditos y un mensaje motivacional de su profesor.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="bonus-credits" className="text-slate-300 font-semibold flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-400" />
                  Cantidad de Créditos
                </Label>
                <Input
                  id="bonus-credits"
                  type="number"
                  min="1"
                  max="10000"
                  value={bonusCredits}
                  onChange={(e) => setBonusCredits(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-slate-950 border-slate-800 text-amber-400 font-bold text-lg"
                  placeholder="Ej. 50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bonus-reason" className="text-slate-300 font-semibold">
                  Razón o Mensaje del Profesor
                </Label>
                <Textarea
                  id="bonus-reason"
                  rows={3}
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50"
                  placeholder="Ej: ¡Excelente trabajo y dedicación en los cuestionarios de esta semana! Sigue así. Profe AlanMath."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setBonusUser(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (bonusUser && bonusCredits > 0 && bonusReason.trim()) {
                    sendBonusMutation.mutate({
                      userId: bonusUser.id,
                      credits: bonusCredits,
                      message: bonusReason.trim(),
                    });
                  }
                }}
                disabled={sendBonusMutation.isPending || !bonusReason.trim()}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
              >
                {sendBonusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Enviar Premio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subscription Management Dialog */}
        <Dialog open={!!subscriptionUser} onOpenChange={(open) => !open && setSubscriptionUser(null)}>
          <DialogContent className="bg-slate-950 border border-amber-500/30 text-slate-200 rounded-[2rem] max-w-lg shadow-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Suscripción de {subscriptionUser?.username}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                    {subscriptionUser?.email || "Sin email"} • Rol: {subscriptionUser?.role}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Current Status Banner */}
            <div className="mt-2 p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Estado Actual:</div>
                <div className="text-sm font-bold flex items-center gap-2 mt-0.5">
                  {subscriptionUser?.subscriptionStatus === "active" ? (
                    <>
                      <span className="text-amber-400">👑 Premium Activo</span>
                      <span className="text-xs text-slate-400">({subscriptionUser?.subscriptionPlan || "Estándar"})</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Gratuito (Sin plan activo)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Vencimiento:</div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">
                  {subscriptionUser?.subscriptionStatus === "active"
                    ? (subscriptionUser?.subscriptionEndDate
                        ? new Date(subscriptionUser.subscriptionEndDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                        : "Permanente (Vitalicio)")
                    : "—"}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Asignar Plan Rápido
              </Label>
              <div className="grid grid-cols-5 gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("free")}
                  className={`text-xs h-9 px-1 border-white/10 ${
                    subStatus === "free"
                      ? "bg-slate-700 text-white border-slate-500"
                      : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  Gratis
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("1m")}
                  className={`text-xs h-9 px-1 border-white/10 ${
                    subStatus === "active" && subPlan === "Premium Mensual"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  1 Mes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("3m")}
                  className={`text-xs h-9 px-1 border-white/10 ${
                    subStatus === "active" && subPlan === "Premium Trimestral"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  3 Meses
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("1y")}
                  className={`text-xs h-9 px-1 border-white/10 ${
                    subStatus === "active" && subPlan === "Premium Anual"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  1 Año
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("unlimited")}
                  className={`text-xs h-9 px-1 border-white/10 ${
                    subStatus === "active" && subPlan === "Premium Vitalicio"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900/60 text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                  }`}
                >
                  👑 Vitalicio
                </Button>
              </div>
            </div>

            {/* Detailed Controls */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sub-status" className="text-xs text-slate-400">Estado</Label>
                  <Select
                    value={subStatus}
                    onValueChange={(val) => {
                      setSubStatus(val);
                      if (val === "free") {
                        setSubPlan("Gratis");
                        setSubEndDate("");
                        setIsUnlimited(false);
                      } else if (val === "active" && subPlan === "Gratis") {
                        setSubPlan("Premium Mensual");
                      }
                    }}
                  >
                    <SelectTrigger id="sub-status" className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="active">Activo (Premium)</SelectItem>
                      <SelectItem value="free">Gratuito (Free)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sub-plan" className="text-xs text-slate-400">Nombre del Plan</Label>
                  <Input
                    id="sub-plan"
                    value={subPlan}
                    disabled={subStatus === "free"}
                    onChange={(e) => setSubPlan(e.target.value)}
                    placeholder="Ej. Premium Mensual"
                    className="bg-slate-900 border-slate-800 text-slate-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {subStatus === "active" && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium text-slate-300">Acceso Permanente / Vitalicio</Label>
                      <p className="text-[11px] text-slate-500">Sin fecha de caducidad</p>
                    </div>
                    <Switch
                      checked={isUnlimited}
                      onCheckedChange={(checked) => {
                        setIsUnlimited(checked);
                        if (checked) {
                          setSubEndDate("");
                        } else if (!subEndDate) {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          setSubEndDate(d.toISOString().split("T")[0]);
                        }
                      }}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>

                  {!isUnlimited && (
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <Label htmlFor="sub-end-date" className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        Fecha de Vencimiento
                      </Label>
                      <Input
                        id="sub-end-date"
                        type="date"
                        value={subEndDate}
                        onChange={(e) => setSubEndDate(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="ghost"
                onClick={() => setSubscriptionUser(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (subscriptionUser) {
                    updateSubscriptionMutation.mutate({
                      userId: subscriptionUser.id,
                      subscriptionStatus: subStatus,
                      subscriptionPlan: subStatus === "free" ? "Gratis" : subPlan,
                      subscriptionEndDate: isUnlimited || subStatus === "free" || !subEndDate ? null : subEndDate,
                    });
                  }
                }}
                disabled={updateSubscriptionMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
              >
                {updateSubscriptionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                ¿Estás seguro de eliminar a {userToDelete?.username}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setUserToDelete(null)}
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (userToDelete) {
                    deleteUserMutation.mutate(userToDelete.id);
                    setUserToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}