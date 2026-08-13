import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { calculateMasteryStats } from "@/lib/mastery-utils";
import { MasteryInsignia } from "@/components/dashboard/MasteryInsignia";
import { useLocation } from "wouter";
import { Category, Quiz } from "@/types/types";

interface CategoryStarItemProps {
  category: Category;
  quizzes: any[];
  completedQuizzes: any[];
  currentUser: any;
  setSelectedAwardsCategory: (cat: Category) => void;
  isLast: boolean;
}

export const CategoryStarItem: React.FC<CategoryStarItemProps> = ({
  category,
  quizzes,
  completedQuizzes,
  currentUser,
  setSelectedAwardsCategory,
  isLast,
}) => {
  const [_, setLocation] = useLocation();

  const { data: categoryQuizzes } = useQuery<Quiz[]>({
    queryKey: ["category-quizzes-all", category.id],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${category.id}/quizzes`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: allQuizzesPool } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const res = await fetch("/api/quizzes");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: nodeMappings } = useQuery<any[]>({
    queryKey: [`/api/node-mappings/${category.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/node-mappings/${category.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  const { progress, isCompleted, hasPendingNewContent, newContentNodes } = useMemo(() => {
    const wasPreviouslyCompleted = !!(
      currentUser?.tourStatus?.completedMaps?.[category.id] ||
      currentUser?.tourStatus?.completedMaps?.[String(category.id)]
    );

    const mergedPool = [...(allQuizzesPool || []), ...(categoryQuizzes || [])];
    const stats = calculateMasteryStats(category.id, quizzes, mergedPool, nodeMappings, wasPreviouslyCompleted);

    let calcProgress = stats.progress;

    if (stats.totalQuizzes === 0 && categoryQuizzes && categoryQuizzes.length > 0) {
      const catBaseQuizzes = categoryQuizzes.filter((q) => q.categoryId === category.id);
      const userProgressMap = new Map((quizzes || []).map((q) => [q.id, q]));
      const completedCount = catBaseQuizzes.filter(
        (q) => userProgressMap.get(q.id)?.status === "completed"
      ).length;
      calcProgress = catBaseQuizzes.length > 0 ? (completedCount / catBaseQuizzes.length) * 100 : 0;
    }

    const finalProgress = Math.min(100, Math.round(calcProgress));
    const complete = stats.earnedGoldTrophy || finalProgress >= 100;

    return {
      progress: finalProgress,
      isCompleted: complete,
      hasPendingNewContent: stats.hasPendingNewContent,
      newContentNodes: stats.newContentNodes,
    };
  }, [category.id, quizzes, categoryQuizzes, allQuizzesPool, nodeMappings, currentUser]);

  return (
    <div className="flex flex-col items-center gap-1 relative group/star">
      <div className="h-10 flex items-center justify-center">
        <MasteryInsignia
          categoryId={category.id}
          quizzes={completedQuizzes}
          tourStatus={currentUser?.tourStatus}
          onClick={() => setSelectedAwardsCategory(category)}
          size="lg"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setLocation(`/category/${category.id}?view=roadmap`)}
              className={cn(
                "relative p-3 rounded-full transition-all duration-300 border shadow-sm group/btn",
                hasPendingNewContent
                  ? "bg-red-500/15 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] hover:bg-slate-800 hover:border-yellow-500/60"
                  : isCompleted
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:bg-slate-800 hover:border-yellow-500/60"
                  : "bg-blue-600/10 border-blue-500/20 hover:bg-slate-800 hover:border-blue-500/40"
              )}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-all duration-300 drop-shadow-sm",
                  hasPendingNewContent
                    ? "text-red-400 fill-red-400/30 group-hover/star:text-yellow-400 group-hover/star:fill-yellow-400/40 group-hover/star:drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]"
                    : isCompleted
                    ? "text-emerald-400 fill-emerald-400/30 group-hover/star:text-yellow-400 group-hover/star:fill-yellow-400/40 group-hover/star:drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]"
                    : "text-blue-500 fill-blue-500/10 group-hover/star:text-yellow-400 group-hover/star:fill-yellow-400/40 group-hover/star:drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]"
                )}
              />
              {hasPendingNewContent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200 font-bold max-w-[200px]">
            {hasPendingNewContent ? (
              <div className="space-y-1">
                <p className="text-red-400 font-black text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Nuevo contenido disponible
                </p>
                <p className="text-slate-400 text-[10px]">
                  {newContentNodes.slice(0, 2).join(", ")}
                  {newContentNodes.length > 2 && ` +${newContentNodes.length - 2} mas`}
                </p>
                <p className="text-slate-500 text-[10px]">Tu camino en {category.name} ({progress}%)</p>
              </div>
            ) : (
              <p>Tu camino en {category.name} ({progress}%)</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span
        onClick={() => setLocation(`/category/${category.id}?view=roadmap`)}
        className={cn(
          "text-[9px] md:text-[10px] font-black text-center max-w-[68px] line-clamp-1 leading-tight mt-1 tracking-wider cursor-pointer uppercase transition-all duration-300",
          hasPendingNewContent
            ? "text-red-400/90 hover:text-red-300 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            : isCompleted
            ? "text-emerald-400/90 hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            : "text-blue-400/80 hover:text-blue-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
        )}
        title={category.name}
      >
        {category.name}
      </span>

      <div
        onClick={() => setLocation(`/category/${category.id}?view=roadmap`)}
        className="w-full max-w-[68px] flex flex-col items-center gap-1 cursor-pointer mt-1 group/bar"
        title={`Progreso en ${category.name}: ${progress}%`}
      >
        <div className="w-full h-1.5 bg-slate-950/90 border border-white/10 rounded-full overflow-hidden p-[0.5px] shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-all duration-500",
              hasPendingNewContent
                ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                : "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400"
            )}
          />
        </div>
        <span
          className={cn(
            "text-[8px] font-black tracking-tighter leading-none transition-colors",
            hasPendingNewContent
              ? "text-red-400 font-extrabold"
              : isCompleted
              ? "text-emerald-400 font-extrabold"
              : "text-slate-400 group-hover/bar:text-blue-300"
          )}
        >
          {progress}%
        </span>
      </div>

      {isLast && (
        <div className="hidden lg:flex flex-col items-center absolute -right-24 xl:-right-32 bottom-[-10px] pointer-events-none z-10 transition-all">
          <svg width="80" height="60" viewBox="0 0 100 70" className="overflow-visible mb-[-12px]">
            <motion.path
              d="M 80 60 Q 60 50, 20 15"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              fill="transparent"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.8, 1] }}
            />
            <motion.path
              d="M 25 22 L 20 15 L 28 12"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.5, 0.8, 1] }}
            />
          </svg>
          <motion.div
            animate={{ y: [0, 4, 0], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.2)] text-center min-w-[95px] flex items-center gap-1.5"
          >
            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter leading-tight whitespace-nowrap">
              Tu ruta al exito
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};
