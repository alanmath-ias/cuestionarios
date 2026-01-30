import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Clock, Trophy, ArrowRight } from "lucide-react";
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
        feedback?: string;
    } | null;
}

export function QuizDetailsDialog({ open, onOpenChange, quiz }: QuizDetailsDialogProps) {
    const { data: feedbackData, isLoading: loadingFeedback } = useQuery<{ feedback: string }>({
        queryKey: ['/api/quiz-feedback', quiz?.progressId],
        enabled: !!quiz?.progressId && !quiz?.feedback,
    });

    if (!quiz) return null;

    const feedbackText = quiz.feedback || feedbackData?.feedback;
    const isLoading = !quiz.feedback && loadingFeedback;

    const formatTime = (seconds: number | undefined) => {
        if (seconds === undefined) return "0:00 min";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-start gap-2 text-white whitespace-normal leading-tight text-left">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{quiz.title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Completado el {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                            <Trophy className="w-3 h-3 text-yellow-500" /> Puntaje
                        </div>
                        <div className="text-3xl font-bold text-white">{quiz.score !== undefined ? Number(quiz.score).toFixed(1) : 'N/A'}<span className="text-lg text-slate-500">/10</span></div>
                    </div>
                    <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                            <Clock className="w-3 h-3 text-blue-500" /> Tiempo
                        </div>
                        <div className="text-3xl font-bold text-white">{formatTime(quiz.timeSpent)}</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-6"><Spinner className="text-blue-500" /></div>
                ) : feedbackText ? (
                    <div className="bg-purple-500/10 p-5 rounded-xl border border-purple-500/20">
                        <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Feedback de AlanMath
                        </h4>
                        <p className="text-sm text-purple-200/80 whitespace-pre-wrap leading-relaxed">{feedbackText}</p>
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-slate-500 italic bg-slate-800/30 rounded-xl border border-white/5">
                        Sin feedback disponible aún.
                    </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                    <p className="text-sm text-blue-300 text-center">
                        ¿Quieres mejorar tu puntaje? ¡Practica de nuevo!
                    </p>
                </div>

                <DialogFooter className="sm:justify-between gap-3 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                        Cerrar
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                        onClick={() => window.location.href = `/results/${quiz.progressId}`}
                    >
                        Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
