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
  MessageSquare,
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
  Book,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useParams } from "wouter";
import { useEffect, useState, useRef, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VideoEmbed from "../VideoEmbed"; // Relative import since both are in src/pages (parent is subdir)
import { QuizDetailsDialog } from "@/components/dialogs/QuizDetailsDialog";
import { HorizontalRoadmap } from "@/components/roadmap/HorizontalRoadmap";
import { RoadmapNode } from "@/types/types";
import { arithmeticMapNodes } from "@/data/arithmetic-map-data";
import { algebraMapNodes } from "@/data/algebra-map-data";
import { calculusMapNodes } from "@/data/calculus-map-data";
import { integralCalculusMapNodes } from "@/data/integral-calculus-map-data";
import { OnboardingTour } from "@/components/dialogs/OnboardingTour";
import { startParentDashboardTour } from "@/lib/tour";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// --- Types ---
interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  progress?: number;
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

async function fetchAllQuizzes() {
  const response = await fetch("/api/quizzes", { credentials: "include" });
  if (!response.ok) throw new Error("Error al obtener todos los cuestionarios");
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
  const hasFeedback = (quiz.feedback && quiz.feedback.length > 0) || quiz.reviewed;

  return (
    <div
      onClick={() => onClick(quiz)}
      className="group flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-slate-800/40 cursor-pointer transition-all hover:bg-slate-800/60"
    >
      <div className="h-10 w-10 rounded-full bg-slate-900/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        {hasFeedback ? <MessageSquare className="h-5 w-5 text-emerald-400" /> : <CheckCircle2 className="h-5 w-5 text-green-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-slate-200 transition-colors line-clamp-3 group-hover:text-white">{quiz.title}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="truncate max-w-[120px]">{quiz.difficulty} • {new Date(quiz.completedAt || '').toLocaleDateString()}</span>
          {hasFeedback && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse shrink-0">
              <MessageSquare className="w-3 h-3" /> Comentario
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 self-start mt-1">
        <span className={`block text-sm font-bold ${hasFeedback ? "text-emerald-400" : "text-green-400"}`}>{Number(quiz.score || 0).toFixed(1)}/10</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
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
  const [selectedChiquiQuiz, setSelectedChiquiQuiz] = useState<{
    title: string; categoryId?: number; isChiqui: true; completedAt?: string | Date; score?: number;
  } | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false);
  const [isRecentDialogOpen, setIsRecentDialogOpen] = useState(false);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [quizSearchQuery, setQuizSearchQuery] = useState("");
  const { toast } = useToast();
  const [expandedRoadmapCategoryId, setExpandedRoadmapCategoryId] = useState<number | null>(null);
  const activeCategoryId = expandedRoadmapCategoryId;

  // Helper to get map nodes based on category
  const getMapNodes = (catId: number | null) => {
    if (!catId) return [];
    const category = categories?.find(c => c.id === catId);
    const name = category?.name.toLowerCase() || "";

    if (catId === 1 || name.includes("aritmética")) return arithmeticMapNodes;
    if (catId === 2 || name.includes("álgebra")) return algebraMapNodes;
    if (catId === 4 || name.includes("diferencial")) return calculusMapNodes;
    if (catId === 5 || name.includes("integral")) return integralCalculusMapNodes;
    return [];
  };

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

  // Sort categories by ID for consistent display (mirroring Student Dashboard)
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.id - b.id);
  }, [categories]);

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithFeedback[]>({
    queryKey: ["child-quizzes", childId],
    queryFn: () => fetchChildQuizzes(childId),
    enabled: !!childId,
  });

  const { data: allQuizzes } = useQuery<any[]>({
    queryKey: ["all-quizzes"],
    queryFn: fetchAllQuizzes,
  });

  const { data: alerts } = useQuery({
    queryKey: ["child-alerts", childId],
    queryFn: () => fetchChildAlerts(childId),
    enabled: !!childId,
  });

  const { data: chiquiResults } = useQuery<any[]>({
    queryKey: ["child-chiquitest-results", childId],
    queryFn: async () => {
      const res = await fetch("/api/parent/child/chiquitest/results", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!childId,
    ...queryOptions,
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

  // Roadmap specific data (Calculated from allQuizzes and child progress)
  const activeCategoryQuizzesRoadmap = useMemo(() => {
    if (!activeCategoryId || !allQuizzes) return [];
    return allQuizzes.filter(q => Number(q.categoryId) === Number(activeCategoryId));
  }, [activeCategoryId, allQuizzes]);

  const { data: activeCategorySubcategoriesRoadmap } = useQuery<any[]>({
    queryKey: ["category-subcategories-roadmap", activeCategoryId],
    queryFn: async () => {
      if (!activeCategoryId) return [];
      const res = await fetch(`/api/admin/subcategories/by-category/${activeCategoryId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!activeCategoryId,
  });

  // Filter quizzes for the selected category (using allQuizzes for complete view)
  const categoryQuizzes = useMemo(() => {
    if (!selectedCategoryForDetails || !allQuizzes) return [];
    const allCatQuizzes = allQuizzes.filter(q => Number(q.categoryId) === Number(selectedCategoryForDetails.id));

    // Enrich with child's progress/status if available
    return allCatQuizzes.map(q => {
      const childVersion = quizzes?.find(cq => cq.id === q.id);
      return {
        ...q,
        userStatus: childVersion?.userStatus || 'unassigned',
        score: childVersion?.score,
        completedAt: childVersion?.completedAt,
        progress: childVersion?.progress,
        progressId: childVersion?.progressId // childVersion.progressId IS correctly returned by getQuizzesByUserId
      };
    }) as QuizWithFeedback[];
  }, [selectedCategoryForDetails, allQuizzes, quizzes]);

  // Calculate Roadmap Nodes for Parent View (Read-Only)
  const roadmapNodes: RoadmapNode[] = useMemo(() => {
    const rawNodes = ((activeCategoryId ? getMapNodes(activeCategoryId) : []) as any[]);

    // 1. First pass: Calculate individual node content and status
    const processedNodes = rawNodes.map((node) => {
      const categoryQuizzes = activeCategoryQuizzesRoadmap || [];
      let nodeQuizzes = categoryQuizzes.filter(q => q.subcategoryId == node.subcategoryId) || [];

      if (node.filterKeywords && node.filterKeywords.length > 0) {
        const keywords = node.filterKeywords.map((k: string) => k.toLowerCase());
        nodeQuizzes = nodeQuizzes.filter(q => {
          const titleLower = q.title.toLowerCase();
          if (!keywords.some((k: string) => titleLower.includes(k))) return false;
          if (node.excludeKeywords && node.excludeKeywords.length > 0) {
            const excludeKeys = node.excludeKeywords.map((k: string) => k.toLowerCase());
            if (excludeKeys.some((k: string) => titleLower.includes(k))) return false;
          }
          return true;
        });
      }

      let progressPercent = 0;
      if (nodeQuizzes.length > 0 && quizzes) {
        const completedCount = nodeQuizzes.filter(q =>
          quizzes.some(uq => uq.id === q.id && uq.userStatus === 'completed')
        ).length;
        progressPercent = (completedCount / nodeQuizzes.length) * 100;
      }

      let status: 'locked' | 'available' | 'completed' = 'locked';
      if (nodeQuizzes.length > 0) {
        status = progressPercent >= 100 ? 'completed' : 'available';
      }

      return {
        ...node,
        nodeQuizzes,
        progressPercent,
        calculatedStatus: status
      };
    });

    // 2. Second pass: Grouping and Parent status aggregation
    const groupNodes: Record<string | number, any[]> = {};
    let currentParent: any = null;

    processedNodes.forEach(node => {
      const isParent = node.behavior === 'container' || node.type === 'parent' || node.type === 'critical';
      if (isParent) {
        currentParent = node;
        groupNodes[node.id] = [];
      } else if (currentParent) {
        if (currentParent && groupNodes[currentParent.id]) {
          groupNodes[currentParent.id].push(node);
        }
      }
    });

    // 3. Third pass: Construct final RoadmapNode objects
    return processedNodes.map((node) => {
      const isParent = node.behavior === 'container' || node.type === 'parent' || node.type === 'critical';
      let finalStatus: 'locked' | 'available' | 'completed' = node.calculatedStatus;

      if (isParent) {
        const children = groupNodes[node.id] || [];
        if (children.length > 0) {
          const allLocked = children.every(c => c.calculatedStatus === 'locked');
          const allCompleted = children.every(c => c.calculatedStatus === 'completed');
          const anyAvailable = children.some(c => c.calculatedStatus === 'available' || c.calculatedStatus === 'completed');

          if (allLocked && node.calculatedStatus === 'locked') {
            finalStatus = 'locked';
          } else if (allCompleted) {
            finalStatus = 'completed';
          } else if (anyAvailable) {
            finalStatus = 'available';
          }
        }
      }

      const hasContent = node.nodeQuizzes.length > 0 || isParent;

      return {
        id: node.id || `node-${Math.random()}`,
        title: node.label || 'Sin título',
        description: node.description || '',
        status: finalStatus,
        type: 'subcategory',
        nodeType: node.type,
        behavior: node.behavior,
        progress: node.progressPercent,
        hasContent: hasContent,
        onClick: () => {
          if (node.nodeQuizzes.length > 0) {
            const cat = categories?.find(c => c.id === activeCategoryId);
            if (cat) {
              setSelectedCategoryForDetails(cat);
              const sub = activeCategorySubcategoriesRoadmap?.find(s => s.id === node.subcategoryId);
              if (sub) {
                handleSubcategorySelect(sub);
              } else {
                setQuizSearchQuery(node.label || '');
              }
            }
          }
        }
      };
    });
  }, [activeCategoryId, activeCategoryQuizzesRoadmap, activeCategorySubcategoriesRoadmap, quizzes, categories]);

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
      <div className="container mx-auto py-12 px-4 text-center max-w-2xl">
        <div className="bg-slate-900/50 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">¡Hola {currentUser?.name || 'Padre'}!</h1>
          <p className="text-xl text-slate-300 mb-6 leading-tight">
            Tu solicitud de registro como padre ha sido recibida correctamente.
          </p>
          <div className="space-y-4 text-slate-400 mb-8 text-sm md:text-base leading-relaxed text-left max-w-md mx-auto">
            <p className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group transition-all hover:bg-indigo-500/15">
              <span className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-sm font-bold shadow-sm shadow-indigo-900/20">1</span>
              <span className="text-slate-200">
                Actualmente un administrador está revisando tu solicitud para vincular tu cuenta con la de <span className="font-bold text-indigo-400 italic">{parentChild?.requested_child_name || 'tu hijo/a'}</span>.
              </span>
            </p>
            <p className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/5 group transition-all hover:bg-indigo-500/10">
              <span className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-sm font-bold opacity-80">2</span>
              <span className="text-slate-300">
                Una vez vinculado, podrás ver su progreso, calificaciones y actividades en tiempo real en este panel.
              </span>
            </p>
            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 mt-6 italic text-slate-500 text-xs text-center">
              <Sparkles className="w-3 h-3 inline-block mr-1 text-indigo-400 mb-0.5" />
              Recibirás un correo cuando la vinculación sea exitosa.
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <a
              href={`https://wa.me/573208056799?text=${encodeURIComponent(`Hola AlanMath, acabo de registrarme como padre (${currentUser?.name}) y me gustaría agilizar la vinculación de mi hijo.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/20 border-none">
                <MessageCircle className="w-6 h-6" />
                Agilizar por WhatsApp
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={async () => {
                await queryClient.invalidateQueries({ queryKey: ["parent-child"] });
                toast({
                  title: "Estado de Solicitud",
                  description: "Aún estamos revisando tu solicitud. ¡Gracias por tu paciencia! El administrador te vinculará pronto.",
                  duration: 5000,
                });
              }}
              className="w-full border-slate-700 bg-white text-slate-800 hover:bg-slate-100 font-bold rounded-2xl py-6 transition-all shadow-md active:scale-95"
            >
              Verificar estado ahora
            </Button>
          </div>
        </div>
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

      {/* Stars Navigation & Roadmap */}
      <div id="parent-roadmap-section" className="mb-8 space-y-4">
        {/* Stars Navigation */}
        <div className="flex items-center justify-center gap-4 py-4 flex-wrap">
          {sortedCategories.map((category) => {
            const categoryResult = chiquiResults?.find(r => r.categoryId === category.id);
            const lastScore = categoryResult?.lastScore;
            const lastDate = categoryResult?.lastDate;
            const isDoneToday = lastDate ? new Date(lastDate).toDateString() === new Date().toDateString() : false;

            return (
              <div key={category.id} className="flex flex-col items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpandedRoadmapCategoryId(expandedRoadmapCategoryId === category.id ? null : category.id)}
                        className={cn(
                          "relative p-3 rounded-full transition-all duration-300 border shadow-sm",
                          expandedRoadmapCategoryId === category.id
                            ? "bg-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.5)] border-yellow-500/50"
                            : "bg-blue-600/10 border-blue-500/20 hover:bg-slate-800 hover:border-blue-500/40 hover:shadow-blue-500/20"
                        )}
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-all duration-300 drop-shadow-sm",
                            expandedRoadmapCategoryId === category.id
                              ? "text-yellow-400 fill-yellow-400 animate-pulse"
                              : "text-blue-500 fill-blue-500/10 group-hover:text-yellow-500 group-hover:fill-yellow-500/20"
                          )}
                        />
                        {/* Active Indicator Dot */}
                        {expandedRoadmapCategoryId === category.id && (
                          <motion.div
                            layoutId="activeStarDot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-500"
                          />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-yellow-200 font-bold">
                      <p>Camino de {parentChild?.child_name || 'Hijo'} en {category.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* ChiquiTest (Repasito) Rayo Button — opens calendar dialog */}
                <div className="flex flex-col items-center gap-1 group/repasito">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => {
                            setSelectedChiquiQuiz({
                              title: `Repasito de ${category.name}`,
                              completedAt: isDoneToday ? lastDate : undefined,
                              score: isDoneToday ? lastScore : undefined,
                              isChiqui: true,
                              categoryId: category.id
                            });
                          }}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border",
                            isDoneToday
                              ? "bg-slate-800/80 text-yellow-500 border-yellow-500/20 shadow-none cursor-pointer hover:bg-slate-700"
                              : "bg-slate-800/40 text-slate-500 border-slate-700 shadow-none cursor-pointer opacity-70 hover:opacity-100"
                          )}
                        >
                          <Zap className={cn("w-5 h-5", isDoneToday && "fill-current")} />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border-slate-800 text-white font-medium p-3 rounded-xl shadow-2xl">
                        <div className="space-y-1">
                          <p className="font-bold text-yellow-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> Repasito Diario
                          </p>
                          <p className="text-xs text-slate-300">Progreso del Estudiante</p>
                          {isDoneToday ? (
                            <p className="text-[10px] text-emerald-400 font-bold mt-1">Ver calendario y resultados</p>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Aún no ha completado el repasito de hoy</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Static score label */}
                  <div className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm border whitespace-nowrap",
                    isDoneToday
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-800 text-slate-500 border-white/5"
                  )}>
                    {isDoneToday && lastScore !== undefined ? `${lastScore}/5` : "–/5"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Roadmap Display Area */}
        <AnimatePresence mode="wait">
          {expandedRoadmapCategoryId && (
            <motion.div
              key={expandedRoadmapCategoryId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-900/40 border border-blue-500/10 rounded-3xl backdrop-blur-md"
            >
              <HorizontalRoadmap
                nodes={roadmapNodes}
                title={`Progreso de ${parentChild?.child_name || 'Hijo'}`}
                categoryName={categories?.find(c => c.id === expandedRoadmapCategoryId)?.name}
                onClose={() => setExpandedRoadmapCategoryId(null)}
              />
              <div className="px-6 pb-6 text-center">
                <p className="text-xs text-slate-500 italic flex items-center justify-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Haz clic en los temas para ver los cuestionarios y resultados del estudiante (Solo lectura).
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {/* 1. Actividad Reciente */}
          <div id="tour-parent-recent" className="rounded-3xl bg-slate-900/60 border border-white/5 shadow-2xl p-5 h-[320px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-white/10" />

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
                {sortedCategories.map((category) => (
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

                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all whitespace-nowrap"
                          onClick={() => setLocation(`/category/${category.id}?user_id=${childId}&view=roadmap`)}
                          title="Ver mapa de progreso"
                        >
                          <MapIcon className="w-3.5 h-3.5 mr-1.5" />
                          Mapa
                        </Button>
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
                sortedCategories.map((c: any) => [c.name, quizzes?.filter((q: any) => q.categoryId === c.id && q.userStatus === 'completed').length || 0]) || []
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

      {/* Repasito / Calendar Dialog for parent */}
      <QuizDetailsDialog
        open={!!selectedChiquiQuiz}
        onOpenChange={(open) => !open && setSelectedChiquiQuiz(null)}
        quiz={selectedChiquiQuiz}
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
                                className={cn(
                                  "h-8 px-3 text-xs border-none shadow-sm transition-all",
                                  isCompleted
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-slate-700 hover:bg-slate-600 text-white"
                                )}
                                onClick={() => isCompleted ? handleViewResults(quiz) : setLocation(`/quiz/${quiz.id}?mode=readonly`)}
                              >
                                {isCompleted ? "Ver resultados" : "Ver (Solo Lectura)"}
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