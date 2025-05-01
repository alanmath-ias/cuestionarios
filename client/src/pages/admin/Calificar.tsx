import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocation } from "wouter";

type QuizSubmission = {
  progress: {
    id: number;
    userId: number;
    timeSpent: number;
    score: number;
  };
  quiz: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    name: string;
  };
  completedAt: string;
};

const Calificar = () => {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/admin/quiz-submissions", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSubmissions(data);
      } catch (err: any) {
        console.error("Error obteniendo las presentaciones de los cuestionarios:", err);
        setError("Hubo un problema al cargar las presentaciones de los cuestionarios");
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Presentaciones de Cuestionarios</h1>
  
      {error && <p className="text-red-500 mb-4">{error}</p>}
  
      {submissions.length === 0 ? (
        <p>No hay presentaciones de cuestionarios disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((submission, index) => (
            <Card key={index} className="shadow-md rounded-xl p-4">
              <CardContent>
                <p><strong>Estudiante:</strong> {submission.user.name}</p>
                <p><strong>Quiz:</strong> {submission.quiz.title}</p>
                <p><strong>Puntaje:</strong> {submission.progress ? submission.progress.score : "No disponible"}</p>
                <p><strong>Fecha:</strong> {new Date(submission.completedAt).toLocaleString()}</p>
                <p><strong>ID Progreso:</strong> {submission.progress ? submission.progress.id : "N/A"}</p>
                {submission.progress && (
                  <div className="mt-4">
                    <Button onClick={() => setLocation(`/admin/quiz-results/${submission.progress.id}`)}>
                      Ver detalles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default Calificar;
