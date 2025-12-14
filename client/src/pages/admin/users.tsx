import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, Save, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";

// Tipos
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
}

interface Quiz {
  id: number;
  title: string;
  status?: string;
  progressId?: number;
  completedAt?: string;
  score?: number;
}

export default function UsersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  // 1. Obtener usuarios
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      return res.json();
    }
  });

  // 2. Mutación para eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Usuario eliminado", description: "El usuario y sus datos han sido eliminados." });
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive", description: "No se pudo eliminar el usuario." });
    }
  });

  // 3. Efecto para resaltar usuario desde URL
  const [location] = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get("highlight");
    if (highlightId && !usersLoading && users) {
      const element = document.getElementById(`user-row-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("bg-yellow-100", "dark:bg-yellow-900/30", "transition-colors", "duration-1000");
        setTimeout(() => {
          element.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30");
        }, 3000);
      }
    }
  }, [users, usersLoading, location]);

  if (usersLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} id={`user-row-${user.id}`}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsProgressDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Eliminará permanentemente al usuario
                          <strong> {user.name} </strong> y todos sus datos asociados (progreso, respuestas, asignaciones).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      </div>

      {/* Diálogo de Progreso y Categorías */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Usuario: {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <UserProgressDetails userId={selectedUser.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserProgressDetails({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [_, setLocation] = useLocation();

  // Obtener datos del dashboard del usuario (quizzes y categorías)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-dashboard", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/dashboard`);
      if (!res.ok) throw new Error("Error al obtener datos del usuario");
      return res.json() as Promise<{ quizzes: Quiz[], categories: Category[] }>;
    }
  });

  // Obtener todas las categorías disponibles (para el selector)
  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Error al obtener categorías");
      return res.json() as Promise<Category[]>;
    }
  });

  // Inicializar categorías seleccionadas
  useEffect(() => {
    if (data?.categories) {
      setSelectedCategories(data.categories.map(c => c.id));
    }
  }, [data?.categories]);

  // Mutación para guardar categorías
  const saveCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: number[]) => {
      const res = await fetch(`/api/admin/users/${userId}/categories`, {
        method: "PUT", // Usamos PUT para reemplazar
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });
      if (!res.ok) throw new Error("Error al guardar categorías");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-dashboard", userId] });
      toast({ title: "Categorías actualizadas", description: "Las asignaciones se han guardado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive", description: "No se pudieron guardar las categorías." });
    }
  });

  // Mutación para eliminar progreso
  const deleteProgressMutation = useMutation({
    mutationFn: async (progressId: number) => {
      const res = await fetch(`/api/admin/progress/${progressId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar progreso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-dashboard", userId] });
      toast({ title: "Progreso eliminado", description: "La tarea ha sido eliminada del historial del usuario." });
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive", description: "No se pudo eliminar el progreso." });
    }
  });

  // Mutación para eliminar asignación (definitivamente)
  const deleteAssignmentMutation = useMutation({
    mutationFn: async ({ userId, quizId }: { userId: number; quizId: number }) => {
      const res = await fetch("/api/admin/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, quizId }),
      });
      if (!res.ok) throw new Error("Error al eliminar asignación");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-dashboard", userId] });
      toast({ title: "Asignación eliminada", description: "El cuestionario ha sido eliminado definitivamente del usuario." });
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive", description: "No se pudo eliminar la asignación." });
    }
  });

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };

  if (isLoading) return <Spinner className="h-8 w-8 mx-auto" />;

  const completedQuizzes = data?.quizzes.filter(q => q.status === 'completed') || [];
  const pendingQuizzes = data?.quizzes.filter(q => q.status !== 'completed') || [];

  return (
    <div className="space-y-8">
      {/* Sección de Categorías */}
      <div className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Asignar Materias</h3>
          <Button
            onClick={() => saveCategoriesMutation.mutate(selectedCategories)}
            disabled={saveCategoriesMutation.status === "pending"}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveCategoriesMutation.status === "pending" ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allCategories?.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
              />
              <label
                htmlFor={`cat-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Progreso */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Progreso del Usuario</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tareas Completadas */}
          <div>
            <h4 className="font-medium text-green-600 mb-2">Completados ({completedQuizzes.length})</h4>
            <div className="space-y-2">
              {completedQuizzes.length === 0 && <p className="text-sm text-muted-foreground">No hay tareas completadas.</p>}
              {completedQuizzes.map(quiz => (
                <div key={quiz.id} className="border p-3 rounded flex justify-between items-center bg-white dark:bg-slate-950">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.completedAt && format(new Date(quiz.completedAt), "PPP p", { locale: es })}
                    </p>
                  </div>
                  {quiz.progressId && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation(`/admin/review/${quiz.progressId}`)}
                        title="Ver detalles de revisión"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-700 hover:bg-orange-50" title="Resetear (Eliminar progreso)">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar este progreso?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el registro de que el usuario completó "<strong>{quiz.title}</strong>".
                              El usuario tendrá que volver a hacerlo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProgressMutation.mutate(quiz.progressId!)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Resetear
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Eliminar definitivamente">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar definitivamente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el progreso Y la asignación del cuestionario. Desaparecerá del dashboard del usuario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: quiz.id })}
                              className="bg-destructive"
                            >
                              Eliminar Todo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tareas Pendientes */}
          <div>
            <h4 className="font-medium text-amber-600 mb-2">Pendientes / En Progreso ({pendingQuizzes.length})</h4>
            <div className="space-y-2">
              {pendingQuizzes.length === 0 && <p className="text-sm text-muted-foreground">No hay tareas pendientes.</p>}
              {pendingQuizzes.map(quiz => (
                <div key={quiz.id} className="border p-3 rounded bg-slate-50 dark:bg-slate-900 opacity-75 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Estado: {quiz.status || 'No iniciado'}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Eliminar asignación">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará la asignación del cuestionario "<strong>{quiz.title}</strong>" para este usuario.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: quiz.id })}
                          className="bg-destructive"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}