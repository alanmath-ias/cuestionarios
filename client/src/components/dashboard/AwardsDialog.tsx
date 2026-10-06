import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award, Star, Search, Sparkles, Target, Zap, Gift, CheckCircle2, ChevronRight, Loader2, ArrowLeft, MessageCircle, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MasteryInsignia } from './MasteryInsignia';
import { Category, Quiz } from '@/types/types';
import { cn } from '@/lib/utils';
import { calculateMasteryStats, CATEGORY_GRADES } from '@/lib/mastery-utils';
import { useQuery } from '@tanstack/react-query';

interface AwardsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
    quizzes: any[]; // User-quizzes with status
    username: string;
    wonDuels?: number;
    hintCredits?: number;
    isPublicView?: boolean;
    tourStatus?: any; // tourStatus del estudiante — para detectar copa ganada previamente
    initialGrade?: string | null; // Optional: e.g. 'grade-1'
}

type DetailType = 'gold_cup' | 'silver_cup' | 'gold_medal' | 'silver_medal' | null;

export const AwardsDialog: React.FC<AwardsDialogProps> = ({
    isOpen,
    onClose,
    category,
    quizzes,
    username,
    wonDuels = 0,
    hintCredits = 0,
    isPublicView = false,
    tourStatus,
    initialGrade
}) => {
    const [selectedType, setSelectedType] = useState<DetailType>(null);
    const [selectedGradeKey, setSelectedGradeKey] = useState<string>('general');

    // Fetch all quizzes for the category to have ground truth for map completion
    const { data: allCategoryQuizzes, isLoading: loadingAllQuizzes } = useQuery<Quiz[]>({
        queryKey: ["category-quizzes-all", category?.id],
        queryFn: async () => {
            if (!category) return [];
            const res = await fetch(`/api/categories/${category.id}/quizzes`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!category && isOpen,
    });

    // Fetch ALL quizzes across all categories to capture guest/cross-category quizzes
    const { data: allQuizzesPool } = useQuery<Quiz[]>({
        queryKey: ["/api/quizzes"],
        queryFn: async () => {
            const res = await fetch("/api/quizzes");
            if (!res.ok) return [];
            return res.json();
        },
        staleTime: 1000 * 60 * 30,
        enabled: isOpen,
    });

    const { data: nodeMappings } = useQuery<any[]>({
        queryKey: [`/api/node-mappings/${category?.id}`],
        queryFn: async () => {
            if (!category) return [];
            const res = await fetch(`/api/node-mappings/${category.id}`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!category && isOpen,
    });

    const availableGrades = React.useMemo(() => {
        if (!category) return [];
        return CATEGORY_GRADES[category.id] || [];
    }, [category]);

    // Sincronizar selección de grado al abrir o cambiar de categoría
    React.useEffect(() => {
        if (isOpen) {
            if (initialGrade && availableGrades.some(g => g.key === initialGrade)) {
                setSelectedGradeKey(initialGrade);
            } else {
                setSelectedGradeKey('general');
            }
            setSelectedType(null);
        }
    }, [isOpen, category?.id, initialGrade]);

    const activeGrade = React.useMemo(() => {
        if (selectedGradeKey === 'general') return null;
        return availableGrades.find(g => g.key === selectedGradeKey) || null;
    }, [selectedGradeKey, availableGrades]);

    // Resúmenes rápidos de cada grado para los badges de las pestañas
    const gradeSummaries = React.useMemo(() => {
        if (!category || availableGrades.length === 0) return {};
        const mergedPool = [...(allQuizzesPool || []), ...(allCategoryQuizzes || [])];
        const res: Record<string, { progress: number; isComplete: boolean }> = {};
        for (const g of availableGrades) {
            const gradeWasPrev = !!(
                tourStatus?.completedMaps?.[g.key] ||
                tourStatus?.completedMaps?.[`${category.id}_${g.key}`]
            );
            const gradeStats = calculateMasteryStats(category.id, quizzes, mergedPool, nodeMappings, gradeWasPrev, g.nodes);
            res[g.key] = {
                progress: Math.round(gradeStats.progress),
                isComplete: gradeStats.earnedGoldTrophy || (gradeStats.progress === 100 && gradeStats.totalQuizzes > 0)
            };
        }
        return res;
    }, [category, availableGrades, allQuizzesPool, allCategoryQuizzes, quizzes, nodeMappings, tourStatus]);

    const stats = React.useMemo(() => {
        if (!category) return null;
        // Si hay un grado seleccionado, su Copa Oro debe depender ÚNICAMENTE de ese grado,
        // no de la copa ganada previamente en la categoría general.
        const wasPreviouslyCompleted = activeGrade
            ? !!(
                tourStatus?.completedMaps?.[activeGrade.key] ||
                tourStatus?.completedMaps?.[`${category.id}_${activeGrade.key}`]
            )
            : !!(
                tourStatus?.completedMaps?.[category.id] ||
                tourStatus?.completedMaps?.[String(category.id)]
            );
        // Merge category quizzes with all-quiz pool so guest quizzes from other categories are counted
        const mergedPool = [...(allQuizzesPool || []), ...(allCategoryQuizzes || [])];
        const customNodes = activeGrade ? activeGrade.nodes : undefined;
        return calculateMasteryStats(category.id, quizzes, mergedPool, nodeMappings, wasPreviouslyCompleted, customNodes);
    }, [category, quizzes, allCategoryQuizzes, allQuizzesPool, nodeMappings, tourStatus, activeGrade]);

    if (!category) return null;

    const handleWhatsApp = (type: string, data: any) => {
        const lowestNames = (data || []).map((q: any) => q.label).join(", ");
        const contextStr = activeGrade ? `${category.name} (${activeGrade.title})` : category.name;
        const message = `¡Hola! Soy ${username}, he visto mis estadísticas de ${contextStr} en el Cofre y me gustaría reforzar estos temas: ${lowestNames}. ¿Podrían ayudarme?`;
        const url = `https://wa.me/573208056799?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setSelectedType(null); onClose(); } }}>
            <DialogContent className="w-[96vw] max-w-5xl max-h-[92vh] bg-slate-950/98 border-amber-500/20 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-0 focus:outline-none">
                <ScrollArea className="h-[92vh] max-h-[92vh] p-0 w-full">
                    {(!allCategoryQuizzes || !stats) ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Abriendo Cofre...</p>
                        </div>
                    ) : (
                        <div className="relative w-full min-w-0">
                            <AnimatePresence mode="wait">
                                {!selectedType ? (
                                    <motion.div
                                        key="main-grid"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="relative w-full min-w-0"
                                    >
                                        {/* Header with Visual Focus on the specific Map */}
                                        <div className="relative p-4 sm:p-8 md:p-10 pb-4 sm:pb-6 text-center space-y-4 sm:space-y-6 w-full min-w-0">
                                            <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

                                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                                                <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                                                <div className="space-y-1">
                                                    <DialogTitle className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 tracking-tighter uppercase italic leading-tight">
                                                        {activeGrade ? `Cofre de ${activeGrade.name}` : `Cofre de ${category.name}`}
                                                    </DialogTitle>
                                                    <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-80">
                                                        {activeGrade ? `${activeGrade.title} • Logros de ${username}` : `Logros de ${username}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Subcofres Navigation Tabs (Grados) */}
                                            {availableGrades.length > 0 && (
                                                <div className="w-full max-w-full min-w-0 flex flex-col items-center gap-2 pt-1 sm:pt-2">
                                                    <div className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" /> Subcofres por Grado
                                                    </div>
                                                    <div className="w-full max-w-full min-w-0 overflow-x-auto no-scrollbar touch-pan-x py-1 px-1">
                                                        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-2xl w-fit mx-auto shrink-0">
                                                            {/* Tab General */}
                                                            <button
                                                                type="button"
                                                                onClick={() => { setSelectedGradeKey('general'); setSelectedType(null); }}
                                                                className={cn(
                                                                    "relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0",
                                                                    selectedGradeKey === 'general'
                                                                        ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105"
                                                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                                                )}
                                                            >
                                                                <span className="text-xs sm:text-sm">🌟</span>
                                                                <span>General</span>
                                                            </button>

                                                            {/* Tabs por Grado */}
                                                            {availableGrades.map((g) => {
                                                                const isSelected = selectedGradeKey === g.key;
                                                                const summary = gradeSummaries[g.key];
                                                                const isComplete = summary?.isComplete;
                                                                const progress = summary?.progress || 0;

                                                                return (
                                                                    <button
                                                                        key={g.key}
                                                                        type="button"
                                                                        onClick={() => { setSelectedGradeKey(g.key); setSelectedType(null); }}
                                                                        className={cn(
                                                                            "relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0",
                                                                            isSelected
                                                                                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105"
                                                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                                        )}
                                                                    >
                                                                        <span className="text-xs sm:text-sm">{g.icon}</span>
                                                                        <span>{g.shortLabel}</span>
                                                                        {isComplete ? (
                                                                            <span className={cn(
                                                                                "text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-black",
                                                                                isSelected ? "bg-slate-950 text-amber-400" : "bg-amber-500/20 text-amber-400"
                                                                            )}>★</span>
                                                                        ) : progress > 0 ? (
                                                                            <span className={cn(
                                                                                "text-[8px] sm:text-[9px] px-1 sm:px-1 py-0.2 rounded-full font-bold",
                                                                                isSelected ? "bg-slate-950/25 text-slate-950" : "bg-white/5 text-slate-400"
                                                                            )}>{progress}%</span>
                                                                        ) : null}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Main Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 mt-6 sm:mt-8 w-full">
                                                <StatCard
                                                    icon={Trophy}
                                                    label="Copa Oro"
                                                    sublabel={activeGrade ? `${activeGrade.shortLabel} Completo` : "Materia Completa"}
                                                    value={stats.earnedGoldTrophy ? 1 : 0}
                                                    color={stats.hasPendingNewContent ? "text-red-400" : "text-yellow-500"}
                                                    delay={0.1}
                                                    onClick={() => !isPublicView && setSelectedType('gold_cup')}
                                                    disabled={isPublicView}
                                                    categoryId={category?.id}
                                                    hasPendingNewContent={stats.hasPendingNewContent}
                                                />
                                                <StatCard
                                                    icon={Trophy}
                                                    label="Copa Plata"
                                                    sublabel={activeGrade ? `Unidades de ${activeGrade.shortLabel}` : "Unidades Completadas"}
                                                    value={stats.silverTrophies}
                                                    color="text-blue-100"
                                                    delay={0.2}
                                                    onClick={() => !isPublicView && setSelectedType('silver_cup')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Award}
                                                    label="Medalla Oro"
                                                    sublabel={activeGrade ? `Temas de ${activeGrade.shortLabel}` : "Temas"}
                                                    value={stats.goldMedals}
                                                    color="text-amber-400"
                                                    delay={0.3}
                                                    onClick={() => !isPublicView && setSelectedType('gold_medal')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Medal}
                                                    label="Medalla Plata"
                                                    sublabel={activeGrade ? `Quizzes de ${activeGrade.shortLabel}` : "Cuestionarios"}
                                                    value={stats.silverMedals}
                                                    color="text-slate-400"
                                                    delay={0.4}
                                                    onClick={() => !isPublicView && setSelectedType('silver_medal')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Sword}
                                                    label="Victorias"
                                                    sublabel="Duelos Ganados"
                                                    value={wonDuels}
                                                    color="text-red-400"
                                                    delay={0.5}
                                                />
                                                <StatCard
                                                    icon={Zap}
                                                    label="Créditos"
                                                    sublabel="Disponibles"
                                                    value={hintCredits}
                                                    color="text-blue-400"
                                                    delay={0.6}
                                                    onClick={isPublicView ? undefined : undefined}
                                                />
                                            </div>
                                        </div>

                                        <div className="px-4 sm:px-8 md:px-10 pb-8 sm:pb-12 space-y-6 sm:space-y-8 w-full min-w-0">
                                            {/* Detailed Progress Section */}
                                            <div className="space-y-3 sm:space-y-4">
                                                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                                                    <span className="h-px w-4 sm:w-6 bg-slate-800" /> {activeGrade ? `Resumen de ${activeGrade.title}` : "Resumen del Mapa"}
                                                </h4>

                                                <div className="p-4 sm:p-6 rounded-[1.8rem] sm:rounded-[2.5rem] bg-slate-900/40 border border-white/5 relative overflow-hidden group">
                                                    <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                            <div className="shrink-0">
                                                                <MasteryInsignia categoryId={category.id} quizzes={quizzes} size="lg" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                                                                    {activeGrade ? "Subcofre Activo" : "Estado Actual"}
                                                                </p>
                                                                <h5 className="text-base sm:text-xl font-black text-white uppercase italic truncate">
                                                                    {activeGrade ? `${activeGrade.icon} ${activeGrade.title}` : category.name}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tighter">{Math.round(stats.progress)}%</span>
                                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Completado</p>
                                                        </div>
                                                    </div>

                                                    <div className="h-2.5 sm:h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <motion.div
                                                            key={selectedGradeKey}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${stats.progress}%` }}
                                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                                            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            <span className="text-xs font-bold truncate">{stats.completedQuizzes} de {stats.totalQuizzes} Cuestionarios</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Target className="w-4 h-4 text-blue-400 shrink-0" />
                                                            <span className="text-xs font-bold truncate">{stats.goldMedals} Temas Dominados</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Motivational Footer */}
                                            <div className="text-center space-y-4 pt-2 sm:pt-4">
                                                {!isPublicView && (
                                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] sm:tracking-[0.5em]">Toca una medalla para ver detalles</p>
                                                )}
                                                <button
                                                    onClick={onClose}
                                                    className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 px-10 sm:px-12 py-3.5 sm:py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl"
                                                >
                                                    Cerrar Cofre
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <DetailView
                                        type={selectedType}
                                        stats={stats}
                                        onBack={() => setSelectedType(null)}
                                        onWhatsApp={handleWhatsApp}
                                        categoryId={category?.id}
                                        gradeTitle={activeGrade ? activeGrade.title : undefined}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

const StatCard = ({ icon: Icon, label, sublabel, value, color, delay, onClick, disabled, categoryId, hasPendingNewContent }: any) => {
    const isGoldCup = label === "Copa Oro" && value > 0;
    let goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo.png";
    if (categoryId === 2) {
        goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo_algebra.png";
    } else if (categoryId === 4) {
        goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo_calculo_diferencial.png";
    }
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring' }}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative bg-slate-900/60 rounded-[1.6rem] sm:rounded-[2.2rem] p-3 sm:p-5 border flex flex-col items-center gap-1 shadow-2xl group transition-all border-b-2 active:scale-95 overflow-hidden w-full",
                isGoldCup && hasPendingNewContent
                    ? "border-red-500/50 border-b-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/20"
                    : isGoldCup 
                    ? "border-yellow-500/50 border-b-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-gradient-to-b from-slate-900 via-slate-900 to-yellow-950/20" 
                    : "border-white/5 border-b-transparent",
                !disabled && "hover:bg-slate-900/80",
                !disabled && !isGoldCup && "hover:border-b-amber-500/40",
                disabled && "cursor-default opacity-90"
            )}
        >
            {isGoldCup && (
                <>
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className={cn(
                            "absolute inset-0 blur-md rounded-[1.6rem] sm:rounded-[2.2rem]",
                            hasPendingNewContent ? "bg-red-500/20" : "bg-yellow-500/20"
                        )}
                    />
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    />
                </>
            )}
            <div className={cn("relative mb-0.5 sm:mb-1", color, isGoldCup && "animate-bounce-subtle")}>
                {isGoldCup ? (
                    <div className="relative">
                        <img src={goldCupImage} className={cn("w-6 h-6 sm:w-7 sm:h-7 object-contain", hasPendingNewContent ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] opacity-75" : "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]")} />
                        {hasPendingNewContent && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center"
                            >
                                <span className="text-[6px] text-white font-black">!</span>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-lg" fill="currentColor" fillOpacity={0.15} />
                )}
                <div className="absolute inset-0 bg-white/20 blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1" />
            </div>
            <span className={cn("text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none relative z-10", isGoldCup && (hasPendingNewContent ? "text-red-400" : "text-yellow-400"))}>{value}</span>
            <div className="text-center mt-0.5 sm:mt-1 relative z-10 w-full px-1">
                <p className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate", color, isGoldCup && (hasPendingNewContent ? "text-red-400" : "text-yellow-400"))}>{label}</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase leading-none opacity-60 truncate mt-0.5">{sublabel}</p>
                {isGoldCup && hasPendingNewContent && (
                    <p className="text-[7px] font-black text-red-400/80 uppercase tracking-widest mt-0.5">Pendiente</p>
                )}
            </div>
            {!disabled && (
                <div className="mt-1 sm:mt-2 text-[7px] sm:text-[8px] text-amber-500/0 group-hover:text-amber-500/70 font-black uppercase tracking-widest transition-all relative z-10">Ver Más</div>
            )}

        </motion.button>
    );
};

const DetailView = ({ type, stats, onBack, onWhatsApp, categoryId, gradeTitle }: { type: DetailType, stats: any, onBack: () => void, onWhatsApp: (type: string, data: any) => void, categoryId?: number, gradeTitle?: string }) => {
    let goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo.png";
    if (categoryId === 2) {
        goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo_algebra.png";
    } else if (categoryId === 4) {
        goldCupImage = "/aritmetica_imagenes/copa_de_oro_trofeo_calculo_diferencial.png";
    }
    const getGoldCupMotivation = (progress: number) => {
        if (progress === 0) return "¡El primer paso es el más importante! Comienza tu viaje hacia la maestría hoy mismo.";
        if (progress <= 25) return "¡Genial, ya comenzaste! Sigue con toda que vas por excelente camino.";
        if (progress <= 50) return "¡Vas progresando muy bien! Es genial ver tu avance, continúa así, ¡tú puedes!";
        if (progress <= 75) return "¡Ya te falta poco para la gloria! Mantén el ritmo, vas increíble, ¡no te detengas ahora!";
        return "¡Wow! Te falta muy poco para terminar todo el curso. ¡Vamos, termina de la mejor forma!";
    };

    const config: any = {
        silver_medal: {
            title: gradeTitle ? `Cuestionarios • ${gradeTitle}` : "Mis Cuestionarios",
            subtitle: gradeTitle ? `Desempeño en ${gradeTitle}` : "Desempeño Individual",
            icon: Medal,
            colorClass: "text-slate-400",
            primaryLabel: "Promedio General",
            primaryValue: stats.totalAverage.toFixed(1),
            itemsLabel: "Temas a mejorar",
            items: stats.worstQuizzes,
            bestItems: stats.bestQuizzes,
            motivation: "¡Cada test es una oportunidad de brillar! Enfócate en tus áreas de entrenamiento para alcanzar el 10.0.",
            hasWhatsApp: true
        },
        gold_medal: {
            title: gradeTitle ? `Temas • ${gradeTitle}` : "Temas Dominados",
            subtitle: gradeTitle ? `Estrategias de ${gradeTitle}` : "Dominio de Estrategias",
            icon: Award,
            colorClass: "text-amber-400",
            primaryLabel: "Maestría Promedio",
            primaryValue: stats.totalAverage.toFixed(1),
            itemsLabel: "Retos sugeridos",
            items: stats.weakestNodes,
            bestItems: stats.strongestNodes,
            motivation: "¡Dominar un tema requiere paciencia! Tus unidades fuertes son la base de tu éxito.",
            hasWhatsApp: true
        },
        silver_cup: {
            title: gradeTitle ? `Unidades • ${gradeTitle}` : "Unidades Clave",
            subtitle: gradeTitle ? `Progreso en ${gradeTitle}` : "Progreso por Unidades",
            icon: Trophy,
            colorClass: "text-blue-100",
            primaryLabel: "Unidades Completas",
            primaryValue: stats.silverTrophies,
            itemsLabel: "Unidades a reforzar",
            items: stats.weakestUnits,
            bestItems: stats.strongestUnits,
            motivation: "¡Estás construyendo un conocimiento sólido! Sigue avanzando bloque a bloque.",
            hasWhatsApp: true
        },
        gold_cup: {
            title: gradeTitle ? `Maestría • ${gradeTitle}` : "Meta Final",
            subtitle: gradeTitle ? `Camino a la Copa de ${gradeTitle}` : "Camino a la Maestría Total",
            icon: Trophy,
            colorClass: "text-yellow-500",
            primaryLabel: "Avance Total",
            primaryValue: `${Math.round(stats.progress)}%`,
            itemsLabel: "Falta por completar",
            items: stats.pendingNodes.map((n: string) => ({ label: n, score: 0 })),
            motivation: getGoldCupMotivation(stats.progress),
            hasWhatsApp: false
        }
    };

    const c = config[type || 'silver_medal'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8"
        >
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Volver</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className={cn("p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center min-w-[72px] min-h-[72px] sm:min-w-[96px] sm:min-h-[96px]", c.colorClass)}>
                        {type === 'gold_cup' && stats.progress === 100 ? (
                            <>
                                <img src={goldCupImage} className="w-9 h-9 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                                <motion.div
                                    animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-yellow-500/20 blur-md rounded-full -z-10"
                                />
                            </>
                        ) : (
                            <c.icon className="w-9 h-9 sm:w-12 sm:h-12 drop-shadow-lg" fill="currentColor" fillOpacity={0.1} />
                        )}
                    </div>
                    <div>
                        <p className={cn("text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]", c.colorClass)}>{c.subtitle}</p>
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">{c.title}</h3>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 text-left sm:text-right min-w-[130px]">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tighter block leading-none">{c.primaryValue}</span>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mt-1">{c.primaryLabel}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strength Areas (Best) */}
                {c.bestItems && c.bestItems.length > 0 && (
                    <div className="bg-emerald-500/5 p-6 rounded-[2.5rem] border border-emerald-500/10">
                        <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Star className="w-3 h-3 fill-current" /> Fortalezas
                        </h5>
                        <div className="space-y-3">
                            {c.bestItems.map((item: any, i: number) => (
                                <div key={i} className="flex items-start justify-between text-xs gap-4">
                                    <span className="text-slate-300 font-bold leading-tight">{item.label}</span>
                                    <span className="text-emerald-400 font-black font-mono px-2 py-0.5 bg-emerald-500/10 rounded whitespace-nowrap">{item.score?.toFixed(1) || '---'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Growth Areas (Worst/Pending) */}
                <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5">
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-current" /> {c.itemsLabel}
                    </h5>
                    <div className="space-y-3">
                        {c.items.length > 0 ? c.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-start justify-between text-xs gap-4">
                                <span className="text-slate-300 font-bold leading-tight">{item.label}</span>
                                {item.score > 0 && (
                                    <span className="text-blue-400 font-black font-mono px-2 py-0.5 bg-blue-500/10 rounded whitespace-nowrap">{item.score?.toFixed(1)}</span>
                                )}
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 italic">¡Felicidades! Tienes un excelente desempeño en todas las áreas de esta sección.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border border-amber-500/10 relative overflow-hidden group">
                <Sparkles className="absolute top-4 right-4 w-12 h-12 text-amber-500/10 -rotate-12 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-slate-300 leading-relaxed italic pr-8">
                    "{c.motivation}"
                </p>

                {c.hasWhatsApp && c.items.length > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">¿Necesitas ayuda extra?</p>
                            <p className="text-[11px] text-slate-500 italic">Escríbele a un experto para reforzar estos temas.</p>
                        </div>
                        <button 
                            onClick={() => onWhatsApp(type!, c.items)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:scale-105"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Pedir Ayuda
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
