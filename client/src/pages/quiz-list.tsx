import { useQuery } from '@tanstack/react-query';
import { QuizCard } from '@/components/dashboard/quiz-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, BookOpen, ListChecks, Youtube, AlertTriangle, PlayCircle, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { calculatePercentage } from '@/lib/mathUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import VideoEmbed from './VideoEmbed';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RoadmapView } from '@/components/roadmap/RoadmapView';

interface Category {
  id: number;
  name: string;
  description: string;
  youtubeLink?: string | null;
}

interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  youtube_sublink?: string | null;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number | null;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
}

interface Progress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: Date | string;
}

function QuizList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [_, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [miniQuizId, setMiniQuizId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'roadmap' | 'grid'>('roadmap');
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    queryFn: async () => {
      const categories = await fetch('/api/categories').then(res => res.json());
      return categories.find((c: Category) => c.id === parseInt(categoryId));
    },
  });

  useEffect(() => {
    if (category?.youtubeLink) {
      setSelectedVideo(prev => prev ?? category.youtubeLink ?? null);
    }
  }, [category]);

  const playVideo = (youtubeLink: string) => {
    if (!youtubeLink) return;
    setSelectedVideo(youtubeLink);
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const { data: subcategories, isLoading: loadingSubcategories } = useQuery<Subcategory[]>({
    queryKey: [`/api/categories/${categoryId}/subcategories`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subcategories/by-category/${categoryId}`);
      const data = await res.json();

      return data.map((sub: Subcategory) => ({
        ...sub,
        youtube_sublink: sub.youtube_sublink?.toUpperCase() === "NULL"
          ? null
          : sub.youtube_sublink?.trim() || null
      }));
    },
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/categories/${categoryId}/quizzes`],
  });

  const { data: progress, isLoading: loadingProgress } = useQuery<Progress[]>({
    queryKey: ['/api/progress'],
  });

  const quizzesBySubcategory = Array.isArray(subcategories)
    ? subcategories.map(subcategory => ({
      ...subcategory,
      quizzes: quizzes?.filter(quiz => quiz.subcategoryId === subcategory.id) || [],
    }))
    : [];

  const getQuizProgress = (quizId: number) => {
    if (!progress) return null;
    return progress.find(p => p.quizId === quizId);
  };

  const calculateSubcategoryProgress = (subcategoryId: number) => {
    const subcategoryQuizzes = quizzes?.filter(q => q.subcategoryId === subcategoryId) || [];
    if (subcategoryQuizzes.length === 0) return 0;

    const completed = progress?.filter(p =>
      subcategoryQuizzes.some(q => q.id === p.quizId) && p.status === 'completed'
    ).length || 0;

    return (completed / subcategoryQuizzes.length) * 100;
  };

  const handleQuizAction = (quizId: number) => {
    setLocation(`/quiz/${quizId}`);
  };

  const handleTraining = (subcategoryId: number) => {
    setLocation(`/training2/${categoryId}/${subcategoryId}`);
  };

  const handleMiniStart = (quizId: number) => {
    setMiniQuizId(quizId);
  };

  const confirmMiniStart = () => {
    if (miniQuizId) {
      setLocation(`/quiz/${miniQuizId}?mode=mini`);
      setMiniQuizId(null);
    }
  };

  const isLoading = loadingCategory || loadingSubcategories || loadingQuizzes || loadingProgress;

  // Prepare Roadmap Data
  const roadmapNodes = quizzesBySubcategory.map((sub, index) => {
    const progressPercent = calculateSubcategoryProgress(sub.id);
    const isCompleted = progressPercent === 100;

    // Determine status based on previous node
    // First node is always available
    // Subsequent nodes are available if previous is completed (or at least started/some threshold)
    // For now, let's say available if previous is > 0% or if it's the first one.
    // Actually, strict unlocking: previous must be 100%? Or just accessible?
    // Let's go with: Available if previous is completed OR if it's the first one.

    let status: 'locked' | 'available' | 'completed' = 'locked';

    if (isCompleted) {
      status = 'completed';
    } else {
      const prevSub = quizzesBySubcategory[index - 1];
      const prevProgress = prevSub ? calculateSubcategoryProgress(prevSub.id) : 100;

      if (index === 0 || prevProgress >= 100) { // Unlock next if previous is fully done
        status = 'available';
      } else if (prevProgress > 0) {
        // Maybe allow parallel? For now strict.
        status = 'locked';
      }
    }

    // Override for now to make everything available for testing/UX if desired, 
    // but let's stick to the gamified logic.
    // Actually, if a user has progress in THIS node, it should be available regardless of previous.
    if (progressPercent > 0 && status === 'locked') {
      status = 'available';
    }

    return {
      id: sub.id,
      title: sub.name,
      description: sub.description,
      status,
      type: 'subcategory' as const,
      progress: progressPercent,
      onClick: () => {
        // Scroll to the section in grid view or navigate to training
        // For roadmap interaction, maybe clicking opens the training directly?
        // Or switches to grid view and scrolls?
        // Let's switch to grid view and scroll for now.
        setViewMode('grid');
        setTimeout(() => {
          document.getElementById(`subcategory-${sub.id}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
  });


  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {loadingCategory ? 'Cargando...' : category?.name}
            </h1>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10">
            <Button
              variant={viewMode === 'roadmap' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('roadmap')}
              className="gap-2"
            >
              <MapIcon className="h-4 w-4" />
              Mapa
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Lista
            </Button>
          </div>
        </div>

        {selectedVideo && (
          <div ref={videoSectionRef} className="w-full max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <VideoEmbed youtubeLink={selectedVideo} />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-8 w-1/3 rounded-lg bg-slate-800" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-40 rounded-lg bg-slate-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {viewMode === 'roadmap' ? (
              <RoadmapView
                nodes={roadmapNodes}
                title={`Ruta de Aprendizaje: ${category?.name}`}
                description={category?.description}
              />
            ) : (
              <div className="space-y-10">
                {quizzesBySubcategory.length > 0 && (
                  <section className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-blue-400" />
                      Temas de Estudio
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzesBySubcategory.map(subcategory => {
                        const progressPercentage = calculateSubcategoryProgress(subcategory.id);

                        return (
                          <Card
                            key={subcategory.id}
                            className="bg-slate-900/50 border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all group"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <CardTitle className="text-lg font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                    {subcategory.name}
                                  </CardTitle>
                                  <CardDescription className="text-sm text-slate-500">
                                    {subcategory.quizzes.length} cuestionario(s)
                                  </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                  {progressPercentage.toFixed(0)}%
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Progress
                                value={progressPercentage}
                                className="h-1.5 bg-slate-800"
                                indicatorClassName="bg-blue-500"
                              />
                              <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5em]">
                                {subcategory.description || 'Sin descripción disponible.'}
                              </p>
                              <div className="flex flex-col gap-2 pt-2">
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    onClick={() => handleTraining(subcategory.id)}
                                  >
                                    <Dumbbell className="h-4 w-4 mr-2" />
                                    Entrenar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                                    onClick={() => {
                                      document.getElementById(`subcategory-${subcategory.id}`)?.scrollIntoView({
                                        behavior: 'smooth'
                                      });
                                    }}
                                  >
                                    <ListChecks className="h-4 w-4 mr-2" />
                                    Ver Tests
                                  </Button>
                                </div>

                                {subcategory.youtube_sublink && (
                                  <Button
                                    size="sm"
                                    className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20"
                                    onClick={() => playVideo(subcategory.youtube_sublink!)}
                                  >
                                    <Youtube className="h-4 w-4 mr-2" />
                                    Ver Videos
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                )}

                {quizzesBySubcategory.map(subcategory => (
                  <section
                    key={`quizzes-${subcategory.id}`}
                    id={`subcategory-${subcategory.id}`}
                    className="bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50 flex items-center gap-4">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl">
                        <ListChecks className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {subcategory.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {subcategory.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      {subcategory.quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {subcategory.quizzes.map(quiz => {
                            const quizProgress = getQuizProgress(quiz.id);
                            const status = quizProgress?.status || 'not_started';
                            const progressPercentage = quizProgress ?
                              calculatePercentage(quizProgress.completedQuestions, quiz.totalQuestions) : 0;

                            return (
                              <QuizCard
                                key={quiz.id}
                                id={quiz.id}
                                title={quiz.title}
                                description={quiz.description}
                                questionCount={quiz.totalQuestions}
                                timeLimit={quiz.timeLimit}
                                difficulty={quiz.difficulty}
                                status={status}
                                progress={progressPercentage}
                                score={quizProgress?.score}
                                onStart={() => handleQuizAction(quiz.id)}
                                onContinue={() => handleQuizAction(quiz.id)}
                                onRetry={() => handleQuizAction(quiz.id)}
                                onMiniStart={() => handleMiniStart(quiz.id)}
                                className="bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-blue-500/20 transition-all"
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 italic">
                          No hay cuestionarios disponibles en este tema.
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={!!miniQuizId} onOpenChange={(open) => !open && setMiniQuizId(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Versión Mini del Cuestionario
              </DialogTitle>
              <DialogDescription className="space-y-4 pt-4 text-slate-300">
                <p>
                  Esta versión tiene <strong>menos preguntas</strong> y es útil si ya conoces el tema y solo quieres repasar, o si no tienes tiempo para realizar el cuestionario completo.
                </p>
                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 text-yellow-200 text-sm">
                  <p className="font-semibold mb-2">⚠️ Ten en cuenta:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
                    <li>Es una versión reducida (50% de preguntas).</li>
                    <li>Otorga un máximo de <strong>2 créditos</strong>.</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-400">
                  Te aconsejamos realizar la versión completa siempre que sea posible para asegurar un mejor aprendizaje.
                </p>
                <p className="font-medium text-white pt-2">¿Deseas continuar con la versión mini?</p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-0 mt-4">
              <Button onClick={() => setMiniQuizId(null)} className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700">
                Cancelar
              </Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={confirmMiniStart}>
                Sí, iniciar versión Mini
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default QuizList;
