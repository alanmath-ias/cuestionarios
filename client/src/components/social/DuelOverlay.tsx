import { useState, useEffect } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, X, ShieldAlert, Cpu, Coins, Zap, Trophy as TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DuelOverlay() {
  const { duel, invite, respondToInvite, submitAnswer } = useDuel();
  const { session } = useSession();
  const [counterWager, setCounterWager] = useState<number>(0);
  const [isNegotiating, setIsNegotiating] = useState(false);

  useEffect(() => {
    if (invite) setCounterWager(invite.wager);
  }, [invite]);

  if (!duel && !invite) return null;

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
          {/* INVITATION / NEGOTIATION */}
          {invite && (
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
                  
                  <h2 className="text-3xl font-black text-amber-400 mb-2 uppercase tracking-tighter">
                    ¡DESAFÍO RECIBIDO!
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
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                             <Input 
                                type="number" 
                                value={counterWager} 
                                onChange={(e) => setCounterWager(parseInt(e.target.value) || 0)}
                                className="bg-slate-950 border-amber-500/50 text-center text-xl font-bold h-12"
                             />
                             <div className="flex gap-2">
                                <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => respondToInvite(invite.duelId, 'counter', counterWager)}>
                                    Proponer
                                </Button>
                                <Button variant="ghost" onClick={() => setIsNegotiating(false)}>Cancelar</Button>
                             </div>
                        </div>
                    )}
                  </div>

                  {!isNegotiating && (
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 rounded-xl font-bold shadow-lg shadow-green-900/40"
                            onClick={() => respondToInvite(invite.duelId, 'accept')}
                        >
                            ACEPTAR DUELO
                        </Button>
                        <Button 
                            variant="outline"
                            className="bg-slate-800 border-white/10 hover:bg-slate-700 text-lg px-8 py-6 rounded-xl"
                            onClick={() => setIsNegotiating(true)}
                        >
                            NEGOCIAR APUESTA
                        </Button>
                        <Button 
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
          {duel && duel.status === 'playing' && (
            <motion.div
              key="arena"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/90 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
              {/* Header: Status & Scores */}
              <div className="bg-slate-950/50 p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">Tú</p>
                        <p className="text-2xl font-black text-blue-400">{duel.scores[session?.userId!] || 0}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">{duel.opponentName}</p>
                        <p className="text-2xl font-black text-red-500">{Object.entries(duel.scores).find(([id]) => parseInt(id) !== session?.userId!)?.[1] || 0 as any}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 mb-1">
                        PREGUNTA {duel.currentQuestion?.index + 1 || 0} / {duel.questionsCount}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-amber-500/50 flex items-center justify-center animate-pulse">
                        <Zap className="h-4 w-4 text-amber-500" />
                    </div>
                </div>
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
                    <h3 className="text-2xl font-bold text-white mb-10 leading-relaxed">
                        {duel.currentQuestion.content}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        {duel.currentQuestion.options.map((option: any) => (
                            <Button
                                key={option.id}
                                variant="outline"
                                className="h-auto p-6 bg-slate-800/50 border-white/5 hover:border-blue-500 hover:bg-blue-500/10 text-white rounded-2xl justify-start group transition-all"
                                onClick={() => submitAnswer(duel.duelId, duel.currentQuestion.index, option.id)}
                            >
                                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-white" />
                                </div>
                                <span className="text-lg font-medium">{option.content}</span>
                            </Button>
                        ))}
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-amber-500/50 p-12 rounded-[2rem] text-center text-white"
            >
              <div className="mb-8">
                {duel.finalResults.winnerId === session?.userId ? (
                    <div className="flex flex-col items-center">
                        <div className="h-32 w-32 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center mb-6">
                            <Trophy className="h-16 w-16 text-green-500" />
                        </div>
                        <h2 className="text-5xl font-black text-green-400 uppercase tracking-tighter mb-2">¡VICTORIA!</h2>
                        <p className="text-slate-400">Has derrotado a tu oponente y ganado la recompensa.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                         <div className="h-32 w-32 rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center mb-6">
                            <ShieldAlert className="h-16 w-16 text-red-500" />
                        </div>
                        <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-2">DERROTA</h2>
                        <p className="text-slate-400">Hoy no fue el día, pero el aprendizaje continúa.</p>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tu Puntaje</p>
                    <p className="text-4xl font-black">{duel.finalResults.scores[session?.userId!] || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Rival</p>
                    <p className="text-4xl font-black">
                        {Object.entries(duel.finalResults.scores).find(([id]) => parseInt(id) !== session?.userId!)?.[1] || 0 as any}
                    </p>
                </div>
              </div>

              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-8 font-black rounded-2xl"
              >
                CERRAR Y CONTINUAR
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
