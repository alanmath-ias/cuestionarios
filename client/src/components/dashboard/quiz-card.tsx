import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, Star, BookOpen, Crown } from "lucide-react";

interface QuizCardProps {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  difficulty: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
  completedQuestions?: number;
  score?: number;
  onStart: () => void;
  onContinue: () => void;
  onRetry: () => void;
  onMiniStart?: () => void;
  onOpenTheory?: () => void;
  isPremium?: boolean;
  className?: string; // Agregar esta propiedad opcional
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
  completedQuestions,
  score,
  onStart,
  onContinue,
  onRetry,
  onMiniStart,
  onOpenTheory,
  isPremium = false,
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
            <span className="ml-2 text-sm font-medium text-yellow-500">
              Progreso: {completedQuestions || Math.round((progress * questionCount) / 100)}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {onOpenTheory && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTheory();
              }}
              className="text-xs px-2.5 h-8 border-indigo-400/40 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center gap-1.5 transition-all"
              title={isPremium ? "Consultar fórmulas y conceptos clave" : "Fórmulas y conceptos clave (Función Premium)"}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Fórmulas</span>
              {!isPremium && (
                <Crown className="w-3 h-3 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
              )}
            </Button>
          )}
          {status === 'not_started' && (
            <>
              {onMiniStart && (
                <Button size="sm" variant="outline" onClick={onMiniStart} className="text-xs px-2 h-8 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                  Versión Mini
                </Button>
              )}
              <Button size="sm" onClick={onStart}>
                Comenzar
              </Button>
            </>
          )}
          {status === 'in_progress' && (
            <Button size="sm" onClick={onContinue}>
              Continuar
            </Button>
          )}
          {status === 'completed' && (
            <Button size="sm" onClick={onRetry}>
              Ver Resultados
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
