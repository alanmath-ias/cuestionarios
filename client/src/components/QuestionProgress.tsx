import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface QuestionProgressProps {
    totalQuestions: number;
    completedQuestions: number;
    currentQuestionIndex: number;
    onQuestionClick: (index: number) => void;
    onQuestionLongPress?: (index: number) => void;
    disabled?: boolean;
    correctAnswers?: Record<number, boolean | null>;
    responseMode?: string;
}

export function QuestionProgress({
    totalQuestions,
    completedQuestions,
    currentQuestionIndex,
    onQuestionClick,
    onQuestionLongPress,
    disabled,
    correctAnswers = {},
    responseMode
}: QuestionProgressProps) {
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
    const didLongPressTriggerRef = useRef(false);

    const startItemLongPress = (i: number) => {
        if (!onQuestionLongPress) return;
        cancelItemLongPress();
        didLongPressTriggerRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            didLongPressTriggerRef.current = true;
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate([40, 30, 40]); } catch {}
            }
            onQuestionLongPress(i);
        }, 1300);
    };

    const cancelItemLongPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        touchStartPosRef.current = null;
    };
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
                        if (responseMode === 'direct_input' && (isCorrect === null || isCorrect === undefined)) {
                            // Blue/Cyan for direct input answered questions pending evaluation
                            bgClass = "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
                        } else {
                            if (isCorrect === true) bgClass = "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                            else if (isCorrect === false) bgClass = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                            else bgClass = "bg-slate-700 text-slate-300 border-slate-600";
                        }
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                if (didLongPressTriggerRef.current) {
                                    didLongPressTriggerRef.current = false;
                                    return;
                                }
                                if (!disabled) onQuestionClick(i);
                            }}
                            disabled={disabled}
                            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
                            onTouchStart={(e) => {
                                if (!onQuestionLongPress) return;
                                e.stopPropagation();
                                const touch = e.touches[0];
                                touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
                                startItemLongPress(i);
                            }}
                            onTouchMove={(e) => {
                                if (touchStartPosRef.current) {
                                    const touch = e.touches[0];
                                    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
                                    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
                                    if (dx > 10 || dy > 10) {
                                        cancelItemLongPress();
                                    }
                                }
                            }}
                            onTouchEnd={cancelItemLongPress}
                            onTouchCancel={cancelItemLongPress}
                            onMouseDown={() => startItemLongPress(i)}
                            onMouseUp={cancelItemLongPress}
                            onMouseLeave={cancelItemLongPress}
                            onContextMenu={(e) => {
                                if (onQuestionLongPress) e.preventDefault();
                            }}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border select-none active:scale-95",
                                i === currentQuestionIndex
                                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 scale-110 bg-blue-500/20 border-blue-500 text-blue-400"
                                    : "",
                                bgClass
                            )}
                            title={onQuestionLongPress ? `Pregunta ${i + 1} (Mantén presionado para anular respuesta)` : `Pregunta ${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
