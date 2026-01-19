import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function UserProgressDetails({ userId, username, onBack }: { userId: number, username: string, onBack: () => void }) {
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
