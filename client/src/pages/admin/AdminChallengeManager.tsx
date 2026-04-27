import React, { useState, useEffect } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Sword, Trophy, Coins, Settings2, Play, AlertCircle, CheckCircle2, UserMinus, Wand2, ClipboardList, ShieldAlert, Clock, Zap, Loader2, Trash2, XCircle, Plus, Minus, History, ArrowLeft, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { User, Quiz } from "@shared/schema";
import { ContentRenderer } from "@/components/ContentRenderer";

export default function AdminChallengeManager() {
    const duelContext = useDuel();
    const { 
        createManagedChallenge, 
        startManagedChallenge, 
        activeManagedChallenges, 
        managedChallenge, 
        setManagedChallenge,
        spectateManagedChallenge, 
        socket 
    } = duelContext;
    
    const { session } = useSession();
    const { toast } = useToast();

    // Configuration state
    const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
    const [selectedHistoryChallenge, setSelectedHistoryChallenge] = useState<any | null>(null);
    const [showParticipantsList, setShowParticipantsList] = useState(false);
    const [wager, setWager] = useState(10);
    const [creditsMode, setCreditsMode] = useState<'redistribute' | 'system_pay'>('redistribute');
    const [quizType, setQuizType] = useState<'ai' | 'database'>('ai');
    const [aiTopic, setAiTopic] = useState("");
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [winnersPrize, setWinnersPrize] = useState<{ 1: number; 2: number; 3: number }>({ 1: 0, 2: 0, 3: 0 });
    const [losersPenalty, setLosersPenalty] = useState<number>(10);
    const [advantages, setAdvantages] = useState<Record<number, { points: number, timeDelay: number }>>({});
    const [editingStudent, setEditingStudent] = useState<User | null>(null);

    // Search states
    const [studentSearch, setStudentSearch] = useState("");
    const [isStudentSearchFocused, setIsStudentSearchFocused] = useState(false);
    const [quizSearch, setQuizSearch] = useState("");
    const [isStarting, setIsStarting] = useState(false);
    const [view, setView] = useState<'monitor' | 'history'>('monitor');
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);

    // Queries
    const { data: allUsers = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
    const { data: allQuizzes = [] } = useQuery<Quiz[]>({ queryKey: ["/api/quizzes"] });
    const { data: challengeHistory = [], refetch: refetchHistory } = useQuery<any[]>({ 
        queryKey: ["/api/admin/managed-challenges"],
        enabled: view === 'history'
    });

    const handleAddStudent = (student: User) => {
        if (selectedStudents.find(s => s.id === student.id)) return;
        setSelectedStudents([...selectedStudents, student]);
        setStudentSearch("");
    };

    const handleRemoveStudent = (id: number) => {
        setSelectedStudents(selectedStudents.filter(s => s.id !== id));
        const newAdvantages = { ...advantages };
        delete newAdvantages[id];
        setAdvantages(newAdvantages);
    };

    const suggestPrizeDistribution = () => {
        const pot = creditsMode === 'redistribute' ? (selectedStudents.length * wager) : wager;
        if (selectedStudents.length === 2) {
            setWinnersPrize({
                1: Math.floor(pot * 0.8),
                2: Math.floor(pot * 0.2),
                3: 0
            });
        } else {
            setWinnersPrize({
                1: Math.floor(pot * 0.6),
                2: Math.floor(pot * 0.3),
                3: Math.floor(pot * 0.1)
            });
        }
        setLosersPenalty(creditsMode === 'redistribute' ? wager : 10);
    };

    useEffect(() => {
        suggestPrizeDistribution();
    }, [selectedStudents.length, wager, creditsMode]);

    // Reset loading state when challenge officially starts
    useEffect(() => {
        if (managedChallenge?.status === 'in_progress') {
            setIsStarting(false);
        }
    }, [managedChallenge?.status]);

    // AUTO-RECONNECT: If admin refreshes, re-attach to their active challenge
    useEffect(() => {
        if (!session?.userId || !activeManagedChallenges || managedChallenge) return;
        
        const myActiveChallenge = activeManagedChallenges.find(c => 
            Number(c.adminId) === Number(session.userId) && 
            (c.status === 'in_progress' || c.status === 'pending')
        );

        if (myActiveChallenge) {
            console.log(`🔗 [ADMIN] Auto-reconnecting to challenge ${myActiveChallenge.id}`);
            spectateManagedChallenge(myActiveChallenge.id);
        }
    }, [activeManagedChallenges, session?.userId, managedChallenge]);

    const totalPot = creditsMode === 'redistribute' ? (selectedStudents.length * wager) : wager;

    // Prizes are calculated reactively
    // If only 2 students: prize1 is set by admin, prize2 is remainder, prize3 is 0
    // If 3+ students: prize1 & prize2 are set by admin, prize3 is remainder
    const p1 = winnersPrize[1];
    let p2 = winnersPrize[2];
    let p3 = 0;

    if (selectedStudents.length === 2) {
        p2 = Math.max(0, totalPot - p1);
        p3 = 0;
    } else if (selectedStudents.length >= 3) {
        p3 = Math.max(0, totalPot - (p1 + p2));
    }

    const currentPrizes = { 1: p1, 2: p2, 3: p3 };

    const filteredUsers = (allUsers || []).filter(u => {
        if (u.role !== 'student') return false;
        if (selectedStudents.some(s => s.id === u.id)) return false;

        // Show all if no search string
        if (!studentSearch) return true;

        const search = studentSearch.toLowerCase();
        const name = (u.name || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        return name.includes(search) || username.includes(search);
    });

    const filteredQuizzes = (allQuizzes || []).filter(q => {
        const search = quizSearch.toLowerCase();
        if (!search) return true;

        const title = (q.title || "").toLowerCase();
        const desc = (q.description || "").toLowerCase();
        return title.includes(search) || desc.includes(search);
    });

    const handleCreateChallenge = () => {
        if (selectedStudents.length < 2) {
            toast({ title: "Error", description: "Selecciona al menos 2 estudiantes", variant: "destructive" });
            return;
        }
        if (quizType === 'ai' && !aiTopic) {
            toast({ title: "Error", description: "Define un tema para la IA", variant: "destructive" });
            return;
        }
        if (creditsMode === 'redistribute' && currentPrizes[3] < 0) {
            toast({ title: "Atención", description: "Los premios exceden el pozo total", variant: "destructive" });
            return;
        }

        const losers: { [key: number]: number } = {};
        selectedStudents.forEach(s => losers[s.id] = losersPenalty);

        createManagedChallenge({
            studentIds: selectedStudents.map(s => s.id),
            wager,
            creditsMode,
            prizeConfig: {
                winners: currentPrizes,
                losers
            },
            advantages,
            quizConfig: quizType === 'ai' ? { type: 'ai', topic: aiTopic } : { type: 'database', quizId: parseInt(selectedQuizId!) }
        });

        toast({ title: "Reto creado", description: "Invitaciones enviadas a los estudiantes" });
    };

    const handleReset = () => {
        if (!managedChallenge?.challengeId) return;
        if (!confirm("¿Seguro que quieres reiniciar? Esto borrará el reto actual de la base de datos y detendrá la sesión para todos.")) return;
        
        socket?.send(JSON.stringify({ 
            type: 'managed:delete', 
            payload: { challengeId: managedChallenge.challengeId } 
        }));
        
        toast({ title: "Configuración Reiniciada", description: "El reto ha sido eliminado y la sesión limpiada." });
    };

    const handleDeleteHistory = (id: number) => {
        if (!confirm("¿Borrar este registro permanentemente?")) return;
        socket?.send(JSON.stringify({ 
            type: 'managed:delete', 
            payload: { challengeId: id } 
        }));
        setTimeout(() => refetchHistory(), 500);
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Configuration */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-white/10 backdrop-blur overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-6">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black text-white tracking-tight">
                                <Settings2 className="w-8 h-8 text-amber-500" />
                                CONFIGURACIÓN DEL RETO
                            </CardTitle>
                            <CardDescription className="text-slate-300 text-xs font-bold mt-1 uppercase tracking-wider opacity-80">Reglas y participantes para este desafío</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">

                            {/* 1. Student Selection */}
                            <div className="space-y-3">
                                <Label className="text-white text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em] opacity-80">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    PARTICIPANTES ({selectedStudents.length})
                                </Label>
                                <div className="space-y-2 relative">
                                    <div className="relative group">
                                        <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            placeholder="Busca por nombre o @usuario..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            onFocus={() => setIsStudentSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setIsStudentSearchFocused(false), 200)}
                                            className="pl-12 bg-slate-950 border-white/20 text-white placeholder:text-slate-700 h-12 text-lg focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>

                                    {/* Dropdown de estudiantes */}
                                    {isStudentSearchFocused && (
                                        <Card className="absolute z-[100] w-full bg-slate-900 border-white/20 shadow-2xl mt-2 max-h-[400px] overflow-hidden flex flex-col ring-1 ring-blue-500/30">
                                            <ScrollArea className="flex-1 overflow-y-auto">
                                                <div className="p-2 space-y-1">
                                                    {filteredUsers.length === 0 ? (
                                                        <div className="p-8 text-slate-400 text-center flex flex-col items-center">
                                                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                                                                <AlertCircle className="w-6 h-6 opacity-40 text-slate-500" />
                                                            </div>
                                                            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Sin resultados</p>
                                                        </div>
                                                    ) : (
                                                        filteredUsers.map(u => (
                                                            <button
                                                                key={u.id}
                                                                onClick={() => handleAddStudent(u)}
                                                                className="w-full text-left p-4 hover:bg-blue-600/20 rounded-2xl flex items-center justify-between group transition-all border-2 border-transparent hover:border-blue-500/30 mb-1"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-black border border-blue-500/10 group-hover:bg-blue-600/30 group-hover:border-blue-400 transitions-all">
                                                                        {u.name?.[0].toUpperCase() || u.username?.[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-white text-base group-hover:text-blue-200 transition-colors">{u.name}</p>
                                                                        <p className="text-[10px] text-slate-500 group-hover:text-blue-300 font-black tracking-[0.2em] uppercase transition-colors">@{u.username}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:rotate-90 transition-all shadow-lg">
                                                                    <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </Card>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1 min-h-[50px] p-3 bg-slate-950/50 rounded-2xl border border-white/5">
                                    {selectedStudents.length === 0 ? (
                                        <p className="text-xs text-slate-600 font-medium italic w-full text-center py-2">Escribe arriba para añadir estudiantes...</p>
                                    ) : (
                                        selectedStudents.map(s => {
                                            const adv = advantages[s.id];
                                            return (
                                                <div 
                                                    key={s.id} 
                                                    className="flex items-center gap-0.5 bg-blue-600/20 text-blue-100 border border-blue-500/40 rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-200"
                                                >
                                                    {/* Botón de Configuración (Principal) */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            console.log("Opening advantages for:", s.name);
                                                            setEditingStudent(s);
                                                        }}
                                                        className="flex items-center gap-2 py-1.5 pl-3 pr-2 hover:bg-blue-600/30 transition-all active:scale-95 group"
                                                    >
                                                        <span className="text-xs font-medium uppercase tracking-tight">{s.name}</span>
                                                        
                                                        {/* Advantage Indicators */}
                                                        {(adv && (adv.points > 0 || adv.timeDelay > 0)) && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-950/40 rounded-lg border border-white/5">
                                                                {adv.points > 0 && <span className="text-[9px] font-black text-amber-400">⚡+{adv.points}</span>}
                                                                {adv.timeDelay > 0 && <span className="text-[9px] font-black text-purple-400">⏳{adv.timeDelay}s</span>}
                                                            </div>
                                                        )}
                                                    </button>

                                                    {/* Botón de Eliminar (Separado) */}
                                                    <button 
                                                        type="button"
                                                        className="py-1.5 px-2 hover:bg-red-500/60 hover:text-white text-blue-300/50 transition-all border-l border-blue-500/20" 
                                                        onClick={() => handleRemoveStudent(s.id)}
                                                    >
                                                        <UserMinus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* 2. Questionnaire Origin */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white font-black text-sm uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-indigo-400" />
                                        ORIGEN DEL CUESTIONARIO
                                    </Label>
                                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 shadow-inner">
                                        <Button
                                            variant={quizType === 'ai' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setQuizType('ai')}
                                            className={`text-[10px] font-black px-4 h-8 rounded-lg transition-all ${quizType === 'ai' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            <Wand2 className="w-3 h-3 mr-2" /> IA
                                        </Button>
                                        <Button
                                            variant={quizType === 'database' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setQuizType('database')}
                                            className={`text-[10px] font-black px-4 h-8 rounded-lg transition-all ${quizType === 'database' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            <ClipboardList className="w-3 h-3 mr-2" /> BASE
                                        </Button>
                                    </div>
                                </div>

                                {quizType === 'ai' ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Input
                                            placeholder="Ej: Historia de la computación..."
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="bg-slate-950 border-white/20 text-white h-12 text-base placeholder:text-slate-800 font-bold focus:border-blue-500/50"
                                        />
                                        <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 uppercase tracking-tight">
                                            <Wand2 className="w-3 h-3" />
                                            <span>La IA creará 10 preguntas desafiantes sobre este tema.</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="relative group">
                                            <ClipboardList className="absolute left-4 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                            <Input
                                                placeholder="Nombre del cuestionario..."
                                                value={quizSearch}
                                                onChange={(e) => setQuizSearch(e.target.value)}
                                                className="pl-12 bg-slate-950 border-white/20 text-white h-10 text-base font-medium"
                                            />
                                        </div>
                                        <ScrollArea className="h-40 bg-slate-950 rounded-xl border border-white/10 p-1 shadow-inner">
                                            <div className="space-y-1">
                                                {filteredQuizzes.length === 0 ? (
                                                    <p className="p-6 text-xs font-bold text-slate-600 text-center">Sin resultados</p>
                                                ) : (
                                                    filteredQuizzes.map(q => (
                                                        <button
                                                            key={q.id}
                                                            onClick={() => setSelectedQuizId(q.id.toString())}
                                                            className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between border-2 ${selectedQuizId === q.id.toString() ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' : 'bg-white/2 border-transparent text-slate-300 hover:bg-white/5 hover:border-white/10'}`}
                                                        >
                                                            <span>{q.title}</span>
                                                            {selectedQuizId === q.id.toString() && <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>

                            {/* 3. Base Wager & Economy Mode */}
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="space-y-3">
                                    <Label className="text-white font-black flex items-center gap-2 uppercase tracking-[0.2em] text-xs opacity-80">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        {creditsMode === 'redistribute' ? 'APUESTA BASE' : 'PREMIO TOTAL'}
                                    </Label>
                                    <div className="flex items-stretch gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                value={wager}
                                                onChange={(e) => setWager(Number(e.target.value))}
                                                className="bg-slate-950 border-white/20 text-white font-black text-2xl h-14 text-center rounded-xl focus:ring-amber-500/50 transition-all"
                                            />
                                        </div>
                                        <div className="bg-amber-500/5 border border-amber-500/20 px-3 rounded-xl flex flex-col items-center justify-center min-w-[70px]">
                                            <p className="text-[9px] font-black text-amber-500/70 uppercase tracking-tighter mb-0.5 leading-none">🪙 PTS</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-white font-black uppercase tracking-[0.2em] text-xs opacity-80">MODO ECONOMÍA</Label>
                                    <Select value={creditsMode} onValueChange={(val: any) => setCreditsMode(val)}>
                                        <SelectTrigger className="bg-slate-950 border-white/20 text-white h-14 text-base font-black focus:ring-amber-500/50 rounded-xl border-2 uppercase">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/20 text-white shadow-2xl p-1">
                                            <SelectItem value="redistribute" className="font-bold py-3 text-sm focus:bg-blue-600 focus:text-white rounded-lg transition-colors cursor-pointer">💸 APUESTA ENTRE JUGADORES</SelectItem>
                                            <SelectItem value="system_pay" className="font-bold py-3 text-sm focus:bg-blue-600 focus:text-white rounded-lg transition-colors cursor-pointer">🏢 SISTEMA PAGA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 4. Prize Distribution (Integrated) */}
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white font-black flex items-center gap-2 uppercase tracking-[0.2em] text-xs opacity-80">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        DISTRIBUCIÓN DE PREMIOS
                                    </Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={suggestPrizeDistribution}
                                        className="text-[10px] h-7 font-black text-amber-500 border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all rounded-lg"
                                    >
                                        <Settings2 className="w-3 h-3 mr-1.5" />
                                        AUTO
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-4 bg-white/2 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black text-amber-400 uppercase tracking-[0.1em]">🏆 1º PUESTO</Label>
                                                <span className="text-xl font-black text-amber-500">{currentPrizes[1]} <span className="text-[10px] text-slate-500">🪙</span></span>
                                            </div>
                                            <Slider
                                                value={[currentPrizes[1]]}
                                                max={totalPot}
                                                step={1}
                                                onValueChange={(val) => setWinnersPrize({ ...winnersPrize, 1: val[0] })}
                                                className="py-4"
                                            />
                                            <Input
                                                type="number"
                                                value={currentPrizes[1]}
                                                max={totalPot}
                                                onChange={(e) => setWinnersPrize({ ...winnersPrize, 1: Math.min(totalPot, Number(e.target.value)) })}
                                                className="bg-slate-950 border-amber-500/30 text-white font-black text-center rounded-xl h-10"
                                            />
                                        </div>

                                        <div className="space-y-4 p-4 bg-white/2 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">🥈 2º PUESTO</Label>
                                                <span className="text-xl font-black text-slate-300">{currentPrizes[2]} <span className="text-[10px] text-slate-500">🪙</span></span>
                                            </div>
                                            <Slider
                                                value={[currentPrizes[2]]}
                                                max={Math.max(0, totalPot - currentPrizes[1])}
                                                step={1}
                                                disabled={selectedStudents.length < 2}
                                                onValueChange={(val) => setWinnersPrize({ ...winnersPrize, 2: val[0] })}
                                                className="py-4"
                                            />
                                            <Input
                                                type="number"
                                                value={currentPrizes[2]}
                                                max={Math.max(0, totalPot - currentPrizes[1])}
                                                disabled={selectedStudents.length < 2}
                                                onChange={(e) => setWinnersPrize({ ...winnersPrize, 2: Math.min(Math.max(0, totalPot - currentPrizes[1]), Number(e.target.value)) })}
                                                className={`bg-slate-950 border-slate-500/30 text-white font-black text-center rounded-xl h-10 ${selectedStudents.length < 2 ? 'opacity-50' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-900/5 rounded-2xl border border-amber-900/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-900/20 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-amber-900" />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-black text-amber-900 uppercase block tracking-[0.1em]">🥉 3º PUESTO (RESTANTE)</Label>
                                                <p className="text-xs font-bold text-slate-500">Se asigna automáticamente</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-amber-900 leading-none">{currentPrizes[3]}</p>
                                            <p className="text-[8px] font-black text-slate-600 uppercase mt-1">🪙 PUNTOS</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">CUENTA TOTAL DEL RETO</p>
                                        <p className="text-2xl font-black text-white leading-none">{totalPot} <span className="text-xs text-slate-500">🪙</span></p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black gap-3 h-16 text-xl uppercase tracking-tighter shadow-xl border-t border-white/20 rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                onClick={handleCreateChallenge}
                                disabled={selectedStudents.length < 2 || (quizType === 'database' && !selectedQuizId) || (quizType === 'ai' && !aiTopic)}
                            >
                                <Sword className="w-6 h-6" />
                                LANZAR RETO A LA ARENA
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Monitor */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-white/10 h-full flex flex-col overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-6">
                            <CardTitle className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3 text-3xl font-black text-white tracking-tight">
                                    <Play className="w-9 h-9 text-green-500" />
                                    {view === 'monitor' ? 'MONITOR EN VIVO' : 'HISTORIAL DE RETOS'}
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setView(view === 'monitor' ? 'history' : 'monitor')}
                                        className="h-10 px-4 text-xs font-black border-white/20 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        {view === 'monitor' ? 'VER HISTORIAL' : 'VOLVER AL MONITOR'}
                                    </Button>
                                </div>
                            </CardTitle>
                            
                            {managedChallenge && view === 'monitor' && (
                                <div className="mt-4 flex items-center justify-between gap-4 py-3 px-4 bg-slate-950/50 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h4 className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">Sesión Activa</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 text-[10px] font-black text-red-500 hover:text-red-400 hover:bg-red-500/10 uppercase tracking-widest rounded-lg border border-red-500/20"
                                            onClick={() => {
                                                if (confirm("¿Estás seguro de cancelar este reto? Se borrará todo el progreso actual.")) {
                                                    socket?.send(JSON.stringify({ type: 'managed:delete', payload: { challengeId: managedChallenge.challengeId } }));
                                                    setView('monitor');
                                                }
                                            }}
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-2" />
                                            CANCELAR RETO
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <CardDescription className="text-slate-300 text-xs font-bold mt-2 uppercase tracking-wider opacity-80">
                                {view === 'monitor' ? 'Progreso en tiempo real de los estudiantes' : 'Administración y registros de retos pasados'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 flex flex-col h-full">
                            {view === 'history' ? (
                                <div className="flex-1 flex flex-col h-full overflow-hidden">
                                     <ScrollArea className="flex-1">
                                        <div className="space-y-4">
                                            {challengeHistory.length === 0 ? (
                                                <div className="py-24 text-center flex flex-col items-center justify-center bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-white/5 mx-2">
                                                    <div className="h-24 w-24 rounded-full bg-slate-800/80 flex items-center justify-center mb-6 shadow-2xl relative">
                                                        <Trophy className="w-12 h-12 text-slate-600" />
                                                        <div className="absolute top-0 right-0 h-4 w-4 bg-slate-700 rounded-full border-2 border-slate-900 animate-pulse" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-300 uppercase tracking-[0.3em] mb-2">Historial Vacío</h3>
                                                    <p className="text-slate-500 text-xs font-medium max-w-xs leading-relaxed uppercase tracking-widest opacity-60">Los desafíos que administres y finalices se guardarán aquí automáticamente.</p>
                                                </div>
                                            ) : (
                                                challengeHistory.map(h => (
                                                    <div key={h.id} className="group transition-all">
                                                        <div 
                                                            onClick={() => setSelectedHistoryChallenge(selectedHistoryChallenge?.id === h.id ? null : h)}
                                                            className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-all flex items-center justify-between cursor-pointer ${selectedHistoryChallenge?.id === h.id ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-black uppercase text-sm tracking-tighter">{h.aiTopic || "Cuestionario Base"}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                                                                    {new Date(h.createdAt || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })} • {h.status === 'finished' ? 'COMPLETADO' : 'PENDIENTE'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <p className="text-lg font-black text-amber-500 leading-none">{h.wager}</p>
                                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">COSTE</p>
                                                                </div>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteHistory(h.id);
                                                                    }}
                                                                    className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* EXPANDED DETAILS */}
                                                        {selectedHistoryChallenge?.id === h.id && (
                                                            <div className="mt-2 ml-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                                {/* PODIUM */}
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {[1, 0, 2].map(idx => {
                                                                        const sorted = [...(h.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
                                                                        const p = sorted[idx];
                                                                        if (!p) return <div key={idx} className="h-20" />;
                                                                        
                                                                        return (
                                                                            <div key={idx} className={`flex flex-col items-center justify-end p-2 rounded-xl h-24 ${idx === 0 ? 'bg-amber-500/10 border border-amber-500/20 order-2 h-28' : 'bg-slate-800/40 order-1'}`}>
                                                                                <Trophy className={`w-4 h-4 mb-1 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-orange-600'}`} />
                                                                                <p className="text-[10px] font-black text-white uppercase truncate w-full text-center">{p.user?.username}</p>
                                                                                <p className="text-xs font-black text-blue-400">{p.score || 0} pts</p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <Button 
                                                                    variant="outline" 
                                                                    className="w-full border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/20 text-blue-300 hover:text-white text-[10px] font-black uppercase h-9 rounded-xl gap-2 transition-all shadow-lg shadow-blue-900/10"
                                                                    onClick={() => setShowParticipantsList(!showParticipantsList)}
                                                                >
                                                                    <Users className="w-3 h-3" />
                                                                    {showParticipantsList ? 'Ocultar Participantes' : 'Ver Participantes'}
                                                                </Button>

                                                                {showParticipantsList && (
                                                                    <div className="space-y-2 mt-2">
                                                                        {h.participants?.map((p: any) => (
                                                                            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px] uppercase font-bold">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                                    <span className="text-slate-300">{p.user?.username}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="flex gap-2">
                                                                                        {p.pointsHandicap > 0 && <span className="text-emerald-500">+{p.pointsHandicap}v</span>}
                                                                                        {p.timeHandicap > 0 && <span className="text-purple-500">-{p.timeHandicap}s</span>}
                                                                                    </div>
                                                                                    <span className="text-white font-black">{p.score || 0} PTS</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                     </ScrollArea>
                                </div>
                            ) : managedChallenge ? (
                                <div className="space-y-8 flex-1 flex flex-col h-full overflow-hidden">
                                    <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border-2 border-white/10 shadow-2xl">
                                        <div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tighter">RETO: {managedChallenge.topic || "Cuestionario Base"}</h4>
                                            <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-tight">ID SESIÓN: {managedChallenge.challengeId}</p>
                                        </div>
                                        <Badge className={`px-4 py-1 text-xs font-black ring-4 ring-offset-4 ring-offset-slate-950 ${
                                             managedChallenge.status === 'finished' ? 'bg-amber-500 text-slate-950 ring-amber-500/30' :
                                             managedChallenge.status === 'in_progress' ? 'bg-green-600 text-white ring-green-600/30' : 
                                             'bg-blue-600 text-white ring-blue-600/30 animate-pulse'
                                         }`}>
                                             {managedChallenge.status === 'finished' ? 'FINALIZADO' :
                                              managedChallenge.status === 'in_progress' ? 'EN JUEGO' : 'INVITADOS'}
                                        </Badge>
                                    </div>

                                    {/* Player List with status */}
                                    <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                                        <h5 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest pl-2 opacity-70">
                                            <Users className="w-5 h-5 text-blue-400" />
                                            ESTADO DE JUGADORES
                                        </h5>
                                        <ScrollArea className="flex-1 pr-6">
                                            <div className="space-y-3">
                                                {managedChallenge.players?.map((p: any) => (
                                                    <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border-2 border-white/5 group hover:border-blue-500/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-3 h-3 rounded-full ring-4 ring-offset-4 ring-offset-slate-900 ${p.status === 'ready' ? 'bg-green-500 ring-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.5)]' :
                                                                    p.status === 'abandoned' ? 'bg-red-500 ring-red-500/20' : 'bg-slate-700 ring-slate-700/20 animate-pulse'
                                                                }`} />
                                                            <div>
                                                                <p className="font-medium text-lg text-white tracking-tight">{p.username}</p>
                                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                    {p.status === 'ready' ? 'Listo' : p.status === 'abandoned' ? 'Abandonó' : 'Esperando...'}
                                                                    {(p.pointsHandicap > 0 || p.timeHandicap > 0) && (
                                                                        <span className="ml-2 text-blue-400">
                                                                            ({p.pointsHandicap > 0 ? `+${p.pointsHandicap} pts` : ''} 
                                                                             {p.timeHandicap > 0 ? `${p.pointsHandicap > 0 ? ', ' : ''}-${p.timeHandicap}s` : ''})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-950 px-4 py-1.5 rounded-xl border border-white/10 text-right min-w-[80px] shadow-inner">
                                                            <p className="text-2xl font-black text-blue-400 leading-none">{managedChallenge.scores?.[p.userId] || 0}</p>
                                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Pts</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        {managedChallenge.status === 'pending' ? (
                                            <div className="space-y-4">
                                                <div className="bg-amber-500/5 p-4 rounded-2xl flex items-center gap-3 border border-amber-500/20">
                                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                                    <p className="text-xs font-bold text-amber-200/80 leading-tight uppercase tracking-tighter">
                                                        LOS QUE NO ACEPTEN AL DAR "COMENZAR" QUEDARÁN FUERA.
                                                    </p>
                                                </div>
                                                <Button 
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 font-black h-14 rounded-2xl text-xl shadow-lg shadow-emerald-900/20 group relative overflow-hidden"
                                                    onClick={() => {
                                                        setIsStarting(true);
                                                        startManagedChallenge(managedChallenge.challengeId);
                                                    }}
                                                    disabled={isStarting}
                                                >
                                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                    {isStarting ? (
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                            <span className="tracking-widest">GENERANDO...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                                            <span>¡COMENZAR AHORA!</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`p-5 rounded-2xl flex items-center border justify-between transition-all ${managedChallenge.status === 'finished' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-600/5 border-blue-600/20'}`}>
                                                     <div className="flex items-center gap-4">
                                                         {managedChallenge.status === 'finished' ? (
                                                             <Trophy className="w-8 h-8 text-amber-500" />
                                                         ) : (
                                                             <Sword className="w-8 h-8 text-blue-400 animate-bounce" />
                                                         )}
                                                         <span className={`font-black uppercase tracking-widest text-base block ${managedChallenge.status === 'finished' ? 'text-amber-500' : 'text-blue-400'}`}>
                                                             {managedChallenge.status === 'finished' ? 'RETO FINALIZADO' : 'COMBATE EN VIVO'}
                                                         </span>
                                                     </div>
                                                    <div className="text-right">
                                                        <span className="text-3xl font-black text-white">Q{(managedChallenge.currentQuestion?.index ?? 0) + 1}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-tighter">Pregunta</span>
                                                    </div>
                                                </div>

                                                {/* LIVE QUESTION MONITOR / RESULTS PODIUM */}
                                                {managedChallenge?.status === 'finished' ? (
                                                     <div className="mt-4 p-8 rounded-3xl bg-amber-500/5 border-2 border-amber-500/20 animate-in zoom-in-95 duration-500 flex flex-col items-center">
                                                         <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/40 mb-4">
                                                             <Trophy className="w-10 h-10 text-slate-950" />
                                                         </div>
                                                         <h4 className="text-2xl font-black text-amber-500 uppercase tracking-tighter italic mb-1">PODIUM FINAL</h4>
                                                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">El combate ha concluido</p>
                                                         
                                                         <div className="w-full space-y-2">
                                                             {managedChallenge.results?.rankings?.slice(0, 5).map((r: any, idx: number) => (
                                                                 <div key={r.id} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
                                                                     <div className="flex items-center gap-3">
                                                                         <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                                                             {idx + 1}
                                                                         </span>
                                                                         <span className="font-bold text-slate-100 text-sm">{r.username}</span>
                                                                     </div>
                                                                     <span className={`font-black ${idx === 0 ? 'text-amber-500' : 'text-white'}`}>{r.score} PTS</span>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                         
                                                         <Button 
                                                             className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black h-12 w-full rounded-2xl shadow-xl shadow-blue-900/40 active:scale-95 transition-all"
                                                             onClick={() => { setReviewIndex(0); setIsReviewing(true); }}
                                                          >
                                                              REVISAR DETALLES
                                                          </Button>
                                                          
                                                          <Button 
                                                             variant="ghost" 
                                                             className="mt-2 text-slate-500 hover:text-white uppercase font-black text-[10px] tracking-widest hover:bg-white/5 h-10 w-full"
                                                             onClick={() => setManagedChallenge(null)}
                                                          >
                                                              LIMPIAR MONITOR
                                                          </Button>
                                                     </div>
                                                 ) : managedChallenge?.currentQuestion && (
                                                    <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <ClipboardList className="w-4 h-4 text-blue-400" />
                                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">MONITOR DE PREGUNTA</span>
                                                        </div>
                                                        <div className="text-base font-bold text-slate-100 mb-4 leading-[1.1]">
                                                            <ContentRenderer content={managedChallenge.currentQuestion.content} tight={true} />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {managedChallenge.currentQuestion.options?.map((opt: any) => {
                                                                const wrongs = managedChallenge.allWrongAnswers || [];
                                                                const playersWhoChoseThis = wrongs.filter((w: any) => Number(w.answerId) === Number(opt.id));
                                                                const isCorrectAnswer = opt.isCorrect;
                                                                const isFirstCorrect = (managedChallenge.lastFeedback as any)?.isCorrect && Number((managedChallenge.lastFeedback as any)?.answerId) === Number(opt.id);
                                                                
                                                                const hasAnyWrong = playersWhoChoseThis.length > 0;
                                                                
                                                                return (
                                                                    <div 
                                                                        key={opt.id} 
                                                                        className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold transition-all ${
                                                                            isFirstCorrect && isCorrectAnswer
                                                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                                                                : hasAnyWrong ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-slate-400'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                                                                             <div className={`w-2 h-2 rounded-full shrink-0 ${opt.isCorrect ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                                                                             <span className="leading-[1.1] truncate">
                                                                                 <ContentRenderer content={opt.content} tight={true} />
                                                                             </span>
                                                                             {opt.isCorrect && <span className="text-emerald-400 text-lg shrink-0">★</span>}
                                                                         </div>
                                                                        
                                                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                                             {isFirstCorrect && (
                                                                                 <Badge className="bg-emerald-500 text-white text-[9px] font-black py-0 px-2 h-5 truncate max-w-[100px]">
                                                                                     {managedChallenge.lastFeedback.userName} ★
                                                                                 </Badge>
                                                                             )}
                                                                             {playersWhoChoseThis.map((w: any, idx: number) => (
                                                                                 <Badge key={idx} variant="outline" className="bg-yellow-400 text-slate-950 border-yellow-500 text-[9px] font-black h-5 px-2 truncate max-w-[100px]">
                                                                                     {w.userName} ✕
                                                                                 </Badge>
                                                                             ))}
                                                                         </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-24 flex-1">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-800/30 flex items-center justify-center border-2 border-dashed border-slate-700 animate-pulse">
                                            <Sword className="w-10 h-10 text-slate-700" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-600 text-xl uppercase tracking-tighter">Arena Vacía</h4>
                                        <p className="text-slate-700 text-sm font-bold max-w-[200px] mx-auto mt-2 italic leading-tight">Configura las reglas para iniciar el combate.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cuadro de Diálogo de Ventajas */}
            <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                <DialogContent className="bg-slate-900 border-white/20 text-white sm:max-w-[440px] rounded-[2rem] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />

                    <DialogHeader className="pt-4 px-2">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
                            <ShieldAlert className="w-8 h-8 text-amber-500" />
                            VENTAJA TÁCTICA
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] opacity-80 pt-1">
                            CONFIGURANDO A: <span className="text-white">{editingStudent?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-10 py-8 px-2">
                        {/* Puntos Iniciales */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-blue-400">
                                    <Zap className="w-5 h-5" />
                                    PUNTOS INICIALES (Ventaja)
                                </Label>
                                <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-xl font-black text-xl border border-blue-500/30">
                                    {advantages[editingStudent?.id || 0]?.points || 0}
                                </span>
                            </div>
                            <Slider
                                value={[advantages[editingStudent?.id || 0]?.points || 0]}
                                min={0}
                                max={quizType === 'ai' ? 3 : 5}
                                step={1}
                                onValueChange={([val]) => {
                                    if (!editingStudent) return;
                                    setAdvantages({
                                        ...advantages,
                                        [editingStudent.id]: {
                                            ...(advantages[editingStudent.id] || { points: 0, timeDelay: 0 }),
                                            points: val
                                        }
                                    });
                                }}
                                className="py-4"
                            />
                            <p className="text-[9px] text-slate-500 font-bold uppercase text-center tracking-tighter">
                                {quizType === 'ai' ? 'MÁXIMO 3 PUNTOS (CUESTIONARIO IA)' : 'MÁXIMO 5 PUNTOS (CUESTIONARIO BASE)'}
                            </p>
                        </div>

                        {/* Retraso de Tiempo */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-purple-400">
                                    <Clock className="w-5 h-5" />
                                    RETRASO INICIAL (Desventaja)
                                </Label>
                                <span className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-xl font-black text-xl border border-purple-500/30">
                                    {advantages[editingStudent?.id || 0]?.timeDelay || 0}s
                                </span>
                            </div>
                            <Slider
                                value={[advantages[editingStudent?.id || 0]?.timeDelay || 0]}
                                min={0}
                                max={quizType === 'ai' ? 60 : 300}
                                step={1}
                                onValueChange={([val]) => {
                                    if (!editingStudent) return;
                                    setAdvantages({
                                        ...advantages,
                                        [editingStudent.id]: {
                                            ...(advantages[editingStudent.id] || { points: 0, timeDelay: 0 }),
                                            timeDelay: val
                                        }
                                    });
                                }}
                                className="py-4"
                            />
                            <p className="text-[9px] text-slate-500 font-bold uppercase text-center tracking-tighter">
                                {quizType === 'ai' ? 'MÁXIMO 60 SEGUNDOS' : 'MÁXIMO 300 SEGUNDOS'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="bg-white/5 -mx-6 -mb-6 p-6 mt-4">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-blue-900/40"
                            onClick={() => setEditingStudent(null)}
                        >
                            CONFIRMAR VENTAJA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── REVIEW DIALOG ─────────────────────────── */}
            <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
                <DialogContent className="max-w-2xl bg-slate-900 border-blue-500/30 p-0 overflow-hidden rounded-[2.5rem]">
                    <div className="flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <ClipboardList className="h-4 w-4 text-blue-400" />
                                </div>
                                <h2 className="text-lg font-black text-white uppercase italic tracking-tight">AUDITORÍA DE RETO</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsReviewing(false)} className="h-8 w-8 text-slate-500"><XCircle className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {(() => {
                                const history = managedChallenge?.results?.history;
                                if (!history || !history[reviewIndex]) return (
                                    <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-slate-700 animate-spin mx-auto mb-4" /><p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Sin historial disponible</p></div>
                                );

                                const current = history[reviewIndex];
                                return (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                            <span>PREGUNTA {reviewIndex + 1} DE {history.length}</span>
                                            <span className="text-blue-400">MONITOR DE ADMINISTRADOR</span>
                                        </div>
                                        
                                        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 text-center text-white text-xl font-bold leading-tight shadow-inner">
                                            <ContentRenderer content={current.content} />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {current.options.map((option: any) => {
                                                const hasSelections = (option.selections?.length || 0) > 0;
                                                return (
                                                    <div 
                                                        key={option.id} 
                                                        className={`relative flex items-center gap-4 py-3 px-5 rounded-2xl border transition-all ${
                                                            option.isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100" : 
                                                            hasSelections ? "bg-red-500/10 border-red-500/30 text-red-100" : 
                                                            "bg-white/5 border-white/5 text-slate-400 opacity-60"
                                                        }`}
                                                    >
                                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                            option.isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" : 
                                                            hasSelections ? "bg-red-500 text-white shadow-lg shadow-red-900/20" : 
                                                            "bg-slate-800 text-slate-600"
                                                        }`}>
                                                            {option.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : hasSelections ? <XCircle className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                                        </div>
                                                        <div className="flex-1 text-base font-bold leading-tight">
                                                            <ContentRenderer content={option.content} tight={true} />
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                                                            {option.selections?.map((sel: any) => (
                                                                <Badge key={sel.userId} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[9px] font-black py-0.5 px-2 rounded-lg">
                                                                    {sel.username}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-6 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-4">
                                <Button 
                                    variant="outline" 
                                    disabled={reviewIndex === 0} 
                                    onClick={() => setReviewIndex(reviewIndex - 1)} 
                                    className="flex-1 bg-slate-800 border-white/10 text-white hover:bg-slate-700 h-12 rounded-2xl text-xs font-black tracking-widest transition-all"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    ANTERIOR
                                </Button>
                                <Button 
                                    disabled={!managedChallenge?.results?.history || reviewIndex === managedChallenge.results.history.length - 1} 
                                    onClick={() => setReviewIndex(reviewIndex + 1)} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 h-12 rounded-2xl text-xs font-black tracking-widest transition-all active:scale-95"
                                >
                                    SIGUIENTE
                                    <Sword className="ml-2 h-4 w-4 rotate-45" />
                                </Button>
                            </div>
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsReviewing(false)} 
                                className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em]"
                            >
                                CERRAR AUDITORÍA
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
