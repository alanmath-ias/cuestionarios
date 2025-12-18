import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, Trophy, Star, Frown, Smile, Sparkles, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import { PageLayout } from "@/components/layout/page-layout";
import { motion, AnimatePresence } from "framer-motion";
import { ContentRenderer } from "@/components/ContentRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
        // Shuffle questions logic should be handled by parent or re-fetch
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
            <PageLayout>
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="animate-spin h-10 w-10 text-cyan-500" />
                </div>
            </PageLayout>
        );
    }

    if (questions.length === 0) {
        return (
            <PageLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader>
                            <h1 className="text-2xl font-bold">{title}</h1>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">No hay preguntas disponibles para esta sección.</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={onExit} className="gap-2">
                                <ChevronLeft className="h-4 w-4" />
                                Volver
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </PageLayout>
        );
    }

    if (quizCompleted && !reviewMode) {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        const percentage = Math.round((score / totalPoints) * 100);
        const isGoodScore = percentage >= 70;

        return (
            <PageLayout>
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500" />
                            <CardHeader className="text-center space-y-4 pt-10">
                                <div className="flex justify-center">
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    >
                                        {isGoodScore ? (
                                            <Trophy className="h-24 w-24 text-yellow-500 drop-shadow-lg" />
                                        ) : (
                                            <Sparkles className="h-24 w-24 text-blue-500 drop-shadow-lg" />
                                        )}
                                    </motion.div>
                                </div>
                                <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                                    {isGoodScore ? "¡Felicidades!" : "¡Buen trabajo!"}
                                </h1>
                                <p className="text-xl text-gray-600 font-medium">
                                    {getRandomMessage('results')}
                                </p>
                            </CardHeader>
                            <CardContent className="text-center space-y-8">
                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Puntuación</p>
                                        <p className="text-3xl font-bold text-indigo-600">{score}<span className="text-lg text-gray-400">/{totalPoints}</span></p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Precisión</p>
                                        <p className={`text-3xl font-bold ${isGoodScore ? 'text-green-600' : 'text-blue-600'}`}>{percentage}%</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${isGoodScore ? 'bg-green-500' : 'bg-blue-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">
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
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2
                        ${answer?.isCorrect
                                                        ? 'bg-green-50 border-green-200 text-green-600'
                                                        : 'bg-red-50 border-red-200 text-red-600'}`}
                                            >
                                                {answer?.isCorrect ? <Smile className="h-6 w-6" /> : <Frown className="h-6 w-6" />}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 pb-8 bg-gray-50/50">
                                <Button variant="outline" onClick={onExit} className="w-full sm:w-auto gap-2 h-11">
                                    <ChevronLeft className="h-4 w-4" />
                                    Volver al inicio
                                </Button>
                                <Button onClick={enterReviewMode} className="w-full sm:w-auto gap-2 h-11 bg-indigo-600 hover:bg-indigo-700">
                                    <Sparkles className="h-4 w-4" />
                                    Revisar respuestas
                                </Button>
                                <Button onClick={resetQuiz} variant="secondary" className="w-full sm:w-auto gap-2 h-11">
                                    Intentar de nuevo
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </PageLayout>
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
        <PageLayout>
            <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {reviewMode ? "Revisión de respuestas" : title}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {reviewMode ? "Revisa tus errores y aciertos" : "Practica y mejora tus habilidades"}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                Pregunta {currentIndex + 1} / {questions.length}
                            </Badge>
                            <div className="h-4 w-px bg-gray-200" />
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{answeredQuestions.filter(q => q.isCorrect).length}</span>
                            </div>
                            <div className="h-4 w-px bg-gray-200" />
                            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span>{answeredQuestions.filter(q => !q.isCorrect).length}</span>
                            </div>
                            <div className="h-4 w-px bg-gray-200" />
                            <span className="text-sm font-medium text-indigo-600">
                                {score} pts
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar & Navigation Circles */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2.5 bg-gray-100" />

                        {/* Navigation Circles (Desktop) */}
                        <div className="hidden md:flex justify-between mt-4 px-1">
                            {questions.map((_, idx) => {
                                const isCurrent = idx === currentIndex;
                                const isPast = idx < currentIndex;
                                const answer = answeredQuestions.find(a => a.questionId === questions[idx].id);

                                let statusColor = "bg-gray-100 border-gray-200 text-gray-400";
                                if (isCurrent) statusColor = "bg-indigo-100 border-indigo-500 text-indigo-600 ring-2 ring-indigo-200";
                                else if (answer?.isCorrect) statusColor = "bg-green-100 border-green-500 text-green-600";
                                else if (answer && !answer.isCorrect) statusColor = "bg-red-100 border-red-500 text-red-600";
                                else if (isPast) statusColor = "bg-gray-200 border-gray-300 text-gray-500";

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
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${statusColor}`}
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
                    <Card className="border-0 shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Badge variant={currentQuestion.difficulty === 'hard' ? 'destructive' : currentQuestion.difficulty === 'medium' ? 'default' : 'secondary'}>
                                    {currentQuestion.difficulty === 'hard' ? 'Difícil' : currentQuestion.difficulty === 'medium' ? 'Medio' : 'Fácil'}
                                </Badge>
                                {!reviewMode && !isAnswered && hasMoreHints && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 gap-2 h-8"
                                        onClick={handleRequestHint}
                                    >
                                        <Lightbulb className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pista ({availableHints.length - currentHints.length})</span>
                                    </Button>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                                {currentQuestion.points} puntos
                            </span>
                        </div>

                        <CardContent className="p-6 md:p-8">
                            <div className="prose max-w-none mb-8">
                                <ContentRenderer content={currentQuestion.content} />
                                {currentQuestion.imageUrl && (
                                    <div className="mt-4 rounded-lg overflow-hidden border shadow-sm">
                                        <img
                                            src={currentQuestion.imageUrl}
                                            alt="Pregunta"
                                            className="w-full h-auto object-contain max-h-[400px] bg-white"
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
                                        className="mb-6 space-y-3"
                                    >
                                        {currentHints.map((hint, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3"
                                            >
                                                <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-yellow-800 mb-1">Pista {idx + 1}</p>
                                                    <ContentRenderer content={hint} />
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
                                        className={`mb-6 p-4 rounded-xl text-center font-bold text-lg shadow-sm border ${selectedOption !== null && currentQuestion.options[selectedOption]?.isCorrect
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-red-50 border-red-200 text-red-700'
                                            }`}
                                    >
                                        {feedbackMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Review Mode Feedback */}
                            {reviewMode && previousAnswer && (
                                <div className={`mb-6 p-4 rounded-xl text-center font-bold text-lg shadow-sm border ${previousAnswer.isCorrect
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                    {previousAnswer.isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
                                </div>
                            )}

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 gap-3">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = isAnswered
                                        ? previousAnswer?.selectedOption === index
                                        : selectedOption === index;

                                    const isCorrectAnswer = option.isCorrect;
                                    const showCorrect = (showResult || reviewMode) && isCorrectAnswer;
                                    const showIncorrect = (showResult || reviewMode) && isSelected && !isCorrectAnswer;

                                    let variantClass = "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50";
                                    if (reviewMode) {
                                        if (isCorrectAnswer) variantClass = "bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500";
                                        else if (isSelected) variantClass = "bg-red-100 border-red-500 text-red-800 ring-1 ring-red-500";
                                        else variantClass = "opacity-60 border-gray-200";
                                    } else if (isAnswered) {
                                        if (previousAnswer?.selectedOption === index) {
                                            variantClass = previousAnswer.isCorrect
                                                ? "bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500"
                                                : "bg-red-100 border-red-500 text-red-800 ring-1 ring-red-500";
                                        } else if (showCorrect) {
                                            variantClass = "bg-green-50 border-green-400 text-green-800";
                                        } else {
                                            variantClass = "opacity-60 border-gray-200";
                                        }
                                    } else if (isSelected) {
                                        variantClass = "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-900";
                                    }

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(index)}
                                            disabled={isAnswered || reviewMode}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${variantClass}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-bold shrink-0
                          ${isSelected || showCorrect ? 'bg-white border-transparent shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 group-hover:bg-white group-hover:border-indigo-200'}
                        `}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <div className="text-base">
                                                    <ContentRenderer content={option.text} />
                                                </div>
                                            </div>
                                            {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                            {showIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>

                        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                            <Button
                                variant="ghost"
                                disabled={currentIndex === 0}
                                onClick={() => {
                                    setCurrentIndex(prev => prev - 1);
                                    setShowResult(false);
                                    setFeedbackMessage("");
                                }}
                                className="hover:bg-white hover:shadow-sm"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={(!reviewMode && selectedOption === null && !isAnswered) || showResult}
                                className={`${currentIndex === questions.length - 1
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    } text-white shadow-md hover:shadow-lg transition-all px-8`}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Solicitar pista?</DialogTitle>
                        <DialogDescription>
                            Se revelará una pista para ayudarte a resolver esta pregunta.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHintDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmHint}>
                            Sí, mostrar pista
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
