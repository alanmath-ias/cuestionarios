import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, Star } from "lucide-react";

interface QuizCardProps {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  difficulty: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
  score?: number;
  onStart: () => void;
  onContinue: () => void;
  onRetry: () => void;
}

export function QuizCard({
  id,
  title,
  description,
  questionCount,
  timeLimit,
  difficulty,
  status,
  progress = 0,
  score,
  onStart,
  onContinue,
  onRetry
}: QuizCardProps) {
  
  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'basic':
        return 'Básico';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in_progress':
        return 'text-warning';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En progreso';
      default:
        return 'No iniciado';
    }
  };

  return (
    <Card className="overflow-hidden quiz-card">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <HelpCircle className="text-gray-400 w-4 h-4 mr-1" />
            <span className="text-sm text-gray-500">{questionCount} preguntas</span>
          </div>
          <div className="flex items-center">
            <Clock className="text-gray-400 w-4 h-4 mr-1" />
            <span className="text-sm text-gray-500">{timeLimit} minutos</span>
          </div>
          <div className="flex items-center">
            <Star className="text-gray-400 w-4 h-4 mr-1" />
            <span className="text-sm text-gray-500">{getDifficultyLabel()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
          {status === 'completed' && score !== undefined && (
            <span className="ml-2 text-sm text-gray-500">Calificación: {score.toFixed(1)}/10</span>
          )}
          {status === 'in_progress' && (
            <span className="ml-2 text-sm text-gray-500">Avance: {progress}%</span>
          )}
        </div>
        {status === 'not_started' && (
          <Button size="sm" onClick={onStart}>
            Comenzar
          </Button>
        )}
        {status === 'in_progress' && (
          <Button size="sm" onClick={onContinue}>
            Continuar
          </Button>
        )}
        {status === 'completed' && (
          <Button size="sm" onClick={onRetry}>
            Intentar de nuevo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
