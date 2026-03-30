import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit2, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MathText } from '@/components/ui/math-display';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface QuestionReport {
    id: number;
    questionId: number;
    description: string;
    status: string;
    createdAt: string;
    question?: {
        id: number;
        content: string;
        type: string;
        imageUrl?: string | null;
        answers: {
            id: number;
            content: string;
            isCorrect: boolean;
        }[];
    };
    quiz?: {
        id: number;
        title: string;
    };
}

export default function UserReports() {
    const [_, setLocation] = useLocation();
    const { toast } = useToast();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ description: '' });
    const [reportToDelete, setReportToDelete] = useState<number | null>(null);

    const { data: user } = useQuery<any>({ queryKey: ['/api/user'] });

    const { data: reports = [], isLoading } = useQuery<QuestionReport[]>({
        queryKey: ['/api/user/reports'],
    });

    const updateReportMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: any }) => {
            await apiRequest('PATCH', `/api/user/reports/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user/reports'] });
            setEditingId(null);
            toast({ title: "Reporte actualizado exitosamente" });
        },
        onError: () => {
            toast({ title: "Error actualizando reporte", variant: "destructive" });
        }
    });

    const deleteReportMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest('DELETE', `/api/user/reports/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user/reports'] });
            setReportToDelete(null);
            toast({ title: "Reporte eliminado exitosamente" });
        },
        onError: () => {
            toast({ title: "Error eliminando reporte", variant: "destructive" });
        }
    });

    const startEditing = (report: QuestionReport) => {
        setEditingId(report.id);
        setEditForm({
            description: report.description
        });
    };

    const handleSaveEdit = (id: number) => {
        updateReportMutation.mutate({ id, data: editForm });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-slate-400 hover:text-white"
                        onClick={() => setLocation('/dashboard')}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Mis Reportes
                        </h1>
                        {user?.totalReports !== undefined && user.totalReports > 0 && (
                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-3 py-1">
                                {user.totalReports} {user.totalReports === 1 ? 'Reporte enviando' : 'Reportes enviados'} en total
                            </Badge>
                        )}
                    </div>
                </div>

                {user && !user.canReport && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl flex items-start gap-4 shadow-lg mb-6">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Función de reportes desactivada</h3>
                            <p className="text-sm opacity-90">Actualmente no tienes habilitada la función para crear nuevos reportes desde los cuestionarios. Sin embargo, aquí puedes revisar, editar o eliminar el registro de los reportes que has enviado en el pasado.</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-20 text-slate-400">Cargando reportes...</div>
                ) : reports.length === 0 ? (
                    <Card className="bg-slate-900 border-white/10 p-12 text-center text-slate-400 shadow-2xl">
                        Tu historial de reportes activos está vacío.
                        <div className="mt-4 text-sm opacity-60">Los reportes eliminados o ya resueltos por un administrador no aparecen aquí.</div>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {reports.map((report) => (
                            <Card key={report.id} className="bg-slate-900 border-white/10 shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                                Reporte de Pregunta ID: {report.questionId}
                                            </CardTitle>
                                            <p className="text-sm font-medium text-blue-400 mt-1">
                                                Cuestionario: {report.quiz?.title || "Desconocido"}
                                            </p>
                                            <CardDescription className="text-slate-400 mt-1">
                                                {format(new Date(report.createdAt), "d 'de' MMMM, yyyy  h:mm a", { locale: es })}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={report.status === 'pending' ? 'destructive' : 'default'} className="capitalize">
                                            {report.status === 'pending' ? 'Pendiente' : report.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-3 bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-400 block mb-2 cursor-pointer">Descripción del error: </span>
                                            {editingId === report.id ? (
                                                <div className="space-y-3">
                                                    <Textarea
                                                        autoFocus
                                                        className="bg-slate-950 border-blue-500/50 focus:border-blue-500 w-full min-h-[100px] text-slate-200"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({ description: e.target.value })}
                                                        placeholder="Explica qué error encontraste..."
                                                    />
                                                    <div className="flex justify-start gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            onClick={() => handleSaveEdit(report.id)}
                                                            disabled={updateReportMutation.isPending}
                                                        >
                                                            <Save className="h-4 w-4 mr-2" /> Guardar
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white">
                                                            <X className="h-4 w-4 mr-2" /> Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 block p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                                    {report.description}
                                                </span>
                                            )}
                                        </div>

                                        {/* Preview de la pregunta */}
                                        {report.question && (
                                            <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                                                <h4 className="text-sm font-semibold text-slate-400">Previsualización del Ejercicio:</h4>
                                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                                                    <MathText className="text-lg text-slate-200">{report.question.content}</MathText>
                                                    {report.question.imageUrl && (
                                                        <div className="mt-4 flex justify-center">
                                                            <img
                                                                src={report.question.imageUrl}
                                                                alt="Imagen aportada para la pregunta"
                                                                className="max-h-[300px] w-auto rounded-lg object-contain shadow-lg"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {report.question.answers && report.question.answers.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        {report.question.answers.map((answer) => (
                                                            <div
                                                                key={answer.id}
                                                                className={`p-3 rounded-lg border ${answer.isCorrect
                                                                    ? "border-green-500/30 bg-green-500/5"
                                                                    : "border-slate-800 bg-slate-900/50"
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex-1">
                                                                        <MathText className="text-slate-300">{answer.content}</MathText>
                                                                    </div>
                                                                    {answer.isCorrect && (
                                                                        <Badge className="bg-green-500/20 text-green-400 border-none ml-4">
                                                                            Correcta
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                {editingId !== report.id && (
                                    <CardFooter className="justify-end gap-2 border-t border-white/5 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                            onClick={() => startEditing(report)}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white"
                                            onClick={() => setReportToDelete(report.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

            </div>
            <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar reporte</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            ¿Estás seguro que deseas eliminar este reporte? Si lo borras ya no se le dará seguimiento a la pregunta reportada, pero tu contador total de reportes no se verá afectado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => reportToDelete && deleteReportMutation.mutate(reportToDelete)}
                        >
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
