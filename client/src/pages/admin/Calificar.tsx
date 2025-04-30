import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type QuizSubmission = {
  progress: {
    id: string;
    userId: string;
    timeSpent: number;
    score: number;
  };
  quiz: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
  };
  completedAt: string;
};

const Calificar = () => {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
                <p><strong>Puntaje:</strong> {submission.progress.score}</p>
                <p><strong>Fecha:</strong> {new Date(submission.completedAt).toLocaleString()}</p>
                <div className="mt-4">
                <Button
  variant="secondary"
  onClick={() => {
    console.log(submission.progress.id);  // Verifica que el id esté bien
    navigate(`/admin/quiz-results/${submission.progress.id}`);
  }}
>
  Ver detalles
</Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calificar;
