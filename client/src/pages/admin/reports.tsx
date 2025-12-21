
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
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface QuestionReport {
    id: number;
    quizId: number;
    questionId: number;
    userId: number;
    description: string;
    status: "pending" | "resolved";
    createdAt: string;
}

export default function AdminReports() {
    const { toast } = useToast();

    const { data: reports, isLoading } = useQuery<QuestionReport[]>({
        queryKey: ["/api/admin/reports"],
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
