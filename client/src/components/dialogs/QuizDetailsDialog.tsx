import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        {quiz.title}
                    </DialogTitle>
                    <DialogDescription>
                        Completado el {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-500 uppercase">Puntaje</p>
                            <p className="text-xl font-bold text-gray-900">{((quiz.score || 0)).toFixed(1)}/10</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-500 uppercase">Tiempo</p>
                            <p className="text-xl font-bold text-gray-900">{quiz.timeSpent || 0}m</p>
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
                        <p className="text-sm text-center text-gray-500 italic">Sin feedback disponible aún.</p>
                    )}

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                        <p className="text-xs text-blue-800">
                            Si quieres practicar de nuevo este cuestionario comunícate con el equipo de AlanMath
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    <Link href={`/results/${quiz.progressId}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Ver Detalles Completos</Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
