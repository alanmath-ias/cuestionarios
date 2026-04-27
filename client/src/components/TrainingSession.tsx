import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Star, Frown, Smile, Sparkles, CheckCircle2, XCircle, ArrowLeft, Target, Clock, Timer, ChevronRight, ChevronLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentRenderer } from "@/components/ContentRenderer";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import { QuestionProgress } from "@/components/QuestionProgress";

// Types
export interface TrainingQuestion {
    id: number;
    content: string;
    options: {
        id: number;
        text: string;
        isCorrect: boolean;
        explanation?: string;
    }[];
    type: string;
    difficulty: string;
    points: number;
    imageUrl?: string;
}

interface AnsweredQuestion {
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number;
}

interface TrainingSessionProps {
    title: string;
    questions: TrainingQuestion[];
    loading: boolean;
    onExit: () => void;
    categoryId?: number;
}

const motivationalMessages = {
    correct: [
        "¡Excelente! 🎉",
        "¡Correcto! 👏",
        "¡Lo sabías! 💪",
        "¡Perfecto! 🌟",
        "¡Así se hace! 🚀"
    ],
    incorrect: [
        "¡Casi! Sigue intentando 💪",
        "No pasa nada, la próxima será 💫",
        "¡Sigue así! El error es parte del aprendizaje 🌱",
        "¡Ups! Pero no te rindas 🏋️",
        "¡Sigue practicando! Lo lograrás ✨"
    ],
    results: [
        "¡Gran esfuerzo!",
        "¡Estás mejorando!",
        "¡Buen trabajo!",
        "¡Sigue así!",
        "¡Lo estás logrando!"
    ]
};

const getRandomMessage = (type: keyof typeof motivationalMessages) => {
    const messages = motivationalMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
};

import { useLocation } from "wouter";

// Componente para renderizar contenido igual que en ActiveQuiz
const QuestionContent = ({ content }: { content: string }) => {
  const getQuestionSizeClass = (text: string) => {
    const cleanContent = text.replace(/\\frac|\\{|\\}|\$|¡/g, '');
    const length = cleanContent.length;
    if (length < 50) return "text-2xl md:text-3xl font-bold";
    if (length < 100) return "text-xl md:text-2xl";
    return "text-lg md:text-xl";
  };
  return (
    <div className={`mb-5 text-slate-200 leading-relaxed transition-all duration-300 ${getQuestionSizeClass(content)}`}>
      <ContentRenderer content={content} />
    </div>
  );
};

export function TrainingSession({ title, questions, loading, onExit, categoryId }: TrainingSessionProps) {
    const [, setLocation] = useLocation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [reviewMode, setReviewMode] = useState(false);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [creditsEarned, setCreditsEarned] = useState<number | null>(null);
    const [rewardLimitReached, setRewardLimitReached] = useState(false);
    const [claimingReward, setClaimingReward] = useState(false);
    const [internalLoading, setInternalLoading] = useState(false);
    const [showFinishWarning, setShowFinishWarning] = useState(false);
    const [lastQuestionTime, setLastQuestionTime] = useState(0);
    const claimRewardOnce = useRef(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Timer Logic - Count-up Stopwatch from 0
    const { elapsedTime, pause } = useTimer({
        initialTime: 99999, // High limit for practice
        initialElapsedTime: 0,
        autoStart: true,
    });

    useEffect(() => {
        if (quizCompleted && !reviewMode) {
            pause();
            if (categoryId && !claimRewardOnce.current) {
                claimRewardOnce.current = true;
                handleClaimReward();
            }
        }
    }, [quizCompleted, reviewMode, categoryId]);

    const handleClaimReward = async () => {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        const currentScore = answeredQuestions.reduce((sum, a) => {
            if (!a.isCorrect) return sum;
            const q = questions.find(question => question.id === a.questionId);
            return sum + (q?.points || 0);
        }, 0);

        setClaimingReward(true);
        try {
            const response = await fetch("/api/training/reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId,
                    score: currentScore,
                    totalPoints,
                    totalQuestions: questions.length,
                    timeSpent: elapsedTime,
                    answers: answeredQuestions,
                    questionsData: questions.map(q => ({
                      id: q.id,
                      content: q.content,
                      type: q.type,
                      difficulty: q.difficulty,
                      points: q.points,
                      imageUrl: q.imageUrl,
                      options: q.options
                    }))
                })
            });

            if (!response.ok) throw new Error("Error en la petición");

            const data = await response.json();
            if (data.success) {
                setCreditsEarned(data.creditsPlus);
                setRewardLimitReached(data.limitReached);
                setRewardClaimed(true);

                // Invalidate training-related queries to ensure UI updates instantly
                queryClient.invalidateQueries({ queryKey: [`/api/results/training/${categoryId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/training/last-result/${categoryId}`] });
                queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
                queryClient.invalidateQueries({ queryKey: ["user"] }); // In case credits changed
            }
        } catch (error) {
            console.error("Error al reclamar recompensa:", error);
            toast({
                title: "Error",
                description: "No se pudo procesar tu recompensa",
                variant: "destructive"
            });
        } finally {
            setClaimingReward(false);
        }
    };

    const formatStopwatch = () => {
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (reviewMode) {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setReviewMode(false);
                setQuizCompleted(true);
            }
            return;
        }

        const currentQuestionId = questions[currentIndex]?.id;
        const alreadyAnswered = isQuestionAnswered(currentQuestionId);

        if (alreadyAnswered) {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption(null);
                setShowResult(false);
                setFeedbackMessage("");
            } else {
                // LAST QUESTION already answered
                const uniqueAnsweredCount = new Set(answeredQuestions.map(a => a.questionId)).size;
                if (uniqueAnsweredCount < questions.length) {
                    setShowFinishWarning(true);
                } else {
                    setQuizCompleted(true);
                }
            }
            return;
        }

        if (selectedOption !== null && questions[currentIndex]) {
            const currentQuestion = questions[currentIndex];
            const isCorrect = currentQuestion.options[selectedOption]?.isCorrect;

            const now = elapsedTime;
            const timeSpentSinceLast = now - lastQuestionTime;
            setLastQuestionTime(now);

            const newAnswer = {
                questionId: currentQuestion.id,
                selectedOption,
                isCorrect,
                timeSpent: timeSpentSinceLast
            };

            // Update answeredQuestions (ensure unique by ID)
            setAnsweredQuestions(prev => {
                const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
                return [...filtered, newAnswer];
            });

            // Update score based on correct unique answers
            if (isCorrect) {
                setFeedbackMessage(getRandomMessage('correct'));
            } else {
                setFeedbackMessage(getRandomMessage('incorrect'));
            }

            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setSelectedOption(null);
                    setShowResult(false);
                    setFeedbackMessage("");
                } else {
                    const uniqueAnsweredCountAtStart = new Set(answeredQuestions.map(a => a.questionId)).size;
                    const finalCount = uniqueAnsweredCountAtStart + (alreadyAnswered ? 0 : 1);
                    
                    if (finalCount < questions.length) {
                        setShowFinishWarning(true);
                    } else {
                        setQuizCompleted(true);
                    }
                }
            }, 1000);
        } else if (currentIndex === questions.length - 1) {
            // "Finalizar" button clicked on last question WITHOUT selecting an answer
            const uniqueAnsweredCount = new Set(answeredQuestions.map(a => a.questionId)).size;
            if (uniqueAnsweredCount < questions.length) {
                setShowFinishWarning(true);
            } else {
                setQuizCompleted(true);
            }
        }
    };

    const handleForceFinish = () => {
        // Fill in missing questions as incorrect
        const answeredIds = new Set(answeredQuestions.map(a => a.questionId));
        const missingQuestions = questions.filter(q => !answeredIds.has(q.id));
        
        const missingAnswers = missingQuestions.map(q => ({
            questionId: q.id,
            selectedOption: -1, 
            isCorrect: false,
            timeSpent: 0
        }));

        setAnsweredQuestions(prev => [...prev, ...missingAnswers]);
        setQuizCompleted(true);
        setShowFinishWarning(false);
    };

    const handleOptionSelect = (index: number) => {
        if (!showResult && !reviewMode && !isQuestionAnswered(questions[currentIndex]?.id)) {
            setSelectedOption(index);
        }
    };

    const isQuestionAnswered = (questionId?: number) => {
        if (!questionId) return false;
        return answeredQuestions.some(q => q.questionId === questionId);
    };

    const getQuestionAnswer = (questionId: number) => {
        return answeredQuestions.find(q => q.questionId === questionId);
    };

    const enterReviewMode = () => {
        setReviewMode(true);
        setCurrentIndex(0);
        setQuizCompleted(false);
        setShowResult(false);
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowResult(false);
        setQuizCompleted(false);
        setAnsweredQuestions([]);
        window.location.reload();
    };

    // Keyboard Navigation (PC Only)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (quizCompleted) return;
            const activeElement = document.activeElement;
            const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
            if (isInput) return;

            if (e.key === 'ArrowRight') {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setSelectedOption(null);
                    setShowResult(false);
                }
            } else if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1);
                    setSelectedOption(null);
                    setShowResult(false);
                }
            } else if (e.key === 'Enter') {
                const canProceed = selectedOption !== null || isQuestionAnswered(questions[currentIndex]?.id);
                if (canProceed && !showResult) {
                    handleNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions, selectedOption, showResult, quizCompleted, answeredQuestions]);

    if (loading || internalLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold mb-4 text-white">Entrenamiento: {title}</h2>
                    <p className="text-slate-400 mb-6">No hay preguntas disponibles para esta sección.</p>
                    <Button variant="outline" onClick={onExit} className="gap-2 border-white/10 text-slate-300">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>
            </div>
        );
    }

    if (quizCompleted && !reviewMode) {
        const correctCount = answeredQuestions.filter(a => a.isCorrect).length;
        const totalCount = questions.length;
        const displayScore = ((correctCount / (totalCount || 1)) * 10).toFixed(1);
        const percentage = Math.round((correctCount / (totalCount || 1)) * 100);
        const isGoodScore = percentage >= 70;

        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl relative z-10">
                    <div className="bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden p-8 text-center space-y-8">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                        <div className="flex justify-center flex-col items-center gap-4 pt-4">
                            {isGoodScore ? <Trophy className="h-20 w-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" /> : <Sparkles className="h-20 w-20 text-blue-400" />}
                            <h1 className="text-4xl font-black text-white">{isGoodScore ? "¡Felicidades!" : "¡Buen trabajo!"}</h1>
                            <p className="text-xl text-slate-400">{getRandomMessage('results')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Puntuación</p>
                                <p className="text-4xl font-black text-blue-400">{displayScore}<span className="text-xl text-slate-600 ml-1">/10</span></p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Precisión</p>
                                <p className={`text-4xl font-black ${isGoodScore ? 'text-green-400' : 'text-blue-400'}`}>{percentage}%</p>
                            </div>
                        </div>

                        {/* Reward Feedback */}
                        {claimingReward ? (
                            <div className="flex items-center justify-center gap-2 text-slate-400 py-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="font-medium">Calculando tus créditos...</span>
                            </div>
                        ) : rewardClaimed && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-4 rounded-2xl border ${rewardLimitReached ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                {rewardLimitReached ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-amber-400 font-bold flex items-center gap-2">
                                            <Target className="h-4 w-4" /> Límite diario alcanzado
                                        </p>
                                        <p className="text-slate-400 text-sm">Has ganado 0 créditos esta vez (máx. 3 por materia), ¡pero sigue practicando!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-green-400 font-bold flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 animate-pulse" /> ¡Has ganado {creditsEarned} créditos!
                                        </p>
                                        <p className="text-slate-400 text-sm">Créditos de pista sumados a tu cuenta por tu esfuerzo.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Button 
                              onClick={() => setLocation(`/results/training/${categoryId}`)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-xl px-8 h-12 rounded-2xl"
                            >
                              Revisar Errores
                            </Button>
                            <Button 
                              onClick={() => {
                                setInternalLoading(true);
                                resetQuiz();
                              }} 
                              className="bg-slate-800 hover:bg-slate-700 text-white border border-white/10 h-12 px-8 rounded-2xl"
                            >
                                Reintentar
                            </Button>
                            <Button variant="ghost" onClick={onExit} className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-12 px-8">
                                Volver al Inicio
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progressValue = ((currentIndex + 1) / questions.length) * 100;
    const isAnswered = isQuestionAnswered(currentQuestion.id);
    const previousAnswer = getQuestionAnswer(currentQuestion.id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
                {/* Header Row - Matches ActiveQuiz */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2" onClick={onExit}>
                                <ArrowLeft className="h-5 w-5 mr-1" /> Atrás
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            Entrenamiento: {title}
                        </h1>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                                <Timer className="h-4 w-4 mr-2 text-blue-400" />
                                <span className="font-mono font-bold text-slate-200">{formatStopwatch()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-none font-bold px-3">
                            Pregunta {currentIndex + 1} / {questions.length}
                        </Badge>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-sm font-bold text-green-400 px-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{answeredQuestions.filter(a => a.isCorrect).length}</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-sm font-bold text-red-100 opacity-60 px-1">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span>{answeredQuestions.filter(a => !a.isCorrect).length}</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-sm font-black text-blue-400 px-2 min-w-[50px] text-center">
                            {answeredQuestions.filter(a => a.isCorrect).reduce((sum, a) => {
                                const q = questions.find(q => q.id === a.questionId);
                                return sum + (q?.points || 0);
                            }, 0)} pts
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mb-12">
                    <div className="flex justify-between items-start mb-6">
                        <Badge className={`${currentQuestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' : currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'} border-none font-bold`}>
                            {currentQuestion.difficulty === 'hard' ? 'Difícil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
                        </Badge>
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-1 rounded-full font-bold shadow-lg">
                            {currentQuestion.points} puntos
                        </div>
                    </div>

                    <h3 className="text-lg font-medium mb-6 text-slate-400 underline underline-offset-4 decoration-white/10">Selecciona la respuesta correcta:</h3>

                    {currentQuestion.imageUrl && (
                        <div className="mb-8 flex justify-center bg-black/20 rounded-3xl p-4 border border-white/5">
                            <img src={currentQuestion.imageUrl} alt="Imagen" className="max-h-[400px] object-contain rounded-2xl" />
                        </div>
                    )}

                    <QuestionContent content={currentQuestion.content} />

                    {/* Feedback Message (Inline as in ActiveQuiz) */}
                    <AnimatePresence>
                        {feedbackMessage && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`mb-8 p-5 rounded-2xl text-center font-bold text-xl border-2 backdrop-blur-md ${selectedOption !== null && currentQuestion.options[selectedOption]?.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-900/20' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-900/20'}`}>
                                {feedbackMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-2.5">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = isAnswered ? previousAnswer?.selectedOption === index : selectedOption === index;
                            const isCorrect = option.isCorrect;
                            const showResultLocal = showResult || reviewMode || isAnswered;

                            let btnClass = "bg-slate-900/30 border-white/5 hover:bg-slate-800/60 text-slate-300";
                            if (showResultLocal) {
                                if (isCorrect) btnClass = "bg-green-500/10 border-green-500/50 text-green-400 ring-2 ring-green-500/10 shadow-green-900/10";
                                else if (isSelected) btnClass = "bg-red-500/10 border-red-500/50 text-red-400";
                                else btnClass = "opacity-40 border-white/5 bg-slate-900/20";
                            } else if (isSelected) {
                                btnClass = "bg-blue-600/20 border-blue-500 text-blue-300 ring-4 ring-blue-500/10 shadow-blue-500/20";
                            }

                            return (
                                <button key={option.id} onClick={() => handleOptionSelect(index)} disabled={isAnswered || reviewMode || showResult} className={`w-full text-left py-3 px-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group overflow-hidden ${btnClass}`}>
                                    <div className="flex items-center gap-5 w-full">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 text-sm font-black shrink-0 transition-all ${isSelected || (showResultLocal && isCorrect) ? 'bg-white/10 border-white/30 text-white' : 'bg-slate-950 border-white/10 text-slate-600'}`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <div className="text-lg font-medium flex-1">
                                            <ContentRenderer content={option.text} />
                                        </div>
                                    </div>
                                    {showResultLocal && isCorrect && <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0 ml-4" />}
                                    {showResultLocal && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-400 shrink-0 ml-4" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Buttons Row - Above Progress */}
                <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
                    <Button variant="outline" className="flex items-center border-white/10 text-slate-300 hover:bg-slate-800 h-11 px-6 rounded-2xl bg-slate-900/50" onClick={() => { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setSelectedOption(null); setShowResult(false); setFeedbackMessage(""); } }} disabled={currentIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>

                    <Button onClick={handleNext} disabled={(!reviewMode && selectedOption === null && !isAnswered && currentIndex !== questions.length - 1) || showResult} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-xl h-11 px-8 rounded-2xl min-w-[140px] font-bold">
                        {currentIndex === questions.length - 1 ? (reviewMode ? "Cerrar Revisión" : "Finalizar") : "Siguiente"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 h-3 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden p-[2px]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressValue}%` }} className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" transition={{ duration: 0.5 }} />
                </div>

                {/* Footer Navigation Dots (circles at the bottom) */}
                <div className="mt-8 flex flex-wrap justify-center gap-3 pb-20">
                    {questions.map((_, idx) => {
                        const isCurrent = idx === currentIndex;
                        const answer = answeredQuestions.find(a => a.questionId === questions[idx].id);
                        let dotStyle = "bg-slate-900 border-white/10 text-slate-500 hover:border-slate-500 hover:text-slate-300";
                        if (isCurrent) dotStyle = "bg-blue-600/20 border-blue-500 text-blue-400 ring-4 ring-blue-500/10 shadow-blue-500/30";
                        else if (answer?.isCorrect) dotStyle = "bg-green-500/20 border-green-500/50 text-green-400 shadow-green-500/20";
                        else if (answer && !answer.isCorrect) dotStyle = "bg-red-500/20 border-red-500/50 text-red-500 shadow-red-500/10";

                        return (
                            <motion.button key={idx} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} onClick={() => { setCurrentIndex(idx); setSelectedOption(null); setShowResult(false); setFeedbackMessage(""); }} className={`w-10 h-10 rounded-full flex items-center justify-center border text-xs font-black transition-all duration-300 ${dotStyle}`}>
                                {idx + 1}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Incomplete Quiz Warning Dialog */}
            <AlertDialog open={showFinishWarning} onOpenChange={setShowFinishWarning}>
                <AlertDialogContent className="bg-slate-900 border border-white/10 text-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-yellow-500">
                            <AlertTriangle className="h-6 w-6" />
                            Sesión Incompleta
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 text-base">
                            Aún te quedan <span className="text-yellow-500 font-bold">{questions.length - new Set(answeredQuestions.map(a => a.questionId)).size - (selectedOption !== null && !isAnswered ? 1 : 0)}</span> preguntas por responder. ¿Deseas finalizar ahora? Las preguntas no respondidas contarán como incorrectas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white">
                            Volver
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleForceFinish}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                        >
                            Terminar de todos modos
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
