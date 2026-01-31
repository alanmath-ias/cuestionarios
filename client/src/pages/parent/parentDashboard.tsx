import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Category, UserQuiz } from "@/types/types";
import {
  BookOpen,
  ListChecks,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Youtube,
  Map as MapIcon,
  Gamepad2,
  X,
  Trophy,
  Globe,
  ShoppingBag,
  ArrowRight,
  Target,
  XCircle,
  Instagram,
  BarChart3,
  ExternalLink,
  ArrowLeft,
  Search,
  Ban,
  Clock,
  Flame,
  Star,
  Book
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useParams } from "wouter";
import { useEffect, useState, useRef, useMemo } from "react";
import VideoEmbed from "../VideoEmbed"; // Relative import since both are in src/pages (parent is subdir)
import { QuizDetailsDialog } from "@/components/dialogs/QuizDetailsDialog";
import { OnboardingTour } from "@/components/dialogs/OnboardingTour";
import { startParentDashboardTour } from "@/lib/tour";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// --- Types ---
interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
  feedback?: string;
  userStatus?: string;
  subcategoryId?: number;
}

// --- Data Fetching ---
async function fetchParentChild() {
  const response = await fetch("/api/parent/child", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo obtener el hijo asociado");
  return response.json();
}

async function fetchChildCategories(childId: string) {
  const response = await fetch(`/api/user/categories?user_id=${childId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Error al obtener materias del hijo");
  return response.json();
}

async function fetchChildQuizzes(childId: string) {
  const response = await fetch(`/api/user/quizzes?user_id=${childId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Error al obtener cuestionarios del hijo");
  return response.json();
}

async function fetchChildAlerts(childId: string) {
  const res = await fetch(`/api/user/alerts?user_id=${childId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener alertas del hijo");
  return res.json();
}

async function fetchAuthenticatedUser() {
  const response = await fetch("/api/user", { credentials: "include" });
  if (!response.ok) throw new Error("No se pudo obtener el usuario");
  return response.json();
}

// --- Local Components (Copied from Dashboard to avoid modifying shared files) ---

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
      {bgImage && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/50 transition-colors z-0" />}

      <div className="relative z-10 flex justify-between items-start">
        <div className={`p-2 rounded-full ${bgImage ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-white/20 backdrop-blur-sm text-white'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white`} />
      </div>

      <div className="relative z-10 mt-2">
        <h3 className={`text-lg font-bold mb-0.5 leading-tight text-white`}>{title}</h3>
        <p className={`text-xs font-medium mb-2 text-white/90`}>{subtitle}</p>
        <div className={`inline-flex items-center text-xs font-bold text-white`}>
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

      {breakdown && Object.keys(breakdown).length > 0 && typeof breakdown === 'object' && ( // Added type check safety
        <div className="relative z-10 mt-auto pt-4 border-t border-white/20">
          <p className="text-xs font-bold mb-2 opacity-90 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Por Área:
          </p>
          <div className="space-y-1.5">
            {Object.entries(breakdown).slice(0, 4).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center text-xs">
                <span className="opacity-80 truncate max-w-[120px]">{name}</span>
                <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ quiz, onClick }: { quiz: QuizWithFeedback; onClick: (quiz: QuizWithFeedback) => void }) {
  const hasFeedback = !!quiz.reviewed || !!quiz.feedback;

  return (
    <div
      onClick={() => onClick(quiz)}
      className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] ${hasFeedback
        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
        : "bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30"
        }`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${hasFeedback ? "bg-emerald-500/20 text-emerald-400" : "bg-green-500/20 text-green-400"
        }`}>
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-slate-200 truncate">{quiz.title}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{quiz.difficulty}</span>
          {quiz.score !== undefined && (
            <span className={quiz.score >= 70 ? "text-green-400" : "text-yellow-400"}>
              • {quiz.score !== undefined ? Number(quiz.score).toFixed(1) : '-'} / 10
            </span>
          )}
        </div>
      </div>
      {(quiz.reviewed || hasFeedback) && (
        <div className="bg-emerald-500/20 px-2 py-1 rounded text-[10px] text-emerald-300 border border-emerald-500/30">
          Feedback
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function ParentDashboard() {
  const queryClient = useQueryClient();
  const params = useParams();
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithFeedback | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false);
  const [isRecentDialogOpen, setIsRecentDialogOpen] = useState(false);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [quizSearchQuery, setQuizSearchQuery] = useState("");

  const queryOptions = {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60,
  };

  const { data: currentUser } = useQuery({
    queryKey: ["authenticated-user"],
    queryFn: fetchAuthenticatedUser,
  });

  const { data: parentChild } = useQuery({
    queryKey: ["parent-child"],
    queryFn: fetchParentChild,
    ...queryOptions,
  });

  // Use child ID if available
  const childId = parentChild?.child_id || params.childId;

  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["child-categories", childId],
    queryFn: () => fetchChildCategories(childId),
    enabled: !!childId,
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithFeedback[]>({
    queryKey: ["child-quizzes", childId],
    queryFn: () => fetchChildQuizzes(childId),
    enabled: !!childId,
  });

  const { data: alerts } = useQuery({
    queryKey: ["child-alerts", childId],
    queryFn: () => fetchChildAlerts(childId),
    enabled: !!childId,
  });

  // Fetch Subcategories for selected category
  const { data: categorySubcategories, isLoading: loadingSubcategories } = useQuery<any[]>({
    queryKey: ["category-subcategories", selectedCategoryForDetails?.id],
    queryFn: async () => {
      if (!selectedCategoryForDetails) return [];
      const res = await fetch(`/api/admin/subcategories/by-category/${selectedCategoryForDetails.id}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedCategoryForDetails,
  });

  // Filter quizzes for the selected category (using existing quizzes data)
  const categoryQuizzes = useMemo<QuizWithFeedback[]>(() => {
    if (!selectedCategoryForDetails || !quizzes) return [];
    return quizzes.filter(q => Number(q.categoryId) === Number(selectedCategoryForDetails.id));
  }, [selectedCategoryForDetails, quizzes]);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategoryForDetails(category);
    setSelectedSubcategory(null);
    setCategorySearchQuery("");
  };

  const handleSubcategorySelect = (subcategory: any | null) => {
    setSelectedSubcategory(subcategory);
    setQuizSearchQuery("");
  };

  // Effect to select the first video by default when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedVideo) {
      // Find first category with a video
      const categoryWithVideo = categories.find(c => c.youtubeLink);
      if (categoryWithVideo && categoryWithVideo.youtubeLink) {
        setSelectedVideo(categoryWithVideo.youtubeLink);
      }
    }
  }, [categories, selectedVideo]);

  const completedQuizzes: QuizWithFeedback[] = quizzes?.filter((q: any) => q.userStatus === 'completed') || [];
  const pendingQuizzes: QuizWithFeedback[] = quizzes?.filter((q: any) => q.userStatus === 'pending') || [];

  // Dedup completed quizzes
  const uniqueCompletedQuizzes = Array.from(new Map(completedQuizzes.map(item => [item.id, item])).values())
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  const progressPercentage = quizzes && quizzes.length > 0
    ? (completedQuizzes.length / quizzes.length) * 100
    : 0;

  const categoryBreakdown = categories?.reduce((acc, cat) => {
    const catQuizzes = quizzes?.filter(q => q.categoryId === cat.id) || [];
    const completed = catQuizzes.filter(q => q.userStatus === "completed").length;
    acc[cat.name] = completed;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleCreateVideo = (link: string) => {
    setSelectedVideo(link);
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleViewResults = (quiz: QuizWithFeedback) => {
    setSelectedQuiz(quiz);
  };

  if (loadingCategories || loadingQuizzes) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  // Also check if child info is loading to avoid false negative
  if (parentChild === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!childId) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Hola {currentUser?.name}</h1>
        <p className="text-muted-foreground">No se ha identificado un estudiante asociado a tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8" id="tour-parent-welcome">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Hola, {currentUser?.name}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Estás viendo el progreso de <span className="font-bold text-indigo-500">{parentChild?.child_name || 'tu hijo'}</span>
          </p>
        </div>

        {alerts?.hasPendingTasks && (
          <div
            onClick={() => setIsPendingDialogOpen(true)}
            className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium flex items-center gap-2 border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Tareas pendientes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* 1. Actividad Reciente */}
          <div id="tour-parent-recent" className="rounded-3xl bg-slate-900/50 border border-emerald-500/20 backdrop-blur-sm shadow-lg shadow-emerald-900/20 p-5 h-[320px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-emerald-500/20" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-emerald-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-400" /> Actividad Reciente (Estudiante)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
                onClick={() => setIsRecentDialogOpen(true)}
              >
                Ver todo
              </Button>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="space-y-2">
                {uniqueCompletedQuizzes.length > 0 ? (
                  uniqueCompletedQuizzes.slice(0, 5).map((quiz) => (
                    <ActivityItem
                      key={quiz.id + "-activity"}
                      quiz={quiz}
                      onClick={(q) => handleViewResults(q)}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Aún no ha completado cuestionarios.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Video Player */}
          {selectedVideo && (
            <div ref={videoSectionRef} className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/20 relative animate-in fade-in slide-in-from-top-4 duration-500 border border-white/10">
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

          {/* 2. Pendientes (Read Only) */}
          <div id="tour-parent-pending" className="rounded-3xl bg-slate-900/50 border border-yellow-500/20 backdrop-blur-sm p-5 h-[320px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-yellow-500 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" /> Actividades Pendientes ({pendingQuizzes.length})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">
                  Solo Lectura
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 text-xs"
                  onClick={() => setIsPendingDialogOpen(true)}
                >
                  Ver todo
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="space-y-2">
                {pendingQuizzes.length > 0 ? (
                  pendingQuizzes.map((quiz) => (
                    <div key={quiz.id + "-pending"} className="group flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-yellow-500/30">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <PlayCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-200 line-clamp-2">{quiz.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{quiz.difficulty}</p>
                        </div>
                      </div>

                      <div className="flex items-center ml-auto gap-2">
                        <Button
                          size="sm"
                          className="h-8 md:h-9 px-4 text-xs md:text-sm bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-sm w-full md:w-auto mt-2 md:mt-0"
                          onClick={() => setLocation(`/quiz/${quiz.id}?mode=readonly`)}
                        >
                          Ver (Solo Lectura)
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mb-2 opacity-20 text-green-500" />
                    <p className="text-sm">¡Todo al día!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 3. Materias (Restricted) */}
          <div id="tour-parent-subjects" className="relative rounded-3xl bg-slate-900/50 border border-rose-500/20 backdrop-blur-sm shadow-lg shadow-rose-900/20 p-5 h-[320px] flex flex-col overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-rose-600/20 rounded-full blur-[80px] -z-10 opacity-60" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px] -z-10" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-400" /> Materias del Estudiante
              </h3>
            </div>

            <ScrollArea className="flex-1 -mr-3 pr-3">
              <div className="space-y-3">
                {categories?.map((category) => (
                  <div
                    key={category.id + "-cat"}
                    className="group relative overflow-hidden rounded-xl border transition-all duration-300 bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-rose-500/30 hover:shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)] max-w-full"
                  >
                    <div className="flex flex-col md:flex-row md:items-center p-3 gap-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-transform group-hover:scale-105 bg-rose-500/10 text-rose-400">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-base truncate text-slate-200 group-hover:text-rose-200">
                            {category.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 md:mt-0 overflow-x-auto pb-1 md:pb-0 no-scrollbar max-w-full">
                        {category.youtubeLink && (
                          <button
                            onClick={() => handleCreateVideo(category.youtubeLink!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-xs font-medium whitespace-nowrap"
                            title="Ver Videos"
                          >
                            <Youtube className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Videos</span>
                          </button>
                        )}
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all whitespace-nowrap"
                          onClick={() => handleCategorySelect(category)}
                          title="Ver temas y cuestionarios"
                        >
                          <ListChecks className="w-3.5 h-3.5 mr-1.5" />
                          Temas
                        </Button>
                        <Link href={`/category/${category.id}?view=roadmap&user_id=${childId}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all whitespace-nowrap"
                          >
                            <MapIcon className="w-3.5 h-3.5 mr-1.5" />
                            Mapa
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-4">
          <div className="h-auto min-h-[220px]" id="tour-parent-stats">
            <StatCard
              title="Progreso General"
              value={`${Math.round((completedQuizzes.length / (quizzes?.length || 1)) * 100)}%`}
              subtitle="Completado"
              icon={Target}
              colorClass="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-900/20"
              progress={(completedQuizzes.length / (quizzes?.length || 1)) * 100}
              total={quizzes?.length || 0}
              completed={completedQuizzes.length}
              breakdown={Object.fromEntries(
                categories?.map((c: any) => [c.name, quizzes?.filter((q: any) => q.categoryId === c.id && q.userStatus === 'completed').length || 0]) || []
              )}
            />
          </div>

          <div className="p-4 rounded-3xl bg-slate-800/50 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-16 h-16 text-blue-400" />
            </div>
            <h4 className="flex items-center gap-2 font-bold text-slate-200 mb-2 relative z-10">
              <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
              Modo Padre Activo
            </h4>
            <p className="text-xs text-slate-400 relative z-10">
              Estás viendo el progreso de <strong>{parentChild?.child_name || "tu hijo"}</strong>.
              Todas las acciones de "Realizar Cuestionario" están deshabilitadas para no afectar sus estadísticas.
            </p>
          </div>

          <PromoBanner
            title="Síguenos"
            subtitle="@alanmath.ias"
            icon={Instagram}
            colorClass="bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg shadow-pink-900/20"
            href="https://instagram.com/alanmath.ias"
            buttonText="Ver perfil"
            compact={true}
          />

          <PromoBanner
            title="eBook Exclusivo"
            subtitle="Potencia tu mente"
            icon={BookOpen}
            colorClass="bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-900/20"
            href="https://alanmath.com"
            buttonText="Descargar"
            compact={true}
          />
        </div>
      </div>

      <QuizDetailsDialog
        open={!!selectedQuiz}
        onOpenChange={(open) => !open && setSelectedQuiz(null)}
        quiz={selectedQuiz}
        childId={childId}
      />

      {/* Pending Activities Dialog */}
      <Dialog open={isPendingDialogOpen} onOpenChange={setIsPendingDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-slate-200" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-500">
              <PlayCircle className="w-6 h-6" />
              Actividades Pendientes ({pendingQuizzes.length})
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Lista completa de cuestionarios pendientes de tu hijo.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {pendingQuizzes.length > 0 ? (
                pendingQuizzes.map((quiz) => (
                  <div key={quiz.id + "-pending-dialog"} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-yellow-500/30">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <PlayCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-200">{quiz.title}</h4>
                      <p className="text-xs text-slate-500">{quiz.difficulty}</p>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                      onClick={() => {
                        setIsPendingDialogOpen(false);
                        setLocation(`/quiz/${quiz.id}?mode=readonly`);
                      }}
                    >
                      Ver
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <p>No hay actividades pendientes.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Recent Activity Dialog */}
      <Dialog open={isRecentDialogOpen} onOpenChange={setIsRecentDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-slate-200" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-400">
              <ListChecks className="w-6 h-6" />
              Historial de Actividades
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Historial completo de cuestionarios completados.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {uniqueCompletedQuizzes.length > 0 ? (
                uniqueCompletedQuizzes.map((quiz) => (
                  <ActivityItem
                    key={quiz.id + "-recent-dialog"}
                    quiz={quiz}
                    onClick={(q) => {
                      setIsRecentDialogOpen(false);
                      handleViewResults(q);
                    }}
                  />
                ))
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <p>Aún no hay actividad reciente.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Category Details Dialog (TEMAS) - Replicated and Adapted for Parents */}
      <Dialog open={!!selectedCategoryForDetails} onOpenChange={(open) => {
        if (!open) {
          handleCategorySelect(null);
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border-white/10 text-slate-200 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()} tabIndex={-1}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-blue-400">
              {selectedSubcategory ? (
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent text-blue-400 hover:text-blue-300 mr-2" onClick={() => handleSubcategorySelect(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <ListChecks className="h-6 w-6" />
              )}
              {selectedSubcategory ? selectedSubcategory.name : `Temas de ${selectedCategoryForDetails?.name}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedSubcategory
                ? "Selecciona un cuestionario para ver su contenido (Modo Lectura)."
                : "Selecciona un tema para ver los cuestionarios disponibles."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-950/30 rounded-xl border border-white/5 mt-2">
            {!selectedSubcategory ? (
              // VIEW: List of subcategories
              <div className="flex-1 flex flex-col min-h-0 p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Buscar tema o cuestionario..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50"
                  />
                </div>

                <ScrollArea className="flex-1 -mr-3 pr-3">
                  <div className="space-y-3">
                    {loadingSubcategories ? (
                      <div className="flex justify-center py-8">
                        <Spinner className="h-8 w-8 text-blue-500" />
                      </div>
                    ) : (
                      (() => {
                        const filteredSubcategories = categorySubcategories?.filter(sub =>
                          sub.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
                        ) || [];

                        if (filteredSubcategories.length === 0) {
                          return (
                            <div className="text-center py-12 text-slate-500">
                              <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                              <p>No se encontraron temas.</p>
                            </div>
                          )
                        }

                        return filteredSubcategories.map((sub: any) => {
                          const subQuizzes = categoryQuizzes?.filter((q: QuizWithFeedback) => Number(q.subcategoryId) === Number(sub.id)) || [];
                          const completedCount = subQuizzes.filter(q => q.userStatus === 'completed').length; // using userStatus from parentChild quizzes
                          const progress = subQuizzes.length > 0 ? (completedCount / subQuizzes.length) * 100 : 0;

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleSubcategorySelect(sub)}
                              className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-white/5 cursor-pointer transition-all hover:bg-slate-800/60 hover:border-blue-500/30 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                  <ListChecks className="h-6 w-6" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{sub.name}</h4>
                                  <p className="text-sm text-slate-500">{subQuizzes.length} cuestionarios</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                  <span className="text-xs font-medium text-slate-400 block mb-1">Progreso</span>
                                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400" />
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // VIEW: Quizzes for selected subcategory
              <div className="flex-1 flex flex-col min-h-0 p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder={`Buscar en ${selectedSubcategory.name}...`}
                    value={quizSearchQuery}
                    onChange={(e) => setQuizSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50"
                  />
                </div>

                <ScrollArea className="flex-1 -mr-3 pr-3">
                  <div className="space-y-2">
                    {(() => {
                      const quizzesForSub = categoryQuizzes?.filter((q: QuizWithFeedback) =>
                        Number(q.subcategoryId) === Number(selectedSubcategory.id) &&
                        q.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
                      ) || [];

                      if (quizzesForSub.length === 0) {
                        return (
                          <div className="text-center py-12 text-slate-500">
                            <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron cuestionarios en este tema.</p>
                          </div>
                        )
                      }

                      return quizzesForSub.map((quiz) => {
                        const isCompleted = quiz.userStatus === 'completed';
                        const score = isCompleted ? (quiz.score || 0) : 0;

                        return (
                          <div key={quiz.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? "bg-green-500/20 text-green-400" : "bg-slate-700/50 text-slate-400"}`}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <ListChecks className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-sm text-slate-200 truncate">{quiz.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{quiz.difficulty}</span>
                                  {isCompleted && <span className="text-green-400 font-medium">• Completado ({score.toFixed(1)}/10)</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-slate-700 hover:bg-slate-600 text-white"
                                onClick={() => setLocation(`/quiz/${quiz.id}?mode=readonly`)}
                              >
                                Ver (Solo Lectura)
                              </Button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsPendingDialogOpen(false)} variant="outline" className="hidden">Hidden</Button>
            <Button onClick={() => setSelectedCategoryForDetails(null)} className="bg-slate-800 hover:bg-slate-700 text-white">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentUser && (
        <OnboardingTour
          isOpen={!currentUser.tourStatus?.onboarding}
          user={currentUser}
          onComplete={startParentDashboardTour}
        />
      )}
    </div>
  );
}