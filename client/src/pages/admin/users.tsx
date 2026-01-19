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
import { Loader2, ArrowLeft, Trash2, Eye, Search, BookOpen, Coins, LogIn } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  }, [searchString]);

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
        onBack={() => setSelectedUser(null)}
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
                          onClick={() => setSelectedUser(user)}
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
      </div>
    </div>
  );
}