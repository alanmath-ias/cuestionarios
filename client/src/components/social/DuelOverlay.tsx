import { useState, useEffect } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, X, ShieldAlert, Cpu, Coins, Zap, Trophy as TrophyIcon, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContentRenderer } from "@/components/ContentRenderer";

import confetti from 'canvas-confetti';

export function DuelOverlay() {
  const { duel, invite, respondToInvite, submitAnswer, isPreparing, setRevengeRequest, resetDuel } = useDuel();
  const { session } = useSession();
  const [counterWager, setCounterWager] = useState<number>(0);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState(4000); // 4 seconds for bonus
  const [bonusActive, setBonusActive] = useState(true);

  useEffect(() => {
    if (invite) setCounterWager(invite.wager);
  }, [invite]);

  // Handle 4s Speed Bonus timer locally
  useEffect(() => {
    if (duel?.status === 'in_progress' && duel.currentQuestion) {
        setTimeLeft(4000);
        setBonusActive(true);
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 4000 - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setBonusActive(false);
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }
  }, [duel?.currentQuestion?.index, duel?.status]);

  // Clear selection when question changes
  useEffect(() => {
    setSelectedOptionId(null);
  }, [duel?.currentQuestion?.index]);

  if (!duel && !invite && !isPreparing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {/* PREPARING STATE */}
          {isPreparing && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-slate-900/90 border border-blue-500/30 p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center"
            >
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                Preparando el Campo de Batalla
              </h2>
              <p className="text-slate-400 max-w-sm">
                ¡AlanMath está preparando el duelo! Demuestra quién es el mejor en este desafío de velocidad y conocimiento.
              </p>
            </motion.div>
          )}

          {/* INVITATION / NEGOTIATION */}
          {invite && !isPreparing && (
            <motion.div
              key="invite"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
            >
              <Card className="bg-slate-900 border-amber-500/30 p-8 shadow-2xl shadow-amber-900/20 text-white overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Swords className="w-48 h-48 text-amber-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-500/50">
                    <Zap className="h-10 w-10 text-amber-400 animate-pulse" />
                  </div>
                  
                  <h2 className={`text-3xl font-black mb-2 uppercase tracking-tighter ${invite.isRevenge ? 'text-red-500' : 'text-amber-400'}`}>
                    {invite.isRevenge ? '¡PEDIDO DE REVANCHA!' : '¡DESAFÍO RECIBIDO!'}
                  </h2>
                  <p className="text-slate-400 mb-8">
                    <span className="text-white font-bold">{invite.challengerName}</span> te ha retado a un duelo de <span className="text-amber-200">{invite.topic}</span>.
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Coins className="h-6 w-6 text-yellow-500" />
                        <span className="text-4xl font-black">{isNegotiating ? counterWager : invite.wager}</span>
                        <span className="text-slate-500 font-bold uppercase text-xs">Créditos</span>
                    </div>

                    {isNegotiating && (
                        <div className="space-y-6 animate-in slide-in-from-top-2">
                             <div className="flex items-center justify-center gap-6 bg-slate-950/50 p-4 rounded-3xl border border-white/5">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl bg-white/5 border-white/10"
                                    onClick={() => setCounterWager(Math.max(1, counterWager - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-4xl font-black">{counterWager}</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl bg-white/5 border-white/10"
                                    onClick={() => setCounterWager(counterWager + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                             </div>

                             <div className="flex gap-2">
                                <Button 
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-lg py-6 font-bold rounded-xl shadow-lg shadow-amber-900/40" 
                                    onClick={() => respondToInvite(invite.duelId, 'counter', counterWager)}
                                >
                                    Proponer
                                </Button>
                                <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6 font-bold rounded-xl shadow-lg shadow-green-900/40 disabled:opacity-30 disabled:grayscale transition-all"
                                    onClick={() => respondToInvite(invite.duelId, 'accept', counterWager)}
                                    disabled={counterWager !== invite.wager}
                                >
                                    Aceptar
                                </Button>
                             </div>
                             <Button 
                                variant="ghost" 
                                onClick={() => setIsNegotiating(false)} 
                                className="w-full text-slate-500 hover:text-white"
                             >
                                 Cancelar Negociación
                             </Button>
                        </div>
                    )}
                  </div>

                  {!isNegotiating && (
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 rounded-xl font-bold shadow-lg shadow-green-900/40"
                            onClick={() => respondToInvite(invite.duelId, 'accept')}
                        >
                            ACEPTAR {invite.isRevenge ? 'REVANCHA' : 'DUELO'}
                        </Button>
                        <Button 
                            variant="outline"
                            className="bg-slate-800 border-white/10 hover:bg-slate-700 text-lg px-8 py-6 rounded-xl"
                            onClick={() => setIsNegotiating(true)}
                        >
                            NEGOCIAR
                        </Button>
                        <Button 
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-lg px-8 py-6 rounded-xl"
                            onClick={() => respondToInvite(invite.duelId, 'reject')}
                        >
                            RECHAZAR
                        </Button>
                      </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* GAME ARENA */}
          {duel && duel.status === 'in_progress' && !isPreparing && (
            <motion.div
              key="arena"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/90 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl w-full"
            >
              {/* Header: Spectacular Scoreboard */}
              <div className="relative p-6 pt-10 flex flex-col items-center">
                {/* Visual glow backdrop for the score */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-center gap-12 relative z-10 w-full">
                  {/* Player 1 (Local) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">Tú</span>
                    <motion.span 
                      key={duel.scores[session?.userId!] || 0}
                      initial={{ scale: 1.5, filter: "brightness(2)" }}
                      animate={{ scale: 1, filter: "brightness(1)" }}
                      className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    >
                      {duel.scores[session?.userId!] || 0}
                    </motion.span>
                  </div>

                  {/* VS Indicator */}
                  <div className="flex flex-col items-center justify-center pt-6">
                    <div className="text-slate-700 font-black italic text-2xl">VS</div>
                    <Badge variant="outline" className="mt-2 bg-slate-950/80 border-white/5 text-[10px] px-4 py-1 rounded-full text-slate-400">
                        {duel.currentQuestion?.index + 1} / {duel.questionsCount}
                    </Badge>
                  </div>

                  {/* Player 2 (Opponent) */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2 px-3 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 max-w-[100px] truncate">{duel.opponentName}</span>
                    <motion.span 
                      key={Object.entries(duel.scores).find(([id]) => parseInt(id) !== session?.userId!)?.[1]}
                      initial={{ scale: 1.5, filter: "brightness(2)" }}
                      animate={{ scale: 1, filter: "brightness(1)" }}
                      className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    >
                      {Object.entries(duel.scores).find(([id]) => parseInt(id) !== session?.userId!)?.[1] || 0 as any}
                    </motion.span>
                  </div>
                </div>

                {duel.topic && (
                  <div className="mt-8 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-xs text-slate-400 font-medium">RETO: <span className="text-white font-bold italic">{duel.topic}</span></p>
                  </div>
                )}
              </div>

              {/* Game Surface */}
              <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
                {duel.currentQuestion ? (
                  <motion.div 
                    key={duel.currentQuestion.index}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full max-w-2xl text-center"
                  >
                    {/* Real-time Chronometer for Speed Bonus */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-2">
                             <Zap className={`w-5 h-5 ${bonusActive ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`} />
                             <span className={`text-sm font-black uppercase tracking-widest ${bonusActive ? 'text-yellow-400' : 'text-slate-500'}`}>
                                {bonusActive ? '¡Bono de Velocidad Activo!' : 'Bono Expirado'}
                             </span>
                        </div>
                        <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: "100%" }}
                                animate={{ width: `${(timeLeft / 4000) * 100}%` }}
                                transition={{ duration: 0.05 }}
                                className={`h-full ${bonusActive ? 'bg-gradient-to-r from-yellow-500 to-amber-300' : 'bg-slate-700'}`}
                            />
                        </div>
                        {bonusActive && (
                            <span className="text-[10px] text-yellow-500/50 font-bold mt-1">
                                {(timeLeft / 1000).toFixed(1)}s restantes
                            </span>
                        )}
                    </div>

                    <div className="text-2xl font-bold text-white mb-10 leading-relaxed flex justify-center">
                        <ContentRenderer content={duel.currentQuestion.content} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        {duel.currentQuestion.options.map((option: any) => {
                            const isSelectedByMe = selectedOptionId === option.id;
                            const isSelectedByOpponent = duel.lastFeedback?.answerId === option.id && duel.lastFeedback?.userId !== session?.userId;
                            const isCorrect = duel.lastFeedback?.isCorrect && duel.lastFeedback?.answerId === option.id;
                            const isRevealedCorrect = duel.lastFeedback?.isCorrect && !duel.lastFeedback.answerId === option.id; // Correct check below
                            
                            // Better logic for coloring
                            let statusClasses = "bg-slate-800/50 border-white/5";
                            if (isSelectedByMe) statusClasses = "border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50";
                            
                            // Feedback phase
                            if (duel.lastFeedback) {
                                if (duel.lastFeedback.answerId === option.id) {
                                  statusClasses = duel.lastFeedback.isCorrect 
                                    ? "border-green-500 bg-green-500/20 ring-2 ring-green-500/50" 
                                    : "border-red-500 bg-red-500/20 ring-2 ring-red-500/50";
                                } else if (duel.lastFeedback.isCorrect && option.id === (duel.lastFeedback as any).correctAnswerId) {
                                  // This is the correct answer being revealed
                                  statusClasses = "border-green-500 bg-green-500/20";
                                }
                            }

                            return (
                              <Button
                                    key={option.id}
                                    variant="outline"
                                    disabled={selectedOptionId !== null || (duel.lastFeedback?.userId === session?.userId && !duel.lastFeedback?.isCorrect)}
                                    className={`h-auto p-6 rounded-3xl justify-start group transition-all relative overflow-hidden ${statusClasses} text-white border-white/5 bg-white/5 hover:bg-white/10 active:scale-95`}
                                    onClick={() => {
                                      setSelectedOptionId(option.id);
                                      submitAnswer(duel.duelId, duel.currentQuestion.index, option.id);
                                    }}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-5 transition-all ${
                                      isSelectedByMe ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-slate-900 group-hover:bg-blue-600'
                                    }`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${
                                          isSelectedByMe ? 'bg-white' : 'bg-slate-700 group-hover:bg-green-500'
                                        }`} />
                                    </div>
                                    <span className="text-lg font-medium pr-10">
                                      <ContentRenderer content={option.content} />
                                    </span>

                                    {/* Badges for identification */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end">
                                        {isSelectedByMe && (
                                            <Badge className="bg-blue-500 text-[8px] h-4 uppercase">Tú</Badge>
                                        )}
                                        {isSelectedByOpponent && (
                                            <Badge className="bg-red-500 text-[8px] h-4 uppercase">Rival</Badge>
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className=" h-24 w-24 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-blue-200 font-bold uppercase tracking-widest text-sm animate-pulse">Iniciando Arena de Duelo...</p>
                  </div>
                )}
              </div>

              {/* Footer Progress */}
              <div className="px-8 pb-8">
                <Progress value={(duel.currentQuestion?.index / duel.questionsCount) * 100} className="h-2 bg-slate-800" />
              </div>
            </motion.div>
          )}

          {/* RESULTS ARENA */}
          {duel && duel.status === 'finished' && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                opacity: 1,
                transition: { type: "spring", damping: 15 } 
              }}
              className="bg-slate-900/95 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-2xl text-center text-white relative overflow-hidden"
              onViewportEnter={() => {
                if (duel.finalResults.winnerId === session?.userId) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#fbbf24', '#22c55e', '#3b82f6']
                    });
                }
              }}
            >
              {/* Background Glow */}
              <div className={`absolute -top-20 -left-20 w-80 h-80 ${duel.finalResults.winnerId === session?.userId ? 'bg-green-500/20' : 'bg-red-500/20'} blur-[100px] rounded-full`} />

              <div className="mb-10 relative z-10">
                {duel.finalResults.winnerId === session?.userId ? (
                    <div className="flex flex-col items-center">
                        <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-yellow-400 to-amber-600 p-1 mb-8 rotate-12 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                            <div className="h-full w-full rounded-[2.3rem] bg-slate-900 flex items-center justify-center">
                                <Trophy Icon className="h-20 w-20 text-yellow-500 drop-shadow-lg" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-tighter mb-4 italic">
                            ¡DOMINACIÓN TOTAL!
                        </h2>
                        <div className="bg-green-500/10 border border-green-500/20 px-8 py-4 rounded-3xl flex flex-col items-center">
                            <p className="text-green-400 font-black text-3xl mb-1">+{duel.finalResults.wager} CRÉDITOS</p>
                            {duel.finalResults.speedBonuses > 0 && (
                                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-tighter">
                                    Incluye {duel.finalResults.speedBonuses} créditos por velocidad ⚡
                                </p>
                            )}
                            <p className="text-green-500/60 text-xs font-bold uppercase tracking-widest">Botín Asegurado</p>
                        </div>
                        <p className="text-slate-400 mt-6 max-w-sm text-lg leading-relaxed">
                            Has demostrado tu superioridad intelectual. Tus arcas crecen y tu honor se eleva.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                         <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-red-900 p-1 mb-8 -rotate-12 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <div className="h-full w-full rounded-[2.3rem] bg-slate-900 flex items-center justify-center">
                                <ShieldAlert className="h-20 w-20 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-200 to-red-700 uppercase tracking-tighter mb-4 italic">
                            CAÍDA EN COMBATE
                        </h2>
                        <div className="bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-3xl flex flex-col items-center">
                            <p className="text-red-500 font-black text-3xl mb-1">-{duel.finalResults.wager} CRÉDITOS</p>
                            <p className="text-red-600/60 text-xs font-bold uppercase tracking-widest">Saldo Perdido</p>
                        </div>
                        <p className="text-slate-400 mt-6 max-w-md text-lg leading-relaxed">
                            Solo el conocimiento te permitirá recuperar lo perdido. Prepárate, estudia y reclama tu honor.
                        </p>
                    </div>
                )}
              </div>

              <div className="flex flex-col gap-3 relative z-10 w-full max-w-sm mx-auto">
                {duel.finalResults.winnerId !== session?.userId && (
                    <Button 
                        onClick={() => {
                            setRevengeRequest({ 
                                opponentId: Number(Object.keys(duel.scores).find(id => Number(id) !== session?.userId)), 
                                opponentName: duel.opponentName 
                            });
                            resetDuel();
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xl py-8 font-black rounded-3xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all"
                    >
                        SOLICITAR REVANCHA
                    </Button>
                )}
                <Button 
                    variant="ghost"
                    onClick={() => {
                        window.location.reload();
                    }}
                    className="text-slate-500 hover:text-white hover:bg-white/5 py-4 rounded-2xl font-bold"
                >
                    SALIR DE LA ARENA
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
