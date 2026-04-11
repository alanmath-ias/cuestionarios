
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MathText } from "@/components/ui/math-display";
import { AIMarkdown } from "@/components/ui/ai-markdown";
import { Loader2, CheckCircle, Eye, Bot, Trash2, ChevronDown, ExternalLink, Pencil, Save, X, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface QuestionReport {
    id: number;
    quizId: number;
    questionId: number;
    userId: number;
    description: string;
    status: "pending" | "resolved";
    createdAt: string;
}

interface ReportDetails extends QuestionReport {
    user: {
        id: number;
        name: string;
        email: string;
        totalReports?: number;
    };
    quiz: {
        id: number;
        title: string;
    };
    question: {
        id: number;
        content: string;
        type: string;
        difficulty: number;
        points: number;
        variables?: any;
        answers: {
            id: number;
            content: string;
            isCorrect: boolean;
            explanation?: string | null;
        }[];
        imageUrl?: string | null;
    };
}

export default function AdminReports() {
    const { toast } = useToast();
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    
    // Estados para edición del reporte
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState<string>("");
    const [editedImageUrl, setEditedImageUrl] = useState<string>("");
    const [editedAnswers, setEditedAnswers] = useState<any[]>([]);

    const { data: reports, isLoading, error, isError } = useQuery<QuestionReport[]>({
        queryKey: ["/api/admin/reports"],
    });

    const { data: reportDetails, isLoading: isLoadingDetails } = useQuery<ReportDetails>({
        queryKey: ["/api/admin/reports", selectedReportId, "details"],
        queryFn: async () => {
            const res = await fetch(`/api/admin/reports/${selectedReportId}/details`);
            if (!res.ok) throw new Error("Failed to fetch details");
            return res.json();
        },
        enabled: !!selectedReportId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/reports/${id}`, { status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            toast({
                title: "Estado actualizado",
                description: "El reporte ha sido actualizado correctamente.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado.",
                variant: "destructive",
            });
        },
    });

    const solveAiMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/admin/reports/${id}/solve-ai`);
            return res.json();
        },
        onSuccess: (data) => {
            setAiResponse(data.aiResponse);
        },
        onError: () => {
            toast({
                title: "Error IA",
                description: "No se pudo obtener la respuesta de la IA.",
                variant: "destructive",
            });
        },
    });

    const resolveAndRewardMutation = useMutation({
        mutationFn: async ({ id, credits }: { id: number, credits: number }) => {
            const res = await apiRequest("POST", `/api/admin/reports/${id}/resolve`, { credits });
            if (!res.ok) throw new Error("No se pudo resolver el reporte");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            toast({
                title: "Reporte resuelto",
                description: "El reporte ha sido cerrado y actualizado.",
            });
            handleCloseDialog();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateQuestionMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
            const res = await apiRequest("PUT", `/api/admin/questions/${id}`, payload);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar la pregunta");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports", selectedReportId, "details"] });
            setIsEditing(false);
            toast({
                title: "Pregunta actualizada",
                description: "Los cambios se han guardado correctamente.",
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

    const deleteReportMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/admin/reports/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            toast({
                title: "Reporte eliminado",
                description: "El reporte ha sido eliminado permanentemente.",
            });
            handleCloseDialog();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudo eliminar el reporte.",
                variant: "destructive",
            });
        },
    });

    const handleCloseDialog = () => {
        setSelectedReportId(null);
        setAiResponse(null);
        setIsEditing(false);
    };

    const startEditing = () => {
        if (!reportDetails?.question) return;
        setEditedQuestion(reportDetails.question.content);
        setEditedImageUrl(reportDetails.question.imageUrl || "");
        setEditedAnswers(reportDetails.question.answers.map(a => ({ ...a })));
        setIsEditing(true);
    };

    const handleSaveQuestion = () => {
        if (!reportDetails?.question) return;
        
        // Validación básica
        if (!editedQuestion.trim()) {
            toast({ title: "Error", description: "El contenido de la pregunta no puede estar vacío.", variant: "destructive" });
            return;
        }

        if (reportDetails.question.type === "multiple_choice") {
            if (editedAnswers.length === 0) {
                toast({ title: "Error", description: "Debes tener al menos una respuesta.", variant: "destructive" });
                return;
            }
            if (!editedAnswers.some(a => a.isCorrect)) {
                toast({ title: "Error", description: "Debes marcar al menos una respuesta como correcta.", variant: "destructive" });
                return;
            }
        }

        const payload = {
            quizId: reportDetails.quiz.id,
            content: editedQuestion,
            type: reportDetails.question.type,
            difficulty: reportDetails.question.difficulty,
            points: reportDetails.question.points,
            variables: reportDetails.question.variables,
            imageUrl: editedImageUrl || null,
            answers: editedAnswers
        };

        updateQuestionMutation.mutate({ id: reportDetails.question.id, payload });
    };

    const addAnswer = () => {
        setEditedAnswers([...editedAnswers, { id: Date.now() * -1, content: "", isCorrect: false }]);
    };

    const removeAnswer = (id: number) => {
        setEditedAnswers(editedAnswers.filter(a => a.id !== id));
    };

    const updateAnswer = (id: number, field: string, value: any) => {
        setEditedAnswers(editedAnswers.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                        Reportes de Errores
                        <Badge variant="secondary" className="ml-2 bg-slate-800 text-slate-300 hover:bg-slate-700">
                            {reports?.filter((r) => r.status === "pending").length} Pendientes
                        </Badge>
                    </h1>
                    <p className="text-slate-400">Gestiona los reportes de errores enviados por los usuarios.</p>
                </div>

                <Card className="bg-slate-900 border border-white/10 shadow-xl">
                    <CardHeader className="border-b border-white/5 bg-slate-900/50">
                        <CardTitle className="text-slate-200">Listado de Reportes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-950/50">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Fecha</TableHead>
                                        <TableHead className="text-slate-400">Quiz ID</TableHead>
                                        <TableHead className="text-slate-400">Pregunta ID</TableHead>
                                        <TableHead className="text-slate-400">Descripción</TableHead>
                                        <TableHead className="text-slate-400">Estado</TableHead>
                                        <TableHead className="text-slate-400">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isError ? (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={6} className="text-center py-8 text-red-500">
                                                Error al cargar reportes: {(error as Error).message}
                                            </TableCell>
                                        </TableRow>
                                    ) : reports?.length === 0 ? (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                No hay reportes de errores.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports?.map((report) => (
                                            <TableRow key={report.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                <TableCell className="text-slate-400">
                                                    {format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                                                </TableCell>
                                                <TableCell className="text-slate-300">{report.quizId}</TableCell>
                                                <TableCell className="text-slate-300">{report.questionId}</TableCell>
                                                <TableCell className="max-w-md truncate text-slate-300" title={report.description}>
                                                    {report.description}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={report.status === "resolved" ? "default" : "destructive"}
                                                        className={report.status === "resolved" ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20"}
                                                    >
                                                        {report.status === "resolved" ? "Resuelto" : "Pendiente"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => setSelectedReportId(report.id)}
                                                            className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver Detalles
                                                        </Button>
                                                        {report.status === "pending" && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        disabled={resolveAndRewardMutation.isPending}
                                                                        className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 hover:text-purple-300"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" /> Resolver <ChevronDown className="h-3 w-3 ml-1" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200">
                                                                    <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: report.id, credits: 0 })}>
                                                                        Resolver (0 créditos)
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                                    <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: report.id, credits: 1 })}>
                                                                        Resolver y dar 1 crédito
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: report.id, credits: 2 })}>
                                                                        Resolver y dar 2 créditos
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: report.id, credits: 3 })}>
                                                                        Resolver y dar 3 créditos
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (window.confirm("¿Deseas eliminar permanentemente este reporte?")) {
                                                                    deleteReportMutation.mutate(report.id);
                                                                }
                                                            }}
                                                            disabled={deleteReportMutation.isPending}
                                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                                                        >
                                                            {deleteReportMutation.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!selectedReportId} onOpenChange={(open) => !open && handleCloseDialog()}>
                    <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-900 border border-white/10 text-slate-200">
                        <DialogHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="text-slate-100">Detalles del Reporte #{selectedReportId}</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Información completa sobre el error reportado.
                                    </DialogDescription>
                                </div>
                                <div className="flex gap-2 mr-6">
                                    {reportDetails?.status === "pending" && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={resolveAndRewardMutation.isPending}
                                                    className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 hover:text-purple-300"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Resolver <ChevronDown className="h-3 w-3 ml-1" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200">
                                                <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: selectedReportId!, credits: 0 })}>
                                                    Resolver (0 créditos)
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: selectedReportId!, credits: 1 })}>
                                                    Resolver y dar 1 crédito
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: selectedReportId!, credits: 2 })}>
                                                    Resolver y dar 2 créditos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => resolveAndRewardMutation.mutate({ id: selectedReportId!, credits: 3 })}>
                                                    Resolver y dar 3 créditos
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            if (window.confirm("¿Deseas eliminar permanentemente este reporte?")) {
                                                deleteReportMutation.mutate(selectedReportId!);
                                            }
                                        }}
                                        disabled={deleteReportMutation.isPending}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                                    >
                                        {deleteReportMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {isLoadingDetails ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : reportDetails ? (
                            <ScrollArea className="h-[60vh] pr-4">
                                <div className="space-y-6">
                                    {/* Información del Usuario */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-lg border border-white/5">
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-400">Reportado por</h4>
                                            <p className="text-slate-200 break-all sm:break-normal">{reportDetails.user?.name} ({reportDetails.user?.email})</p>
                                            <p className="text-xs text-slate-500 mt-1">Total reportes históricos: {reportDetails.user?.totalReports ?? 0}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-sm text-slate-400">Cuestionario</h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-slate-200" title={reportDetails.quiz?.title}>
                                                    {reportDetails.quiz?.title} <span className="text-slate-500 text-xs">(ID: {reportDetails.quiz?.id})</span>
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    onClick={() => window.open(`/quiz/${reportDetails.quiz?.id}`, '_blank')}
                                                    title="Abrir cuestionario en nueva pestaña"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción del Reporte */}
                                    <div>
                                        <h3 className="font-semibold mb-2 text-slate-200">Descripción del Error</h3>
                                        <div className="p-3 bg-red-500/10 text-red-200 rounded-md border border-red-500/20">
                                            {reportDetails.description}
                                        </div>
                                    </div>

                                    {/* Pregunta y Opciones */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-slate-200">Pregunta (ID: {reportDetails.question?.id})</h3>
                                            {!isEditing ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 bg-slate-800 text-blue-400 border-blue-500/20 hover:bg-blue-500/10"
                                                    onClick={startEditing}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-slate-400 hover:text-white"
                                                        onClick={() => setIsEditing(false)}
                                                    >
                                                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={handleSaveQuestion}
                                                        disabled={updateQuestionMutation.isPending}
                                                    >
                                                        {updateQuestionMutation.isPending ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                        ) : (
                                                            <Save className="h-3.5 w-3.5 mr-1" />
                                                        )}
                                                        Guardar Cambios
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="p-4 border border-blue-500/30 rounded-lg space-y-4 bg-blue-500/5">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 text-xs">Contenido de la pregunta</Label>
                                                    <Textarea
                                                        value={editedQuestion}
                                                        onChange={(e) => setEditedQuestion(e.target.value)}
                                                        className="bg-slate-950 border-slate-700 text-slate-200 min-h-[100px]"
                                                        placeholder="Escribe el enunciado de la pregunta..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 text-xs">URL de la imagen (opcional)</Label>
                                                    <Input
                                                        value={editedImageUrl}
                                                        onChange={(e) => setEditedImageUrl(e.target.value)}
                                                        className="bg-slate-950 border-slate-700 text-slate-200"
                                                        placeholder="https://ejemplo.com/imagen.png"
                                                    />
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-slate-400 text-xs">Opciones de respuesta</Label>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs text-blue-400 hover:text-white hover:bg-blue-500/10"
                                                            onClick={addAnswer}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Añadir Opción
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {editedAnswers.map((answer, idx) => (
                                                            <div key={answer.id} className="flex gap-2 items-start">
                                                                <div className="pt-2">
                                                                    <Checkbox
                                                                        checked={answer.isCorrect}
                                                                        onCheckedChange={(checked) => updateAnswer(answer.id, 'isCorrect', !!checked)}
                                                                        className="border-slate-600 data-[state=checked]:bg-green-600"
                                                                        title="Marcar como correcta"
                                                                    />
                                                                </div>
                                                                <Input
                                                                    value={answer.content}
                                                                    onChange={(e) => updateAnswer(answer.id, 'content', e.target.value)}
                                                                    className={`bg-slate-950 border-slate-700 text-slate-200 h-9 ${answer.isCorrect ? 'border-green-500/50 ring-1 ring-green-500/20' : ''}`}
                                                                    placeholder={`Opción ${idx + 1}`}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                                                                    onClick={() => removeAnswer(answer.id)}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 border border-white/10 rounded-lg space-y-4 bg-slate-950/30">
                                                <div className="text-lg font-medium text-slate-200">
                                                    <MathText>{reportDetails.question?.content}</MathText>
                                                </div>
                                                {reportDetails.question?.imageUrl && (
                                                    <div className="mt-4 flex justify-center">
                                                        <img src={reportDetails.question.imageUrl} alt="Imagen de la pregunta" className="max-w-full h-auto max-h-64 rounded-lg shadow-md border border-white/10" />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    {reportDetails.question?.answers?.map((answer) => (
                                                        <div
                                                            key={answer.id}
                                                            className={`p-3 rounded-md border flex justify-between items-center ${answer.isCorrect
                                                                ? "bg-green-500/10 border-green-500/20 text-slate-200"
                                                                : "bg-slate-900 border-white/5 text-slate-400"
                                                                }`}
                                                        >
                                                            <div className="flex-1">
                                                                <MathText>{answer.content}</MathText>
                                                            </div>
                                                            {answer.isCorrect && (
                                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/20 ml-2">Correcta</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sección de IA */}
                                    <div className="border-t border-white/10 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-slate-200">
                                                <Bot className="h-5 w-5 text-purple-400" />
                                                Opinión de la IA
                                            </h3>
                                            <Button
                                                onClick={() => selectedReportId && solveAiMutation.mutate(selectedReportId)}
                                                disabled={solveAiMutation.isPending}
                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                {solveAiMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Analizando...
                                                    </>
                                                ) : (
                                                    "Consultar a la IA"
                                                )}
                                            </Button>
                                        </div>

                                        {aiResponse && (
                                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 text-sm">
                                                <AIMarkdown content={aiResponse} className="text-white prose-invert" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center p-8 text-slate-500">
                                No se encontraron detalles para este reporte.
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
