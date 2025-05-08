"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MathDisplay } from "@/components/ui/math-display";
import { Link } from 'wouter';
import { PageLayout } from "@/components/layout/page-layout";
import { useParams } from 'wouter';

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

const TrainingPageSub = () => {
  const params = useParams<{ categoryId: string; subcategoryId: string }>();
  const { categoryId, subcategoryId } = params;
  
  // Convertir parámetros a números
  const categoryIdNum = Number(categoryId);
  const subcategoryIdNum = Number(subcategoryId);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      // Validar IDs antes de hacer la petición
      if (isNaN(categoryIdNum)) {
        console.error("Invalid categoryId:", categoryId);
        return;
      }
      if (isNaN(subcategoryIdNum)) {
        console.error("Invalid subcategoryId:", subcategoryId);
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
    if (selectedOption !== null && questions[currentIndex]) {
      const currentQuestion = questions[currentIndex];
      const isCorrect = currentQuestion.options[selectedOption]?.isCorrect;

      if (isCorrect) {
        setScore(score + currentQuestion.points);
      }

      setShowResult(true);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedOption(null);
          setShowResult(false);
        } else {
          setQuizCompleted(true);
        }
      }, 1500);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (!showResult) {
      setSelectedOption(index);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setQuizCompleted(false);
    setQuestions(prev => [...prev.sort(() => 0.5 - Math.random())]);
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

  if (quizCompleted) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <h1 className="text-2xl font-bold">¡Entrenamiento completado!</h1>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-xl">
                Puntuación final: <span className="font-bold">{score} puntos</span>
              </p>
              <p>
                Acertaste {Math.round((score / questions.reduce((acc, q) => acc + q.points, 0)) * 100)}% de las preguntas
              </p>
              <Progress 
                value={(score / questions.reduce((acc, q) => acc + q.points, 0)) * 100} 
                className="h-4"
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button onClick={resetQuiz}>
                Reintentar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Entrenamiento</h1>
          <p className="text-muted-foreground">
            {isNaN(categoryIdNum) || isNaN(subcategoryIdNum)
              ? "IDs de categoría inválidos"
              : "No hay preguntas disponibles para esta subcategoría"
          }
          </p>
        </div>
      </PageLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Entrenamiento</h1>
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
                {currentQuestion.content.split('*').map((part, i) => (
                  i % 2 === 0 ? 
                    <span key={i}>{part}</span> : 
                    <MathDisplay key={i} math={part.trim()} inline />
                ))}
              </h2>
            </div>
          </div>

          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={option.id}
                variant={showResult
                  ? option.isCorrect
                    ? "secondary"
                    : index === selectedOption
                    ? "destructive"
                    : "outline"
                  : selectedOption === index
                  ? "secondary"
                  : "outline"}
                className="w-full text-left justify-start h-auto py-3 whitespace-normal"
                onClick={() => handleOptionSelect(index)}
              >
                {option.text}
              </Button>
            ))}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(prev => prev - 1);
                setSelectedOption(null);
                setShowResult(false);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button 
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentIndex === questions.length - 1 ? "Finalizar" : "Siguiente"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TrainingPageSub;