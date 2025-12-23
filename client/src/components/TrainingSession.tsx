import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, Trophy, Star, Frown, Smile, Sparkles, Lightbulb, CheckCircle2, XCircle, ArrowLeft, Target, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import { motion, AnimatePresence } from "framer-motion";
import { ContentRenderer } from "@/components/ContentRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Types
export interface TrainingQuestion {
    id: number;
    content: string;
    options: {
        id: number;
        text: string;
        isCorrect: boolean;
    }[];
    type: string;
    difficulty: string;
    points: number;
    imageUrl?: string;
    hint1?: string;
    hint2?: string;
    hint3?: string;
    explanation?: string;
}

interface AnsweredQuestion {
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
}

interface TrainingSessionProps {
    title: string;
    questions: TrainingQuestion[];
    loading: boolean;
    onExit: () => void;
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

export function TrainingSession({ title, questions, loading, onExit }: TrainingSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [reviewMode, setReviewMode] = useState(false);

    // Hint state
    const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
    const [hintsRevealed, setHintsRevealed] = useState<Record<number, string[]>>({});
    const { toast } = useToast();

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

        if (selectedOption !== null && questions[currentIndex]) {
            const currentQuestion = questions[currentIndex];
            const isCorrect = currentQuestion.options[selectedOption]?.isCorrect;

            setAnsweredQuestions(prev => [
                ...prev,
                {
                    questionId: currentQuestion.id,
                    selectedOption,
                    isCorrect
                }
            ]);

            if (isCorrect) {
                setScore(score + currentQuestion.points);
                setFeedbackMessage(getRandomMessage('correct'));
            } else {
                setFeedbackMessage(getRandomMessage('incorrect'));
            }

            setShowResult(true);

            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setSelectedOption(null);
                    setShowResult(false);
                    setFeedbackMessage("");
                } else {
                    setQuizCompleted(true);
                }
            }, 1500);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (!showResult && !isQuestionAnswered(questions[currentIndex]?.id) && !reviewMode) {
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
        setHintsRevealed({});
        window.location.reload();
    };

    // Hint Logic
    const handleRequestHint = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        const currentHints = hintsRevealed[currentQ.id] || [];
        const availableHints = [currentQ.hint1, currentQ.hint2, currentQ.hint3].filter(Boolean) as string[];

        if (currentHints.length >= availableHints.length) {
            toast({
                title: "No hay más pistas",
                description: "Has utilizado todas las pistas disponibles para esta pregunta.",
                variant: "default",
            });
            return;
        }

        setIsHintDialogOpen(true);
    };

    const confirmHint = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        const currentHints = hintsRevealed[currentQ.id] || [];
        const availableHints = [currentQ.hint1, currentQ.hint2, currentQ.hint3].filter(Boolean) as string[];
        const nextHint = availableHints[currentHints.length];

        if (nextHint) {
            setHintsRevealed({
                ...hintsRevealed,
                [currentQ.id]: [...currentHints, nextHint]
            });
            setIsHintDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="bg-slate-900 border-white/10 text-white max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-400">No hay preguntas disponibles para esta sección.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={onExit} className="gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (quizCompleted && !reviewMode) {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        const percentage = Math.round((score / totalPoints) * 100);
        const isGoodScore = percentage >= 70;

        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                {/* Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                        <CardHeader className="text-center space-y-6 pt-12 pb-2">
                            <div className="flex justify-center">
                                <motion.div
                                    initial={{ rotate: -10, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                                    {isGoodScore ? (
                                        <Trophy className="h-24 w-24 text-yellow-400 relative z-10" />
                                    ) : (
                                        <Sparkles className="h-24 w-24 text-blue-400 relative z-10" />
                                    )}
                                </motion.div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                                    {isGoodScore ? "¡Felicidades!" : "¡Buen trabajo!"}
                                </h1>
                                <p className="text-xl text-slate-400 font-medium">
                                    {getRandomMessage('results')}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-8 p-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Puntuación</p>
                                    <p className="text-4xl font-bold text-blue-400">{score}<span className="text-xl text-slate-600">/{totalPoints}</span></p>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Precisión</p>
                                    <p className={`text-4xl font-bold ${isGoodScore ? 'text-green-400' : 'text-blue-400'}`}>{percentage}%</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${isGoodScore ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-400'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <p className="text-sm text-slate-500">
                                    Dificultad promedio: {questions.reduce((acc, q) => acc + (q.difficulty === 'hard' ? 2 : q.difficulty === 'medium' ? 1 : 0), 0) / questions.length > 1.5 ? 'Alta' : 'Media'}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                {questions.map((q, i) => {
                                    const answer = answeredQuestions.find(a => a.questionId === q.id);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + (i * 0.05) }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border
                        ${answer?.isCorrect
                                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                    : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                                        >
                                            {answer?.isCorrect ? <Smile className="h-5 w-5" /> : <Frown className="h-5 w-5" />}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 p-8 bg-slate-900/80 border-t border-white/5">
                            <Button variant="outline" onClick={onExit} className="w-full sm:w-auto gap-2 h-11 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent">
                                <ArrowLeft className="h-4 w-4" />
                                Volver al inicio
                            </Button>
                            <Button onClick={enterReviewMode} className="w-full sm:w-auto gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/20">
                                <Sparkles className="h-4 w-4" />
                                Revisar respuestas
                            </Button>
                            <Button onClick={resetQuiz} variant="secondary" className="w-full sm:w-auto gap-2 h-11 bg-slate-800 text-white hover:bg-slate-700 border border-white/5">
                                Intentar de nuevo
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;
    const isAnswered = isQuestionAnswered(currentQuestion.id);
    const previousAnswer = getQuestionAnswer(currentQuestion.id);
    const currentHints = hintsRevealed[currentQuestion.id] || [];
    const availableHints = [currentQuestion.hint1, currentQuestion.hint2, currentQuestion.hint3].filter(Boolean);
    const hasMoreHints = currentHints.length < availableHints.length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto p-4 md:p-6 max-w-5xl relative z-10 py-8">
                {/* Header Section */}
                <div className="space-y-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full text-slate-400 hover:text-white hover:bg-white/10 -ml-2">
                                    <ArrowLeft className="w-6 h-6" />
                                </Button>
                                <h1 className="text-2xl font-bold text-white">
                                    {reviewMode ? "Revisión de respuestas" : title}
                                </h1>
                            </div>
                            <p className="text-slate-400 ml-10">
                                {reviewMode ? "Revisa tus errores y aciertos" : "Practica y mejora tus habilidades"}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                            <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-slate-200">
                                    {currentIndex + 1} <span className="text-slate-500">/</span> {questions.length}
                                </span>
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-green-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{answeredQuestions.filter(q => q.isCorrect).length}</span>
                                </div>
                                <div className="w-px h-4 bg-white/10" />
                                <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                                    <XCircle className="w-4 h-4" />
                                    <span>{answeredQuestions.filter(q => !q.isCorrect).length}</span>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-bold text-white">
                                    {score}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar & Navigation Circles */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
                            <span>Progreso</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />

                        {/* Navigation Circles (Desktop) */}
                        <div className="hidden md:flex justify-between mt-4 px-1">
                            {questions.map((_, idx) => {
                                const isCurrent = idx === currentIndex;
                                const isPast = idx < currentIndex;
                                const answer = answeredQuestions.find(a => a.questionId === questions[idx].id);

                                let statusColor = "bg-slate-800 border-slate-700 text-slate-500";
                                if (isCurrent) statusColor = "bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
                                else if (answer?.isCorrect) statusColor = "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                                else if (answer && !answer.isCorrect) statusColor = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                                else if (isPast) statusColor = "bg-slate-800 border-slate-600 text-slate-400";

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (idx === currentIndex) return;
                                            setCurrentIndex(idx);
                                            setSelectedOption(null);
                                            setShowResult(false);
                                            setFeedbackMessage("");
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 hover:scale-110 focus:outline-none cursor-pointer ${statusColor}`}
                                        title={`Ir a la pregunta ${idx + 1}`}
                                    >
                                        {answer?.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    {/* Main Question Card */}
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="bg-slate-900/50 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={`border-none px-3 py-1 ${currentQuestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}
                                >
                                    {currentQuestion.difficulty === 'hard' ? 'Difícil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
                                </Badge>
                                {!reviewMode && !isAnswered && hasMoreHints && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 gap-2 h-8"
                                        onClick={handleRequestHint}
                                    >
                                        <Lightbulb className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pista ({availableHints.length - currentHints.length})</span>
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                {currentQuestion.points} pts
                            </div>
                        </div>

                        <CardContent className="p-6 md:p-8">
                            <div className="prose prose-invert max-w-none mb-8">
                                <div className="text-lg md:text-xl text-slate-200 leading-relaxed">
                                    <ContentRenderer content={currentQuestion.content} />
                                </div>
                                {currentQuestion.imageUrl && (
                                    <div className="mt-6 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/20">
                                        <img
                                            src={currentQuestion.imageUrl}
                                            alt="Pregunta"
                                            className="w-full h-auto object-contain max-h-[400px]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Hints Display */}
                            <AnimatePresence>
                                {currentHints.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-8 space-y-3"
                                    >
                                        {currentHints.map((hint, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-4"
                                            >
                                                <div className="p-2 bg-yellow-500/10 rounded-lg h-fit">
                                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-yellow-400 mb-1">Pista {idx + 1}</p>
                                                    <div className="text-slate-300 text-sm">
                                                        <ContentRenderer content={hint} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Feedback Message */}
                            <AnimatePresence>
                                {!reviewMode && feedbackMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mb-8 p-4 rounded-xl text-center font-bold text-lg shadow-lg border backdrop-blur-sm ${selectedOption !== null && currentQuestion.options[selectedOption]?.isCorrect
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-900/20'
                                            : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-900/20'
                                            }`}
                                    >
                                        {feedbackMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Review Mode Feedback */}
                            {reviewMode && previousAnswer && (
                                <div className={`mb-8 p-4 rounded-xl text-center font-bold text-lg shadow-lg border backdrop-blur-sm ${previousAnswer.isCorrect
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}>
                                    {previousAnswer.isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
                                </div>
                            )}

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = isAnswered
                                        ? previousAnswer?.selectedOption === index
                                        : selectedOption === index;

                                    const isCorrectAnswer = option.isCorrect;
                                    const showCorrect = (showResult || reviewMode) && isCorrectAnswer;
                                    const showIncorrect = (showResult || reviewMode) && isSelected && !isCorrectAnswer;

                                    let variantClass = "bg-slate-800/30 border-white/5 hover:bg-slate-800/60 hover:border-blue-500/30 text-slate-300";

                                    if (reviewMode) {
                                        if (isCorrectAnswer) variantClass = "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                                        else if (isSelected) variantClass = "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                                        else variantClass = "opacity-60 border-white/5 bg-slate-900/20 text-slate-500";
                                    } else if (isAnswered) {
                                        if (previousAnswer?.selectedOption === index) {
                                            variantClass = previousAnswer.isCorrect
                                                ? "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                                : "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                                        } else if (showCorrect) {
                                            variantClass = "bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                                        } else {
                                            variantClass = "opacity-60 border-white/5 bg-slate-900/20 text-slate-500";
                                        }
                                    } else if (isSelected) {
                                        variantClass = "bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
                                    }

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(index)}
                                            disabled={isAnswered || reviewMode}
                                            className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${variantClass}`}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold shrink-0 transition-colors
                          ${isSelected || showCorrect
                                                        ? 'bg-white/10 border-white/20 text-white'
                                                        : 'bg-slate-900/50 border-white/10 text-slate-500 group-hover:text-slate-300 group-hover:border-white/20'}
                        `}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <div className="text-base font-medium">
                                                    <ContentRenderer content={option.text} />
                                                </div>
                                            </div>
                                            {showCorrect && <CheckCircle2 className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                                            {showIncorrect && <XCircle className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>

                        <CardFooter className="bg-slate-900/50 px-6 py-6 flex justify-between items-center border-t border-white/5">
                            <Button
                                variant="ghost"
                                disabled={currentIndex === 0}
                                onClick={() => {
                                    setCurrentIndex(prev => prev - 1);
                                    setShowResult(false);
                                    setFeedbackMessage("");
                                }}
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={(!reviewMode && selectedOption === null && !isAnswered) || showResult}
                                className={`${currentIndex === questions.length - 1
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                                    } text-white shadow-lg transition-all px-8 border-none`}
                            >
                                {currentIndex === questions.length - 1
                                    ? reviewMode ? "Finalizar revisión" : "Finalizar Entrenamiento"
                                    : "Siguiente Pregunta"}
                                {currentIndex !== questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Hint Dialog */}
            <Dialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-400">
                            <Lightbulb className="w-5 h-5" />
                            ¿Solicitar pista?
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2">
                            Se revelará una pista para ayudarte a resolver esta pregunta.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsHintDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10">
                            Cancelar
                        </Button>
                        <Button onClick={confirmHint} className="bg-yellow-600 hover:bg-yellow-700 text-white border-none">
                            Sí, mostrar pista
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
