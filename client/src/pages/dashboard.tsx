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
  XCircle,
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
  ArrowLeft,
  MessageSquare,
  Clock,
  Flame,
  Star,
  Sparkles
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { startDashboardTour } from "@/lib/tour";
import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState, useMemo } from "react";
import VideoEmbed from './VideoEmbed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { ContentRenderer } from "@/components/ContentRenderer";
import { Input } from "@/components/ui/input";
import { QuizDetailsDialog } from "@/components/dialogs/QuizDetailsDialog";
import { RestZoneDialog } from "@/components/dialogs/RestZoneDialog";
import { WelcomeDialog } from "@/components/dialogs/WelcomeDialog";
import { getRandomQuote } from "@/lib/motivational-quotes";
import { HorizontalRoadmap } from "@/components/roadmap/HorizontalRoadmap";
import { RoadmapNode } from "@/types/types";
import { OnboardingTour } from "@/components/dialogs/OnboardingTour";
import { arithmeticMapNodes, ArithmeticNode } from "@/data/arithmetic-map-data";
import { algebraMapNodes } from "@/data/algebra-map-data";
import { calculusMapNodes } from "@/data/calculus-map-data";
import { integralCalculusMapNodes } from "@/data/integral-calculus-map-data";


interface QuizWithFeedback extends UserQuiz {
  progressId?: string;
  reviewed?: boolean;
  completedAt?: string | Date;
  score?: number;
  timeSpent?: number;
  url?: string | null;
  feedback?: string;
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
  breakdown?: Record<string, number> | Array<[string, number]>
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

      {breakdown && (Array.isArray(breakdown) ? breakdown.length > 0 : Object.keys(breakdown).length > 0) && (
        <div className="relative z-10 mt-auto pt-4 border-t border-white/20">
          <p className="text-xs font-bold mb-2 opacity-90 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Por Área:
          </p>
          <div className="space-y-1.5">
            {(Array.isArray(breakdown) ? breakdown : Object.entries(breakdown)).slice(0, 4).map(([name, count]) => (
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
  const hasFeedback = quiz.feedback && quiz.feedback.length > 0;

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
        {hasFeedback ? <MessageSquare className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm transition-colors line-clamp-3 ${hasFeedback ? "text-emerald-200" : "text-slate-200"}`}>{quiz.title}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="truncate max-w-[120px]">{quiz.difficulty} • {new Date(quiz.completedAt || '').toLocaleDateString()}</span>
          {hasFeedback && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse shrink-0">
              <MessageSquare className="w-3 h-3" /> Feedback
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

export default function UserDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithFeedback | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false); // New state for social dialog
  const [showRestZone, setShowRestZone] = useState(false);
  const [miniQuizId, setMiniQuizId] = useState<number | null>(null);
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  // New states for enhancements
  const [showCreditsInfo, setShowCreditsInfo] = useState(false);
  const [_, setLocation] = useLocation();
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Welcome Dialog State
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [lastActivity, setLastActivity] = useState<QuizWithFeedback | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  useEffect(() => {
    setMotivationalMessage(getRandomQuote());
  }, []);

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

  // Sort categories by ID for consistent display
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.id - b.id);
  }, [categories]);

  // --- Data Preparation (Derived State) ---
  const completedQuizzes = useMemo(() => quizzes?.filter((q) => q.status === "completed") || [], [quizzes]);

  const allPendingQuizzes = useMemo(() => quizzes?.filter((q) => q.status !== "completed") || [], [quizzes]);

  const pendingQuizzes = useMemo(() => {
    return allPendingQuizzes.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      return acc;
    }, [] as QuizWithFeedback[]);
  }, [allPendingQuizzes]);

  const filteredPendingQuizzes = useMemo(() => {
    return pendingQuizzes.filter(q =>
      q.title.toLowerCase().includes(pendingSearchQuery.toLowerCase())
    );
  }, [pendingQuizzes, pendingSearchQuery]);

  const progressPercentage = useMemo(() => {
    if (!quizzes || quizzes.length === 0) return 0;
    return (completedQuizzes.length / quizzes.length) * 100;
  }, [completedQuizzes, quizzes]);

  const sortedCompletedQuizzes = useMemo(() => {
    return [...completedQuizzes].sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
  }, [completedQuizzes]);

  const uniqueCompletedQuizzes = useMemo(() => {
    return sortedCompletedQuizzes.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      return acc;
    }, [] as QuizWithFeedback[]);
  }, [sortedCompletedQuizzes]);

  const feedbackQuizzes = useMemo(() => {
    return quizzes?.filter(q => q.feedback && q.feedback.length > 0 && !q.reviewed) || [];
  }, [quizzes]);

  const stats = useMemo(() => {
    const avg = uniqueCompletedQuizzes.length > 0
      ? Math.round(uniqueCompletedQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / uniqueCompletedQuizzes.length * 10)
      : 0;
    const totalTime = uniqueCompletedQuizzes.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
    return {
      completedQuizzes: uniqueCompletedQuizzes.length,
      averageScore: avg,
      totalTime: totalTime
    };
  }, [uniqueCompletedQuizzes]);

  const categoryBreakdown = useMemo(() => {
    if (!quizzes || !sortedCategories) return [];
    const breakdown: Record<string, number> = {};
    completedQuizzes.forEach(quiz => {
      const catName = sortedCategories.find(c => c.id === quiz.categoryId)?.name || 'Otros';
      breakdown[catName] = (breakdown[catName] || 0) + 1;
    });

    return sortedCategories
      .map(cat => [cat.name, breakdown[cat.name] || 0] as [string, number])
      .filter(([_, count]) => count > 0);
  }, [completedQuizzes, sortedCategories]);

  const filteredCategoryQuizzes = useMemo(() => {
    return categoryQuizzes?.filter(quiz =>
      quiz.title.toLowerCase().includes(categorySearchQuery.toLowerCase())
    ) || [];
  }, [categoryQuizzes, categorySearchQuery]);

  // --- Roadmap Data Logic ---
  const [expandedRoadmapCategoryId, setExpandedRoadmapCategoryId] = useState<number | null>(null);
  const activeCategoryId = expandedRoadmapCategoryId;

  // Helper to get map nodes based on category
  const getMapNodes = (catId: number | null) => {
    if (!catId) return [];
    const category = sortedCategories.find(c => c.id === catId);
    const name = category?.name.toLowerCase() || "";

    if (catId === 1 || name.includes("aritmética")) return arithmeticMapNodes;
    if (catId === 2 || name.includes("álgebra")) return algebraMapNodes;
    if (catId === 4 || name.includes("diferencial")) return calculusMapNodes;
    if (catId === 5 || name.includes("integral")) return integralCalculusMapNodes;
    return [];
  };

  const { data: activeCategorySubcategories } = useQuery<any[]>({
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

  const { data: activeCategoryQuizzes } = useQuery<Quiz[]>({
    queryKey: ["category-quizzes-roadmap", activeCategoryId],
    queryFn: () => activeCategoryId ? fetchCategoryQuizzes(activeCategoryId) : Promise.resolve([]),
    enabled: !!activeCategoryId,
  });

  // Calculate Roadmap Nodes
  // Calculate Roadmap Nodes based on MAP DATA (Visual Order)
  const roadmapNodes: RoadmapNode[] = useMemo(() => {
    const rawNodes = ((activeCategoryId ? getMapNodes(activeCategoryId) : []) as ArithmeticNode[]);

    // 1. First pass: Calculate individual node content and status
    const processedNodes = rawNodes.map((node) => {
      const categoryQuizzes = activeCategoryQuizzes || [];
      let nodeQuizzes = categoryQuizzes.filter(q => q.subcategoryId == node.subcategoryId) || [];

      if (node.filterKeywords && node.filterKeywords.length > 0) {
        const keywords = node.filterKeywords.map(k => k.toLowerCase());
        nodeQuizzes = nodeQuizzes.filter(q => {
          const titleLower = q.title.toLowerCase();
          if (!keywords.some(k => titleLower.includes(k))) return false;
          if (node.excludeKeywords && node.excludeKeywords.length > 0) {
            const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
            if (excludeKeys.some(k => titleLower.includes(k))) return false;
          }
          return true;
        });
      }

      let progressPercent = 0;
      if (nodeQuizzes.length > 0 && quizzes) {
        const completedCount = nodeQuizzes.filter(q =>
          quizzes.some(uq => uq.id === q.id && uq.status === 'completed')
        ).length;
        progressPercent = (completedCount / nodeQuizzes.length) * 100;
      }

      // EXPLORATORY LOGIC: No prerequisites, only content-based
      let status: 'locked' | 'available' | 'completed' | 'partial' = 'locked';
      if (nodeQuizzes.length === 0) {
        status = 'locked';
      } else if (progressPercent >= 100) {
        status = 'completed';
      } else {
        status = 'available';
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
      const isParent = node.behavior === 'container' || node.type === 'critical';
      if (isParent) {
        currentParent = node;
        groupNodes[node.id] = [];
      } else if (currentParent) {
        groupNodes[currentParent.id].push(node);
      }
    });

    // 3. Third pass: Construct final RoadmapNode objects
    return processedNodes.map((node) => {
      const isParent = node.behavior === 'container' || node.type === 'critical';
      let finalStatus: 'locked' | 'available' | 'completed' | 'partial' = node.calculatedStatus;

      if (isParent) {
        const children = groupNodes[node.id] || [];
        if (children.length > 0) {
          const allLocked = children.every(c => c.calculatedStatus === 'locked');
          const allCompleted = children.every(c => c.calculatedStatus === 'completed');
          const anyAvailable = children.some(c => c.calculatedStatus === 'available');
          const hasLockedChild = children.some(c => c.calculatedStatus === 'locked');
          const hasCompletedChild = children.some(c => c.calculatedStatus === 'completed');

          if (allLocked && node.calculatedStatus === 'locked') {
            finalStatus = 'locked';
          } else if (allCompleted) {
            finalStatus = 'completed';
          } else if (anyAvailable) {
            finalStatus = 'available';
          } else if (hasLockedChild && hasCompletedChild) {
            // Mixed: Some completed, some locked -> Partial
            finalStatus = 'partial';
          }
        }
      }

      return {
        id: node.id || `node-${Math.random()}`,
        title: node.label || 'Sin título',
        description: node.description || '',
        status: finalStatus,
        type: 'subcategory',
        nodeType: node.type,
        behavior: node.behavior,
        progress: node.progressPercent,
        hasContent: node.nodeQuizzes.length > 0 || (isParent && (groupNodes[node.id] || []).some(c => c.nodeQuizzes.length > 0)),
        onClick: () => {
          if (isParent) {
            const hasAnyContent = node.nodeQuizzes.length > 0 || (groupNodes[node.id] || []).some(c => c.nodeQuizzes.length > 0);
            if (hasAnyContent) {
              if (node.subcategoryId && activeCategorySubcategories) {
                const sub = activeCategorySubcategories.find(s => s.id === node.subcategoryId);
                if (sub) handleSubcategorySelect(sub);
              }
              const cat = sortedCategories.find(c => c.id === activeCategoryId);
              if (cat) setSelectedCategoryForDetails(cat);
            }
          } else {
            if (finalStatus !== 'locked') {
              const cat = sortedCategories.find(c => c.id === activeCategoryId);
              if (cat) {
                setSelectedCategoryForDetails(cat);
                setCategorySearchQuery(node.label || '');
                setQuizSearchQuery(node.label || '');
              }
              if (node.subcategoryId && activeCategorySubcategories) {
                const sub = activeCategorySubcategories.find(s => s.id === node.subcategoryId);
                if (sub) handleSubcategorySelect(sub);
              }
            }
          }
        }
      };
    });
  }, [activeCategoryId, activeCategoryQuizzes, activeCategorySubcategories, quizzes, sortedCategories]);

  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [quizSearchQuery, setQuizSearchQuery] = useState("");

  // Reset search queries when category changes
  useEffect(() => {
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
  const handleCategorySelect = (category: Category | null, subcategoryToSelect?: any) => {
    setSelectedCategoryForDetails(category);
    if (subcategoryToSelect) {
      setSelectedSubcategory(subcategoryToSelect);
      updateUrlState(category, subcategoryToSelect);
    } else {
      setSelectedSubcategory(null);
      updateUrlState(category, null);
    }
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
    if (!currentUser?.id) return;

    const today = new Date().toDateString();
    const storageKey = `mathTipLastShown_${currentUser.id}`;
    const lastShown = localStorage.getItem(storageKey);

    // Only show tip if welcome dialog is NOT shown AND user has activity (not a new user)
    // Also wait for Onboarding Tour to finish
    const isNewUser = quizzes && quizzes.length === 0;
    if (mathTipData?.tip && lastShown !== today && !showWelcomeDialog && !isNewUser && !showOnboarding) {
      const timer = setTimeout(() => {
        toast({
          title: "💡 Tip Matemático",
          description: (
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <ContentRenderer content={mathTipData.tip} className="text-white/90 text-base font-medium text-center mt-2" />
            </div>
          ),
          duration: 15000,
          className: "w-full md:w-[400px] h-auto flex flex-col justify-center items-center bg-slate-900 border border-indigo-500/30 text-slate-200 shadow-2xl rounded-2xl p-6 md:mr-12 [&>button[toast-close]]:!text-slate-400 [&>button[toast-close]]:!opacity-100 [&>button[toast-close]]:hover:!text-white [&>button[toast-close]]:hover:!bg-white/10 [&>button[toast-close]]:scale-125 [&>button[toast-close]]:top-3 [&>button[toast-close]]:right-3"
        });
        localStorage.setItem(storageKey, today);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mathTipData, toast, showWelcomeDialog, currentUser, showOnboarding]);

  const isLoading = loadingUser || loadingCategories || loadingQuizzes;



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
    // If not loading, and user has NO subjects, and is NOT viewing the onboarding tour:
    // Redirect to /welcome so they can pick a subject.
    const hasSubjects = categories && categories.length > 0;
    const isTourActive = showOnboarding;
    const isTourCompleted = currentUser?.tourStatus?.onboarding;

    console.log('Dashboard Redirect Debug:', {
      isLoading,
      hasSubjects,
      isTourActive,
      isTourCompleted,
      tourStatus: currentUser?.tourStatus,
      showOnboardingState: showOnboarding
    });

    // We only redirect if tour is NOT active. 
    // If they haven't seen the tour (isTourCompleted false), showOnboarding should become true via the other effect.
    // So we wait for showOnboarding to stabilize? 
    // Actually, if !isTourCompleted, the other effect sets showOnboarding(true).
    // So we just need to ensure we don't redirect if showOnboarding is true OR if we are about to show it.

    if (!isLoading && !hasSubjects && !isTourActive && isTourCompleted) {
      setLocation('/welcome');
    }
  }, [categories, showOnboarding, currentUser, isLoading, setLocation]);

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

  // Determine last activity and show welcome dialog
  useEffect(() => {
    if (quizzes && quizzes.length > 0) {
      // Sort by most recent interaction (completedAt or just updated if we had that, but completedAt is what we have for now)
      // For in-progress, we might need to rely on the fact that they are in the list. 
      // Ideally we'd have an 'updatedAt' field. For now, we'll use completedAt for completed ones.
      // For pending ones, we don't have a timestamp in the frontend Quiz interface easily accessible for sorting 
      // unless we look at 'progress' object if available.
      // Let's try to find the most relevant one.

      const allQuizzes = [...quizzes];
      // Sort by ID as a proxy for recency if no date? No, ID is quiz ID.
      // We need the user_quiz interaction time.
      // Assuming the API returns them in some order or we can use what we have.
      // Let's prioritize the most recently completed OR the first pending one?

      // Actually, let's look at the 'sortedCompletedQuizzes' for completed.
      // For pending, we just take the first one?

      // Let's try to find the absolute last interaction.
      // If we have mixed pending and completed, it's hard to know which was LAST without a unified date.
      // But the user said: "Si la última vez que ingresó no terminó el cuestionario..."

      // Let's prioritize IN PROGRESS (Pending) as the "last thing they might want to continue".
      // If there are pending quizzes, pick the first one (or random?).
      // If no pending, pick the last completed.

      let activity: QuizWithFeedback | null = null;

      const pending = quizzes.filter(q => q.status !== 'completed');
      const completed = quizzes.filter(q => q.status === 'completed').sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

      if (pending.length > 0) {
        activity = pending[0];
      } else if (completed.length > 0) {
        activity = completed[0];
      }

      setLastActivity(activity);

      // New Onboarding Tour Logic
      // If user hasn't seen the onboarding tour, show it first.

      // Use localStorage with userId to persist state across sessions/refresh
      // This prevents the dialog from showing again when navigating back to dashboard
      const welcomeKey = `welcomeShown_${currentUser.id}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);

      const isNewUserForDialog = !currentUser?.tourStatus?.onboarding;

      // Calculate account age to prevent "Welcome Back" for users who just registered
      // Even if they finished the tour and have activity (diagnostic), they are not "returning" yet.
      const accountAge = currentUser.createdAt ? new Date().getTime() - new Date(currentUser.createdAt).getTime() : 100000000;
      const isRecentAccount = accountAge < 24 * 60 * 60 * 1000; // 24 hours

      // Show ONLY if not seen AND has activity AND is NOT a new user AND account is not recent
      if (!hasSeenWelcome && activity && !isNewUserForDialog && !isRecentAccount) {
        setShowWelcomeDialog(true);
        localStorage.setItem(welcomeKey, 'true');
      }

    }
  }, [quizzes, currentUser]);

  // Separate effect for Onboarding Tour to ensure it runs even if user has no quizzes
  useEffect(() => {
    if (currentUser) {
      const userTourKey = `onboardingTour_${currentUser.id}`;
      const localTourCompleted = localStorage.getItem(userTourKey);

      // Only show if NOT completed in DB AND NOT completed in local storage
      if (!currentUser.tourStatus?.onboarding && !localTourCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [currentUser]);





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

  if (loadingUser || !currentUser || loadingCategories || !categories || loadingQuizzes || !quizzes) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-950"><Spinner className="h-12 w-12 text-purple-500" /></div>;
  }

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
                Hola <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{(currentUser?.username || 'Estudiante').charAt(0).toUpperCase() + (currentUser?.username || 'Estudiante').slice(1)}</span> 👋
              </h1>
            </div>
            <p className="text-slate-400 mt-1 italic">"{motivationalMessage}"</p>
            <div
              className="mt-2 inline-flex items-center bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors"
              onClick={() => setShowCreditsInfo(true)}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {currentUser?.hintCredits ?? 0} Créditos de Pistas
            </div>
          </div>



          {/* Alert Section */}
          <div className="flex flex-col gap-3 items-start">
            {/* New User Banner */}
            {quizzes && quizzes.length === 0 && (
              <div
                id="tour-get-started-alert"
                onClick={() => {
                  const element = document.getElementById('tour-quiz-list');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="animate-pulse flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-200 px-4 py-2 rounded-full border border-blue-500/30 shadow-sm cursor-pointer hover:bg-blue-600/30 transition-colors"
              >
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold">
                  ¡Comienza tu primera lección!
                </span>
              </div>
            )}

            {pendingQuizzes.length > 0 && (
              <div
                id="tour-pending-alert"
                onClick={() => setShowPendingDialog(true)}
                className="animate-pulse flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/20 shadow-sm cursor-pointer hover:bg-yellow-500/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {pendingQuizzes.length > 5
                    ? "Tienes varias actividades pendientes"
                    : `Tienes ${pendingQuizzes.length} actividades pendientes`}
                </span>
              </div>
            )}
            {feedbackQuizzes.length > 0 && (
              <div
                onClick={() => {
                  if (feedbackQuizzes.length === 1) {
                    // Navigate directly if only one
                    window.location.href = `/results/${feedbackQuizzes[0].progressId}`;
                  } else {
                    // Show dialog if multiple
                    setShowFeedbackDialog(true);
                  }
                }}
                className="animate-pulse flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 shadow-sm cursor-pointer hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {feedbackQuizzes.length === 1
                    ? "Tienes 1 nuevo comentario"
                    : `Tienes ${feedbackQuizzes.length} nuevos comentarios`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stars Navigation & Roadmap */}
        <div className="mb-8 space-y-4">
          {/* Stars Navigation */}
          <div className="flex items-center justify-center gap-4 py-4 flex-wrap">
            {sortedCategories.map((category) => (
              <TooltipProvider key={category.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setExpandedRoadmapCategoryId(expandedRoadmapCategoryId === category.id ? null : category.id)}
                      className={cn(
                        "relative p-3 rounded-full transition-all duration-300",
                        expandedRoadmapCategoryId === category.id
                          ? "bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                          : "hover:bg-slate-800"
                      )}
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-all duration-300",
                          expandedRoadmapCategoryId === category.id
                            ? "text-yellow-400 fill-yellow-400 animate-pulse"
                            : "text-slate-600 hover:text-yellow-500 hover:fill-yellow-500/20"
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
                    <p>Tu camino en {category.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Expandable Roadmap */}
          <AnimatePresence>
            {expandedRoadmapCategoryId && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <HorizontalRoadmap
                  nodes={roadmapNodes}
                  categoryName={sortedCategories.find(c => c.id === expandedRoadmapCategoryId)?.name}
                  title={sortedCategories.find(c => c.id === expandedRoadmapCategoryId)?.name ? `Tu camino en ${sortedCategories.find(c => c.id === expandedRoadmapCategoryId)?.name}` : 'Tu Progreso'}
                  className="bg-slate-900/50 border border-white/5 rounded-2xl shadow-2xl"
                  onClose={() => setExpandedRoadmapCategoryId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Main Layout: 2 Columns (Content | Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Recent Activity */}
            <div className="rounded-3xl bg-slate-900/50 border border-emerald-500/20 backdrop-blur-sm shadow-lg shadow-emerald-900/20 p-5 h-[320px] flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-emerald-500/20" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-emerald-100 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-400" /> Actividad Reciente
                </h3>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
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
                        <Button variant="link" className="text-emerald-400 mt-2">Comenzar ahora</Button>
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
            <div id="tour-pending" className="rounded-3xl bg-slate-900/50 border border-yellow-500/20 backdrop-blur-sm p-5 h-[320px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-yellow-500 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> Actividades Pendientes ({pendingQuizzes.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
                  onClick={() => setShowPendingDialog(true)}
                >
                  Ver todo
                </Button>
              </div>
              <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-2">
                  {pendingQuizzes.length > 0 ? (
                    pendingQuizzes.map((quiz) => (
                      <div key={quiz.id} className="group flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 transition-all hover:bg-slate-800/60 hover:border-yellow-500/30 hover:shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                            <PlayCircle className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0 sm:hidden">
                            <h4 className="font-semibold text-sm text-slate-200 line-clamp-2">{quiz.title}</h4>
                            <p className="text-xs text-slate-500 truncate">{quiz.difficulty}</p>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 hidden sm:block">
                          <h4 className="font-semibold text-sm text-slate-200">{quiz.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{quiz.difficulty}</p>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-2 mt-2 sm:mt-0 pl-12 sm:pl-0">
                          {(quiz.completedQuestions || 0) > 0 && (
                            <span className="text-xs font-medium text-yellow-500/80 mr-auto sm:mr-2">
                              Progreso: {quiz.completedQuestions}
                            </span>
                          )}
                          <div className="flex gap-2 ml-auto">
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
            <div id="tour-quiz-list" className="relative rounded-3xl bg-slate-900/50 border border-rose-500/20 backdrop-blur-sm shadow-lg shadow-rose-900/20 p-5 h-[320px] flex flex-col overflow-hidden">
              {/* Light from behind effect */}
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-rose-600/20 rounded-full blur-[80px] -z-10 opacity-60" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px] -z-10" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-400" /> Tus Materias
                </h3>
              </div>

              <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-3">
                  {sortedCategories.map((category) => {
                    const isRecommended = (() => {
                      const rec = localStorage.getItem('pendingRecommendations');
                      if (rec) {
                        try {
                          const parsed = JSON.parse(rec);
                          return parsed && parsed.categoryId === category.id;
                        } catch (e) { return false; }
                      }
                      return false;
                    })();

                    const recommendationData = isRecommended ? (() => {
                      try {
                        const data = JSON.parse(localStorage.getItem('pendingRecommendations') || '{}');
                        return data || {};
                      } catch (e) { return {}; }
                    })() : {};

                    return (
                      <div
                        key={category.id}
                        id={`category-card-${category.id}`}
                        onClick={() => handleCategoryClick(category)}
                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer max-w-full ${isRecommended
                          ? "bg-purple-900/10 border-purple-500/30 hover:border-purple-500/50"
                          : "bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-rose-500/30 hover:shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]"
                          }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center p-3 gap-3">
                          {/* Top row for Mobile (Icon, Title, Training Button) / Left for Desktop */}
                          <div className="flex items-center justify-between md:justify-start gap-4 flex-1 min-w-0">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-transform group-hover:scale-105 ${isRecommended ? "bg-purple-500/20 text-purple-400" : "bg-rose-500/10 text-rose-400"}`}>
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div className="min-w-0">
                                <h4 className={`font-bold text-base truncate ${isRecommended ? "text-purple-200" : "text-slate-200 group-hover:text-rose-200"}`}>
                                  {category.name}
                                </h4>
                                {isRecommended && (
                                  <p className="text-xs text-purple-400 font-medium flex items-center gap-1 animate-pulse">
                                    <Sparkles className="w-3 h-3" /> Recomendado para ti
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* CTA Button moved to Top Right on Mobile only */}
                            <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
                              <Link href={`/training/${category.id}`}>
                                <Button
                                  size="sm"
                                  className="h-9 px-4 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-0 transition-all whitespace-nowrap"
                                >
                                  <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                                  Entrenar
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {/* Action Buttons row (Videos, Temas, Mapa) + Training Button for Desktop */}
                          <div className="flex items-center gap-2 mt-1 md:mt-0 overflow-x-auto pb-1 md:pb-0 no-scrollbar max-w-full" onClick={(e) => e.stopPropagation()}>
                            {/* Video */}
                            {category.youtubeLink && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVideo(category.youtubeLink!);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-xs font-medium whitespace-nowrap"
                                title="Ver Videos"
                              >
                                <Youtube className="w-3.5 h-3.5" />
                                <span className="">Videos</span>
                              </button>
                            )}

                            {/* Temas */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-8 px-3 text-xs font-medium border transition-all whitespace-nowrap ${isRecommended
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20"
                                : "bg-slate-700/50 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategorySelect(category);
                              }}
                            >
                              <ListChecks className="w-3.5 h-3.5 mr-1.5" />
                              Temas
                            </Button>

                            {/* Mapa */}
                            <Link href={`/category/${category.id}?view=roadmap`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all whitespace-nowrap"
                              >
                                <MapIcon className="w-3.5 h-3.5 mr-1.5" />
                                Mapa
                              </Button>
                            </Link>

                            {/* Entrenamiento (CTA) - Hidden on Mobile because it's at the top */}
                            <div className="hidden md:block">
                              <Link href={`/training/${category.id}`}>
                                <Button
                                  size="sm"
                                  className="h-8 px-4 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-0 transition-all whitespace-nowrap"
                                >
                                  <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                                  Entrenar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Recommendation Detail Overlay (Optional: only if space permits or kept minimal) 
                            User said "deja el resto intacto", so I should try to preserve the diagnosis info if possible. 
                            In the previous grid, it was a side panel. Here, it could be an expanded row.
                        */}
                        {isRecommended && recommendationData?.diagnosis && (
                          <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="text-xs text-purple-300/70 font-medium mr-2">Foco:</div>
                            {Array.isArray(recommendationData.diagnosis) && recommendationData.diagnosis.slice(0, 3).map((item: any, idx: number) => (
                              item.status === 'danger' && (
                                <span key={idx} className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] text-red-200">
                                  <XCircle className="w-2.5 h-2.5" /> {item.topic}
                                </span>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

            {/* Sidebar Extras Container for Tour */}
            <div id="tour-sidebar-extras" className="space-y-4">
              {/* Promo Banners */}
              <div id="tour-promo-social" onClick={(e) => { e.preventDefault(); setShowSocialDialog(true); }} className="cursor-pointer">
                <PromoBanner
                  title="Síguenos en nuestras redes"
                  subtitle="@alanmath.ias"
                  icon={Instagram}
                  colorClass="bg-gradient-to-br from-purple-600 to-pink-500 text-white"
                  href="#"
                  buttonText="Ver redes"
                  compact={true}
                />
              </div>

              <div id="tour-promo-ebook">
                <PromoBanner
                  title="eBook Exclusivo"
                  subtitle="Movimiento Parabólico"
                  icon={ShoppingBag}
                  colorClass="bg-gradient-to-br from-[#8B4513] to-[#A0522D] text-white shadow-lg shadow-orange-900/40"
                  href="https://alanmatiasvilla1000.hotmart.host/el-fascinante-movimiento-parabolico-guia-practica-de-alanmath-f1416e10-f1d2-49ac-aa29-2e8318b2fea4"
                  buttonText="Ver eBook"
                  compact={true}
                />
              </div>

              <div id="tour-promo-website">
                <PromoBanner
                  title="Sitio Web"
                  subtitle="alanmath.com"
                  icon={Globe}
                  colorClass="bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                  href="https://alanmath.com/"
                  buttonText="Visitar"
                  compact={true}
                />
              </div>

              {/* Rest Zone Card */}
              <div id="tour-rest-zone" className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/40 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setShowRestZone(true)}>
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
          <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-slate-200" onOpenAutoFocus={(e) => e.preventDefault()} tabIndex={-1}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-500">
                <PlayCircle className="w-6 h-6" />
                Actividades Pendientes ({pendingQuizzes.length})
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Aquí tienes la lista completa de cuestionarios que aún no has completado.
              </DialogDescription>
            </DialogHeader>

            <div className="relative px-4 pb-2">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar cuestionario..."
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-yellow-500/50"
              />
            </div>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3 py-2">
                {filteredPendingQuizzes.length > 0 ? (
                  filteredPendingQuizzes.map((quiz) => (
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
              <Button variant="outline" onClick={() => setShowPendingDialog(false)} className="bg-slate-800 hover:bg-slate-700 text-white border-slate-600 hover:border-slate-500">Cerrar</Button>
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
                  ? "Selecciona un cuestionario para comenzar."
                  : "Selecciona un tema para ver los cuestionarios disponibles."}
              </DialogDescription>
            </DialogHeader>

            {!selectedSubcategory && (
              <div className="space-y-4">


                <div className="relative my-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Buscar tema o cuestionario..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="pl-9 bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500/50"
                  />
                </div>
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
                                    <p className="text-xs text-slate-500 line-clamp-none">{quiz.description}</p>
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
                                        const completedQuiz = completedQuizzes.find(q => q.id === quiz.id);
                                        if (completedQuiz?.progressId) {
                                          setLocation(`/results/${completedQuiz.progressId}`);
                                        }
                                      } else {
                                        // Start quiz
                                        setLocation(`/quiz/${quiz.id}`);
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
                  {/* Recommendation Alert inside Dialog */}
                  {(() => {
                    const rec = localStorage.getItem('pendingRecommendations');
                    if (rec) {
                      try {
                        const parsed = JSON.parse(rec);
                        // Verify matches category
                        if (parsed.categoryId === selectedCategoryForDetails?.id && parsed.diagnosis) {
                          return (
                            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-4 mb-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Sparkles className="w-16 h-16 text-purple-400" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="flex items-center gap-2 text-purple-300 font-bold text-lg mb-2">
                                  <Sparkles className="w-5 h-5" /> Recomendación Personalizada
                                </h4>
                                <p className="text-slate-300 text-sm mb-3">
                                  Basado en tu diagnóstico, te sugerimos enfocar tu estudio en estos temas:
                                </p>

                                {Array.isArray(parsed.diagnosis) && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                    {parsed.diagnosis.map((item: any, idx: number) => (
                                      item.status === 'danger' && (
                                        <div key={idx} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                                          <XCircle className="w-4 h-4 text-red-400" />
                                          <span className="text-red-200 text-xs font-semibold">{item.topic}</span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 items-center mt-2">
                                  <p className="text-xs text-slate-400 italic flex-1">
                                    ¿No sabes por dónde empezar? Pide ayuda a un profe.
                                  </p>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-900/20 w-full sm:w-auto"
                                    onClick={() => window.open(`https://wa.me/573208056799?text=${encodeURIComponent('Hola, vi mis recomendaciones de estudio y quisiera ayuda para empezar con mi plan personalizado.')}`, '_blank')}
                                  >
                                    <FaWhatsapp className="mr-2 h-4 w-4" /> Solicitar Guía
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        console.error("Error parsing recommendation", e);
                      }
                    }
                    return null;
                  })()}

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

        {/* Social Media Dialog */}
        <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-pink-500">
                <Instagram className="w-6 h-6" />
                Síguenos en Redes
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Únete a nuestra comunidad en todas las plataformas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 py-4">
              <a href="https://www.youtube.com/@AlanMath" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group">
                <div className="p-2 bg-red-500/20 rounded-full text-red-500 group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">YouTube</h4>
                  <p className="text-xs text-slate-400">Tutoriales y clases completas</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
              </a>

              <a href="https://www.instagram.com/alanmath.ias/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-colors group">
                <div className="p-2 bg-pink-500/20 rounded-full text-pink-500 group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Instagram</h4>
                  <p className="text-xs text-slate-400">Tips rápidos y novedades</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
              </a>

              <a href="https://www.tiktok.com/@alanmath.ias" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 transition-colors group">
                <div className="p-2 bg-black/40 rounded-full text-white group-hover:scale-110 transition-transform">
                  <span className="font-bold text-lg">Tk</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">TikTok</h4>
                  <p className="text-xs text-slate-400">Hacks matemáticos virales</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
              </a>

              <a href="https://www.facebook.com/people/AlanMathias/61572215860800/?name=xhp_nt_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 transition-colors group">
                <div className="p-2 bg-blue-600/20 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Facebook</h4>
                  <p className="text-xs text-slate-400">Comunidad y eventos</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
              </a>

              <a href="https://alanmath.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-cyan-600/10 border border-cyan-600/20 hover:bg-cyan-600/20 transition-colors group">
                <div className="p-2 bg-cyan-600/20 rounded-full text-cyan-500 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Sitio Web</h4>
                  <p className="text-xs text-slate-400">Visita nuestra página oficial</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
              </a>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSocialDialog(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Selection Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogContent className="bg-slate-900 border-white/10 text-slate-200 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Nuevos Feedbacks Recibidos
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Has recibido comentarios en los siguientes cuestionarios. Selecciona uno para ver los detalles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {feedbackQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => window.location.href = `/results/${quiz.progressId}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer hover:bg-slate-800 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{quiz.title}</h4>
                      <p className="text-xs text-slate-500">{new Date(quiz.completedAt || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowFeedbackDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <RestZoneDialog open={showRestZone} onOpenChange={setShowRestZone} />

        <WelcomeDialog
          open={showWelcomeDialog && !showOnboarding}
          onOpenChange={setShowWelcomeDialog}
          username={currentUser?.username || 'Estudiante'}
          lastActivity={lastActivity}
        />
        {currentUser && (
          <OnboardingTour
            isOpen={showOnboarding}
            user={currentUser}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
      </div >
      <FloatingWhatsApp
        message="Hola, me gustaría cotizar clases de refuerzo para mejorar mi rendimiento en matemáticas."
        tooltip="Cotizar Clases de Refuerzo"
      />
    </div >
  );
}
