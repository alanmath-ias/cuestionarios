import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Category } from "@/types/types";
import { UserQuiz } from "@/types/types";
import {
  BookOpen,
  ListChecks,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
  MessageCircle,
  AlertTriangle,
  Youtube,
  ExternalLink,
  Instagram,
  ShoppingBag,
  X,
  PlayCircle,
  Trophy,
  Target,
  Globe,
  BarChart3,
  Lightbulb,
  HelpCircle
} from "lucide-react";
import { startDashboardTour } from "@/lib/tour";
import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import VideoEmbed from './VideoEmbed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ContentRenderer } from "@/components/ContentRenderer";

interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
  url?: string | null;
}

async function fetchCurrentUser() {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo obtener el usuario");
  return response.json();
}

async function fetchCategories() {
  const response = await fetch("/api/user/categories", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al obtener materias");
  return response.json();
}

async function fetchQuizzes() {
  try {
    const response = await fetch("/api/user/quizzes", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al obtener cuestionarios");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en fetchQuizzes:", error);
    throw error;
  }
}

async function fetchAlerts() {
  const res = await fetch("/api/user/alerts", { credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener alertas");
  return res.json();
}

async function fetchQuizFeedback(progressId: string) {
  if (!progressId) return null;
  const res = await fetch(`/api/quiz-feedback/${progressId}`);
  if (!res.ok) return null;
  return res.json();
}

// --- Components ---

function PromoBanner({
  title,
  subtitle,
  icon: Icon,
  colorClass,
  bgImage,
  href,
  buttonText,
  compact = false
}: {
  title: string,
  subtitle: string,
  icon: any,
  colorClass: string,
  bgImage?: string,
  href: string,
  buttonText: string,
  compact?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between w-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${colorClass} ${compact ? 'h-[140px] min-h-[140px]' : 'h-full min-h-[160px]'}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-0" />}

      <div className="relative z-10 flex justify-between items-start">
        <div className={`p-2 rounded-full ${bgImage ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-white/80'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${bgImage ? 'text-white' : ''}`} />
      </div>

      <div className="relative z-10 mt-2">
        <h3 className={`text-lg font-bold mb-0.5 leading-tight ${bgImage ? 'text-white' : ''}`}>{title}</h3>
        <p className={`text-xs font-medium mb-2 ${bgImage ? 'text-white/90' : 'opacity-80'}`}>{subtitle}</p>
        <div className={`inline-flex items-center text-xs font-bold ${bgImage ? 'text-white' : ''}`}>
          {buttonText} <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </a>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  progress,
  total,
  completed,
  breakdown
}: {
  title: string,
  value: string,
  subtitle: string,
  icon: any,
  colorClass: string,
  progress?: number,
  total?: number,
  completed?: number,
  breakdown?: Record<string, number>
}) {
  return (
    <div className={`rounded-3xl p-5 flex flex-col h-full ${colorClass} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
        <Icon className="w-32 h-32" />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="font-semibold opacity-80 text-sm">{title}</span>
        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 mb-4">
        <div className="flex items-baseline gap-1 mb-1">
          <div className="text-4xl font-bold">{value}</div>
        </div>
        <div className="text-xs font-medium opacity-70 uppercase tracking-wide mb-3">{subtitle}</div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-current opacity-80 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
            </div>
            {total !== undefined && completed !== undefined && (
              <div className="flex justify-between text-xs font-medium opacity-80">
                <span>{completed} completadas</span>
                <span>{total} total</span>
              </div>
            )}
          </div>
        )}
      </div>

      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="relative z-10 mt-auto pt-4 border-t border-white/20">
          <p className="text-xs font-bold mb-2 opacity-90 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Por Área:
          </p>
          <div className="space-y-1.5">
            {Object.entries(breakdown).slice(0, 4).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center text-xs">
                <span className="opacity-80 truncate max-w-[120px]">{name}</span>
                <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ quiz, onClick }: { quiz: QuizWithFeedback, onClick: (quiz: QuizWithFeedback) => void }) {
  return (
    <div
      onClick={() => onClick(quiz)}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
    >
      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate text-gray-900">{quiz.title}</h4>
        <p className="text-xs text-gray-500 truncate">{quiz.difficulty} • {new Date(quiz.completedAt || '').toLocaleDateString()}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="block text-sm font-bold text-green-700">{(quiz.score || 0)}/10</span>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600" />
    </div>
  );
}



export default function UserDashboard() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithFeedback | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [miniQuizId, setMiniQuizId] = useState<number | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const playVideo = (youtubeLink: string) => {
    if (!youtubeLink) return;
    setSelectedVideo(youtubeLink);
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const queryOptions = {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60,
  };

  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    ...queryOptions,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["user-categories"],
    queryFn: fetchCategories,
    ...queryOptions,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithFeedback[]>({
    queryKey: ["user-quizzes"],
    queryFn: fetchQuizzes,
    ...queryOptions,
  });

  const { data: alerts } = useQuery({
    queryKey: ["user-alerts"],
    queryFn: fetchAlerts,
    ...queryOptions,
  });

  // Fetch feedback for selected quiz
  const { data: feedbackData, isLoading: loadingFeedback } = useQuery({
    queryKey: ['quiz-feedback', selectedQuiz?.progressId],
    queryFn: () => selectedQuiz?.progressId ? fetchQuizFeedback(selectedQuiz.progressId) : null,
    enabled: !!selectedQuiz?.progressId
  });

  // Fetch Math Tip
  const { data: mathTipData } = useQuery({
    queryKey: ["math-tip"],
    queryFn: async () => {
      const res = await fetch("/api/user/math-tip");
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('mathTipLastShown');

    if (mathTipData?.tip && lastShown !== today) {
      const timer = setTimeout(() => {
        toast({
          title: "💡 Tip Matemático",
          description: <ContentRenderer content={mathTipData.tip} className="text-white/90 text-lg font-medium text-center mt-2" />,
          duration: 10000,
          className: "w-80 h-auto aspect-[4/3] flex flex-col justify-center items-center bg-indigo-600 text-white border-none shadow-2xl rounded-2xl p-6"
        });
        localStorage.setItem('mathTipLastShown', today);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [mathTipData, toast]);

  const isLoading = loadingUser || loadingCategories || loadingQuizzes;

  // Auto-start tour for new users
  useEffect(() => {
    if (!isLoading && currentUser?.id && !currentUser.tourStatus?.dashboard) {
      setTimeout(() => {
        startDashboardTour();
        // Update DB
        fetch('/api/user/tour-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourType: 'dashboard' })
        }).then(res => {
          if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
          }
        });
      }, 1000);
    }
  }, [isLoading, currentUser, queryClient]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedVideo) {
      const categoriesWithVideo = categories.filter(cat =>
        cat.youtubeLink &&
        cat.youtubeLink !== 'NULL' &&
        cat.youtubeLink.trim() !== ''
      );
      if (categoriesWithVideo.length > 0) {
        const randomCategory = categoriesWithVideo[Math.floor(Math.random() * categoriesWithVideo.length)];
        setSelectedVideo(randomCategory.youtubeLink!);
      }
    }
  }, [categories, selectedVideo]);

  const [_, setLocation] = useLocation();

  const handleMiniStart = (e: React.MouseEvent, quizId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setMiniQuizId(quizId);
  };

  const confirmMiniStart = () => {
    if (miniQuizId) {
      setLocation(`/quiz/${miniQuizId}?mode=mini`);
      setMiniQuizId(null);
      setShowPendingDialog(false); // Close pending dialog if open
    }
  };

  if (loadingUser || loadingCategories || loadingQuizzes) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner className="h-12 w-12" /></div>;
  }

  const completedQuizzes = quizzes?.filter((q) => q.status === "completed") || [];
  const allPendingQuizzes = quizzes?.filter((q) => q.status !== "completed") || [];
  const pendingQuizzes = allPendingQuizzes.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) return acc.concat([current]);
    return acc;
  }, [] as QuizWithFeedback[]);

  const progressPercentage = quizzes && quizzes.length > 0 ? (completedQuizzes.length / quizzes.length) * 100 : 0;
  const sortedCompletedQuizzes = [...completedQuizzes].sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  // Filter out duplicates, keeping only the most recent one per quizId
  const uniqueCompletedQuizzes = sortedCompletedQuizzes.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as QuizWithFeedback[]);

  // Calculate breakdown by category
  const categoryBreakdown = completedQuizzes.reduce((acc, quiz) => {
    const catName = categories?.find(c => c.id === quiz.categoryId)?.name || 'Otros';
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-8">
      {/* Header Section */}
      <div id="tour-welcome" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Hola, <span className="text-indigo-600">{currentUser?.username || 'Estudiante'}</span> 👋
            </h1>
          </div>
          <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu progreso hoy.</p>
          <div className="mt-2 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
            <Lightbulb className="w-4 h-4 mr-2" />
            {currentUser?.hintCredits ?? 0} Créditos de Pistas
          </div>
        </div>



        {/* Alert Section */}
        {pendingQuizzes.length > 0 && (
          <div
            onClick={() => setShowPendingDialog(true)}
            className="animate-pulse flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-200 shadow-sm cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">Tienes {pendingQuizzes.length} actividades pendientes</span>
          </div>
        )}
      </div>

      {/* Main Layout: 2 Columns (Content | Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Recent Activity */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5 h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-500" /> Actividad Reciente
              </h3>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  Ver todo
                </Button>
              </Link>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="space-y-2">
                {uniqueCompletedQuizzes.length > 0 ? (
                  uniqueCompletedQuizzes.slice(0, 5).map((quiz) => (
                    <ActivityItem key={quiz.id} quiz={quiz} onClick={setSelectedQuiz} />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                    <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Aún no has completado cuestionarios</p>
                    <Link href="/training">
                      <Button variant="link" className="text-indigo-600 mt-2">Comenzar ahora</Button>
                    </Link>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 2. Video Section */}
          {selectedVideo && (
            <div ref={videoSectionRef} className="w-full bg-black rounded-3xl overflow-hidden shadow-lg relative animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <VideoEmbed youtubeLink={selectedVideo} />
            </div>
          )}

          {/* 3. Pending Activities (Yellow, Play Icon) */}
          <div id="tour-pending" className="rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 p-5 h-[300px] flex flex-col border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-yellow-900 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-orange-600" /> Actividades Pendientes ({pendingQuizzes.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100"
                onClick={() => setShowPendingDialog(true)}
              >
                Ver todo
              </Button>
            </div>
            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="space-y-2">
                {pendingQuizzes.length > 0 ? (
                  pendingQuizzes.map((quiz) => (
                    <div key={quiz.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-yellow-100/50 hover:border-yellow-200 transition-all">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <PlayCircle className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-gray-900">{quiz.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{quiz.difficulty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={(e) => handleMiniStart(e, quiz.id)}
                        >
                          Mini
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-none shadow-sm"
                          onClick={() => setLocation(`/quiz/${quiz.id}`)}
                        >
                          Normal
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                    <CheckCircle2 className="w-12 h-12 mb-2 opacity-20 text-green-500" />
                    <p className="text-sm">¡Todo al día! No tienes actividades pendientes.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 4. Materias Disponibles (White) */}
          <div id="tour-quiz-list" className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5 h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Materias Disponibles
              </h3>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories?.map((category) => (
                  <div key={category.id} className="group bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 flex flex-col justify-between h-full min-h-[100px]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {category.youtubeLink && (
                        <button
                          onClick={() => playVideo(category.youtubeLink!)}
                          className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                          <Youtube className="w-3 h-3" /> Video
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-700 transition-colors mb-2">{category.name}</h4>
                      <Link href={`/training/${category.id}`} className="w-full">
                        <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                          Entrenamiento
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <div id="tour-stats" className="h-auto min-h-[220px]">
            <StatCard
              title="Progreso General"
              value={`${progressPercentage.toFixed(0)}%`}
              subtitle="Completado"
              icon={Trophy}
              colorClass="bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              progress={progressPercentage}
              total={quizzes?.length || 0}
              completed={completedQuizzes.length}
              breakdown={categoryBreakdown}
            />
          </div>

          {/* Promo Banners */}
          <PromoBanner
            title="Síguenos"
            subtitle="@alanmath.ias"
            icon={Instagram}
            colorClass="bg-gradient-to-br from-purple-600 to-pink-500 text-white"
            href="https://www.instagram.com/alanmath.ias/"
            buttonText="Ver perfil"
            compact={true}
          />

          <PromoBanner
            title="eBook Exclusivo"
            subtitle="Movimiento Parabólico"
            icon={ShoppingBag}
            colorClass="bg-orange-500 text-white"
            bgImage="https://imagenes.alanmath.com/ebook-cover-placeholder.jpg"
            href="https://alanmatiasvilla1000.hotmart.host/el-fascinante-movimiento-parabolico-guia-practica-de-alanmath-f1416e10-f1d2-49ac-aa29-2e8318b2fea4"
            buttonText="Ver eBook"
            compact={true}
          />

          <PromoBanner
            title="Sitio Web"
            subtitle="alanmath.com"
            icon={Globe}
            colorClass="bg-blue-600 text-white"
            href="https://alanmath.com/"
            buttonText="Visitar"
            compact={true}
          />
        </div>
      </div>

      {/* Quiz Details Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {selectedQuiz?.title}
            </DialogTitle>
            <DialogDescription>
              Completado el {selectedQuiz?.completedAt ? new Date(selectedQuiz.completedAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase">Puntaje</p>
                <p className="text-xl font-bold text-gray-900">{((selectedQuiz?.score || 0)).toFixed(1)}/10</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase">Tiempo</p>
                <p className="text-xl font-bold text-gray-900">{selectedQuiz?.timeSpent || 0}m</p>
              </div>
            </div>

            {loadingFeedback ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : feedbackData?.feedback ? (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Feedback de AlanMath
                </h4>
                <p className="text-sm text-purple-800 whitespace-pre-wrap">{feedbackData.feedback}</p>
              </div>
            ) : (
              <p className="text-sm text-center text-gray-500 italic">Sin feedback disponible aún.</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setSelectedQuiz(null)}>Cerrar</Button>
            <Link href={`/results/${selectedQuiz?.progressId}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Ver Detalles Completos</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Activities Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-800">
              <PlayCircle className="w-6 h-6 text-orange-600" />
              Actividades Pendientes ({pendingQuizzes.length})
            </DialogTitle>
            <DialogDescription>
              Aquí tienes la lista completa de cuestionarios que aún no has completado.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {pendingQuizzes.length > 0 ? (
                pendingQuizzes.map((quiz) => (
                  <div key={quiz.id} className="group flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100 hover:border-yellow-200 transition-all">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <PlayCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900">{quiz.title}</h4>
                      <p className="text-xs text-gray-600">{quiz.difficulty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={(e) => handleMiniStart(e, quiz.id)}
                      >
                        Mini
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm"
                        onClick={() => setLocation(`/quiz/${quiz.id}`)}
                      >
                        Normal
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 text-gray-400">
                  <CheckCircle2 className="w-16 h-16 mb-4 opacity-20 text-green-500" />
                  <p className="text-lg font-medium text-gray-600">¡Todo al día!</p>
                  <p className="text-sm">No tienes actividades pendientes por ahora.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowPendingDialog(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mini Quiz Confirmation Dialog */}
      <Dialog open={!!miniQuizId} onOpenChange={(open) => !open && setMiniQuizId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Versión Mini del Cuestionario
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Estás a punto de iniciar una <strong>versión reducida (50%)</strong> de este cuestionario con preguntas al azar.
              </p>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-sm">
                <p className="font-semibold mb-1">⚠️ Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Esta versión es ideal para repasos rápidos.</li>
                  <li>Ganarás <strong>menos créditos</strong> que en la versión completa.</li>
                  <li>Si tienes tiempo, te recomendamos hacer la versión completa.</li>
                </ul>
              </div>
              <p>¿Deseas continuar con la versión mini?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMiniQuizId(null)}>
              Cancelar, haré la completa
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmMiniStart}>
              Sí, iniciar versión Mini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
