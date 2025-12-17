"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useParams } from 'wouter';
import { TrainingSession, TrainingQuestion } from "@/components/TrainingSession";

const TrainingPageSub = () => {
  const { categoryId, subcategoryId } = useParams();
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiRequest("GET", `/api/training/${categoryId}/${subcategoryId}`);
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

    if (categoryId && subcategoryId) {
      fetchQuestions();
    }
  }, [categoryId, subcategoryId]);

  return (
    <TrainingSession
      title="Entrenamiento por Tema"
      questions={questions}
      loading={loading}
      onExit={() => setLocation("/")}
    />
  );
};

export default TrainingPageSub;