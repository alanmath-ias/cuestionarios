import { cn } from "@/lib/utils";

interface QuestionProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: Record<number, boolean>;
  onQuestionClick?: (index: number) => void;
  disabled?: boolean;
}

export function QuestionProgress({
  currentQuestionIndex,
  totalQuestions,
  answeredQuestions,
  onQuestionClick,
  disabled = false
}: QuestionProgressProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const questionNumber = index + 1;
        const isCurrentQuestion = index === currentQuestionIndex;
        const isAnswered = answeredQuestions[index] === true;
        
        return (
          <div
            key={index}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors",
              isCurrentQuestion ? "bg-primary text-white" : 
              isAnswered ? "bg-green-100 border border-green-500 text-green-700" : 
              "bg-gray-100 border",
              disabled && !isCurrentQuestion ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-200"
            )}
            onClick={() => {
              if (!disabled || isCurrentQuestion) {
                onQuestionClick?.(index);
              }
            }}
          >
            <span>{questionNumber}</span>
          </div>
        );
      })}
    </div>
  );
}
