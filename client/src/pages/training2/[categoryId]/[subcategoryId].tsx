"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, Trophy, Star, Frown, Smile, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MathDisplay } from "@/components/ui/math-display";
import { Link } from 'wouter';
import { PageLayout } from "@/components/layout/page-layout";
import { useParams } from 'wouter';
import { motion, AnimatePresence } from "framer-motion";

type Question = {
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
};

type AnsweredQuestion = {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
};

const motivationalMessages = {
  correct: [
    "¡Perfecto! 🌟",
    "¡Así se hace! 🚀",
    "¡Excelente respuesta! 🎯",
    "¡Dominas este tema! 💪",
    "¡Correcto! 👏"
  ],
  incorrect: [
    "¡Casi! Sigue practicando 💫",
    "No te rindas, sigue intentando 🌱",
    "¡Error, pero aprendiste algo nuevo! 📚",
    "La próxima lo lograrás ✨",
    "¡Sigue así! El error es parte del aprendizaje 🏋️"
  ],
  results: [
    "¡Gran progreso!",
    "¡Estás mejorando!",
    "¡Buen trabajo!",
    "¡Sigue practicando!",
    "¡Vas por buen camino!"
  ]
};

const getRandomMessage = (type: keyof typeof motivationalMessages) => {
  const messages = motivationalMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

const TrainingPageSub = () => {
  const params = useParams<{ categoryId: string; subcategoryId: string }>();
  const { categoryId, subcategoryId } = params;
  
  const categoryIdNum = Number(categoryId);
  const subcategoryIdNum = Number(subcategoryId);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (isNaN(categoryIdNum) || isNaN(subcategoryIdNum)) {
        console.error("Invalid IDs:", { categoryId, subcategoryId });
        return;
      }

      try {
        const res = await apiRequest(
          "GET", 
          `/api/training-subcategory/${categoryIdNum}/${subcategoryIdNum}`
        );
        const data = await res.json();
        const questionsWithOptions = data.questions.map((q: any) => ({
          ...q,
          options: q.options || []
        }));
        setQuestions(questionsWithOptions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && subcategoryId) {
      fetchQuestions();
    }
  }, [categoryId, subcategoryId, categoryIdNum, subcategoryIdNum]);

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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin h-10 w-10 text-cyan-500" />
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
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  {isGoodScore ? (
                    <Trophy className="h-16 w-16 text-yellow-500" />
                  ) : (
                    <Sparkles className="h-16 w-16 text-blue-500" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isGoodScore ? "¡Dominas este tema!" : "¡Buen progreso!"}
                </h1>
                <p className="text-lg text-gray-600">
                  {getRandomMessage('results')}
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-xl font-semibold">
                    Puntuación: <span className="text-2xl text-blue-600">{score}</span>/{totalPoints} puntos
                  </p>
                  <p className="text-lg">
                    Acertaste el <span className={`font-bold ${isGoodScore ? 'text-green-600' : 'text-blue-600'}`}>{percentage}%</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={percentage} 
                    className="h-4 bg-gray-200"
                    indicatorClassName={isGoodScore ? 'bg-green-500' : 'bg-blue-500'}
                  />
                  <p className="text-sm text-gray-500">
                    Dificultad: {questions.reduce((acc, q) => acc + (q.difficulty === 'hard' ? 2 : q.difficulty === 'medium' ? 1 : 0), 0) / questions.length > 1.5 ? 'Alta' : 'Media'}
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {questions.map((q, i) => {
                    const answer = answeredQuestions.find(a => a.questionId === q.id);
                    return (
                      <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center 
                        ${answer?.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {answer?.isCorrect ? <Smile className="h-5 w-5" /> : <Frown className="h-5 w-5" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <Link href={`/category/${categoryId}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Volver a la materia
                  </Button>
                </Link>
                <Button onClick={enterReviewMode} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Revisar respuestas
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-50 to-white">
            <CardHeader>
              <h1 className="text-2xl font-bold">Entrenamiento del Tema</h1>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isNaN(categoryIdNum) || isNaN(subcategoryIdNum)
                  ? "IDs inválidos"
                  : "No hay preguntas disponibles para este tema"
                }
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/category/${categoryId}`}>
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  const isAnswered = isQuestionAnswered(currentQuestion.id);
  const previousAnswer = getQuestionAnswer(currentQuestion.id);

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {reviewMode ? "Revisión de respuestas" : "Entrenamiento"}
            </h1>
            <Badge variant="outline">
              Pregunta {currentIndex + 1} de {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Dificultad: {currentQuestion.difficulty} | Puntos: {currentQuestion.points}
          </p>
        </div>

        <Card>
          <div className="mb-3 flex justify-center text-center">
            <div className="whitespace-pre-wrap">
              <h2 className="text-xl font-semibold">
                {currentQuestion.content.split('¡').map((part, i) => (
                  i % 2 === 0 ? 
                    <span key={i}>{part}</span> : 
                    <MathDisplay key={i} math={part.trim()} inline />
                ))}
              </h2>
            </div>
          </div>

          <CardContent className="space-y-3">
            {reviewMode && previousAnswer && (
              <div className={`p-3 rounded-md text-center font-medium ${
                previousAnswer.isCorrect 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {previousAnswer.isCorrect 
                  ? "¡Respuesta correcta!" 
                  : "Respuesta incorrecta"}
              </div>
            )}

            <AnimatePresence>
              {!reviewMode && feedbackMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-md text-center font-medium ${
                    selectedOption !== null && currentQuestion.options[selectedOption]?.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {feedbackMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {currentQuestion.options.map((option, index) => {
  const isSelected = isAnswered 
    ? previousAnswer?.selectedOption === index
    : selectedOption === index;
  
  const isCorrectAnswer = option.isCorrect;
  const showCorrect = (showResult || reviewMode) && isCorrectAnswer;
  const showIncorrect = (showResult || reviewMode) && isSelected && !isCorrectAnswer;

  return (
    <Button
      key={option.id}
      variant={
        reviewMode
          ? isCorrectAnswer
            ? "secondary"
            : isSelected
            ? "destructive"
            : "outline"
          : isAnswered
          ? previousAnswer?.selectedOption === index
            ? previousAnswer?.isCorrect
              ? "secondary"
              : "destructive"
            : showCorrect
            ? "secondary"
            : "outline"
          : isSelected
          ? "secondary"
          : "outline"
      }
      className={`w-full text-left justify-start h-auto py-3 whitespace-normal transition-all ${
        showCorrect ? 'ring-2 ring-green-500' : ''
      } ${showIncorrect ? 'ring-2 ring-red-500' : ''}`}
      onClick={() => handleOptionSelect(index)}
      disabled={isAnswered || reviewMode}
    >
      <span className="whitespace-pre-wrap">
        {option.text.split('¡').map((part, i) => (
          i % 2 === 0 ? 
            <span key={i}>{part}</span> : 
            <MathDisplay key={i} math={part.trim()} inline />
        ))}
      </span>
      {showCorrect && <Star className="ml-2 h-4 w-4 text-yellow-500" />}
    </Button>
  );
})}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(prev => prev - 1);
                setShowResult(false);
                setFeedbackMessage("");
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button 
              onClick={handleNext}
              disabled={(!reviewMode && selectedOption === null && !isAnswered) || showResult}
            >
              {currentIndex === questions.length - 1 
                ? reviewMode ? "Finalizar revisión" : "Finalizar" 
                : "Siguiente"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TrainingPageSub;