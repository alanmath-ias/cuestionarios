import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, ChevronLeft, Clock, Calendar, Search, Trophy, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { UserQuiz } from "@/types/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface QuizWithFeedback extends UserQuiz {
    progressId?: string;
    reviewed?: boolean;
    completedAt?: string | Date;
    score?: number;
    timeSpent?: number;
    feedback?: string;
}

async function fetchQuizzes() {
    const response = await fetch("/api/user/quizzes", { credentials: "include" });
    if (!response.ok) throw new Error("Error al obtener cuestionarios");
    return response.json();
}

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: quizzes, isLoading } = useQuery<QuizWithFeedback[]>({
        queryKey: ["user-quizzes"],
        queryFn: fetchQuizzes,
    });

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-slate-950"><Spinner className="h-12 w-12 text-blue-500" /></div>;
    }

    const completedQuizzes = quizzes?.filter((q) =>
        q.status === "completed" &&
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()) || [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto p-4 max-w-4xl space-y-8 relative z-10 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Historial</h1>
                            <p className="text-slate-400 text-sm">Tus logros y actividades completadas</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Buscar actividad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus={false}
                            className="pl-10 bg-slate-900/50 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl"
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {completedQuizzes.length > 0 ? (
                        completedQuizzes.map((quiz) => {
                            const hasFeedback = quiz.feedback && quiz.feedback.length > 0;
                            return (
                                <Link key={quiz.progressId || quiz.id} href={`/results/${quiz.progressId}`}>
                                    <Card className={`bg-slate-900/40 border-white/5 transition-all cursor-pointer backdrop-blur-sm group ${hasFeedback
                                        ? "hover:bg-blue-900/20 hover:border-blue-500/30 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]"
                                        : "hover:bg-slate-900/60 hover:border-purple-500/30"
                                        }`}>
                                        <CardContent className="p-5 flex items-center gap-5">
                                            <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform ${hasFeedback
                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                : "bg-green-500/10 border-green-500/20 text-green-400"
                                                }`}>
                                                {hasFeedback ? <MessageSquare className="h-7 w-7" /> : <Trophy className="h-7 w-7" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-lg transition-colors line-clamp-2 ${hasFeedback ? "text-slate-200 group-hover:text-blue-400" : "text-slate-200 group-hover:text-green-400"
                                                    }`}>{quiz.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(quiz.completedAt || '').toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {quiz.timeSpent || 0} min
                                                    </span>
                                                    {hasFeedback && (
                                                        <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            Feedback disponible
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-2xl font-bold transition-colors ${hasFeedback ? "text-white group-hover:text-blue-400" : "text-white group-hover:text-green-400"
                                                        }`}>
                                                        {quiz.score}<span className="text-sm text-slate-500 font-normal">/10</span>
                                                    </span>
                                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Puntaje</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 px-4 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                            <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-4">
                                <Clock className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-300 mb-2">Sin actividad reciente</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Aún no has completado ninguna actividad. ¡Explora los temas y comienza tu aprendizaje!
                            </p>
                            <Link href="/dashboard">
                                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                                    Ir al Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
