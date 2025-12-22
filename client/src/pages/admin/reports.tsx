
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
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { MathText } from "@/components/ui/math-display";

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
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Reportes de Errores
                        <Badge variant="secondary" className="ml-2">
                            {reports?.filter((r) => r.status === "pending").length} Pendientes
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 cursor-pointer">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Quiz ID</TableHead>
                                    <TableHead>Pregunta ID</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No hay reportes de errores.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports?.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                {format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>{report.quizId}</TableCell>
                                            <TableCell>{report.questionId}</TableCell>
                                            <TableCell className="max-w-md truncate" title={report.description}>
                                                {report.description}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={report.status === "resolved" ? "default" : "destructive"}
                                                    className={report.status === "resolved" ? "bg-green-600" : ""}
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
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Detalles del Reporte #{selectedReportId}</DialogTitle>
                        <DialogDescription>
                            Información completa sobre el error reportado.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingDetails ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : reportDetails ? (
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6">
                                {/* Información del Usuario */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground">Reportado por</h4>
                                        <p>{reportDetails.user?.name} ({reportDetails.user?.email})</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-muted-foreground">Cuestionario</h4>
                                        <p>{reportDetails.quiz?.title} (ID: {reportDetails.quiz?.id})</p>
                                    </div>
                                </div>

                                {/* Descripción del Reporte */}
                                <div>
                                    <h3 className="font-semibold mb-2">Descripción del Error</h3>
                                    <div className="p-3 bg-red-50 text-red-900 rounded-md border border-red-100">
                                        {reportDetails.description}
                                    </div>
                                </div>

                                {/* Pregunta y Opciones */}
                                <div>
                                    <h3 className="font-semibold mb-2">Pregunta (ID: {reportDetails.question?.id})</h3>
                                    <div className="p-4 border rounded-lg space-y-4">
                                        <div className="text-lg font-medium">
                                            <MathText>{reportDetails.question?.content}</MathText>
                                        </div>

                                        <div className="space-y-2">
                                            {reportDetails.question?.answers?.map((answer) => (
                                                <div
                                                    key={answer.id}
                                                    className={`p-3 rounded-md border flex justify-between items-center ${answer.isCorrect
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-white"
                                                        }`}
                                                >
                                                    <div className="flex-1">
                                                        <MathText>{answer.content}</MathText>
                                                    </div>
                                                    {answer.isCorrect && (
                                                        <Badge className="bg-green-600 ml-2">Correcta</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sección de IA */}
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Bot className="h-5 w-5 text-purple-600" />
                                            Opinión de la IA
                                        </h3>
                                        <Button
                                            onClick={() => selectedReportId && solveAiMutation.mutate(selectedReportId)}
                                            disabled={solveAiMutation.isPending}
                                            className="bg-purple-600 hover:bg-purple-700"
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
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm prose prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {aiResponse.replace(/¡/g, '$').replace(/\\\[/g, '$$').replace(/\\\]/g, '$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground">
                            No se encontraron detalles para este reporte.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
