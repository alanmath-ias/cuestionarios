"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from 'wouter';
import { TrainingSession, TrainingQuestion } from "@/components/TrainingSession";

const CATEGORY_NAMES: Record<string, string> = {
  "1": "Aritmética",
  "2": "Álgebra",
  "3": "Trigonometría",
  "4": "Cálculo Diferencial",
  "5": "Cálculo Integral",
  "6": "Ecuaciones Diferenciales",
  "10": "Física Mecánica",
  "19": "Estadística"
};

const TrainingPage = ({ categoryId }: { categoryId: string }) => {
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setLocation] = useLocation();

  const title = CATEGORY_NAMES[categoryId] || "Entrenamiento";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiRequest("GET", `/api/training/${categoryId}`);
        const data = await res.json();
        const questionsWithOptions = data.questions.map((q: any) => ({
          ...q,
          options: (q.options || []).sort(() => Math.random() - 0.5)
        }));
        setQuestions(questionsWithOptions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId]);

  return (
    <TrainingSession
      title={title}
      questions={questions}
      loading={loading}
      onExit={() => setLocation("/")}
      categoryId={parseInt(categoryId)}
    />
  );
};

export default TrainingPage;