import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, ChevronLeft, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";
import { UserQuiz } from "@/types/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface QuizWithFeedback extends UserQuiz {
    progressId?: string;
    reviewed?: boolean;
    completedAt?: string | Date;
    score?: number;
    timeSpent?: number;
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
        return <div className="flex justify-center items-center min-h-screen"><Spinner className="h-12 w-12" /></div>;
    }

    const completedQuizzes = quizzes?.filter((q) =>
        q.status === "completed" &&
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()) || [];

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Historial de Actividades</h1>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar actividad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-white"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {completedQuizzes.length > 0 ? (
                    completedQuizzes.map((quiz) => (
                        <Link key={quiz.progressId || quiz.id} href={`/results/${quiz.progressId}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(quiz.completedAt || '').toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {quiz.timeSpent || 0} min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg font-bold text-green-700">
                                            {quiz.score}/10
                                        </span>
                                        <span className="text-xs text-gray-500">Puntaje</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>No has completado ninguna actividad aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
