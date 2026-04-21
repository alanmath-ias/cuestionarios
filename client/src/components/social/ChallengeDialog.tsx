import { useState } from "react";
import { 
  Sword, 
  MessageSquare, 
  Coins, 
  Minus, 
  Plus,
  Trophy,
  History,
  ShieldAlert,
  Zap,
  Timer
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDuel } from "@/hooks/use-duel";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";

export function ChallengeDialog() {
  const { session } = useSession();
  const { 
    challengingUser, 
    setChallengingUser, 
    challengeTopic, 
    setChallengeTopic, 
    challengeWager, 
    setChallengeWager, 
    challengeHandicap,
    setChallengeHandicap,
    isRevengeMode, 
    setIsRevengeMode,
    sendChallenge 
  } = useDuel();

  if (!challengingUser) return null;

  const handleChallenge = () => {
    if (!challengeTopic.trim()) return;
    
    // Process handicap for server
    let handicapPayload = null;
    if (challengeHandicap.type !== 'none' && challengeHandicap.value !== 0) {
      handicapPayload = {
        type: challengeHandicap.type,
        value: Math.abs(challengeHandicap.value),
        targetId: challengeHandicap.value > 0 ? challengingUser.id : session?.userId
      };
    }

    sendChallenge(challengingUser.id, challengeWager, challengeTopic, isRevengeMode, handicapPayload, challengingUser.name);
    setChallengingUser(null);
    setChallengeTopic("");
    setChallengeHandicap({ type: 'none', value: 0, targetId: null });
    setIsRevengeMode(false);
  };

  const updateHandicap = (val: number) => {
    // Limit points to 3, time to 15s (arbitrary but reasonable)
    const limit = challengeHandicap.type === 'points' ? 3 : 15;
    const nextVal = Math.max(-limit, Math.min(limit, val));
    setChallengeHandicap({ ...challengeHandicap, value: nextVal });
  };

  return (
    <Dialog open={!!challengingUser} onOpenChange={(open) => !open && setChallengingUser(null)}>
      <DialogContent className="bg-slate-900 border-white/10 text-white shadow-2xl shadow-blue-900/20 z-[200] max-w-sm sm:max-w-md p-0 overflow-hidden rounded-[2rem]">
        <div className="p-6 sm:p-8 space-y-5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-black text-blue-400">
                <Sword className="h-6 w-6" />
                {isRevengeMode ? '¡LANZAR REVANCHA!' : 'LANZAR DESAFÍO'}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Retarás a <span className="text-blue-400 font-semibold">{challengingUser?.name}</span> a un duelo matemático.
              </DialogDescription>
            </DialogHeader>

            {/* Content Area */}
            <div className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 text-blue-500" /> Tema o Descripción
                </label>
                <Input 
                  placeholder="Ej: Fracciones, Lógica..."
                  value={challengeTopic}
                  onChange={(e) => setChallengeTopic(e.target.value)}
                  className={`bg-slate-950/50 border-white/5 rounded-xl h-11 text-sm focus:ring-blue-500/30 transition-all ${!challengeTopic.trim() ? 'border-orange-500/20' : 'border-blue-500/20'}`}
                  autoFocus
                />
              </div>

              {/* Two Column Grid for Wager & Handicap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Wager Control */}
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-500 mb-3">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Apuesta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border border-white/5" onClick={() => setChallengeWager(Math.max(1, challengeWager - 1))}><Minus className="h-3 w-3" /></Button>
                    <span className="text-2xl font-black text-white">{challengeWager}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border border-white/5" onClick={() => setChallengeWager(challengeWager + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                </div>

                {/* Handicap Type Toggle */}
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-3">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Modo Ventaja</span>
                  </div>
                  <div className="flex bg-black/20 p-1 rounded-xl gap-1">
                    <button 
                        onClick={() => setChallengeHandicap({ ...challengeHandicap, type: 'none', value: 0 })}
                        className={`flex-1 text-[9px] font-black py-1.5 rounded-lg transition-all ${challengeHandicap.type === 'none' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >OFF</button>
                    <button 
                        onClick={() => setChallengeHandicap({ ...challengeHandicap, type: 'points', value: 0 })}
                        className={`flex-1 text-[9px] font-black py-1.5 rounded-lg transition-all ${challengeHandicap.type === 'points' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >PTS</button>
                    <button 
                        onClick={() => setChallengeHandicap({ ...challengeHandicap, type: 'time', value: 0 })}
                        className={`flex-1 text-[9px] font-black py-1.5 rounded-lg transition-all ${challengeHandicap.type === 'time' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >SEG</button>
                  </div>
                </div>
              </div>

              {/* Bilateral Handicap Selector (Conditional) */}
              <AnimatePresence mode="wait">
                {challengeHandicap.type !== 'none' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 px-5">
                      <div className="flex items-center justify-between gap-4">
                           {/* Left: You */}
                           <div className="flex flex-col items-center flex-1 min-w-0">
                              <span className="text-[8px] font-black text-slate-500 uppercase mb-2 truncate w-full text-center">TÚ</span>
                              <div className={`w-full py-2 rounded-xl border flex items-center justify-center transition-all ${challengeHandicap.value < 0 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                 <span className={`text-xl font-black`}>
                                     {challengeHandicap.value < 0 ? Math.abs(challengeHandicap.value) : 0}
                                     {challengeHandicap.type === 'time' && challengeHandicap.value < 0 ? 's' : ''}
                                 </span>
                              </div>
                           </div>

                          {/* Center: Controls */}
                          <div className="flex items-center gap-3 mt-4">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700" onClick={() => updateHandicap(challengeHandicap.value - 1)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col items-center">
                                {challengeHandicap.type === 'points' ? <Trophy className="h-4 w-4 text-emerald-400 animate-pulse" /> : <Timer className="h-4 w-4 text-blue-400 animate-pulse" />}
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700" onClick={() => updateHandicap(challengeHandicap.value + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                           {/* Right: Opponent */}
                           <div className="flex flex-col items-center flex-1 min-w-0">
                              <span className="text-[8px] font-black text-slate-500 uppercase mb-2 truncate w-full text-center">{challengingUser?.name || 'OPONENTE'}</span>
                              <div className={`w-full py-2 rounded-xl border flex items-center justify-center transition-all ${challengeHandicap.value > 0 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                 <span className={`text-xl font-black`}>
                                     {challengeHandicap.value > 0 ? Math.abs(challengeHandicap.value) : 0}
                                     {challengeHandicap.type === 'time' && challengeHandicap.value > 0 ? 's' : ''}
                                 </span>
                              </div>
                           </div>
                      </div>
                      <p className="text-[9px] text-slate-500 text-center mt-3 font-bold uppercase tracking-widest italic">
                        {challengeHandicap.value === 0 
                            ? "Equilibrio Perfecto" 
                            : challengeHandicap.value > 0 
                                ? `Ventaja para ${challengingUser?.name}` 
                                : `Ventaja para ti`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>

        <DialogFooter className="bg-slate-950/80 p-6 flex flex-row items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setChallengingUser(null)}
            className="flex-1 text-slate-500 font-bold rounded-xl h-12 uppercase text-[10px] tracking-widest hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button 
            className={`flex-[2] ${!challengeTopic.trim() ? 'bg-slate-800 grayscale cursor-not-allowed text-slate-500' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95'} rounded-xl font-black h-12 transition-all uppercase text-[11px] tracking-[0.2em]`}
            onClick={handleChallenge}
            disabled={!challengeTopic.trim()}
          >
            {isRevengeMode ? 'Lanzar Revancha' : 'Retar ahora'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
