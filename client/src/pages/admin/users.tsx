import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
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
import { Loader2, ArrowLeft, Trash2, Eye, Search, RotateCcw, BookOpen, Coins } from "lucide-react";
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

export default function UsersAdmin() {
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { toast } = useToast();
  const searchString = useSearch();
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

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
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">Gestión de Usuarios</h1>
          <p className="text-slate-400">Administra los usuarios registrados en la plataforma.</p>
        </div>

        <Card className="bg-slate-900 border border-white/10 shadow-xl">
          <CardHeader className="border-b border-white/5 bg-slate-900/50">
            <CardTitle className="text-slate-200">Usuarios Registrados</CardTitle>
            <CardDescription className="text-slate-400">
              Lista de todos los usuarios y sus roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Usuario</TableHead>
                  <TableHead className="text-slate-400">Rol</TableHead>
                  <TableHead className="text-slate-400">Créditos</TableHead>
                  <TableHead className="text-slate-400">Fecha de Registro</TableHead>
                  <TableHead className="text-right text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers?.map((user: any) => (
                  <TableRow
                    key={user.id}
                    ref={(el) => (rowRefs.current[user.id] = el)}
                    className={`border-white/5 hover:bg-white/5 transition-colors ${highlightId === user.id ? "bg-yellow-500/10 duration-1000" : ""}`}
                  >
                    <TableCell className="text-slate-400">{user.id}</TableCell>
                    <TableCell className="font-medium text-slate-200">{user.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-200 font-mono">
                      {user.hintCredits || 0}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManagingCategoriesUser(user)}
                        title="Gestionar Materias"
                        className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Materias
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setManagingCreditsUser(user);
                          setCreditsAmount(user.hintCredits?.toString() || "0");
                        }}
                        title="Gestionar Créditos"
                        className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Créditos
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Progreso
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-100">¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
                              "{user.username}" y todo su progreso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {managingCreditsUser && (
          <Dialog open={!!managingCreditsUser} onOpenChange={(open) => !open && setManagingCreditsUser(null)}>
            <DialogContent className="bg-slate-900 border border-white/10 text-slate-200">
              <DialogHeader>
                <DialogTitle>Gestionar Créditos</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Actualiza los créditos para el usuario {managingCreditsUser.username}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="credits" className="text-right text-slate-400">
                    Créditos
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    value={creditsAmount}
                    onChange={(e) => setCreditsAmount(e.target.value)}
                    className="col-span-3 bg-slate-950 border-slate-800 text-slate-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setManagingCreditsUser(null)} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
                  Cancelar
                </Button>
                <Button onClick={() => updateCreditsMutation.mutate({ userId: managingCreditsUser.id, credits: parseInt(creditsAmount) || 0 })} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <UserCategoriesDialog
          userId={managingCategoriesUser?.id}
          username={managingCategoriesUser?.username}
          isOpen={!!managingCategoriesUser}
          onClose={() => setManagingCategoriesUser(null)}
        />
      </div>
    </div>
  );
}

function UserProgressDetails({ userId, username, onBack }: { userId: number, username: string, onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch comprehensive dashboard data (quizzes + categories)
  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: [`/api/admin/users/${userId}/dashboard`],
  });

  const deleteProgressMutation = useMutation({
    mutationFn: async (progressId: number) => {
      await apiRequest("DELETE", `/api/progress/${progressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/dashboard`] });
      toast({
        title: "Progreso reseteado",
        description: "El progreso del cuestionario ha sido eliminado. El usuario puede volver a intentarlo.",
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

  const deleteAssignmentMutation = useMutation({
    mutationFn: async ({ userId, quizId }: { userId: number, quizId: number }) => {
      // Use the correct endpoint for removing assignments
      await apiRequest("DELETE", "/api/admin/users/quizzes", { userId, quizId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/dashboard`] });
      toast({
        title: "Asignación eliminada",
        description: "El cuestionario ha sido eliminado definitivamente para este usuario.",
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

  const quizzes = dashboardData?.quizzes || [];

  // Filter and sort logic
  const filteredQuizzes = quizzes.filter((q: any) => {
    return q.title.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a: any, b: any) => {
    return (a.title || "").localeCompare(b.title || "");
  });

  const completedQuizzes = filteredQuizzes.filter((q: any) => q.status === 'completed');
  const pendingOrInProgressQuizzes = filteredQuizzes.filter((q: any) => q.status !== 'completed').sort((a: any, b: any) => {
    // Sort by status: In Progress (has status) comes before Pending (no status)
    if (a.status && !b.status) return -1;
    if (!a.status && b.status) return 1;
    // Secondary sort by title
    return (a.title || "").localeCompare(b.title || "");
  });

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Usuarios
            </Button>
            <h1 className="text-3xl font-bold text-slate-100">Progreso de {username}</h1>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar cuestionario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Completed Quizzes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Completados ({completedQuizzes.length})
              </h2>
            </div>

            {completedQuizzes.length === 0 ? (
              <Card className="bg-slate-900/50 border border-dashed border-slate-700">
                <CardContent className="pt-6 text-center text-slate-500">
                  No hay cuestionarios completados que coincidan con tu búsqueda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedQuizzes.map((q: any) => (
                  <Card key={q.id} className="bg-slate-900 border border-white/10 hover:border-white/20 transition-all shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-200 mb-1">{q.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>Completado: {q.completedAt ? new Date(q.completedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={q.score >= 7 ? "default" : "secondary"} className={`text-sm px-3 py-1 ${q.score >= 7 ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20' : 'bg-slate-700 text-slate-300'}`}>
                            Nota: {q.score}/10
                          </Badge>
                          {q.progressId && (
                            <Link href={`/results/${q.progressId}`}>
                              <Button variant="secondary" size="sm" className="h-7 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Detalles
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-white/5">
                        {q.progressId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border-orange-500/20 bg-orange-500/5">
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Resetear
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-100">¿Resetear cuestionario?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Se eliminará el progreso y la calificación. El estudiante podrá volver a realizar el cuestionario desde cero.
                                  <br /><br />
                                  <strong>Esta acción no elimina la asignación.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProgressMutation.mutate(q.progressId)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  Resetear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20 bg-red-500/5">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Eliminar Definitivamente
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-400">¿Eliminar definitivamente?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Esta acción es irreversible.
                                <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-500">
                                  <li>Se borrará todo el progreso y calificación.</li>
                                  <li>Se eliminará la asignación del cuestionario.</li>
                                  <li>El cuestionario desaparecerá del dashboard del estudiante.</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: q.id })}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Eliminar Definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Pending / In Progress */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Pendientes / En Curso ({pendingOrInProgressQuizzes.length})
              </h2>
            </div>

            {pendingOrInProgressQuizzes.length === 0 ? (
              <Card className="bg-slate-900/50 border border-dashed border-slate-700">
                <CardContent className="pt-6 text-center text-slate-500">
                  No hay cuestionarios pendientes que coincidan con tu búsqueda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrInProgressQuizzes.map((q: any) => {
                  const isStarted = !!q.status;
                  return (
                    <Card key={q.id} className="bg-slate-900 border border-white/10 hover:border-white/20 transition-all shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-medium text-slate-200 mb-1">{q.title}</h3>
                            {isStarted ? (
                              <>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <span>Progreso: {q.completedQuestions || 0} preguntas</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Última actividad: {q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : 'Reciente'}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Badge variant="outline" className="text-slate-400 border-slate-600 bg-slate-800/50">
                                  Pendiente
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-white/5">
                          {isStarted && q.progressId && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border-orange-500/20 bg-orange-500/5">
                                  <RotateCcw className="h-3 w-3 mr-2" />
                                  Reiniciar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-100">¿Reiniciar cuestionario?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    Se borrará el avance actual ({q.completedQuestions} preguntas). El estudiante comenzará desde cero.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProgressMutation.mutate(q.progressId)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                  >
                                    Reiniciar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20 bg-red-500/5">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Eliminar Asignación
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">¿Eliminar asignación?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Se eliminará el cuestionario "<strong>{q.title}</strong>" y todo su progreso.
                                  <br />
                                  El estudiante ya no verá este cuestionario en su lista.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: q.id })}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Eliminar Definitivamente
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}