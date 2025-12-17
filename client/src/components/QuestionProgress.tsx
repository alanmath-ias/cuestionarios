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
            <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progreso</span>
                <span>{Math.round((completedQuestions / totalQuestions) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
                />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                    const isAnswered = i < completedQuestions || correctAnswers[i] !== undefined;
                    const isCorrect = correctAnswers[i];

                    let bgClass = "bg-gray-100 text-gray-500 hover:bg-gray-200";
                    if (isAnswered) {
                        if (isCorrect === true) bgClass = "bg-green-100 text-green-700 border-green-200";
                        else if (isCorrect === false) bgClass = "bg-red-100 text-red-700 border-red-200";
                        else bgClass = "bg-gray-200 text-gray-700"; // Answered but no correctness info (e.g. text)
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => !disabled && onQuestionClick(i)}
                            disabled={disabled}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors border",
                                i === currentQuestionIndex
                                    ? "ring-2 ring-primary ring-offset-2"
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
