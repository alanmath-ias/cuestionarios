import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Trophy, ArrowRight, Calendar, Star, Zap, XCircle, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
        readByStudent?: boolean;
        isChiqui?: boolean;
        categoryId?: number;
    } | null;
    childId?: string;
}

export function QuizDetailsDialog({ open, onOpenChange, quiz, childId }: QuizDetailsDialogProps) {
    const queryClient = useQueryClient();

    const isChiqui = quiz?.isChiqui || quiz?.title?.toLowerCase().includes("repasito");

    const { data: feedbackData, isLoading: loadingFeedback } = useQuery<{ feedback: string }>({
        queryKey: ['/api/quiz-feedback', quiz?.progressId],
        enabled: !!quiz?.progressId && !quiz?.feedback && !isChiqui,
    });

    const feedbackText = quiz?.feedback || feedbackData?.feedback;

    const { data: history } = useQuery<any[]>({
        queryKey: ['/api/chiquitest/history', childId, quiz?.categoryId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (childId) params.set('user_id', childId);
            if (quiz?.categoryId) params.set('category_id', String(quiz.categoryId));
            const url = `/api/chiquitest/history${params.toString() ? `?${params}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json();
        },
        enabled: open && !!isChiqui,
    });

    // Fetch chiqui results to get lastAnswers (for wrong answers display)
    const { data: chiquiResults } = useQuery<any[]>({
        queryKey: ['/api/chiquitest/results', childId],
        queryFn: async () => {
            const url = `/api/chiquitest/results${childId ? `?user_id=${childId}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch chiqui results");
            return res.json();
        },
        enabled: open && !!isChiqui && !!quiz?.completedAt,
    });

    // Get result for this specific category
    const categoryResult = chiquiResults?.find((r: any) => r.categoryId === quiz?.categoryId);
    const wrongCount: number = categoryResult?.lastAnswers
        ? (JSON.parse(typeof categoryResult.lastAnswers === 'string' ? categoryResult.lastAnswers : JSON.stringify(categoryResult.lastAnswers)) as any[]).filter((a: any) => !a.isCorrect).length
        : 0;

    // Compute current streak from history (local dates, timezone-safe)
    const toLocalDateStr = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const uniqueDayStrs = Array.from(new Set((history || []).map((h: any) => toLocalDateStr(new Date(h.date))))).sort().reverse();
    let currentStreak = 0;
    const todayLocal = new Date();
    for (let i = 0; i < 60; i++) {
        const d = new Date(todayLocal);
        d.setDate(d.getDate() - i);
        if (uniqueDayStrs.includes(toLocalDateStr(d))) currentStreak++;
        else break;
    }

    // Mark as read when student opens the dialog with unread feedback
    useEffect(() => {
        if (open && quiz?.progressId && feedbackText && !quiz?.readByStudent && !childId) {
            fetch(`/api/quiz-submissions/${quiz.progressId}/read`, {
                method: 'PATCH',
                credentials: 'include'
            })
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
                    queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
                })
                .catch(err => console.error('Error marking feedback as read:', err));
        }
    }, [open, quiz?.progressId, !!feedbackText, quiz?.readByStudent, childId, queryClient]);

    // Reset wrong answers panel on close
    useEffect(() => {
        if (!open) return;
    }, [open]);

    if (!quiz) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-start gap-2 text-white whitespace-normal leading-tight text-left">
                        {quiz.completedAt ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                            <Zap className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5 fill-current" />
                        )}
                        <span>{quiz.title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {quiz.completedAt
                            ? `Completado el ${new Date(quiz.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
                            : 'Pendiente para hoy'}
                    </DialogDescription>
                </DialogHeader>

                {/* Score box — only for completed, no time for Repasito */}
                {quiz.completedAt && (
                    <div className={`py-4 ${isChiqui ? '' : 'grid grid-cols-2 gap-4'}`}>
                        <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                                <Trophy className="w-3 h-3 text-yellow-500" /> {isChiqui ? 'Aciertos' : 'Puntaje'}
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {quiz.score !== undefined ? Number(quiz.score) : 'N/A'}
                                <span className="text-lg text-slate-500">/{isChiqui ? '5' : '10'}</span>
                            </div>
                        </div>
                        {/* Time: only for non-Repasito */}
                        {!isChiqui && quiz.timeSpent !== undefined && (
                            <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl text-center">
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                                    <Trophy className="w-3 h-3 text-blue-500" /> Tiempo
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {`${Math.floor((quiz.timeSpent ?? 0) / 60)}:${String((quiz.timeSpent ?? 0) % 60).padStart(2, '0')} min`}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback — only for non-Repasito */}
                {!isChiqui && (
                    loadingFeedback ? (
                        <div className="flex justify-center py-6"><Spinner className="text-blue-500" /></div>
                    ) : feedbackText ? (
                        <div className="bg-purple-500/10 p-5 rounded-xl border border-purple-500/20">
                            <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Comentario de AlanMath
                            </h4>
                            <p className="text-sm text-purple-200/80 whitespace-pre-wrap leading-relaxed">{feedbackText}</p>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm text-slate-500 italic bg-slate-800/30 rounded-xl border border-white/5">
                            Sin comentarios disponibles aún.
                        </div>
                    )
                )}

                {/* Repasito-specific sections */}
                {isChiqui && (
                    <div className="space-y-4">
                        {/* 7-day streak calendar */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-emerald-400" /> Racha de los últimos 7 días
                            </h4>
                            <div className="flex justify-between items-center gap-1">
                                {[...Array(7)].map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (6 - i));
                                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    const dayRecord = history?.find(h => {
                                        const hLocal = new Date(h.date);
                                        return `${hLocal.getFullYear()}-${String(hLocal.getMonth() + 1).padStart(2, '0')}-${String(hLocal.getDate()).padStart(2, '0')}` === dateStr;
                                    });
                                    const isToday = i === 6;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${dayRecord
                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                : 'bg-slate-900 border-white/5 text-slate-600'
                                                } ${isToday ? 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-slate-900' : ''}`}>
                                                {dayRecord ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{date.getDate()}</span>}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {date.toLocaleDateString('es-ES', { weekday: 'narrow' })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Streak badge + milestone messages */}
                        {currentStreak > 0 && (
                            <div className={`flex flex-col gap-2 rounded-xl border p-3 ${currentStreak >= 7
                                    ? 'bg-orange-500/10 border-orange-500/20'
                                    : currentStreak >= 3
                                        ? 'bg-yellow-500/10 border-yellow-500/20'
                                        : 'bg-slate-800/30 border-white/5'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                                        <Flame className={`w-4 h-4 ${currentStreak >= 7 ? 'text-orange-400' :
                                                currentStreak >= 3 ? 'text-yellow-400' : 'text-slate-400'
                                            } fill-current`} />
                                        Racha actual: <span className={`text-lg ${currentStreak >= 7 ? 'text-orange-400' :
                                                currentStreak >= 3 ? 'text-yellow-400' : 'text-slate-300'
                                            }`}>{currentStreak}</span> día{currentStreak !== 1 ? 's' : ''} seguido{currentStreak !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {currentStreak >= 7 && (
                                    <p className="text-xs text-orange-300 font-medium">🏆 ¡Semana completa! Ganaste <span className="font-bold text-orange-400">+3 créditos</span> de bonus.</p>
                                )}
                                {currentStreak === 3 && (
                                    <p className="text-xs text-yellow-300 font-medium">🔥 ¡Racha de 3 días! Ganaste <span className="font-bold text-yellow-400">+1 crédito</span> extra.</p>
                                )}
                                {currentStreak < 3 && (
                                    <p className="text-xs text-slate-500">{3 - currentStreak} día{3 - currentStreak !== 1 ? 's' : ''} más para ganar +1 crédito extra.</p>
                                )}
                                {currentStreak > 3 && currentStreak < 7 && (
                                    <p className="text-xs text-yellow-500/80">{7 - currentStreak} día{7 - currentStreak !== 1 ? 's' : ''} más para racha de semana (+3 créditos).</p>
                                )}
                            </div>
                        )}

                        {!childId && quiz.completedAt && (
                            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500/50" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">¡Recompensa Diaria!</p>
                                    <p className="text-xs text-slate-400">Has ganado <span className="text-yellow-400 font-bold">+1 crédito</span> de pista por hoy.</p>
                                </div>
                            </div>
                        )}

                        {/* Wrong answers count — static, non-clickable */}
                        {quiz.completedAt && wrongCount > 0 && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <span className="text-sm text-red-300">
                                    <span className="font-bold">{wrongCount}</span> pregunta{wrongCount !== 1 ? 's' : ''} incorrecta{wrongCount !== 1 ? 's' : ''} — usa "Ver Detalles" para verlas
                                </span>
                            </div>
                        )}

                        {/* If no wrong answers and completed — perfect score message */}
                        {quiz.completedAt && wrongCount === 0 && quiz.score === 5 && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center text-sm text-emerald-400 font-bold">
                                🌟 ¡Puntaje perfecto! ¡Todo correcto!
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-between gap-3 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                        Cerrar
                    </Button>
                    {isChiqui ? (
                        quiz.completedAt ? (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                                onClick={() => window.location.href = `/quiz/chiqui/${quiz.categoryId}?results=1${childId ? `&user_id=${childId}` : ''}`}
                            >
                                Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : !childId ? (
                            // Only students can start the Repasito — parents are read-only
                            <Button
                                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-slate-950 font-bold shadow-lg shadow-yellow-900/20"
                                onClick={() => window.location.href = `/quiz/chiqui/${quiz.categoryId}`}
                            >
                                ¡Empezar Repasito! <Zap className="w-4 h-4 ml-2 fill-current" />
                            </Button>
                        ) : null
                    ) : (
                        quiz.progressId ? (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                                onClick={() => window.location.href = `/results/${quiz.progressId}${childId ? `?user_id=${childId}` : ''}`}
                            >
                                Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : null
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
