import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award, Star, Search, Sparkles, Target, Zap, Gift, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MasteryInsignia } from './MasteryInsignia';
import { Category, Quiz } from '@/types/types';
import { cn } from '@/lib/utils';
import { calculateMasteryStats } from '@/lib/mastery-utils';
import { useQuery } from '@tanstack/react-query';

interface AwardsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
    quizzes: any[]; // User-quizzes with status
    username: string;
}

export const AwardsDialog: React.FC<AwardsDialogProps> = ({
    isOpen,
    onClose,
    category,
    quizzes,
    username
}) => {
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

    const stats = React.useMemo(() => {
        if (!category || !allCategoryQuizzes) return null;
        return calculateMasteryStats(category.id, quizzes, allCategoryQuizzes);
    }, [category, quizzes, allCategoryQuizzes]);

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-950/98 border-amber-500/20 backdrop-blur-2xl rounded-[3rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-0 focus:outline-none">
                <ScrollArea className="h-[90vh] p-0">
                    {(!allCategoryQuizzes || !stats) ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Abriendo Cofre...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header with Visual Focus on the specific Map */}
                            <div className="relative p-8 md:p-12 pb-6 text-center space-y-6">
                                <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <Gift className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                                    <div className="space-y-1">
                                        <DialogTitle className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 tracking-tighter uppercase italic">
                                            Cofre de {category.name}
                                        </DialogTitle>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] opacity-80">
                                            Logros de {username}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <StatCard
                                        icon={Trophy}
                                        label="Copa Oro"
                                        sublabel="Materia Completa"
                                        value={stats.goldTrophies}
                                        color="text-yellow-500"
                                        delay={0.1}
                                    />
                                    <StatCard
                                        icon={Trophy}
                                        label="Copa Plata"
                                        sublabel="Unidades Completadas"
                                        value={stats.silverTrophies}
                                        color="text-blue-100"
                                        delay={0.2}
                                    />
                                    <StatCard
                                        icon={Award}
                                        label="Medalla Oro"
                                        sublabel="Temas"
                                        value={stats.goldMedals}
                                        color="text-amber-400"
                                        delay={0.3}
                                    />
                                    <StatCard
                                        icon={Medal}
                                        label="Medalla Plata"
                                        sublabel="Cuestionarios"
                                        value={stats.silverMedals}
                                        color="text-slate-400"
                                        delay={0.4}
                                    />
                                </div>
                            </div>

                            <div className="px-8 md:px-12 pb-12 space-y-8">
                                {/* Detailed Progress Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="h-px w-6 bg-slate-800" /> Resumen del Mapa
                                    </h4>

                                    <div className="p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 relative overflow-hidden group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <MasteryInsignia categoryId={category.id} quizzes={quizzes} size="lg" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado Actual</p>
                                                    <h5 className="text-xl font-black text-white uppercase italic">{category.name}</h5>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-amber-400 tracking-tighter">{Math.round(stats.progress)}%</span>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Completado</p>
                                            </div>
                                        </div>

                                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.progress}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs font-bold">{stats.completedQuizzes} de {stats.totalQuizzes} Cuestionarios</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Target className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-bold">{stats.goldMedals} Estrategias Dominadas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivational Footer */}
                                <div className="text-center space-y-4 pt-4">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Toca para continuar</p>
                                    <button
                                        onClick={onClose}
                                        className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 px-12 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl"
                                    >
                                        Cerrar Cofre
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

const StatCard = ({ icon: Icon, label, sublabel, value, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring' }}
        className="bg-slate-900/60 rounded-[2.2rem] p-5 border border-white/5 flex flex-col items-center gap-1 shadow-2xl group hover:bg-slate-900/80 transition-all border-b-2 border-b-transparent hover:border-b-amber-500/40"
    >
        <div className={cn("relative mb-1", color)}>
            <Icon className="w-7 h-7 drop-shadow-lg" fill="currentColor" fillOpacity={0.15} />
            <div className="absolute inset-0 bg-white/20 blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1" />
        </div>
        <span className="text-3xl font-black text-white tracking-tighter leading-none">{value}</span>
        <div className="text-center mt-1">
            <p className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{label}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase leading-none opacity-60">{sublabel}</p>
        </div>
    </motion.div>
);
