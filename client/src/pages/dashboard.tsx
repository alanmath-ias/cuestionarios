import { useQuery } from '@tanstack/react-query';
import { QuizCategoryCard } from '@/components/dashboard/quiz-category-card';
import { ProgressOverview } from '@/components/dashboard/progress-overview';
import { calculatePercentage } from '@/lib/mathUtils';
import { useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  description: string;
  colorClass: string;
}

interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: string;
  quiz?: {
    id: number;
    title: string;
    categoryId: number;
  };
}

interface Activity {
  type: 'completed' | 'started' | 'scored';
  quizTitle: string;
  timeAgo: string;
  score?: number;
}

function Dashboard() {
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch student progress
  const { data: progress, isLoading: loadingProgress } = useQuery<Progress[]>({
    queryKey: ['/api/progress'],
  });

  // Fetch quizzes
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
  });

  // Calculate statistics for the progress overview
  const completedQuizzes = progress?.filter(p => p.status === 'completed').length || 0;
  const totalQuizzes = quizzes?.length || 0;
  
  // Calculate average score
  const scores = progress?.filter(p => p.status === 'completed' && p.score !== undefined)
    .map(p => p.score as number) || [];
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  // Format recent activities
  const getRecentActivities = (): Activity[] => {
    if (!progress || progress.length === 0 || !quizzes) return [];
    
    // Sort progress by completed date or ID if not completed
    const sortedProgress = [...progress].sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      return b.id - a.id;
    });
    
    // Take most recent 3 activities
    return sortedProgress.slice(0, 3).map(p => {
      const quiz = quizzes.find(q => q.id === p.quizId);
      const quizTitle = quiz?.title || 'Cuestionario';
      
      // Format time ago
      const timeAgo = p.completedAt 
        ? getTimeAgo(new Date(p.completedAt))
        : 'Recientemente';
      
      if (p.status === 'completed') {
        return {
          type: 'scored',
          quizTitle,
          timeAgo,
          score: p.score
        };
      } else if (p.status === 'in_progress') {
        return {
          type: 'started',
          quizTitle,
          timeAgo
        };
      } else {
        return {
          type: 'completed',
          quizTitle,
          timeAgo
        };
      }
    });
  };

  // Helper to format relative time
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `Hace ${interval} ${interval === 1 ? 'año' : 'años'}`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `Hace ${interval} ${interval === 1 ? 'mes' : 'meses'}`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `Hace ${interval} ${interval === 1 ? 'día' : 'días'}`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `Hace ${interval} ${interval === 1 ? 'hora' : 'horas'}`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `Hace ${interval} ${interval === 1 ? 'minuto' : 'minutos'}`;
    }
    
    return 'Hace unos segundos';
  };

  // Count completed quizzes per category
  const getCompletedQuizzesForCategory = (categoryId: number): number => {
    if (!progress || !quizzes) return 0;
    
    const categoryQuizIds = quizzes
      .filter(q => q.categoryId === categoryId)
      .map(q => q.id);
    
    return progress.filter(p => 
      categoryQuizIds.includes(p.quizId) && p.status === 'completed'
    ).length;
  };

  // Count total quizzes per category
  const getTotalQuizzesForCategory = (categoryId: number): number => {
    if (!quizzes) return 0;
    return quizzes.filter(q => q.categoryId === categoryId).length;
  };

  const isLoading = loadingCategories || loadingProgress || loadingQuizzes;

  return (
    <div id="dashboard" className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">Bienvenido/a al Sistema de Cuestionarios AlanMath</h2>
      
      <ProgressOverview
        completedQuizzes={completedQuizzes}
        totalQuizzes={totalQuizzes}
        averageScore={averageScore}
        recentActivities={getRecentActivities()}
        isLoading={isLoading}
      />
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Categorías de Cuestionarios</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <QuizCategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                totalQuizzes={getTotalQuizzesForCategory(category.id)}
                completedQuizzes={getCompletedQuizzesForCategory(category.id)}
                colorClass={category.colorClass}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay categorías disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
