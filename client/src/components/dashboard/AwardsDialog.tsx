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
import { calculateMasteryStats } from '@/lib/mastery-utils';
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
    isPublicView = false
}) => {
    const [selectedType, setSelectedType] = useState<DetailType>(null);

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

    const handleWhatsApp = (type: string, data: any) => {
        const lowestNames = (data || []).map((q: any) => q.label).join(", ");
        const message = `¡Hola! Soy ${username}, he visto mis estadísticas de ${category.name} en el Cofre y me gustaría reforzar estos temas: ${lowestNames}. ¿Podrían ayudarme?`;
        const url = `https://wa.me/573208056799?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setSelectedType(null); onClose(); } }}>
            <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-950/98 border-amber-500/20 backdrop-blur-2xl rounded-[3rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-0 focus:outline-none">
                <ScrollArea className="h-[90vh] p-0">
                    {(!allCategoryQuizzes || !stats) ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Abriendo Cofre...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {!selectedType ? (
                                    <motion.div
                                        key="main-grid"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="relative"
                                    >
                                        {/* Header with Visual Focus on the specific Map */}
                                        <div className="relative p-8 md:p-12 pb-6 text-center space-y-6">
                                            <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

                                            <div className="flex flex-col items-center gap-3">
                                                <Gift className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                                                <div className="space-y-1">
                                                    <DialogTitle className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 tracking-tighter uppercase italic">
                                                        Cofre de {category.name}
                                                    </DialogTitle>
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] opacity-80">
                                                        Logros de {username}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Main Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                                                <StatCard
                                                    icon={Trophy}
                                                    label="Copa Oro"
                                                    sublabel="Materia Completa"
                                                    value={stats.goldTrophies}
                                                    color="text-yellow-500"
                                                    delay={0.1}
                                                    onClick={() => !isPublicView && setSelectedType('gold_cup')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Trophy}
                                                    label="Copa Plata"
                                                    sublabel="Unidades Completadas"
                                                    value={stats.silverTrophies}
                                                    color="text-blue-100"
                                                    delay={0.2}
                                                    onClick={() => !isPublicView && setSelectedType('silver_cup')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Award}
                                                    label="Medalla Oro"
                                                    sublabel="Temas"
                                                    value={stats.goldMedals}
                                                    color="text-amber-400"
                                                    delay={0.3}
                                                    onClick={() => !isPublicView && setSelectedType('gold_medal')}
                                                    disabled={isPublicView}
                                                />
                                                <StatCard
                                                    icon={Medal}
                                                    label="Medalla Plata"
                                                    sublabel="Cuestionarios"
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
                                                    onClick={isPublicView ? undefined : undefined} // Zap doesn't have onClick anyway in original code but for consistency
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
                                                {!isPublicView && (
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Toca una medalla para ver detalles</p>
                                                )}
                                                <button
                                                    onClick={onClose}
                                                    className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 px-12 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl"
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

const StatCard = ({ icon: Icon, label, sublabel, value, color, delay, onClick, disabled }: any) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring' }}
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "bg-slate-900/60 rounded-[2.2rem] p-5 border border-white/5 flex flex-col items-center gap-1 shadow-2xl group transition-all border-b-2 border-b-transparent active:scale-95",
            !disabled && "hover:bg-slate-900/80 hover:border-b-amber-500/40",
            disabled && "cursor-default opacity-90"
        )}
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
        {!disabled && (
            <div className="mt-2 text-[8px] text-amber-500/0 group-hover:text-amber-500/70 font-black uppercase tracking-widest transition-all">Ver Más</div>
        )}
    </motion.button>
);

const DetailView = ({ type, stats, onBack, onWhatsApp }: { type: DetailType, stats: any, onBack: () => void, onWhatsApp: (type: string, data: any) => void }) => {
    const getGoldCupMotivation = (progress: number) => {
        if (progress === 0) return "¡El primer paso es el más importante! Comienza tu viaje hacia la maestría hoy mismo.";
        if (progress <= 25) return "¡Genial, ya comenzaste! Sigue con toda que vas por excelente camino.";
        if (progress <= 50) return "¡Vas progresando muy bien! Es genial ver tu avance, continúa así, ¡tú puedes!";
        if (progress <= 75) return "¡Ya te falta poco para la gloria! Mantén el ritmo, vas increíble, ¡no te detengas ahora!";
        return "¡Wow! Te falta muy poco para terminar todo el curso. ¡Vamos, termina de la mejor forma!";
    };

    const config: any = {
        silver_medal: {
            title: "Mis Cuestionarios",
            subtitle: "Desempeño Individual",
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
            title: "Temas Dominados",
            subtitle: "Dominio de Estrategias",
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
            title: "Unidades Clave",
            subtitle: "Progreso por Unidades",
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
            title: "Meta Final",
            subtitle: "Camino a la Maestría Total",
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
            className="p-8 md:p-12 space-y-8"
        >
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Volver</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={cn("p-6 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl", c.colorClass)}>
                        <c.icon className="w-12 h-12 drop-shadow-lg" fill="currentColor" fillOpacity={0.1} />
                    </div>
                    <div>
                        <p className={cn("text-xs font-black uppercase tracking-[0.3em]", c.colorClass)}>{c.subtitle}</p>
                        <h3 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">{c.title}</h3>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 text-right min-w-[150px]">
                    <span className="text-4xl font-black text-amber-400 tracking-tighter block leading-none">{c.primaryValue}</span>
                    <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{c.primaryLabel}</p>
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
