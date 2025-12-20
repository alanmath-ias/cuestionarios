import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

interface QuizDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quiz: {
        title: string;
        completedAt?: string | Date;
        score?: number;
        timeSpent?: number;
        progressId?: string | number;
    } | null;
}

export function QuizDetailsDialog({ open, onOpenChange, quiz }: QuizDetailsDialogProps) {
    const { data: feedbackData, isLoading: loadingFeedback } = useQuery({
        queryKey: ['/api/quiz-feedback', quiz?.progressId],
        enabled: !!quiz?.progressId,
    });

    if (!quiz) return null;

    const formatTime = (seconds: number | undefined) => {
        if (seconds === undefined) return "0:00 minutos";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} minutos`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        {quiz.title}
                    </DialogTitle>
                    <DialogDescription>
                        Completado el {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <div className="text-xs font-medium text-slate-500 uppercase mb-1">Puntaje</div>
                        <div className="text-2xl font-bold text-slate-900">{quiz.score !== undefined ? quiz.score : 'N/A'}/10</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <div className="text-xs font-medium text-slate-500 uppercase mb-1">Tiempo</div>
                        <div className="text-2xl font-bold text-slate-900">{formatTime(quiz.timeSpent)}</div>
                    </div>
                </div>

                {loadingFeedback ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                ) : feedbackData?.feedback ? (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Feedback de AlanMath
                        </h4>
                        <p className="text-sm text-purple-800 whitespace-pre-wrap">{feedbackData.feedback}</p>
                    </div>
                ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground italic">
                        Sin feedback disponible aún.
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-4">
                    <p className="text-sm text-blue-800 text-center">
                        Si quieres practicar de nuevo este cuestionario comunícate con el equipo de AlanMath
                    </p>
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.location.href = `/results/${quiz.progressId}`}
                    >
                        Ver Detalles Completos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
