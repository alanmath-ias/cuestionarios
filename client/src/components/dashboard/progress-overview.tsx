import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculatePercentage } from "@/lib/mathUtils";
import { Hourglass, Star, History } from "lucide-react";

interface Activity {
  type: 'completed' | 'started' | 'scored';
  quizTitle: string;
  timeAgo: string;
  score?: number;
}

interface ProgressOverviewProps {
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  recentActivities: Activity[];
  isLoading?: boolean;
}

export function ProgressOverview({
  completedQuizzes,
  totalQuizzes,
  averageScore,
  recentActivities,
  isLoading = false
}: ProgressOverviewProps) {
  const progressPercentage = calculatePercentage(completedQuizzes, totalQuizzes);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="animate-pulse">
          <CardContent className="p-5">
            <div className="h-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-5">
            <div className="h-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-5">
            <div className="h-24 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Progress Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Progreso general</h3>
            <Hourglass className="text-secondary w-5 h-5" />
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-blue-200">
                  En progreso
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {progressPercentage}%
                </span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-blue-100" />
          </div>
          <p className="text-sm text-gray-600 mt-4">Has completado {completedQuizzes} de {totalQuizzes} cuestionarios</p>
        </CardContent>
      </Card>

      {/* Average Score Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Puntuación media</h3>
            <Star className="text-secondary w-5 h-5" />
          </div>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-primary">{averageScore.toFixed(1)}</div>
            <div className="text-lg text-gray-500 ml-1">/10</div>
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            {averageScore > 8 
              ? "¡Excelente trabajo! Tu puntuación es sobresaliente."
              : averageScore > 6 
                ? "Buen trabajo. Tu puntuación está por encima del promedio."
                : "Sigue practicando para mejorar tu puntuación."}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Actividad reciente</h3>
            <History className="text-secondary w-5 h-5" />
          </div>
          <ul className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2">
                    {activity.type === 'completed' ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : activity.type === 'started' ? (
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    )}
                  </span>
                  <div>
                    <p>
                      {activity.type === 'completed' && `Completaste `}
                      {activity.type === 'started' && `Comenzaste `}
                      {activity.type === 'scored' && `Obtuviste `}
                      {activity.type === 'scored' && <span className="font-medium">{activity.score?.toFixed(1)} </span>}
                      {activity.type === 'scored' && `en `}
                      <span className="font-medium">{activity.quizTitle}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">No hay actividades recientes</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
