import { useQuery } from '@tanstack/react-query';
import { QuizCard } from '@/components/dashboard/quiz-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, BookOpen, ListChecks, Youtube, AlertTriangle, PlayCircle, Map as MapIcon, LayoutGrid, Search, CheckCircle2, Ban } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { calculatePercentage } from '@/lib/mathUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import VideoEmbed from './VideoEmbed';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import { SkillTreeView } from '@/components/roadmap/SkillTreeView';
import { arithmeticMapNodes, ArithmeticNode } from '@/data/arithmetic-map-data';
import { algebraMapNodes } from '@/data/algebra-map-data';
import { calculusMapNodes } from '@/data/calculus-map-data';
import { useToast } from "@/hooks/use-toast";

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
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  // Determine which map nodes to use
  const currentMapNodes = categoryId === '2' ? algebraMapNodes :
    categoryId === '4' ? calculusMapNodes :
      arithmeticMapNodes;
  const initialViewMode = searchParams.get('view') as 'roadmap' | 'grid' | null;
  const { toast } = useToast();

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [miniQuizId, setMiniQuizId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'roadmap' | 'grid'>(initialViewMode || 'roadmap');
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [selectedNode, setSelectedNode] = useState<ArithmeticNode | null>(null);
  const [quizSearchQuery, setQuizSearchQuery] = useState("");
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Update view mode if URL changes (e.g. back button)
  useEffect(() => {
    const mode = searchParams.get('view') as 'roadmap' | 'grid' | null;
    if (mode && mode !== viewMode) {
      setViewMode(mode);
    }
    // Scroll to top when view changes or on mount
    window.scrollTo(0, 0);
  }, [window.location.search, viewMode]);

  // Reset quiz search when subcategory changes
  useEffect(() => {
    setQuizSearchQuery("");
  }, [selectedSubcategory]);

  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) return undefined;
      const categories = await res.json();
      if (!Array.isArray(categories)) return undefined;
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
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        return [];
      }

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
    queryKey: ['/api/progress', searchParams.get('user_id')],
    queryFn: async () => {
      const parentUserId = searchParams.get('user_id');
      const url = parentUserId ? `/api/progress?user_id=${parentUserId}` : '/api/progress';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error fetching progress');
      return res.json();
    }
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

  const calculateNodeProgress = (node: ArithmeticNode) => {
    if (!node.subcategoryId) return 0;

    // Get all quizzes in the subcategory
    // Get all quizzes in the subcategory
    let contextQuizzes = quizzes?.filter(q =>
      q.subcategoryId === node.subcategoryId ||
      (node.additionalSubcategories && node.additionalSubcategories.includes(q.subcategoryId!))
    ) || [];

    // Filter by keywords if they exist on the node
    if (node.filterKeywords && node.filterKeywords.length > 0) {
      const keywords = node.filterKeywords.map(k => k.toLowerCase());
      contextQuizzes = contextQuizzes.filter(q => {
        const titleLower = q.title.toLowerCase();
        const matchesInclude = keywords.some(k => titleLower.includes(k));

        if (!matchesInclude) return false;

        if (node.excludeKeywords && node.excludeKeywords.length > 0) {
          const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
          if (excludeKeys.some(k => titleLower.includes(k))) return false;
        }
        return true;
      });
    }

    if (contextQuizzes.length === 0) return 0; // If no quizzes match filter, technically 0% complete or maybe 100? Let's say 0 but 'available' status handles visual.

    const completed = progress?.filter(p =>
      contextQuizzes.some(q => q.id === p.quizId) && p.status === 'completed'
    ).length || 0;

    return (completed / contextQuizzes.length) * 100;
  };

  const getFilteredQuizzesForNode = (node: ArithmeticNode) => {
    // Debug: Check if quizzes exist
    if (!quizzes) return [];

    let contextQuizzes = quizzes.filter(q => {
      // Primary subcategory match (loose equality for string/number safety)
      const primaryMatch = node.subcategoryId && q.subcategoryId == node.subcategoryId;

      // Additional subcategories match
      const additionalMatch = node.additionalSubcategories &&
        q.subcategoryId &&
        node.additionalSubcategories.includes(Number(q.subcategoryId));

      return primaryMatch || additionalMatch;
    }) || [];

    // DEBUG: Log matches for problematic nodes
    if (['c0-polinomicas', 'c0-explog', 'c0-trigo'].includes(node.id)) {
      console.log(`[DEBUG NODE ${node.id}] Matches: ${contextQuizzes.length}. SubCat: ${node.subcategoryId}. Additional: ${node.additionalSubcategories?.join(',')}`);
    }

    if (node.filterKeywords && node.filterKeywords.length > 0) {
      const keywords = node.filterKeywords.map(k => k.toLowerCase());
      contextQuizzes = contextQuizzes.filter(q => {
        const titleLower = q.title.toLowerCase();
        const matchesInclude = keywords.some(k => titleLower.includes(k));

        if (!matchesInclude) return false;

        // Check exclusions if they exist
        if (node.excludeKeywords && node.excludeKeywords.length > 0) {
          const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
          const matchesExclude = excludeKeys.some(k => titleLower.includes(k));
          if (matchesExclude) return false;
        }

        return true;
      });
    }

    // Fallback: If no subcategory rules exist, return empty (standard node behavior)
    if (!node.subcategoryId && (!node.additionalSubcategories || node.additionalSubcategories.length === 0)) return [];

    return contextQuizzes;
  };

  const calculateSubcategoryProgress = (subcategoryId: number) => {
    const subcategoryQuizzes = quizzes?.filter(q => q.subcategoryId == subcategoryId) || [];
    if (subcategoryQuizzes.length === 0) return 0;

    const completed = progress?.filter(p =>
      subcategoryQuizzes.some(q => q.id === p.quizId) && p.status === 'completed'
    ).length || 0;

    return (completed / subcategoryQuizzes.length) * 100;
  };

  const handleQuizAction = (quizId: number) => {
    const parentUserId = searchParams.get('user_id');
    const modeParam = parentUserId ? '?mode=readonly' : '';
    setLocation(`/quiz/${quizId}${modeParam}`);
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

    let status: 'locked' | 'available' | 'completed' = 'locked';

    if (isCompleted) {
      status = 'completed';
    } else {
      const prevSub = quizzesBySubcategory[index - 1];
      const prevProgress = prevSub ? calculateSubcategoryProgress(prevSub.id) : 100;

      if (index === 0 || prevProgress >= 100) {
        status = 'available';
      } else if (prevProgress > 0) {
        status = 'locked';
      }
    }

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
        setSelectedSubcategory(sub);
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
      </div>

      {/* Only show video in Grid mode */}
      {viewMode === 'grid' && selectedVideo && (
        <div ref={videoSectionRef} className="w-full max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
          <VideoEmbed youtubeLink={selectedVideo} />
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            <MapIcon className="absolute inset-0 m-auto h-8 w-8 text-blue-400 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">Cargando Mapa...</h3>
            <p className="text-slate-400">Preparando tu camino de aprendizaje</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'roadmap' ? (
            (categoryId === '1' || categoryId === '2' || categoryId === '4') ? (
              <SkillTreeView
                nodes={currentMapNodes}
                allQuizzes={quizzes}
                title={`Mapa de Habilidades: ${category?.name}`}
                description={(() => {
                  if (categoryId === '1') return "Un árbol de conocimiento diseñado para dominar la aritmética paso a paso.";
                  if (categoryId === '2') return "Explora el álgebra desde sus fundamentos hasta el dominio de funciones.";
                  if (categoryId === '4') return "Domina el cálculo diferencial: límites, derivadas y sus aplicaciones.";
                  return "";
                })()}
                progressMap={(() => {
                  const map: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'> = {};

                  // Pass 1: Intrinsic Status
                  currentMapNodes.forEach(node => {
                    const filteredQuizzes = getFilteredQuizzesForNode(node);
                    if (filteredQuizzes.length > 0) {
                      const pct = calculateNodeProgress(node);
                      if (pct === 100) map[node.id] = 'completed';
                      else if (pct > 0) map[node.id] = 'in_progress';
                      else map[node.id] = 'available'; // Content exists but 0% progress -> Available to play!
                    } else if (node.behavior !== 'container') {
                      map[node.id] = 'locked'; // Empty content -> locked
                    }
                  });

                  // Pass 2: Unlock Logic (Explorative Mode: No blocking)
                  // Sort by level to ensure parents processed first
                  const sortedNodes = [...currentMapNodes].sort((a, b) => a.level - b.level);

                  sortedNodes.forEach(node => {
                    if (map[node.id] === 'completed' || map[node.id] === 'in_progress') return;

                    // In Explorative Mode, we ignore prerequisites for access. 
                    // We only check if content exists.
                    const hasContent = getFilteredQuizzesForNode(node).length > 0;

                    if (node.behavior === 'container') {
                      // Container status is determined by children in Pass 3
                      map[node.id] = 'available';
                    } else {
                      // Content nodes are available if they have content, otherwise locked
                      map[node.id] = hasContent ? 'available' : 'locked';
                    }
                  });

                  // Pass 3: Container Aggregation (Bottom-Up Logic)
                  // If container, check children. If all children green -> parent green.
                  currentMapNodes.filter(n => n.behavior === 'container').forEach(container => {
                    // Note: We intentionally do NOT check if container is locked here. 
                    // If it has active children, it should UNLOCK and show Play.

                    const children = currentMapNodes.filter(n => n.requires.includes(container.id));
                    const hasContent = getFilteredQuizzesForNode(container).length > 0;

                    // Intrinsic Status
                    const intrinsicDone = hasContent ? map[container.id] === 'completed' : true;

                    if (children.length === 0) {
                      if (!hasContent) map[container.id] = 'locked'; // Empty container
                      return;
                    }

                    const allChildrenCompleted = children.every(c => map[c.id] === 'completed');
                    const anyChildActive = children.some(c => map[c.id] !== 'locked');

                    if (allChildrenCompleted && intrinsicDone) {
                      map[container.id] = 'completed';
                    } else if (anyChildActive || (hasContent && map[container.id] !== 'locked')) {
                      map[container.id] = 'available'; // Play icon
                    } else {
                      map[container.id] = 'locked';
                    }
                  });

                  return map;
                })()}
                onNodeClick={(node) => {
                  if (node.subcategoryId) {
                    // Find the actual subcategory object
                    const sub = quizzesBySubcategory.find(s => s.id === node.subcategoryId);
                    if (sub) {
                      setSelectedSubcategory(sub);
                      setSelectedNode(node);
                    } else {
                      toast({
                        title: "Sección no disponible",
                        description: "Esta sección aún no tiene contenido vinculado.",
                        variant: "destructive"
                      });
                    }
                  } else {
                    toast({
                      title: "Próximamente",
                      description: "Estamos trabajando en el contenido para este módulo.",
                    });
                  }
                }}
              />
            ) : (
              <RoadmapView
                nodes={roadmapNodes}
                title={`Camino al Éxito: ${category?.name}`}
                description="Cada paso que das te acerca más a dominar la materia. ¡Sigue avanzando, completa los desafíos y construye tu conocimiento paso a paso!"
              />
            )
          ) : (
            <div className="space-y-10">
              {quizzesBySubcategory.length > 0 && (
                <section className="space-y-8">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-blue-400" />
                    Tus Materias
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzesBySubcategory.map(subcategory => {
                      const progressPercentage = calculateSubcategoryProgress(subcategory.id);

                      return (
                        <Card
                          key={subcategory.id}
                          className="bg-slate-900/80 border-slate-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <CardTitle className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
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
                            {/* Custom Gradient Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>

                            <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5em]">
                              {subcategory.description || 'Sin descripción disponible.'}
                            </p>
                            <div className="flex flex-col gap-2 pt-2">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/20 border-0 transition-all duration-300"
                                  onClick={() => handleTraining(subcategory.id)}
                                >
                                  <Dumbbell className="h-4 w-4 mr-2" />
                                  Entrenar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
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
                                  className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-all duration-300"
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

      {/* Subcategory/Node Details Dialog */}
      <Dialog open={!!selectedSubcategory} onOpenChange={(open) => {
        if (!open) {
          setSelectedSubcategory(null);
          setSelectedNode(null);
        }
      }}>
        <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ListChecks className="h-6 w-6 text-blue-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {selectedNode ? selectedNode.label : selectedSubcategory?.name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400">
              {selectedNode ? selectedNode.description : selectedSubcategory?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedSubcategory && (
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder={`Buscar en ${selectedSubcategory.name}...`}
                    value={quizSearchQuery}
                    onChange={(e) => setQuizSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50 h-9 text-sm"
                  />
                </div>

                {(() => {
                  let quizzesForSub = [];

                  if (selectedNode) {
                    quizzesForSub = quizzes?.filter(q =>
                      q.subcategoryId == selectedNode.subcategoryId ||
                      (selectedNode.additionalSubcategories && selectedNode.additionalSubcategories.includes(q.subcategoryId!))
                    ) || [];
                  } else {
                    quizzesForSub = selectedSubcategory.quizzes || [];
                  }

                  // Apply Node-based Keyword Filtering if available
                  if (selectedNode && selectedNode.filterKeywords && selectedNode.filterKeywords.length > 0) {
                    const keywords = selectedNode.filterKeywords.map((k: string) => k.toLowerCase());
                    quizzesForSub = quizzesForSub.filter((q: Quiz) =>
                      keywords.some((k: string) => q.title.toLowerCase().includes(k))
                    );

                    // Apply Node-based Exclusion Filtering if available
                    if (selectedNode.excludeKeywords && selectedNode.excludeKeywords.length > 0) {
                      const excludeKeys = selectedNode.excludeKeywords.map((k: string) => k.toLowerCase());
                      quizzesForSub = quizzesForSub.filter((q: Quiz) =>
                        !excludeKeys.some((k: string) => q.title.toLowerCase().includes(k))
                      );
                    }
                  }

                  // Apply standard search filter
                  quizzesForSub = quizzesForSub.filter((q: Quiz) =>
                    q.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
                  );

                  if (quizzesForSub.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500">
                        <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay cuestionarios disponibles.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {quizzesForSub.map((quiz: Quiz) => {
                        const quizProgress = getQuizProgress(quiz.id);
                        const isCompleted = quizProgress?.status === 'completed';

                        return (
                          <div key={quiz.id} className="group flex flex-col gap-3 p-4 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-blue-500/30 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-slate-200 line-clamp-2">{quiz.title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${quiz.difficulty === 'Fácil' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                quiz.difficulty === 'Medio' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                  'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {quiz.difficulty}
                              </span>

                              <div className="flex gap-2">
                                {!isCompleted && !searchParams.get('user_id') && (
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                                    onClick={(e) => handleMiniStart(quiz.id)}
                                  >
                                    Mini
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className={`h-7 px-3 text-xs font-medium ${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                  onClick={() => {
                                    if (isCompleted && quizProgress) {
                                      // Ensure user_id is passed if present
                                      const parentUserId = searchParams.get('user_id');
                                      const resultUrl = `/results/${quizProgress.id}${parentUserId ? `?user_id=${parentUserId}` : ''}`;
                                      setLocation(resultUrl);
                                    } else {
                                      handleQuizAction(quiz.id);
                                    }
                                  }}
                                >
                                  {isCompleted ? 'Ver Resultados' : 'Comenzar'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
  );
}

export default QuizList;
