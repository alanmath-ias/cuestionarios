
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
import { Loader2, CheckCircle, Eye, Bot, Trash2, ChevronDown, ExternalLink, Pencil, Save, X, Plus, Trash, Coins, Bookmark, BookmarkCheck, BookmarkX, Archive } from "lucide-react";
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
    isSaved: boolean;
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

interface ResolveDropdownProps {
    reportId: number;
    isPending: boolean;
    onResolve: (id: number, credits: number) => void;
}

function ResolveDropdown({ reportId, isPending, onResolve }: ResolveDropdownProps) {
    const [open, setOpen] = useState(false);
    const [customCredits, setCustomCredits] = useState("");

    const handleCustomSubmit = () => {
        const parsed = parseInt(customCredits.trim(), 10);
        if (isNaN(parsed) || parsed < 0) {
            return;
        }
        onResolve(reportId, parsed);
        setCustomCredits("");
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 hover:text-purple-300"
                >
                    <CheckCircle className="h-4 w-4 mr-1" /> Resolver <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200 w-60 p-1.5 shadow-2xl">
                <DropdownMenuItem
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/10 focus:text-white"
                    onClick={() => {
                        onResolve(reportId, 0);
                        setOpen(false);
                    }}
                >
                    Resolver (0 créditos)
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/10 focus:text-white"
                    onClick={() => {
                        onResolve(reportId, 1);
                        setOpen(false);
                    }}
                >
                    Resolver y dar 1 crédito
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/10 focus:text-white"
                    onClick={() => {
                        onResolve(reportId, 2);
                        setOpen(false);
                    }}
                >
                    Resolver y dar 2 créditos
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/10 focus:text-white"
                    onClick={() => {
                        onResolve(reportId, 3);
                        setOpen(false);
                    }}
                >
                    Resolver y dar 3 créditos
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <div
                    className="p-2 pt-1.5 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                            <Coins className="h-3.5 w-3.5 text-amber-400" /> Cantidad personalizada:
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Ej: 5"
                            value={customCredits}
                            onChange={(e) => setCustomCredits(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCustomSubmit();
                                }
                            }}
                            className="h-8 w-20 px-2 text-xs bg-slate-950 border-white/20 text-slate-100 placeholder:text-slate-500 focus-visible:ring-purple-500"
                            disabled={isPending}
                        />
                        <Button
                            size="sm"
                            type="button"
                            disabled={isPending || customCredits.trim() === "" || isNaN(parseInt(customCredits, 10)) || parseInt(customCredits, 10) < 0}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCustomSubmit();
                            }}
                            className="h-8 px-2.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium flex-1 shadow-sm transition-colors"
                        >
                            Dar y resolver
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function AdminReports() {
    const { toast } = useToast();
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [showSavedView, setShowSavedView] = useState(false);
    const [openedFromSaved, setOpenedFromSaved] = useState(false);
    
    // Estados para edición del reporte
    const [isEditing, setIsEditing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState<string>("");
    const [editedImageUrl, setEditedImageUrl] = useState<string>("");
    const [editedAnswers, setEditedAnswers] = useState<any[]>([]);

    // Muestra confirmación si hay cambios sin guardar, luego ejecuta el callback
    const confirmIfUnsaved = (callback: () => void) => {
        if (isEditing && hasUnsavedChanges) {
            if (!window.confirm("⚠️ Tienes cambios sin guardar en la pregunta.\n\n¿Deseas salir de todas formas? Los cambios se perderán.")) {
                return;
            }
        }
        callback();
    };

    const { data: reports, isLoading, error, isError } = useQuery<QuestionReport[]>({
        queryKey: ["/api/admin/reports"],
    });

    const { data: savedReports, isLoading: isLoadingSaved } = useQuery<QuestionReport[]>({
        queryKey: ["/api/admin/reports/saved"],
        queryFn: async () => {
            const res = await fetch("/api/admin/reports/saved");
            if (!res.ok) throw new Error("Failed to fetch saved reports");
            return res.json();
        },
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
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports"] });
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports/saved"] });

            const prevReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports"]) || [];
            const prevSavedReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports/saved"]) || [];

            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports"], (old = []) =>
                old.map(r => r.id === id ? { ...r, status: status as "pending" | "resolved" } : r)
            );
            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports/saved"], (old = []) =>
                old.map(r => r.id === id ? { ...r, status: status as "pending" | "resolved" } : r)
            );

            return { prevReports, prevSavedReports };
        },
        onError: (_err, _vars, context) => {
            if (context) {
                queryClient.setQueryData(["/api/admin/reports"], context.prevReports);
                queryClient.setQueryData(["/api/admin/reports/saved"], context.prevSavedReports);
            }
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado.",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Estado actualizado",
                description: "El reporte ha sido actualizado correctamente.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/saved"] });
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
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports"] });
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports/saved"] });

            const prevReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports"]) || [];
            const prevSavedReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports/saved"]) || [];
            const prevDetails = queryClient.getQueryData<ReportDetails>(["/api/admin/reports", id, "details"]);

            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports"], (old = []) =>
                old.map(r => r.id === id ? { ...r, status: "resolved" as const } : r)
            );
            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports/saved"], (old = []) =>
                old.map(r => r.id === id ? { ...r, status: "resolved" as const } : r)
            );
            if (prevDetails && prevDetails.id === id) {
                queryClient.setQueryData<ReportDetails>(["/api/admin/reports", id, "details"], {
                    ...prevDetails,
                    status: "resolved",
                });
            }

            return { prevReports, prevSavedReports, prevDetails };
        },
        onError: (error: Error, { id }, context) => {
            if (context) {
                queryClient.setQueryData(["/api/admin/reports"], context.prevReports);
                queryClient.setQueryData(["/api/admin/reports/saved"], context.prevSavedReports);
                if (context.prevDetails) {
                    queryClient.setQueryData(["/api/admin/reports", id, "details"], context.prevDetails);
                }
            }
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
        onSuccess: (_data, variables) => {
            toast({
                title: "Reporte resuelto",
                description: variables.credits > 0
                    ? `El reporte ha sido marcado como resuelto y se otorgaron ${variables.credits} crédito${variables.credits > 1 ? 's' : ''} al usuario.`
                    : "El reporte ha sido marcado como resuelto (0 créditos).",
            });
            if (selectedReportId === variables.id) {
                handleCloseDialog();
            }
        },
        onSettled: (_data, _err, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/saved"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports", id, "details"] });
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
            setHasUnsavedChanges(false);
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
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports"] });
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports/saved"] });

            const prevReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports"]) || [];
            const prevSavedReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports/saved"]) || [];

            // Remove optimistically from both caches
            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports"], (old = []) =>
                old.filter(r => r.id !== id)
            );
            queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports/saved"], (old = []) =>
                old.filter(r => r.id !== id)
            );

            if (selectedReportId === id) {
                handleCloseDialog();
            }

            return { prevReports, prevSavedReports };
        },
        onError: (_err, _id, context) => {
            if (context) {
                queryClient.setQueryData(["/api/admin/reports"], context.prevReports);
                queryClient.setQueryData(["/api/admin/reports/saved"], context.prevSavedReports);
            }
            toast({
                title: "Error",
                description: "No se pudo eliminar el reporte.",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Reporte eliminado",
                description: "El reporte ha sido eliminado definitivamente.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/saved"] });
        },
    });

    const saveReportMutation = useMutation({
        mutationFn: async ({ id, isSaved }: { id: number; isSaved: boolean }) => {
            const res = await apiRequest("PATCH", `/api/admin/reports/${id}/save`, { isSaved });
            return res.json();
        },
        onMutate: async ({ id, isSaved }) => {
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports"] });
            await queryClient.cancelQueries({ queryKey: ["/api/admin/reports/saved"] });

            const prevReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports"]) || [];
            const prevSavedReports = queryClient.getQueryData<QuestionReport[]>(["/api/admin/reports/saved"]) || [];
            const prevDetails = queryClient.getQueryData<ReportDetails>(["/api/admin/reports", id, "details"]);

            // Find target report from caches
            const targetReport =
                prevReports.find(r => r.id === id) ||
                prevSavedReports.find(r => r.id === id) ||
                (prevDetails ? {
                    id: prevDetails.id,
                    quizId: prevDetails.quizId,
                    questionId: prevDetails.questionId,
                    userId: prevDetails.userId,
                    description: prevDetails.description,
                    status: prevDetails.status,
                    isSaved: prevDetails.isSaved,
                    createdAt: prevDetails.createdAt,
                } as QuestionReport : null);

            if (isSaved) {
                // Moving from main list -> saved list
                queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports"], (old = []) =>
                    old.filter(r => r.id !== id)
                );
                if (targetReport) {
                    const savedItem = { ...targetReport, isSaved: true };
                    queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports/saved"], (old = []) => [
                        savedItem,
                        ...old.filter(r => r.id !== id)
                    ]);
                }
            } else {
                // Moving from saved list -> main list
                queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports/saved"], (old = []) =>
                    old.filter(r => r.id !== id)
                );
                if (targetReport) {
                    const restoredItem = { ...targetReport, isSaved: false };
                    queryClient.setQueryData<QuestionReport[]>(["/api/admin/reports"], (old = []) => {
                        const withoutCurrent = old.filter(r => r.id !== id);
                        const newTime = new Date(restoredItem.createdAt).getTime();
                        const insertIndex = withoutCurrent.findIndex(r => new Date(r.createdAt).getTime() < newTime);
                        if (insertIndex === -1) {
                            return [...withoutCurrent, restoredItem];
                        }
                        const copy = [...withoutCurrent];
                        copy.splice(insertIndex, 0, restoredItem);
                        return copy;
                    });
                }
            }

            if (prevDetails && prevDetails.id === id) {
                queryClient.setQueryData<ReportDetails>(["/api/admin/reports", id, "details"], {
                    ...prevDetails,
                    isSaved,
                });
            }

            return { prevReports, prevSavedReports, prevDetails };
        },
        onError: (_err, { id }, context) => {
            if (context) {
                queryClient.setQueryData(["/api/admin/reports"], context.prevReports);
                queryClient.setQueryData(["/api/admin/reports/saved"], context.prevSavedReports);
                if (context.prevDetails) {
                    queryClient.setQueryData(["/api/admin/reports", id, "details"], context.prevDetails);
                }
            }
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado de guardado.",
                variant: "destructive"
            });
        },
        onSuccess: (_data, { isSaved }) => {
            toast({
                title: isSaved ? "📌 Reporte guardado" : "Reporte regresado",
                description: isSaved
                    ? "El reporte se movió a Reportes Guardados."
                    : "El reporte regresó a la lista general.",
            });
        },
        onSettled: (_data, _err, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports/saved"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports", id, "details"] });
        },
    });

    const handleCloseDialog = () => {
        setSelectedReportId(null);
        setAiResponse(null);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        if (openedFromSaved) {
            setOpenedFromSaved(false);
            setShowSavedView(true);
        }
    };

    const handleCloseDialogWithConfirm = () => {
        confirmIfUnsaved(handleCloseDialog);
    };

    const startEditing = () => {
        if (!reportDetails?.question) return;
        setEditedQuestion(reportDetails.question.content);
        setEditedImageUrl(reportDetails.question.imageUrl || "");
        setEditedAnswers(reportDetails.question.answers.map(a => ({ ...a })));
        setHasUnsavedChanges(false);
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
        setHasUnsavedChanges(true);
    };

    const removeAnswer = (id: number) => {
        setEditedAnswers(editedAnswers.filter(a => a.id !== id));
        setHasUnsavedChanges(true);
    };

    const updateAnswer = (id: number, field: string, value: any) => {
        setEditedAnswers(editedAnswers.map(a => a.id === id ? { ...a, [field]: value } : a));
        setHasUnsavedChanges(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const activeReports = (reports || []).filter(r => !r.isSaved);
    const pendingCount = activeReports.filter((r) => r.status === "pending").length;
    const savedCount = savedReports?.length || 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                            Reportes de Errores
                            <Badge variant="secondary" className="ml-2 bg-slate-800 text-slate-300 hover:bg-slate-700">
                                {pendingCount} Pendiente{pendingCount !== 1 ? "s" : ""}
                            </Badge>
                        </h1>
                        <p className="text-slate-400">Gestiona los reportes de errores enviados por los usuarios.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowSavedView(true)}
                        className="shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300 flex items-center gap-2"
                    >
                        <Bookmark className="h-4 w-4" />
                        Reportes Guardados
                        {savedCount > 0 && (
                            <Badge className="ml-1 bg-amber-500/30 text-amber-300 border-amber-500/30 text-xs px-1.5">
                                {savedCount}
                            </Badge>
                        )}
                    </Button>
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
                                    ) : activeReports.length === 0 ? (
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                                    <CheckCircle className="h-8 w-8 text-green-500/50" />
                                                    <p className="font-medium text-slate-400">No hay reportes en la lista general</p>
                                                    {savedCount > 0 ? (
                                                        <p className="text-xs text-slate-500">
                                                            Tienes {savedCount} reporte{savedCount > 1 ? "s" : ""} en{" "}
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowSavedView(true)}
                                                                className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
                                                            >
                                                                Reportes Guardados <Bookmark className="h-3 w-3 inline" />
                                                            </button>
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-slate-600">¡Todo está al día!</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activeReports.map((report) => (
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
                                                            onClick={() => {
                                                                setOpenedFromSaved(false);
                                                                setSelectedReportId(report.id);
                                                            }}
                                                            className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver Detalles
                                                        </Button>
                                                        {report.status === "pending" && (
                                                            <ResolveDropdown
                                                                reportId={report.id}
                                                                isPending={resolveAndRewardMutation.isPending}
                                                                onResolve={(id, credits) => resolveAndRewardMutation.mutate({ id, credits })}
                                                            />
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Eliminar permanentemente"
                                                            onClick={() => {
                                                                if (window.confirm("¿Deseas eliminar permanentemente este reporte?")) {
                                                                    deleteReportMutation.mutate(report.id);
                                                                }
                                                            }}
                                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Guardar reporte (mover a guardados)"
                                                            onClick={() => saveReportMutation.mutate({ id: report.id, isSaved: true })}
                                                            className="bg-slate-800/50 text-slate-400 hover:bg-amber-500/15 border-slate-700 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                                                        >
                                                            <Bookmark className="h-4 w-4" />
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

                <Dialog open={!!selectedReportId} onOpenChange={(open) => !open && handleCloseDialogWithConfirm()}>
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
                                        <ResolveDropdown
                                            reportId={selectedReportId!}
                                            isPending={resolveAndRewardMutation.isPending}
                                            onResolve={(id, credits) => confirmIfUnsaved(() => resolveAndRewardMutation.mutate({ id, credits }))}
                                        />
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        title="Eliminar permanentemente"
                                        onClick={() => {
                                            if (window.confirm("¿Deseas eliminar permanentemente este reporte?")) {
                                                deleteReportMutation.mutate(selectedReportId!);
                                            }
                                        }}
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {reportDetails && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            title={reportDetails.isSaved ? "Quitar de guardados (regresar a lista general)" : "Guardar reporte (mover a guardados)"}
                                            onClick={() => saveReportMutation.mutate({ id: selectedReportId!, isSaved: !reportDetails.isSaved })}
                                            className={reportDetails.isSaved
                                                ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30 hover:text-amber-300"
                                                : "bg-slate-800/50 text-slate-400 hover:bg-amber-500/10 border-slate-700 hover:text-amber-400 hover:border-amber-500/30"
                                            }
                                        >
                                            {reportDetails.isSaved ? (
                                                <BookmarkCheck className="h-4 w-4" />
                                            ) : (
                                                <Bookmark className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
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
                                                    className="h-8 bg-slate-800 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40"
                                                    onClick={startEditing}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                                                        onClick={() => confirmIfUnsaved(() => { setIsEditing(false); setHasUnsavedChanges(false); })}
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
                                                        onChange={(e) => { setEditedQuestion(e.target.value); setHasUnsavedChanges(true); }}
                                                        className="bg-slate-950 border-slate-700 text-slate-200 min-h-[100px]"
                                                        placeholder="Escribe el enunciado de la pregunta..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-slate-400 text-xs">URL de la imagen (opcional)</Label>
                                                    <Input
                                                        value={editedImageUrl}
                                                        onChange={(e) => { setEditedImageUrl(e.target.value); setHasUnsavedChanges(true); }}
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

                {/* Saved Reports Dialog */}
                <Dialog open={showSavedView} onOpenChange={setShowSavedView}>
                    <DialogContent className="max-w-4xl max-h-[85vh] bg-slate-900 border border-white/10 text-slate-200">
                        <DialogHeader>
                            <DialogTitle className="text-slate-100 flex items-center gap-2">
                                <Bookmark className="h-5 w-5 text-amber-400" />
                                Reportes Guardados
                                {savedCount > 0 && (
                                    <Badge className="ml-1 bg-amber-500/20 text-amber-300 border-amber-500/30">
                                        {savedCount}
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Reportes que guardaste para socializar o revisar más adelante. Elimínalos cuando ya no los necesites.
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="h-[60vh] pr-2">
                            {isLoadingSaved ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                                </div>
                            ) : !savedReports || savedReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
                                    <Archive className="h-12 w-12 opacity-30" />
                                    <p className="text-sm">No tienes reportes guardados todavía.</p>
                                    <p className="text-xs text-slate-600">Usa el botón <Bookmark className="inline h-3 w-3" /> en la lista general para guardar reportes.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 py-2">
                                    {savedReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="p-4 bg-slate-950/60 rounded-lg border border-amber-500/10 hover:border-amber-500/20 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-xs text-slate-500">
                                                            {format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                                                        </span>
                                                        <Badge className="text-xs px-1.5 bg-slate-800 text-slate-400 border-slate-700">
                                                            Quiz {report.quizId} · Preg. {report.questionId}
                                                        </Badge>
                                                        <Badge
                                                            className={report.status === "resolved"
                                                                ? "text-xs px-1.5 bg-green-500/15 text-green-400 border-green-500/20"
                                                                : "text-xs px-1.5 bg-red-500/15 text-red-400 border-red-500/20"
                                                            }
                                                        >
                                                            {report.status === "resolved" ? "Resuelto" : "Pendiente"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-300 text-sm line-clamp-2">{report.description}</p>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setOpenedFromSaved(true);
                                                            setShowSavedView(false);
                                                            setSelectedReportId(report.id);
                                                        }}
                                                        className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> Ver Detalles
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Quitar de guardados (regresar a lista general)"
                                                        onClick={() => saveReportMutation.mutate({ id: report.id, isSaved: false })}
                                                        className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 hover:text-amber-300 transition-colors"
                                                    >
                                                        <BookmarkX className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Eliminar definitivamente"
                                                        onClick={() => {
                                                            if (window.confirm("¿Deseas eliminar este reporte definitivamente? Esta acción no se puede deshacer.")) {
                                                                deleteReportMutation.mutate(report.id);
                                                            }
                                                        }}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
