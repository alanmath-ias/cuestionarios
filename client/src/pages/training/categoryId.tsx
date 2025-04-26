'use client';

import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/queryClient';
import { Question } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TrainingByCategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("GET", `/api/training/${categoryId}`);
        setQuestions(res.questions);
      } catch (error) {
        console.error("Error al cargar las preguntas de entrenamiento", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!questions) {
    return <div className="text-center text-red-500">Error cargando preguntas.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Entrenamiento por categoría</h1>

      {questions.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron preguntas para esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q, index) => (
            <Card key={q.id} className="p-4 shadow">
              <p className="font-semibold mb-2">Pregunta {index + 1}:</p>
              <p>{q.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
