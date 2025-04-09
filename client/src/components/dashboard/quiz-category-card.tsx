import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { calculatePercentage } from "@/lib/mathUtils";

interface QuizCategoryCardProps {
  id: number;
  name: string;
  description: string;
  totalQuizzes: number;
  completedQuizzes: number;
  colorClass: string;
}

export function QuizCategoryCard({
  id,
  name,
  description,
  totalQuizzes,
  completedQuizzes,
  colorClass
}: QuizCategoryCardProps) {
  const progressPercentage = calculatePercentage(completedQuizzes, totalQuizzes);
  
  const getBorderColor = () => {
    switch (colorClass) {
      case 'primary':
        return 'border-t-4 border-primary';
      case 'secondary':
        return 'border-t-4 border-secondary';
      case 'accent':
        return 'border-t-4 border-accent';
      default:
        return 'border-t-4 border-primary';
    }
  };
  
  const getBadgeColor = () => {
    switch (colorClass) {
      case 'primary':
        return 'bg-blue-100 text-primary';
      case 'secondary':
        return 'bg-amber-100 text-secondary';
      case 'accent':
        return 'bg-teal-100 text-accent';
      default:
        return 'bg-blue-100 text-primary';
    }
  };
  
  const getLinkColor = () => {
    switch (colorClass) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      case 'accent':
        return 'text-accent';
      default:
        return 'text-primary';
    }
  };
  
  const getProgressBgColor = () => {
    switch (colorClass) {
      case 'primary':
        return 'bg-blue-100';
      case 'secondary':
        return 'bg-amber-100';
      case 'accent':
        return 'bg-teal-100';
      default:
        return 'bg-blue-100';
    }
  };
  
  const getProgressFillColor = () => {
    switch (colorClass) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-secondary';
      case 'accent':
        return 'bg-accent';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className={`overflow-hidden ${getBorderColor()}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">{name}</h4>
          <span className={`${getBadgeColor()} text-xs px-2 py-1 rounded-full`}>{totalQuizzes} cuestionarios</span>
        </div>
        <p className="text-gray-600 mt-2 text-sm">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">Progreso: {completedQuizzes}/{totalQuizzes}</div>
          <div className={`text-xs font-medium ${getLinkColor()}`}>{progressPercentage}%</div>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-1.5 mt-1 ${getProgressBgColor()}`}
          indicatorClassName={getProgressFillColor()}
        />
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <Link to={`/category/${id}`} className={`${getLinkColor()} font-medium text-sm flex items-center hover:underline`}>
          Ver cuestionarios
          <ChevronRight className="ml-1 w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
