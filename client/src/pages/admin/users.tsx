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
import { Loader2, ArrowLeft, Trash2, Eye, Search, RotateCcw } from "lucide-react";
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

  useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, users]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios registrados en la plataforma.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>
              Lista de todos los usuarios y sus roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow
                    key={user.id}
                    ref={(el) => (rowRefs.current[user.id] = el)}
                    className={highlightId === user.id ? "bg-yellow-100 transition-colors duration-1000" : ""}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Progreso
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
                              "{user.username}" y todo su progreso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="bg-destructive"
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
      </div>
    </div>
  );
}

function UserProgressDetails({ userId, username, onBack }: { userId: number, username: string, onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: progress, isLoading: isLoadingProgress } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/progress`],
  });

  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery<any[]>({
    queryKey: ["/api/quizzes"],
  });

  const deleteProgressMutation = useMutation({
    mutationFn: async (progressId: number) => {
      await apiRequest("DELETE", `/api/progress/${progressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/progress`] });
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
      await apiRequest("DELETE", "/api/admin/assignments", { userId, quizId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/progress`] });
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

  if (isLoadingProgress || isLoadingQuizzes) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter and sort logic
  const filteredProgress = progress?.filter((p: any) => {
    const quiz = quizzes?.find((q: any) => q.id === p.quizId);
    if (!quiz) return false;
    return quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a: any, b: any) => {
    const quizA = quizzes?.find((q: any) => q.id === a.quizId);
    const quizB = quizzes?.find((q: any) => q.id === b.quizId);
    return (quizA?.title || "").localeCompare(quizB?.title || "");
  }) || [];

  const completedQuizzes = filteredProgress.filter((p: any) => p.status === 'completed');
  const inProgressQuizzes = filteredProgress.filter((p: any) => p.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Usuarios
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Progreso de {username}</h1>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cuestionario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Completed Quizzes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Completados ({completedQuizzes.length})
              </h2>
            </div>

            {completedQuizzes.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                  No hay cuestionarios completados que coincidan con tu búsqueda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedQuizzes.map((p: any) => {
                  const quiz = quizzes?.find((q: any) => q.id === p.quizId);

                  return (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{quiz?.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Completado: {new Date(p.completedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={p.score >= 7 ? "default" : "secondary"} className="text-sm px-3 py-1">
                              Nota: {p.score}/10
                            </Badge>
                            <Link href={`/results/${p.id}`}>
                              <Button variant="secondary" size="sm" className="h-7 text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Detalles
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2 pt-4 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200">
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Resetear
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Resetear cuestionario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará el progreso y la calificación. El estudiante podrá volver a realizar el cuestionario desde cero.
                                  <br /><br />
                                  <strong>Esta acción no elimina la asignación.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProgressMutation.mutate(p.id)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Resetear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Eliminar Definitivamente
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">¿Eliminar definitivamente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción es irreversible.
                                  <ul className="list-disc pl-4 mt-2 space-y-1">
                                    <li>Se borrará todo el progreso y calificación.</li>
                                    <li>Se eliminará la asignación del cuestionario.</li>
                                    <li>El cuestionario desaparecerá del dashboard del estudiante.</li>
                                  </ul>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: p.quizId })}
                                  className="bg-red-600 hover:bg-red-700"
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

          {/* Column 2: Pending / In Progress */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Pendientes / En Curso ({inProgressQuizzes.length})
              </h2>
            </div>

            {inProgressQuizzes.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="pt-6 text-center text-gray-500">
                  No hay cuestionarios pendientes que coincidan con tu búsqueda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inProgressQuizzes.map((p: any) => {
                  const quiz = quizzes?.find((q: any) => q.id === p.quizId);
                  return (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">{quiz?.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Progreso: {p.completedQuestions} preguntas</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Última actividad: {new Date(p.updatedAt || p.startedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2 pt-4 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200">
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Reiniciar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Reiniciar cuestionario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se borrará el avance actual ({p.completedQuestions} preguntas). El estudiante comenzará desde cero.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProgressMutation.mutate(p.id)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Reiniciar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                <Trash2 className="h-3 w-3 mr-2" />
                                Eliminar Asignación
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">¿Eliminar asignación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará el cuestionario "<strong>{quiz?.title}</strong>" y todo su progreso.
                                  <br />
                                  El estudiante ya no verá este cuestionario en su lista.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAssignmentMutation.mutate({ userId, quizId: p.quizId })}
                                  className="bg-red-600 hover:bg-red-700"
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