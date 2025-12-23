import { cn } from "@/lib/utils";

interface QuestionProgressProps {
    totalQuestions: number;
    completedQuestions: number;
    currentQuestionIndex: number;
    onQuestionClick: (index: number) => void;
    disabled?: boolean;
    correctAnswers?: Record<number, boolean>;
}

export function QuestionProgress({
    totalQuestions,
    completedQuestions,
    currentQuestionIndex,
    onQuestionClick,
    disabled,
    correctAnswers = {}
}: QuestionProgressProps) {
    return (
        <div className="w-full">
            <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium uppercase tracking-wider">
                <span>Progreso</span>
                <span>{Math.round((completedQuestions / totalQuestions) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
                />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                    const isAnswered = i < completedQuestions || correctAnswers[i] !== undefined;
                    const isCorrect = correctAnswers[i];

                    let bgClass = "bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300";
                    if (isAnswered) {
                        if (isCorrect === true) bgClass = "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                        else if (isCorrect === false) bgClass = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                        else bgClass = "bg-slate-700 text-slate-300 border-slate-600"; // Answered but no correctness info
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => !disabled && onQuestionClick(i)}
                            disabled={disabled}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border",
                                i === currentQuestionIndex
                                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-110 bg-blue-500/20 border-blue-500 text-blue-400"
                                    : "",
                                bgClass
                            )}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
