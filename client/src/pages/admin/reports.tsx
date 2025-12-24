
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
import { Loader2, CheckCircle, Eye, Bot } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { MathText } from "@/components/ui/math-display";
import { AIMarkdown } from "@/components/ui/ai-markdown";

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
    };
    quiz: {
        id: number;
        title: string;
    };
    question: {
        id: number;
        content: string;
        type: string;
        answers: {
            id: number;
            content: string;
            isCorrect: boolean;
        }[];
    };
}

export default function AdminReports() {
    const { toast } = useToast();
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const { data: reports, isLoading } = useQuery<QuestionReport[]>({
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

    const handleCloseDialog = () => {
        setSelectedReportId(null);
        setAiResponse(null);
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
                                    {reports?.length === 0 ? (
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
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateStatusMutation.mutate({ id: report.id, status: "resolved" })}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 hover:text-green-300"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Marcar Resuelto
                                                            </Button>
                                                        )}
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
                            <DialogTitle className="text-slate-100">Detalles del Reporte #{selectedReportId}</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Información completa sobre el error reportado.
                            </DialogDescription>
                        </DialogHeader>

                        {isLoadingDetails ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : reportDetails ? (
                            <ScrollArea className="h-[60vh] pr-4">
                                <div className="space-y-6">
                                    {/* Información del Usuario */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-lg border border-white/5">
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-400">Reportado por</h4>
                                            <p className="text-slate-200">{reportDetails.user?.name} ({reportDetails.user?.email})</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-slate-400">Cuestionario</h4>
                                            <p className="text-slate-200">{reportDetails.quiz?.title} (ID: {reportDetails.quiz?.id})</p>
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
                                        <h3 className="font-semibold mb-2 text-slate-200">Pregunta (ID: {reportDetails.question?.id})</h3>
                                        <div className="p-4 border border-white/10 rounded-lg space-y-4 bg-slate-950/30">
                                            <div className="text-lg font-medium text-slate-200">
                                                <MathText>{reportDetails.question?.content}</MathText>
                                            </div>

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
                                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 text-sm text-slate-200">
                                                <AIMarkdown content={aiResponse} />
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
