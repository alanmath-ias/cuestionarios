import { useState, useEffect, useRef, memo } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, X, ShieldAlert, Cpu, Coins, Zap, Loader2, Minus, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContentRenderer } from "@/components/ContentRenderer";
import confetti from 'canvas-confetti';

// ─── OPTIMIZED SPEED CLOCK COMPONENT ─────────────────────────────
// This component manages its own timer to avoid re-rendering the whole Overlay
const SpeedClock = memo(({ questionIndex, lastFeedback, onExpire }: { 
    questionIndex: number, 
    lastFeedback: any,
    onExpire?: () => void 
}) => {
    const [msLeft, setMsLeft] = useState(4000);
    const [isFrozen, setIsFrozen] = useState(false);
    const totalMs = 4000;

    useEffect(() => {
        setMsLeft(totalMs);
        setIsFrozen(false);
        
        let intervalId: any;
        const start = Date.now();
        
        // Dynamic delay: First question needs more time for entrance animations + math engine cold start
        const startDelay = questionIndex === 0 ? 1800 : 400;
        
        const timeoutId = setTimeout(() => {
            intervalId = setInterval(() => {
                const elapsed = Date.now() - start;
                const adjustedElapsed = Math.max(0, elapsed - startDelay);
                const remaining = Math.max(0, totalMs - adjustedElapsed);
                setMsLeft(remaining);
                if (remaining <= 0) {
                    clearInterval(intervalId);
                    if (onExpire) onExpire();
                }
            }, 60);
        }, startDelay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [questionIndex]);

    useEffect(() => {
        if (lastFeedback) {
            setIsFrozen(true);
        }
    }, [lastFeedback]);

    const pct = (msLeft / totalMs) * 100;
    const isLow = msLeft < 1000 && msLeft > 0;
    
    // SVG Circle Math
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative h-14 w-14 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                        cx="28" cy="28" r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-slate-800"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        cx="28" cy="28" r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: isFrozen ? 0 : 0.1, ease: "linear" }}
                        className={`${
                            msLeft === 0 ? 'text-slate-600' :
                            isLow ? 'text-red-500' : 
                            'text-yellow-400'
                        }`}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Digital Countdown */}
                <div className={`text-sm font-black transition-all tabular-nums ${
                    isFrozen ? 'text-slate-400' : 
                    isLow ? 'text-red-500 scale-110 animate-pulse' : 
                    'text-white'
                }`}>
                    {(msLeft / 1000).toFixed(1)}
                </div>

                {/* Pulse Effect for low time */}
                {isLow && !isFrozen && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20" />
                )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tighter ${
                isFrozen ? 'text-slate-500' : 'text-yellow-500'
            }`}>
                {isFrozen ? 'GELID' : 'BONO VELOZ'}
            </span>
        </div>
    );
});

export function DuelOverlay() {
  const { 
    duel, 
    invite, 
    respondToInvite, 
    submitAnswer, 
    isPreparing, 
    resetDuel, 
    leaveResults,
    setChallengingUser,
    setChallengeWager,
    setChallengeTopic,
    setIsRevengeMode
  } = useDuel();
  const { session } = useSession();
  const [counterWager, setCounterWager] = useState<number>(0);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Speed bonus effects
  const [speedBonusFlash, setSpeedBonusFlash] = useState<string | null>(null);

  useEffect(() => {
    if (invite) setCounterWager(invite.wager);
  }, [invite]);

  // Sync safety: if duel is in progress, we shouldn't show "Preparing"
  const actualPreparing = isPreparing && (!duel || duel.status !== 'in_progress');

  // Freeze effects when round ends
  useEffect(() => {
    if (duel?.lastFeedback) {
      if (duel.lastFeedback.speedBonus && duel.lastFeedback.userName) {
        setSpeedBonusFlash(duel.lastFeedback.userName);
        setTimeout(() => setSpeedBonusFlash(null), 2500);
      }
    }
  }, [duel?.lastFeedback]);

  // Clear selection when question changes
  useEffect(() => {
    setSelectedOptionId(null);
  }, [duel?.currentQuestion?.index]);

  // Reset review state when duel resets or a new duel starts
  useEffect(() => {
    if (!duel || duel.status === 'in_progress') {
      setIsReviewing(false);
      setReviewIndex(0);
    }
  }, [duel?.status, duel?.duelId]);

  if (!duel && !invite && !actualPreparing) return null;

  const myId = session?.userId!;

  // ─── Option styling helper ─────────────────────────────────────────────────
  const getOptionStyle = (option: any) => {
    const fb = duel?.lastFeedback;
    const wrongs = duel?.allWrongAnswers || [];
    const isSelectedByMe = selectedOptionId === option.id;
    const isWrongAnswer = wrongs.some((w: any) => w.answerId === option.id);

    if (!fb && wrongs.length === 0) {
      if (isSelectedByMe) return "bg-blue-600/40 border-blue-400 ring-1 ring-blue-400/50 text-white";
      return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white cursor-pointer";
    }

    const correctId = (fb as any)?.correctAnswerId;
    const isCorrect = correctId ? option.id === correctId : (fb?.answerId === option.id && fb?.isCorrect);

    if (isCorrect) return "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]";
    if (isWrongAnswer) return "bg-red-700/60 border-red-500 text-red-200";
    if (isSelectedByMe) return "bg-slate-700/50 border-slate-500 text-slate-300";
    return "bg-white/3 border-white/5 text-slate-500";
  };

  const getWhoAnswered = (option: any) => {
    const wrongs = duel?.allWrongAnswers || [];
    const fb = duel?.lastFeedback;
    const correctId = (fb as any)?.correctAnswerId;
    const isCorrect = correctId ? option.id === correctId : (fb?.answerId === option.id && fb?.isCorrect);
    const wrongBy = wrongs.filter((w: any) => w.answerId === option.id);
    const isWinnerAnswer = isCorrect && fb?.userId && fb.userId !== null;

    const meWrong = wrongBy.some((w: any) => w.userId === myId);
    const oppWrong = wrongBy.some((w: any) => w.userId !== myId);
    const oppCorrect = isWinnerAnswer && fb?.userId !== myId;
    const meCorrect = isWinnerAnswer && fb?.userId === myId;

    if (!meWrong && !oppWrong && !oppCorrect && !meCorrect) return null;
    return { meWrong, oppWrong, oppCorrect, meCorrect, name: fb?.userName || duel?.opponentName };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto" />

      <div className="relative z-10 w-full max-w-2xl pointer-events-auto">
        <AnimatePresence mode="wait">

          {/* ── PREPARING ──────────────────────────────────────────────── */}
          {actualPreparing && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
              className="bg-slate-900/90 border border-blue-500/30 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">Preparando el Campo de Batalla</h2>
              <p className="text-slate-400 max-w-sm text-sm">¡AlanMath está preparando el duelo! Demuestra quién es el mejor en este desafío.</p>
            </motion.div>
          )}

          {/* ── INVITATION / NEGOTIATION ───────────────────────────────── */}
          {invite && !actualPreparing && (!duel || duel.status === 'finished') && (
            <motion.div key="invite" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="px-2">
              <Card className="bg-slate-900 border-amber-500/30 p-4 sm:p-8 shadow-2xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Swords className="w-40 h-40 text-amber-500" /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-5 border border-amber-500/50">
                    <Zap className="h-8 w-8 text-amber-400 animate-pulse" />
                  </div>
                  <h2 className={`text-3xl font-black mb-2 uppercase tracking-tighter ${invite.isRevenge ? 'text-red-500' : 'text-amber-400'}`}>
                    {invite.isRevenge ? '¡PEDIDO DE REVANCHA!' : '¡DESAFÍO RECIBIDO!'}
                  </h2>
                  <p className="text-slate-400 mb-6 text-sm">
                    <span className="text-white font-bold">{invite.challengerName}</span> te ha retado a un duelo de <span className="text-amber-200">{invite.topic}</span>.
                  </p>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-xs mb-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-4xl font-black">{isNegotiating ? counterWager : invite.wager}</span>
                      <span className="text-slate-500 font-bold uppercase text-xs">Créditos</span>
                    </div>
                    {isNegotiating && (
                      <div className="flex items-center justify-center gap-4 mt-3">
                        <button className="h-10 w-10 rounded-full bg-slate-600 hover:bg-amber-500 text-white flex items-center justify-center transition-all" onClick={() => setCounterWager(Math.max(1, counterWager - 1))}><Minus /></button>
                        <span className="text-2xl font-black w-12">{counterWager}</span>
                        <button className="h-10 w-10 rounded-full bg-slate-600 hover:bg-amber-500 text-white flex items-center justify-center transition-all" onClick={() => setCounterWager(counterWager + 1)}><Plus /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {isNegotiating ? (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700 font-bold" onClick={() => respondToInvite(invite.duelId, 'accept', invite.wager)}>ACEPTAR CON {invite.wager}</Button>
                        <Button variant="outline" className="bg-amber-600/20 border-amber-500/30" onClick={() => respondToInvite(invite.duelId, 'counter', counterWager)}>CONTRA-OFERTAR</Button>
                        <Button variant="ghost" className="text-red-400" onClick={() => respondToInvite(invite.duelId, 'reject')}>RECHAZAR</Button>
                        <Button variant="link" className="text-slate-500 text-xs w-full" onClick={() => setIsNegotiating(false)}>VOLVER ATRÁS</Button>
                      </>
                    ) : (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700 px-6 py-5 rounded-xl font-bold" onClick={() => respondToInvite(invite.duelId, 'accept')}>ACEPTAR {invite.isRevenge ? 'REVANCHA' : 'DUELO'}</Button>
                        <Button variant="outline" className="bg-slate-800" onClick={() => setIsNegotiating(true)}>NEGOCIAR</Button>
                        <Button variant="ghost" className="text-red-400" onClick={() => respondToInvite(invite.duelId, 'reject')}>RECHAZAR</Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── GAME ARENA ─────────────────────────────────────────────── */}
          {duel && duel.status === 'in_progress' && !actualPreparing && (
            <motion.div key="arena" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/95 border border-blue-500/20 rounded-3xl shadow-2xl w-full overflow-hidden">
              <div className="relative px-4 pt-4 pb-2 flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/5 blur-[40px] rounded-full" />
                <div className="flex items-center justify-between relative z-10 w-full px-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-blue-400 font-black uppercase mb-1">TÚ</span>
                    <motion.span key={duel.scores[myId]} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-2xl sm:text-4xl font-black text-white">{duel.scores[myId] || 0}</motion.span>
                  </div>
                  
                  {/* CENTRAL SPEED CLOCK */}
                  <div className="px-2 sm:px-6">
                    <SpeedClock questionIndex={duel.currentQuestion?.index ?? 0} lastFeedback={duel.lastFeedback} />
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-red-400 font-black uppercase mb-1 truncate max-w-[60px] sm:max-w-[80px]">{duel.opponentName}</span>
                    <motion.span key={String(Object.entries(duel.scores).find(([id]) => parseInt(id) !== myId)?.[1] ?? 0)} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-2xl sm:text-4xl font-black text-white">
                      {(Object.entries(duel.scores).find(([id]) => parseInt(id) !== myId)?.[1] as number) || 0}
                    </motion.span>
                  </div>
                </div>
                
                <div className="mt-1 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Pregunta {(duel.currentQuestion?.index ?? 0) + 1} / {duel.questionsCount}
                </div>
              </div>

              <div className="px-5 pb-5 mt-2">
                {duel.currentQuestion && duel.currentQuestion.options?.length > 0 ? (
                  <motion.div key={duel.currentQuestion.index} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <AnimatePresence>
                      {speedBonusFlash && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                          <div className="bg-yellow-500/90 backdrop-blur-sm rounded-2xl px-8 py-4 text-center shadow-2xl">
                            <Zap className="h-6 w-6 text-white mx-auto mb-1 animate-bounce" />
                            <p className="text-white font-black text-lg uppercase leading-none">⚡ {speedBonusFlash === session?.username ? '¡BONO VELOZ!' : `${speedBonusFlash} fue más rápido`}</p>
                            <p className="text-white/80 text-[10px] font-bold mt-1">{speedBonusFlash === session?.username ? '+1 crédito para ti' : '-1 crédito para ti'}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-base font-bold text-white mb-4 leading-tight text-center"><ContentRenderer content={duel.currentQuestion.content} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {duel.currentQuestion.options.map((option: any) => {
                        const styleClass = getOptionStyle(option);
                        const who = getWhoAnswered(option);
                        return (
                          <button
                            key={option.id}
                            disabled={selectedOptionId !== null || (!!duel.lastFeedback && duel.lastFeedback.isCorrect) || (duel.allWrongAnswers || []).some((w: any) => w.userId === myId)}
                            className={`relative flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all ${styleClass}`}
                            onClick={() => { setSelectedOptionId(option.id); submitAnswer(duel.duelId, duel.currentQuestion.index, option.id); }}
                          >
                            <div className="h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/20">
                              {who?.meCorrect || who?.oppCorrect ? <CheckCircle2 className="h-4 w-4" /> : (who?.meWrong || who?.oppWrong) ? <XCircle className="h-4 w-4 text-red-300" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                            </div>
                            <span className="text-base font-bold flex-1 text-left leading-tight"><ContentRenderer content={option.content} /></span>
                            {who && (
                              <div className="flex flex-col gap-1 items-end ml-1">
                                {(who.meCorrect || who.meWrong) && <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${who.meCorrect ? 'bg-blue-500' : 'bg-orange-600'}`}>TÚ</span>}
                                {(who.oppCorrect || who.oppWrong) && <span className={`text-[8px] font-black px-2 py-0.5 rounded-full max-w-[60px] truncate ${who.oppCorrect ? 'bg-yellow-400 text-slate-900' : 'bg-orange-600'}`}>{who.oppCorrect ? '⚡ ' : ''}{who.name}</span>}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-10 flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-4" />
                    <p className="text-slate-400 text-sm font-bold">Preparando preguntas...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ────────────────────────────────────────────────── */}
          {duel && duel.status === 'finished' && !isReviewing && (
            <motion.div
              key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/98 border border-white/10 p-0 rounded-[2.5rem] shadow-2xl text-center text-white overflow-hidden max-h-[96vh] flex flex-col"
              onViewportEnter={() => { if (duel.finalResults?.winnerId === myId) confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#fbbf24', '#22c55e'] }); }}
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center">
                {duel.finalResults?.winnerId === myId ? (
                  <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-1 mb-4 rotate-12"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><Trophy className="h-10 w-10 text-yellow-500" /></div></div>
                    <h2 className="text-3xl font-black text-yellow-400 uppercase italic tracking-tighter mb-2">¡VICTORIA TOTAL!</h2>
                    <div className="bg-green-500/10 border border-green-500/30 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-green-400 font-black text-3xl">+{duel.finalResults.wager} CRÉDITOS</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 p-1 mb-4 -rotate-12"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><ShieldAlert className="h-10 w-10 text-red-500" /></div></div>
                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-2 italic">CAÍDA EN COMBATE</h2>
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-red-400 font-black text-3xl">-{duel.finalResults?.wager} CRÉDITOS</p>
                    </div>
                  </>
                )}
                <p className="text-slate-400 text-xs max-w-[280px] leading-relaxed">El honor se gana en el campo de batalla. Pulsa abajo para revisar tus aciertos y fallos.</p>
              </div>
              <div className="p-6 bg-black/20 flex flex-col gap-2">
                <Button onClick={() => { setReviewIndex(0); setIsReviewing(true); }} className="bg-blue-600 hover:bg-blue-500 py-6 font-black rounded-2xl text-lg">REVISAR DETALLES</Button>
                {duel.finalResults?.winnerId !== myId && (
                  <button 
                    onClick={() => { 
                      const oppIds = Object.keys(duel.scores).filter(id => Number(id) !== myId);
                      const oppId = Number(oppIds[0]);
                      const oppName = duel.opponentName;
                      // First: fully close the current duel
                      leaveResults(duel.duelId);
                      // Then: open revenge dialog after duel state is cleared
                      setTimeout(() => {
                        setChallengingUser({ id: oppId, name: oppName });
                        setChallengeWager(10);
                        setChallengeTopic("");
                        setIsRevengeMode(true);
                      }, 50);
                    }} 
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-red-900/20"
                  >
                    SOLICITAR REVANCHA
                  </button>
                )}
                <Button variant="ghost" onClick={() => leaveResults(duel.duelId)} className="text-slate-500 py-4 font-bold uppercase text-[10px] tracking-widest">SALIR DE LA ARENA</Button>
              </div>
            </motion.div>
          )}

          {/* ── REVIEW MODE ── */}
          {duel && duel.status === 'finished' && isReviewing && (
            <motion.div key="review" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-blue-500/30 rounded-[2.5rem] shadow-2xl p-0 w-full max-w-2xl overflow-hidden relative max-h-[96vh] flex flex-col">
              <div className="flex items-center justify-between p-4 px-6 border-b border-white/5">
                <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Swords className="h-4 w-4 text-blue-400" /></div><h2 className="text-lg font-black text-white uppercase italic tracking-tight">REVISIÓN DE ARENA</h2></div>
                <Button variant="ghost" size="icon" onClick={() => setIsReviewing(false)} className="h-8 w-8"><X className="h-4 w-4 text-slate-500" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {duel.history && duel.history[reviewIndex] ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2"><span>PREGUNTA {reviewIndex + 1} DE {duel.history.length}</span><span className="text-blue-400">TEMA: {duel.topic || "Matemáticas"}</span></div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 min-h-[60px] flex items-center justify-center text-center text-white font-bold leading-tight"><ContentRenderer content={duel.history[reviewIndex].content} /></div>
                    <div className="grid grid-cols-1 gap-2">
                        {duel.history[reviewIndex].options.map((option: any) => {
                          const isError = !option.isCorrect && (option.selections?.length || 0) > 0;
                          return (
                            <div key={option.id} className={`relative flex items-center gap-3 py-1.5 px-3 rounded-xl border transition-all ${option.isCorrect ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : isError ? "bg-red-500/20 border-red-500/40 text-red-100" : "bg-white/5 border-white/5 text-slate-400"}`}>
                              <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${option.isCorrect ? "bg-emerald-500 text-white" : isError ? "bg-red-500 text-white" : "bg-slate-800 text-slate-600"}`}>{option.isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : isError ? <XCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}</div>
                              <span className="text-base font-bold flex-1 leading-tight"><ContentRenderer content={option.content} /></span>
                              <div className="flex gap-1">{option.selections && option.selections.map((sel: any) => <Badge key={sel.userId} className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-tighter rounded-full ${sel.userId === myId ? "bg-blue-500 text-white" : "bg-yellow-500 text-slate-900"}`}>{sel.userId === myId ? "TÚ" : sel.username}</Badge>)}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-slate-700 animate-spin mx-auto mb-4" /><p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin historial disponible</p></div>}
              </div>
              <div className="p-4 bg-slate-900 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Button variant="outline" disabled={reviewIndex === 0} onClick={() => setReviewIndex(reviewIndex - 1)} className="flex-1 bg-slate-800 h-10 rounded-xl text-sm font-bold">ANTERIOR</Button>
                    <Button variant="outline" disabled={reviewIndex === (duel.history?.length || 0) - 1} onClick={() => setReviewIndex(reviewIndex + 1)} className="flex-1 bg-slate-800 h-10 rounded-xl text-sm font-bold">SIGUIENTE</Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsReviewing(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] tracking-widest">VOLVER A RESULTADOS</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
