import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateMasteryStats, MasteryStats } from '@/lib/mastery-utils';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '@/types/types';

export type MasteryLevel = 'none' | 'silver_medal' | 'gold_medal' | 'silver_trophy' | 'gold_trophy';

interface MasteryInsigniaProps {
    categoryId: number;
    quizzes: any[]; // User-quizzes with status
    onClick?: (categoryId: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export const MasteryInsignia: React.FC<MasteryInsigniaProps> = ({
    categoryId,
    quizzes,
    onClick,
    size = 'md'
}) => {
    // Fetch all quizzes for the category to have ground truth (cached)
    const { data: allCategoryQuizzes } = useQuery<Quiz[]>({
        queryKey: ["category-quizzes-all", categoryId],
        queryFn: async () => {
            const res = await fetch(`/api/categories/${categoryId}/quizzes`);
            if (!res.ok) return [];
            return res.json();
        },
        staleTime: 1000 * 60 * 30, // 30 mins cache
    });

    const mastery = useMemo(() => {
        if (!allCategoryQuizzes || allCategoryQuizzes.length === 0) return { level: 'none' as MasteryLevel };

        const stats = calculateMasteryStats(categoryId, quizzes, allCategoryQuizzes);

        if (stats.goldTrophies >= 1) return { level: 'gold_trophy' as MasteryLevel };
        if (stats.silverTrophies >= 1) return { level: 'silver_trophy' as MasteryLevel };
        if (stats.goldMedals >= 1) return { level: 'gold_medal' as MasteryLevel };
        if (stats.silverMedals >= 1) return { level: 'silver_medal' as MasteryLevel };

        return { level: 'none' as MasteryLevel };
    }, [categoryId, quizzes, allCategoryQuizzes]);

    if (mastery.level === 'none') return null;

    const config = {
        silver_medal: {
            icon: Medal,
            color: "text-slate-300",
            label: "Cuestionarios",
            type: "Medalla de Plata"
        },
        gold_medal: {
            icon: Award,
            color: "text-yellow-400",
            label: "Temas",
            type: "Medalla de Oro"
        },
        silver_trophy: {
            icon: Trophy,
            color: "text-blue-100",
            label: "Unidades Completadas",
            type: "Copa de Plata"
        },
        gold_trophy: {
            icon: Trophy,
            color: "text-yellow-500",
            label: "Materia Completa",
            type: "Copa de Oro"
        }
    }[mastery.level as Exclude<MasteryLevel, 'none'>];

    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(categoryId);
                        }}
                        className={cn(
                            "relative cursor-pointer group flex items-center justify-center pointer-events-auto",
                            size === 'sm' ? "w-8 h-8" : size === 'lg' ? "w-16 h-16" : "w-12 h-12"
                        )}
                    >
                        <div className={cn("relative z-10 w-full h-full p-1 drop-shadow-xl")}>
                            <Icon
                                className={cn("w-full h-full stroke-[1.5px] transition-all", config.color)}
                                fill="currentColor"
                                fillOpacity={0.25}
                            />

                            {/* Highlight Overlay (Simulates 3D reflections) */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/20 pointer-events-none rounded-full" />
                            <div className="absolute top-1 left-2 w-1/4 h-1/4 bg-white/30 blur-[2px] rounded-full pointer-events-none" />
                        </div>

                        {mastery.level === 'gold_trophy' && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full -z-10"
                            />
                        )}
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-950 border-white/10 p-3 rounded-xl shadow-2xl z-[100]">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{config.label}</p>
                        <p className={cn("text-xs font-black italic", config.color)}>{config.type}</p>
                        <div className="mt-2 text-[9px] text-slate-400 bg-white/5 py-1 px-2 rounded opacity-80">Haz clic para ver tu cofre</div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
