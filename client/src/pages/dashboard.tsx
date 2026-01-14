import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Category, Quiz } from "@/types/types";
import { UserQuiz } from "@/types/types";
import {
  BookOpen,
  ListChecks,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
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
  HelpCircle,
  Search, Ban,
  Gamepad2,
  ArrowRight,
  Map as MapIcon,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { startDashboardTour } from "@/lib/tour";
import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import VideoEmbed from './VideoEmbed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { ContentRenderer } from "@/components/ContentRenderer";
import { Input } from "@/components/ui/input";
import { QuizDetailsDialog } from "@/components/dialogs/QuizDetailsDialog";
import { RestZoneDialog } from "@/components/dialogs/RestZoneDialog";

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

async function fetchCategoryQuizzes(categoryId: number) {
  const res = await fetch(`/api/categories/${categoryId}/quizzes`);
  if (!res.ok) throw new Error("Error al obtener cuestionarios de la categoría");
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
      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 cursor-pointer transition-all hover:bg-slate-800/60 hover:border-purple-500/30 hover:shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]"
    >
      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate text-slate-200">{quiz.title}</h4>
        <p className="text-xs text-slate-500 truncate">{quiz.difficulty} • {new Date(quiz.completedAt || '').toLocaleDateString()}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="block text-sm font-bold text-green-400">{(quiz.score || 0)}/10</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
    </div>
  );
}



export default function UserDashboard() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithFeedback | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showRestZone, setShowRestZone] = useState(false);
  const [miniQuizId, setMiniQuizId] = useState<number | null>(null);

  // New states for enhancements
  const [showCreditsInfo, setShowCreditsInfo] = useState(false);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

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

  // Fetch quizzes for selected category
  const { data: categoryQuizzes, isLoading: loadingCategoryQuizzes } = useQuery<Quiz[]>({
    queryKey: ["category-quizzes", selectedCategoryForDetails?.id],
    queryFn: () => selectedCategoryForDetails ? fetchCategoryQuizzes(selectedCategoryForDetails.id) : Promise.resolve([]),
    enabled: !!selectedCategoryForDetails,
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

  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [quizSearchQuery, setQuizSearchQuery] = useState("");

  // Reset subcategory selection and search queries when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setCategorySearchQuery("");
    setQuizSearchQuery("");
  }, [selectedCategoryForDetails]);

  // Reset quiz search when subcategory changes
  useEffect(() => {
    setQuizSearchQuery("");
  }, [selectedSubcategory]);

  // URL Synchronization for Dialog State
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dialog = params.get('dialog');
    const catId = params.get('categoryId');
    const subId = params.get('subcategoryId');

    if (dialog === 'topics' && catId && categories) {
      const category = categories.find(c => c.id === parseInt(catId));
      if (category) {
        setSelectedCategoryForDetails(category);

        // If subcategory is present in URL, we need to wait for subcategories to load
        // But we can set a flag or just rely on the user clicking again if it fails initially.
        // Better: We can't easily sync subcategory here without fetching them first.
        // However, `categorySubcategories` query depends on `selectedCategoryForDetails`.
        // So once `selectedCategoryForDetails` is set, the query runs.
        // We need another effect to set subcategory once data is available.
      }
    }
  }, [categories, window.location.search]);

  // Effect to set selected subcategory from URL once data is loaded
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subId = params.get('subcategoryId');

    if (subId && categorySubcategories && selectedCategoryForDetails) {
      const sub = categorySubcategories.find(s => s.id === parseInt(subId));
      if (sub) {
        setSelectedSubcategory(sub);
      }
    }
  }, [categorySubcategories, selectedCategoryForDetails, window.location.search]);

  // Update URL when state changes
  const updateUrlState = (category: Category | null, subcategory: any | null) => {
    const params = new URLSearchParams(window.location.search);

    if (category) {
      params.set('dialog', 'topics');
      params.set('categoryId', category.id.toString());
      if (subcategory) {
        params.set('subcategoryId', subcategory.id.toString());
      } else {
        params.delete('subcategoryId');
      }
    } else {
      params.delete('dialog');
      params.delete('categoryId');
      params.delete('subcategoryId');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Wrap state setters to sync URL
  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategoryForDetails(category);
    updateUrlState(category, null);
  };

  const handleSubcategorySelect = (subcategory: any | null) => {
    setSelectedSubcategory(subcategory);
    updateUrlState(selectedCategoryForDetails, subcategory);
  };

  const { data: alerts } = useQuery({
    queryKey: ["user-alerts"],
    queryFn: fetchAlerts,
    ...queryOptions,
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
          className: "w-80 h-auto aspect-[4/3] flex flex-col justify-center items-center bg-slate-900 border border-indigo-500/30 text-slate-200 shadow-2xl rounded-2xl p-6"
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
      const timer = setTimeout(() => {
        // Ensure the element exists before starting the tour to prevent freeze
        if (document.getElementById('tour-welcome')) {
          startDashboardTour();
          // Update DB to mark tour as seen
          fetch('/api/user/tour-seen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tourType: 'dashboard' })
          }).then(res => {
            if (res.ok) {
              queryClient.invalidateQueries({ queryKey: ["current-user"] });
            }
          });
        }
      }, 2000); // Increased delay to 2 seconds for safety

      return () => clearTimeout(timer);
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
      setSelectedCategoryForDetails(null); // Close category details if open
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategoryForDetails(category);
    setCategorySearchQuery("");
  };

  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (loadingUser || loadingCategories || loadingQuizzes) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-950"><Spinner className="h-12 w-12 text-purple-500" /></div>;
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

  // Filter quizzes for category details
  const filteredCategoryQuizzes = categoryQuizzes?.filter(quiz =>
    quiz.title.toLowerCase().includes(categorySearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto p-4 max-w-7xl space-y-8 relative z-10">
        {/* Header Section */}
        <div id="tour-welcome" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{currentUser?.username || 'Estudiante'}</span> 👋
              </h1>
            </div>
            <p className="text-slate-400 mt-1">Aquí tienes el resumen de tu progreso hoy.</p>
            <div
              className="mt-2 inline-flex items-center bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors"
              onClick={() => setShowCreditsInfo(true)}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {currentUser?.hintCredits ?? 0} Créditos de Pistas
            </div>
          </div>



          {/* Alert Section */}
          {pendingQuizzes.length > 0 && (
            <div
              onClick={() => setShowPendingDialog(true)}
              className="animate-pulse flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/20 shadow-sm cursor-pointer hover:bg-yellow-500/20 transition-colors"
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
            <div className="rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-sm shadow-xl p-5 h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-purple-500" /> Actividad Reciente
                </h3>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
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
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                      <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                      <p className="text-sm">Aún no has completado cuestionarios</p>
                      <Link href="/training">
                        <Button variant="link" className="text-purple-400 mt-2">Comenzar ahora</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 2. Video Section */}
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

            {/* 3. Pending Activities (Yellow, Play Icon) */}
            <div id="tour-pending" className="rounded-3xl bg-slate-900/50 border border-yellow-500/20 backdrop-blur-sm p-5 h-[300px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-yellow-500 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> Actividades Pendientes ({pendingQuizzes.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => setShowPendingDialog(true)}
                >
                  Ver todo
                </Button>
              </div>
              <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-2">
                  {pendingQuizzes.length > 0 ? (
                    pendingQuizzes.map((quiz) => (
                      <div key={quiz.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-yellow-500/30 hover:shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <PlayCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-200">{quiz.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{quiz.difficulty}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={(e) => handleMiniStart(e, quiz.id)}
                          >
                            Mini
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-sm"
                            onClick={() => setLocation(`/quiz/${quiz.id}`)}
                          >
                            Normal
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                      <CheckCircle2 className="w-12 h-12 mb-2 opacity-20 text-green-500" />
                      <p className="text-sm">¡Todo al día! No tienes actividades pendientes.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 4. Materias Disponibles (White) */}
            <div id="tour-quiz-list" className="rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-sm shadow-xl p-5 h-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> Tus Materias
                </h3>
              </div>

              <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      className="group bg-slate-900/80 rounded-xl p-3 border border-slate-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between h-full min-h-[140px] cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors mb-3">{category.name}</h4>

                        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* Botón Video */}
                          {category.youtubeLink ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playVideo(category.youtubeLink!);
                              }}
                              className="flex items-center justify-center gap-1.5 h-7 text-[10px] font-medium rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                            >
                              <Youtube className="w-3 h-3" /> Videos
                            </button>
                          ) : (
                            <div className="h-7" /> /* Spacer if no video */
                          )}

                          {/* Botón Entrenamiento */}
                          <Link href={`/category/${category.id}?view=grid`} className="w-full">
                            <Button size="sm" className="w-full h-7 text-[10px] bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-0 transition-all duration-300">
                              Entrenamiento
                            </Button>
                          </Link>

                          {/* Botón Temas */}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full h-7 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategorySelect(category);
                            }}
                          >
                            <ListChecks className="w-3 h-3 mr-1.5" /> Temas
                          </Button>

                          {/* Botón Mapa */}
                          <Link href={`/category/${category.id}?view=roadmap`} className="w-full">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full h-7 text-[10px] bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                            >
                              <MapIcon className="w-3 h-3 mr-1.5" /> Mapa
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

          {/* Right Column: Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div id="tour-stats" className="h-auto min-h-[220px]">
              <StatCard
                title="Progreso General"
                value={`${progressPercentage.toFixed(0)}%`}
                subtitle="Completado"
                icon={Trophy}
                colorClass="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-900/40"
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
              colorClass="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/40"
              bgImage="https://imagenes.alanmath.com/ebook-cover-placeholder.jpg"
              href="https://alanmatiasvilla1000.hotmart.host/el-fascinante-movimiento-parabolico-guia-practica-de-alanmath-f1416e10-f1d2-49ac-aa29-2e8318b2fea4"
              buttonText="Ver eBook"
              compact={true}
            />

            <PromoBanner
              title="Sitio Web"
              subtitle="alanmath.com"
              icon={Globe}
              colorClass="bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
              href="https://alanmath.com/"
              buttonText="Visitar"
              compact={true}
            />

            {/* Rest Zone Card */}
            <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/40 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowRestZone(true)}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Zona de Descanso</h3>
              <p className="text-teal-100 text-sm mb-6">
                ¿Necesitas un respiro? Relájate con nuestra selección de juegos y puzzles.
              </p>
              <button
                className="flex items-center text-sm font-semibold hover:text-teal-100 transition-colors group"
              >
                Entrar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Details Dialog */}
        <QuizDetailsDialog
          open={!!selectedQuiz}
          onOpenChange={(open) => !open && setSelectedQuiz(null)}
          quiz={selectedQuiz}
        />

        {/* Credits Info Dialog */}
        <Dialog open={showCreditsInfo} onOpenChange={setShowCreditsInfo}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-400">
                <Lightbulb className="w-5 h-5" />
                Créditos de Pistas
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Usa tus créditos para obtener ayuda durante los cuestionarios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> ¿Cómo obtener más?
                </h4>
                <ul className="space-y-2 text-sm text-slate-400 ml-6 list-disc">
                  <li>Completa un cuestionario: <span className="text-yellow-400 font-bold">+1 crédito</span></li>
                  <li>Mira un video explicativo: <span className="text-yellow-400 font-bold">+2 créditos</span></li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" /> Costo de pistas
                </h4>
                <p className="text-sm text-slate-400">
                  Cada pista que solicites durante un cuestionario consumirá <span className="text-yellow-400 font-bold">1 crédito</span>.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowCreditsInfo(false)} className="bg-slate-800 hover:bg-slate-700 text-white">
                Entendido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pending Activities Dialog */}
        <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
          <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-500">
                <PlayCircle className="w-6 h-6" />
                Actividades Pendientes ({pendingQuizzes.length})
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Aquí tienes la lista completa de cuestionarios que aún no has completado.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3 py-2">
                {pendingQuizzes.length > 0 ? (
                  pendingQuizzes.map((quiz) => (
                    <div key={quiz.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-yellow-500/30 hover:shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 shadow-sm">
                        <PlayCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-200">{quiz.title}</h4>
                        <p className="text-xs text-slate-500">{quiz.difficulty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-white/10"
                          onClick={(e) => handleMiniStart(e, quiz.id)}
                        >
                          Mini
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-sm"
                          onClick={() => setLocation(`/quiz/${quiz.id}`)}
                        >
                          Normal
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <CheckCircle2 className="w-16 h-16 mb-4 opacity-20 text-green-500" />
                    <p className="text-lg font-medium text-slate-400">¡Todo al día!</p>
                    <p className="text-sm">No tienes actividades pendientes por ahora.</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowPendingDialog(false)} className="border-slate-700 text-slate-300 hover:bg-white/10">Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mini Quiz Confirmation Dialog */}
        <Dialog open={!!miniQuizId} onOpenChange={(open) => !open && setMiniQuizId(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Modo Mini
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
            <DialogFooter>
              <Button onClick={() => setMiniQuizId(null)} className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700">Cancelar</Button>
              <Button onClick={confirmMiniStart} className="bg-yellow-600 hover:bg-yellow-700 text-white">Comenzar Mini Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>




        {/* Credits Info Dialog */}
        <Dialog open={showCreditsInfo} onOpenChange={setShowCreditsInfo}>
          <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-400 text-xl">
                <Lightbulb className="h-6 w-6" />
                Créditos de Pistas
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Descubre cómo funcionan los créditos en AlanMath.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Section 1: Utility */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> ¿Para qué sirven?
                </h4>
                <p className="text-sm text-slate-300 mb-2">
                  Los créditos te permiten solicitar pistas cuando estés atascado en una pregunta difícil.
                </p>
                <p className="text-xs text-blue-200/80 italic">
                  *Hay dos tipos de pistas, la Pista Regular te cuesta 1 Crédito, la Súper Pista te cuesta 2 Créditos.
                </p>
              </div>

              {/* Section 2: How to earn */}
              <div>
                <h4 className="font-bold text-slate-200 mb-3">¿Cómo conseguir Créditos?</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Cuestionarios Largos:</strong> ¡Tu esfuerzo tiene recompensa! Obtén 1 crédito si sacas entre 7 y 8, 2 créditos entre 8 y 9, ¡y 3 créditos si logras más de 9!
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Mini Cuestionarios:</strong> Si obtienes más de 8 puntos, te llevas 2 créditos.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Tareas Completas:</strong> Terminar todas tus actividades pendientes te da 5 créditos.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Ver Videos:</strong> ¡Aprende y gana! Obtén 3 créditos por ver un video explicativo completo.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 text-center">
                  Contacta al equipo AlanMath para que además puedas intercambiar Créditos por clases en vivo.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowCreditsInfo(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                ¡Entendido!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Details Dialog (TEMAS) */}
        <Dialog open={!!selectedCategoryForDetails} onOpenChange={(open) => {
          if (!open) {
            handleCategorySelect(null);
            handleSubcategorySelect(null);
          }
        }}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border-white/10 text-slate-200 overflow-hidden">
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
                  ? "Selecciona un cuestionario para comenzar."
                  : "Selecciona un tema para ver los cuestionarios disponibles."}
              </DialogDescription>
            </DialogHeader>

            {!selectedSubcategory && (
              <div className="relative my-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar tema o cuestionario..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
              {loadingCategoryQuizzes || loadingSubcategories ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8 text-blue-500" />
                </div>
              ) : selectedSubcategory ? (
                // VIEW: Quizzes for selected subcategory
                <div className="space-y-4 pb-4">
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
                    const quizzesForSub = categoryQuizzes?.filter(q =>
                      Number(q.subcategoryId) === Number(selectedSubcategory.id) &&
                      q.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
                    ) || [];
                    if (quizzesForSub.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-500">
                          <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No hay cuestionarios en este tema.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quizzesForSub.map((quiz) => {
                          const isCompleted = completedQuizzes.some(q => q.id === quiz.id);
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
                                  {!isCompleted && (
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 text-xs bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                                      onClick={(e) => handleMiniStart(e, quiz.id)}
                                    >
                                      Mini
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    className={`h-7 px-3 text-xs font-medium ${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCompleted) {
                                        // Navigate to results
                                        setLocation(`/quiz-results/${quiz.id}`);
                                      } else {
                                        // Start quiz
                                        handleQuizStart(quiz.id);
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
              ) : (
                // VIEW: List of Subcategories
                <div className="space-y-3 pb-4">
                  {(() => {
                    const filteredSubs = categorySubcategories?.filter(sub => {
                      const matchesSub = sub.name.toLowerCase().includes(categorySearchQuery.toLowerCase());
                      const subQuizzes = categoryQuizzes?.filter(q => q.subcategoryId === sub.id) || [];
                      const matchesQuiz = subQuizzes.some(q => q.title.toLowerCase().includes(categorySearchQuery.toLowerCase()));
                      return matchesSub || matchesQuiz;
                    }) || [];

                    if (filteredSubs.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-500">
                          <Ban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No se encontraron temas ni cuestionarios.</p>
                        </div>
                      );
                    }

                    return filteredSubs.map((sub) => {
                      const subQuizzes = categoryQuizzes?.filter(q => q.subcategoryId === sub.id) || [];
                      const completedCount = subQuizzes.filter(q => completedQuizzes.some(cq => cq.id === q.id)).length;
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
                  })()}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <RestZoneDialog open={showRestZone} onOpenChange={setShowRestZone} />
      </div>
      <FloatingWhatsApp
        message="Hola, me gustaría cotizar clases de refuerzo para mejorar mi rendimiento en matemáticas."
        tooltip="Cotizar Clases de Refuerzo"
      />
    </div>
  );
}
