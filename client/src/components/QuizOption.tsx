import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ContentRenderer } from "@/components/ContentRenderer";

interface QuizOptionProps {
    optionLabel: string;
    content: string;
    state: 'default' | 'selected' | 'correct' | 'incorrect';
    disabled?: boolean;
    onClick: () => void;
}

export function QuizOption({ optionLabel, content, state, disabled, onClick }: QuizOptionProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                "w-full justify-start text-left h-auto py-4 px-4 relative",
                state === 'selected' && "border-primary bg-primary/5 ring-1 ring-primary",
                state === 'correct' && "border-green-500 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700",
                state === 'incorrect' && "border-red-500 bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700",
                "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border mr-4",
                state === 'selected' && "border-primary bg-primary text-primary-foreground",
                state === 'correct' && "border-green-500 bg-green-500 text-white",
                state === 'incorrect' && "border-red-500 bg-red-500 text-white",
                state === 'default' && "border-muted-foreground/30 text-muted-foreground"
            )}>
                {state === 'correct' ? <Check className="h-4 w-4" /> :
                    state === 'incorrect' ? <X className="h-4 w-4" /> :
                        optionLabel}
            </div>
            <div className="flex-1">
                <ContentRenderer content={content} />
            </div>
        </Button>
    );
}
