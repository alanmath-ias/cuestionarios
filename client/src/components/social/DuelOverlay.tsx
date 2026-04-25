import { useState, useEffect, useRef, memo } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, X, ShieldAlert, Cpu, Coins, Zap, Loader2, Minus, Plus, CheckCircle2, XCircle, Brain, Sparkles, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Clock, Skull, Users, HandMetal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContentRenderer } from "@/components/ContentRenderer";
import confetti from 'canvas-confetti';
import { useToast } from "@/hooks/use-toast";

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
    setIsRevengeMode,
    activeDuels,
    spectateDuel,
    sentChallengeInfo,
    isResponding,
    speedBonusFlash,
    managedChallenge,
    managedInvite,
    respondToManagedInvite,
    submitManagedAnswer
  } = useDuel();
  const { session } = useSession();
  const { toast } = useToast();
  const [reviewIndex, setReviewIndex] = useState(0);
  
  // ─── DERIVED STATE (Define early to be used in effects) ───────────────────
  const myId = session?.userId;
  const myNumberId = Number(myId);
  const isManaged = !!managedChallenge;
  const isSpectator = !!duel?.isSpectator;
  const [prepStep, setPrepStep] = useState(0);
  const [counterWager, setCounterWager] = useState<number>(0);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [localHandicap, setLocalHandicap] = useState<{ points: number, time: number }>({ points: 0, time: 0 });
  const [activeHandicapTab, setActiveHandicapTab] = useState<'points' | 'time'>('points');
  
  const actualPreparing = isPreparing && (!duel || duel.status !== 'in_progress') && (!managedChallenge || (managedChallenge.currentQuestion?.index === 0 && !managedChallenge.currentQuestion?.content));

  const challengerName = duel?.challengerName || 'Retador';
  const receiverName = duel?.receiverName || 'Oponente';

  // Extract scores and names for cleaner JSX
  const scores = duel?.scores || {};
  const challengerId = Number(duel?.challenger?.userId);
  const receiverId = Number(duel?.receiver?.userId);

  // Managed Challenge Helpers
  const managedMe = managedChallenge?.players?.find((p: any) => p.userId === myNumberId);
  const managedOther = managedChallenge?.players?.find((p: any) => p.userId !== myNumberId);

  const myScore = isManaged ? (managedChallenge.scores?.[myNumberId] ?? managedMe?.score ?? 0) : (scores[myNumberId] || 0);

  // For Arena View
  const challengerScore = isManaged 
    ? (isSpectator ? (managedChallenge.scores?.[managedChallenge.players?.[0]?.userId] ?? managedChallenge.players?.[0]?.score ?? 0) : 0)
    : (isSpectator ? (scores[challengerId] || 0) : 0);
    
  const receiverScore = isManaged
    ? (isSpectator ? (managedChallenge.scores?.[managedChallenge.players?.[1]?.userId] ?? managedChallenge.players?.[1]?.score ?? 0) : 0)
    : (isSpectator ? (scores[receiverId] || 0) : 0);
  
  // Find opponent score (or leading opponent score)
  const oppScore = isManaged
    ? (managedOther ? (managedChallenge.scores?.[managedOther.userId] ?? managedOther.score ?? 0) : 0)
    : ((myNumberId ? Object.entries(scores).find(([id]) => Number(id) !== myNumberId)?.[1] : 0) || 0);
  
  const receiverNameLabel = isManaged
    ? (isSpectator ? (managedChallenge.players?.[1]?.username || 'Jugador 2') : (managedOther?.username || 'Oponente'))
    : (isSpectator ? (duel?.receiver?.username || 'Oponente') : (duel?.opponentName || 'Oponente'));

  const challengerNameLabel = isManaged
    ? (isSpectator ? (managedChallenge.players?.[0]?.username || 'Jugador 1') : 'Tú')
    : (isSpectator ? (duel?.challenger?.username || 'Retador') : 'Tú');

const rivalLeader = isManaged ? (managedChallenge?.players || [])
    ?.filter((p: any) => p.userId !== myNumberId)
    ?.reduce((prev: any, current: any) => (prev.score > current.score) ? prev : current, { username: 'RIVALES', score: 0 })
    : null;

  const displayOppScore = (isManaged && (managedChallenge?.players?.length || 0) > 2)
    ? (rivalLeader?.score || 0)
    : oppScore;
    
  const displayOppName = (isManaged && (managedChallenge?.players?.length || 0) > 2)
    ? `LÍDER: ${rivalLeader?.username || 'OPONENTES'}`
    : receiverNameLabel;

  // ─── EFFECTS (Must all be above ANY return) ────────────────────────────────

  // Managed Challenge Join Text Cycle
  const [joinText, setJoinText] = useState("UNIENDO...");
  useEffect(() => {
    if (!managedInvite || !isResponding) {
        setJoinText("UNIENDO...");
        return;
    }
    const texts = ["ESPERANDO RIVALES...", "UN MOMENTO...", "UNIENDO..."];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setJoinText(texts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [managedInvite, isResponding]);

  // Cycle through preparing steps every 4.5 seconds
  useEffect(() => {
    if (!actualPreparing) {
      setPrepStep(0);
      return;
    }
    const interval = setInterval(() => {
      setPrepStep(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, [actualPreparing]);

  useEffect(() => {
    if (invite) {
        setIsNegotiating(false);
        setCounterWager(invite.wager);
        
        const incomingHandicap = invite.handicap;
        let initialHandicap = { points: 0, time: 0 };
        
        if (incomingHandicap) {
            if (incomingHandicap.points) {
                const h = incomingHandicap.points;
                initialHandicap.points = Number(h.targetId) === Number(myNumberId) ? -h.value : h.value;
            }
            if (incomingHandicap.time) {
                const h = incomingHandicap.time;
                initialHandicap.time = Number(h.targetId) === Number(myNumberId) ? -h.value : h.value;
            }
        }
        setLocalHandicap(initialHandicap);
        setActiveHandicapTab('points');
    }
  }, [invite, myNumberId]);


  const updateHandicap = (val: number) => {
    const limit = activeHandicapTab === 'points' ? 3 : 15;
    const nextVal = Math.max(-limit, Math.min(limit, val));
    setLocalHandicap(prev => ({ ...prev, [activeHandicapTab]: nextVal }));
  };

  const [blurActive, setBlurActive] = useState(false);
  const [blurTimeLeft, setBlurTimeLeft] = useState(0);

  // Time handicap effect
  useEffect(() => {
    let timer: any;
    
    // Normal Duel
    if (duel?.status === 'in_progress' && duel.handicap?.time) {
        const isBeneficiary = Number(duel.handicap.time.targetId) === Number(myId);
        if (!isBeneficiary) {
            setBlurActive(true);
            setBlurTimeLeft(duel.handicap.time.value);
            timer = setTimeout(() => {
                setBlurActive(false);
                setBlurTimeLeft(0);
            }, duel.handicap.time.value * 1000);
            return () => clearTimeout(timer);
        }
    } 
    // Managed Challenge
    else if (managedChallenge?.status === 'in_progress') {
        const me = managedChallenge.players?.find((p: any) => Number(p.userId) === Number(myId));
        // Advantages apply on EVERY question
        if (me && me.timeHandicap > 0) {
            const startTime = managedChallenge.currentQuestion?.startTime || Date.now();
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = me.timeHandicap - elapsed;
            
            if (remaining > 0) {
                setBlurActive(true);
                setBlurTimeLeft(remaining);
                timer = setTimeout(() => {
                    setBlurActive(false);
                    setBlurTimeLeft(0);
                }, remaining * 1000);
                return () => clearTimeout(timer);
            }
        }
    }
    
    setBlurActive(false);
    setBlurTimeLeft(0);
    setBlurActive(false);
  }, [duel?.currentQuestion?.index, duel?.status, duel?.handicap, managedChallenge?.currentQuestion?.index, managedChallenge?.status, myId]);

  // Digital ticker for the blur countdown display
  useEffect(() => {
    if (!blurActive || blurTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setBlurTimeLeft(prev => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [blurActive]);

  // Reset review state when duel resets or a new duel starts
  useEffect(() => {
    if (!duel || duel.status === 'in_progress') {
      setIsReviewing(false);
      setReviewIndex(0);
      setSelectedOptionId(null);
    }
  }, [duel?.status, duel?.duelId]);


  // IMPORTANT: Reset choice on every new question to avoid "Freeze"
  useEffect(() => {
    if (duel?.status === 'in_progress') {
      setSelectedOptionId(null);
    }
  }, [duel?.currentQuestion?.index]);

  useEffect(() => {
    if (managedChallenge?.status === 'in_progress') {
      setSelectedOptionId(null);
    }
  }, [managedChallenge?.currentQuestion?.index]);

  // ─── EARLY RETURN ───
  if (!duel && !invite && !actualPreparing && !sentChallengeInfo && !managedInvite && !managedChallenge) return null;

  // ─── EFFECTS (Must all be above ANY return) ────────────────────────────────

  // ─── Option styling helper ─────────────────────────────────────────────────
  const getOptionStyle = (option: any) => {
    const fb = isManaged ? managedChallenge?.lastFeedback : duel?.lastFeedback;
    const wrongs = (isManaged ? managedChallenge?.allWrongAnswers : duel?.allWrongAnswers) || [];
    
    const isSelectedByMe = selectedOptionId === option.id;
    const isWrongAnswer = wrongs.some((w: any) => w.answerId === option.id);
    const iFailedThis = wrongs.some((w: any) => w.answerId === option.id && Number(w.userId) === Number(myId));

    if (!fb && wrongs.length === 0) {
      if (isSelectedByMe) return "bg-blue-600/40 border-blue-400 ring-1 ring-blue-400/50 text-white";
      return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white cursor-pointer";
    }

    const correctId = (fb as any)?.correctAnswerId;
    
    // In managed challenges, we reveal the correct answer once SOMEONE hits it or it's provided in feedback
    const isCorrect = correctId 
        ? option.id === correctId 
        : (fb?.answerId === option.id && fb?.isCorrect);

    if (isCorrect) return "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]";
    
    // RED HIGHLIGHT: Show to everyone if anyone failed this option
    if (isWrongAnswer) return "bg-red-700/80 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse";
    
    // If I selected but not confirmed yet
    if (isSelectedByMe) return "bg-slate-700/50 border-slate-500 text-slate-300";
    return "bg-white/3 border-white/5 text-slate-500";
  };

  const getWhoAnswered = (option: any) => {
    const wrongs = (isManaged ? managedChallenge?.allWrongAnswers : duel?.allWrongAnswers) || [];
    const fb = isManaged ? managedChallenge?.lastFeedback : duel?.lastFeedback;
    
    const correctId = (fb as any)?.correctAnswerId;
    const isCorrect = correctId ? option.id === correctId : (fb?.answerId === option.id && fb?.isCorrect);
    const wrongBy = wrongs.filter((w: any) => w.answerId === option.id);
    const isWinnerAnswer = isCorrect && fb?.userId && fb.userId !== null;

    const meWrong = wrongBy.some((w: any) => Number(w.userId) === Number(myId));
    const oppWrong = wrongBy.some((w: any) => Number(w.userId) !== Number(myId));
    const oppCorrect = isWinnerAnswer && Number(fb?.userId) !== Number(myId);
    const meCorrect = isWinnerAnswer && Number(fb?.userId) === Number(myId);

    if (!meWrong && !oppWrong && !oppCorrect && !meCorrect) return null;
    
    let name = fb?.userName || fb?.winnerName;
    if (!name) {
        if (isManaged) {
            // Find in wrongBy
            const lastWrong = wrongBy[wrongBy.length - 1];
            name = lastWrong?.userName || "Alguien";
        } else {
            name = duel?.opponentName;
        }
    }

    return { meWrong, oppWrong, oppCorrect, meCorrect, name };
  };

  // ─── RENDERING GUARDS ───────────────────────────────────────────────────
  // If we are admin and it's a managed challenge, we don't show the overlay 
  // (unless spectating, but that's a future feature. For now, clear the blur).
  const isAdminManaging = session?.role === 'admin' && !!managedChallenge;
  
  // Only show the overlay if there is something ACTIVE and VISIBLE to the user
  const hasContent = (!!invite || !!managedInvite || !!sentChallengeInfo || (!!duel && !duel.closed) || (!!managedChallenge && !isAdminManaging) || isPreparing) && !isAdminManaging;

  if (!hasContent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto" />

      <div className="relative z-10 w-full max-w-2xl pointer-events-auto">
        <AnimatePresence mode="wait">

          {/* ── MANAGED GAME ARENA ───────────────────────────────────── */}
          {managedChallenge && managedChallenge.status === 'in_progress' && !actualPreparing && (
            <motion.div key="managed-arena" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 flex flex-col w-full relative overflow-hidden">
                {/* Close Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 z-20 text-white/20 hover:text-white hover:bg-white/10 rounded-full" 
                    onClick={() => leaveResults(managedChallenge.challengeId)}
                >
                    <X className="h-6 w-6" />
                </Button>
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/5 blur-[40px] rounded-full" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 select-none pointer-events-none">
                    <span className="text-[12rem] font-black text-white leading-none">ALAN<br/>MATH</span>
                 </div>

                {/* Scoreboard Header */}
                <div className="flex items-center justify-between relative z-20 w-full px-2 mb-6">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Reto del Profesor</span>
                    </div>
                </div>

                {/* Individual Pacing replaced by Global Sync - Central Clock */}
                <div className="flex items-center justify-between relative z-10 w-full px-4 mb-4">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] text-blue-400 font-black uppercase mb-1">TÚ</span>
                        <motion.span key={`score-${myScore}`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-3xl sm:text-4xl font-black text-white">{myScore}</motion.span>
                    </div>

                    <div className="px-6">
                        <SpeedClock questionIndex={managedChallenge.currentQuestion?.index ?? 0} lastFeedback={managedChallenge.lastFeedback} />
                    </div>

                    <div className="flex flex-col items-center flex-1">
                        <span className="text-[9px] text-red-500 font-black uppercase mb-1">{displayOppName}</span>
                        <motion.span key={`other-score-${displayOppScore}`} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-3xl sm:text-4xl font-black text-white">{displayOppScore}</motion.span>
                    </div>
                </div>

                <div className="flex flex-col items-center mb-6 relative z-10">
                    <AnimatePresence>
                      {speedBonusFlash && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 1.2, y: -20 }} 
                            className="absolute -top-6 z-50 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-yellow-400 border-2 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.4)] rounded-2xl px-6 py-3 text-center flex items-center gap-3 transform -rotate-2">
                            <div className="bg-slate-900 rounded-full p-2">
                                <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <p className="text-slate-900 font-black text-xs uppercase tracking-tighter">¡BONO DE VELOCIDAD!</p>
                                <p className="text-slate-900/70 text-[9px] font-bold">
                                    {speedBonusFlash === 'Tú' ? '¡Has ganado +1 crédito extra!' : `${speedBonusFlash} ha ganado +1 crédito`}
                                </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Badge className="bg-slate-800 text-slate-400 border-white/10 mb-3 px-4 py-1 uppercase tracking-[0.2em] text-[8px] font-black rounded-full ring-1 ring-white/5">
                        Pregunta {(managedChallenge.currentQuestion?.index ?? 0) + 1} / {managedChallenge.questionsCount}
                    </Badge>
                    <div className={`text-lg sm:text-xl font-bold text-white text-center leading-[1.1] max-w-lg mb-6 transition-all duration-700 ${blurActive ? 'blur-2xl grayscale opacity-30 select-none scale-95 pointer-events-none' : ''}`}>
                        <ContentRenderer content={managedChallenge.currentQuestion?.content || ""} tight={true} />
                    </div>
                    {blurActive && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                            <div className="bg-orange-600/90 backdrop-blur-xl border border-orange-400 p-4 rounded-3xl shadow-2xl animate-bounce">
                                <ShieldAlert className="h-10 w-10 text-white mb-2 mx-auto" />
                                <span className="text-sm font-black text-white uppercase tracking-tighter block">Desventaja Activa</span>
                                <span className="text-2xl font-black text-white">{blurTimeLeft.toFixed(1)}s</span>
                            </div>
                            <p className="mt-4 text-xs font-bold text-white/40 uppercase tracking-widest text-center whitespace-nowrap">Debes esperar para ver la pregunta</p>
                        </div>
                    )}
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 relative z-10 transition-all duration-700 ${blurActive ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                    {managedChallenge.currentQuestion?.options?.map((opt: any) => {
                        const styleClass = getOptionStyle(opt);
                        const who = getWhoAnswered(opt);
                        const fb = managedChallenge.lastFeedback;
                        const wasAlreadyAnsweredByMe = (managedChallenge.allWrongAnswers || []).some((w: any) => Number(w.userId) === Number(myId));

                        return (
                            <button 
                                key={opt.id}
                                disabled={managedChallenge.myStatus === 'finished' || selectedOptionId !== null || (!!fb && (fb as any).isCorrect) || wasAlreadyAnsweredByMe || blurActive}
                                className={`relative flex items-center gap-3 py-4 px-6 rounded-2xl border transition-all text-left justify-start ${styleClass}`}
                                onClick={() => {
                                    setSelectedOptionId(opt.id);
                                    submitManagedAnswer(managedChallenge.challengeId, managedChallenge.currentQuestion.index, opt.id)
                                }}
                            >
                                <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/20">
                                  {who?.meCorrect || who?.oppCorrect ? <CheckCircle2 className="h-4 w-4" /> : (who?.meWrong || who?.oppWrong) ? <XCircle className="h-4 w-4 text-red-300" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                                </div>
                                <span className="text-base font-bold flex-1"><ContentRenderer content={opt.content} tight={true} /></span>
                                {who && (
                                  <div className="flex flex-col gap-1.5 items-end ml-1">
                                    {(who.meCorrect || who.meWrong) && (
                                        <span className={`px-2 py-0.5 rounded-md bg-yellow-400 text-slate-950 text-[12px] font-black shadow-lg ring-1 ring-yellow-500/50 flex items-center gap-1`}>
                                            {who.meCorrect ? <CheckCircle2 className="w-3 h-3 fill-slate-900" /> : <XCircle className="w-3 h-3" />}
                                            TÚ
                                        </span>
                                    )}
                                    {(who.oppCorrect || who.oppWrong) && (
                                        <span className={`px-3 py-1 rounded-md bg-yellow-400 text-slate-950 text-[12px] font-black shadow-lg ring-1 ring-yellow-500/50 flex items-center gap-2 animate-in zoom-in duration-300`}>
                                            {who.oppCorrect ? <Zap className="w-3 h-3 fill-slate-900" /> : <XCircle className="w-3 h-3" />}
                                            <span className="truncate max-w-[100px]">{who.name}</span>
                                        </span>
                                    )}
                                  </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {managedChallenge.myStatus === 'finished' && (
                    <div className="mt-4 flex flex-col items-center gap-4 py-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 animate-in fade-in zoom-in">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                        <h4 className="text-xl font-black text-amber-400">¡Ronda Finalizada!</h4>
                        <p className="text-slate-400 text-sm">Espera a que finalice el reto para ver el podio.</p>
                    </div>
                )}
            </motion.div>
          )}

          {/* ── MANAGED RESULTS POYIUM ─────────────────────────────── */}
          {managedChallenge && managedChallenge.status === 'finished' && (
              <motion.div 
                key="managed-results" 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-slate-900/98 backdrop-blur-3xl border border-white/10 p-0 rounded-[2.5rem] shadow-2xl text-center max-w-xl mx-auto overflow-hidden flex flex-col"
                onViewportEnter={() => {
                  const rankings = managedChallenge.results?.rankings || [];
                  const mIndex = rankings.findIndex((r: any) => Number(r.id) === Number(myNumberId));
                  const myRank = rankings[mIndex]?.rank;
                  const isWinner = myRank === 1;
                  if (isWinner) {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#ffffff', '#3b82f6'] });
                  } else if (myRank <= 3) {
                    confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 }, colors: ['#ffffff', '#3b82f6'] });
                  }
                }}
              >
                    {/* Individual Merit Header */}
                    <div className="bg-gradient-to-b from-blue-600/20 to-transparent pt-6 pb-4 px-6 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                        
                        {(() => {
                           const rankings = managedChallenge.results?.rankings || [];
                           const mIndex = rankings.findIndex((r: any) => Number(r.id) === Number(myId));
                           const myData = rankings[mIndex];
                           const myRank = myData?.rank ?? 0;
                           const isShared = rankings.filter((r: any) => r.rank === myRank).length > 1;
                           
                           if (myRank === 1) return (
                             <>
                               <div className="relative mb-6">
                                 {isShared ? <Swords className="h-20 w-20 text-blue-400 mx-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse" /> : <Trophy className="h-20 w-20 text-yellow-500 mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-bounce" />}
                                 <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-white animate-pulse" />
                               </div>
                               <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">{isShared ? '¡EMPATE!' : '¡CAMPEÓN!'}</h2>
                               <p className="text-amber-400 font-black text-lg uppercase tracking-widest">{isShared ? 'Han compartido la gloria' : 'Has conquistado la arena'}</p>
                             </>
                           );
                           
                           if (myRank === 2 || myRank === 3) return (
                             <>
                               <Trophy className={`h-16 w-16 ${myRank === 2 ? 'text-slate-300' : 'text-orange-500'} mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`} />
                               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">¡EXCELENTE!</h2>
                               <p className="text-blue-300 font-bold uppercase tracking-widest">Podio Asegurado: {myRank}º Puesto</p>
                             </>
                           );

                           return (
                             <>
                               <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-70" />
                               <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">¡BIEN JUGADO!</h2>
                               <p className="text-slate-400 font-bold uppercase tracking-widest">Puesto {myRank} de {managedChallenge.results?.rankings?.length || 0}</p>
                             </>
                           );
                        })()}
                    </div>

                    {/* Rankings Comparison */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[45vh] custom-scrollbar">
                        <div className="space-y-3 mb-6">
                            {managedChallenge.results?.rankings?.slice(0, 10).map((r: any, idx: number) => {
                                const isMe = Number(r.id) === myNumberId;
                                
                                return (
                                    <motion.div 
                                        key={r.id} 
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                            r.rank === 1 ? 'bg-amber-500/20 border-amber-500/40 shadow-lg shadow-amber-900/10' : 
                                            isMe ? 'bg-blue-600/30 border-blue-500/50 ring-2 ring-blue-500/20' : 'bg-white/5 border-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black ${
                                                idx === 0 ? 'bg-amber-500 text-slate-950' : 
                                                idx === 1 ? 'bg-slate-300 text-slate-950' :
                                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="text-left">
                                                <span className={`font-black text-lg block ${isMe ? 'text-blue-300' : 'text-slate-100'}`}>
                                                    {r.username} {isMe && "(TÚ)"}
                                                </span>
                                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Combatiente AlanMath</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex flex-col items-end">
                                               <span className={`text-2xl font-black ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>{r.score}</span>
                                               {r.creditChange !== undefined && (
                                                   <span className={`text-[10px] font-black italic ${r.creditChange >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                                       {r.creditChange >= 0 ? `+${r.creditChange}` : r.creditChange} CRÉDITOS
                                                   </span>
                                               )}
                                               {r.bonusGained > 0 && (
                                                   <span className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter -mt-0.5">
                                                       Incluye +{r.bonusGained} por velocidad
                                                   </span>
                                               )}
                                           </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 bg-black/20 border-t border-white/5 space-y-4">
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-16 rounded-3xl text-xl shadow-xl shadow-blue-900/40 active:scale-95 transition-all group relative overflow-hidden"
                            onClick={() => leaveResults(managedChallenge.challengeId)}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <ArrowLeft className="mr-3 h-6 w-6 transition-transform group-hover:-translate-x-1" />
                                FINALIZAR SESIÓN
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Button>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] opacity-60">Sigue practicando para subir en el ranking mundial</p>
                    </div>
              </motion.div>
          )}


          {/* ── PREPARING ──────────────────────────────────────────────── */}
          {actualPreparing && (
            <motion.div
              key="preparing-container"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-slate-900/90 border border-blue-500/30 p-4 sm:p-10 rounded-3xl shadow-xl backdrop-blur-2xl flex flex-col items-center text-center max-w-lg mx-auto"
            >
              <AnimatePresence mode="wait">
                {prepStep === 0 && (
                  <motion.div key="p0" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                      <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 text-blue-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Preparando la Batalla</h2>
                    <p className="text-slate-400 max-w-xs text-xs sm:text-sm">AlanMath está diseñando un desafío único para ti. ¡Demuestra tu nivel!</p>
                  </motion.div>
                )}

                {prepStep === 1 && (
                  <motion.div key="p1" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                      <Zap className="h-10 w-10 text-amber-400 animate-bounce" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase italic tracking-tighter mb-3">¡Roba Créditos!</h2>
                    <p className="text-slate-300 max-w-xs text-xs sm:text-sm">Si respondes <b>rápido y bien</b>, le robas un crédito automáticamente a tu rival.</p>
                  </motion.div>
                )}

                {prepStep === 2 && (
                  <motion.div key="p2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <ShieldAlert className="h-10 w-10 text-red-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-red-500 uppercase italic tracking-tighter mb-3">No te Precipites</h2>
                    <p className="text-slate-300 max-w-xs text-xs sm:text-sm">Si fallas, quedarás <b>bloqueado</b> y tu oponente tendrá tiempo libre para resolver.</p>
                  </motion.div>
                )}

                {prepStep === 3 && (
                  <motion.div key="p3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <Brain className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 uppercase italic tracking-tighter mb-3">AlanMath dice...</h2>
                    <p className="text-slate-300 max-w-xs text-xs sm:text-sm">"Lee bien la pregunta. La precisión es la madre de la maestría. ¡Tú puedes!"</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-8 flex gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${prepStep === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── WAITING FOR RESPONSE (SENT CHALLENGE) ────────────────── */}
          {sentChallengeInfo && !invite && (!duel || duel.status === 'finished') && !actualPreparing && (
            <motion.div key="waiting" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="px-2 relative">
              <Card className="bg-[#0f172a] border-blue-500/30 p-6 sm:p-10 shadow-[0_0_50px_rgba(30,58,138,0.3)] text-white overflow-hidden relative rounded-[2.5rem]">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-blue-400/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-full" onClick={resetDuel}><X className="h-6 w-6" /></Button>
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Swords className="w-64 h-64 text-blue-400" /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <Zap className="h-10 w-10 text-blue-400 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-500 italic">
                    ¡RETO ENVIADO!
                  </h2>
                  <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-sm leading-relaxed">
                    Has retado a <span className="text-white font-black">{sentChallengeInfo.receiverName || 'tu amigo'}</span> a un duelo de <span className="text-blue-300 font-bold">{sentChallengeInfo.topic}</span>.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 w-full max-w-sm flex items-center justify-around">
                    <div className="text-center">
                        <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Apuesta</span>
                        <div className="flex items-center gap-1.5 text-yellow-500 justify-center">
                            <Coins className="h-3 w-3" />
                            <span className="text-lg font-black">{sentChallengeInfo.wager}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Ventaja</span>
                        <div className="flex items-center gap-1.5 text-purple-400 justify-center">
                            <ShieldAlert className="h-3 w-3" />
                                <div className="flex flex-col items-center leading-none">
                                    {(!sentChallengeInfo.handicap || (sentChallengeInfo.handicap.points === 0 && sentChallengeInfo.handicap.time === 0)) ? (
                                        <span className="text-lg font-black uppercase text-slate-600">Nula</span>
                                    ) : (
                                        <div className="flex flex-col gap-0.5 items-center">
                                            {sentChallengeInfo.handicap.points !== 0 && (
                                                <span className="text-xs font-black uppercase text-emerald-400">+{Math.abs(sentChallengeInfo.handicap.points)} PTS</span>
                                            )}
                                            {sentChallengeInfo.handicap.time !== 0 && (
                                                <span className="text-xs font-black uppercase text-blue-400">+{Math.abs(sentChallengeInfo.handicap.time)} SEG</span>
                                            )}
                                            <span className="text-[7px] font-black text-purple-400/60 uppercase mt-0.5">
                                                {Number(sentChallengeInfo.handicap.targetId) === Number(myId) ? 'Para ti' : 'Para oponente'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 w-full max-w-[240px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1.5">
                            {[0,1,2].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                    className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" 
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">Esperando respuesta</span>
                    </div>
                    <div className="w-full h-px bg-white/5" />
                    <Button variant="ghost" className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest" onClick={resetDuel}>CANCELAR DESAFÍO</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── MANAGED CHALLENGE INVITATION ─────────────────────────────── */}
          {managedInvite && !actualPreparing && (!duel || duel.status === 'finished') && (
            <motion.div key="managed-invite" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="px-2 relative">
                <Card className="bg-slate-950 border-purple-500/30 p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-white overflow-hidden relative rounded-[2.5rem]">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="w-48 h-48 text-purple-400" /></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/40 shadow-lg">
                            <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-400 italic">
                            RETO DEL PROFESOR
                        </h2>
                        <p className="text-slate-400 mb-8 text-sm">
                            <span className="text-white font-bold">{managedInvite.adminName}</span> te invita a participar en un reto especial de <span className="text-purple-300 font-bold uppercase">{managedInvite.topic}</span>.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 w-full max-w-xs flex items-center justify-around">
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Premio</span>
                                <div className="flex items-center gap-1.5 text-yellow-500 justify-center">
                                    <Coins className="h-4 w-4" />
                                    <span className="text-xl font-black">{managedInvite.wager}</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Jugadores</span>
                                <div className="flex items-center gap-1.5 text-blue-400 justify-center">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xl font-black">{managedInvite.participantIds?.length || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full max-w-[280px]">
                            <Button 
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-7 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-purple-900/40 active:scale-95 transition-all w-full flex items-center justify-center"
                                onClick={() => respondToManagedInvite(managedInvite.challengeId, 'accept')}
                                disabled={isResponding}
                            >
                                {isResponding ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <motion.span
                                            key={joinText}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="uppercase font-black tracking-widest"
                                        >
                                            {joinText}
                                        </motion.span>
                                    </div>
                                ) : (
                                    "¡ACEPTAR Y ENTRAR!"
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 font-bold uppercase text-[10px] tracking-widest h-10"
                                onClick={() => respondToManagedInvite(managedInvite.challengeId, 'abandon')}
                            >
                                IGNORAR RETO
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>
          )}

          {/* ── INVITATION / NEGOTIATION ───────────────────────────────── */}
          {invite && !actualPreparing && (!duel || duel.status === 'finished') && (
            <motion.div key="invite" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="px-2 relative">
              <Card className="bg-slate-900 border-amber-500/30 p-4 sm:p-8 shadow-2xl text-white overflow-hidden relative">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-slate-500 hover:text-white hover:bg-white/10 rounded-full" onClick={() => respondToInvite(invite.duelId, 'reject')}><X className="h-6 w-6" /></Button>
                <div className="absolute top-0 right-0 p-8 opacity-10"><Swords className="w-40 h-40 text-amber-500" /></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-5 border border-amber-500/50">
                    <Zap className="h-8 w-8 text-amber-400 animate-pulse" />
                  </div>
                  <h2 className={`text-3xl font-black mb-2 uppercase tracking-tighter ${invite.isRevenge ? 'text-red-500' : 'text-amber-400'}`}>
                    {invite.isRevenge ? '¡PEDIDO DE REVANCHA!' : '¡DESAFÍO RECIBIDO!'}
                  </h2>
                  <p className="text-slate-400 mb-6 text-sm">
                    <span className="text-white font-bold">{myId === Number(invite.challengerId) ? invite.receiverName : invite.challengerName}</span> 
                    {myId === Number(invite.challengerId) ? ' ha actualizado las condiciones para un duelo de ' : ' te ha retado a un duelo de '}
                    <span className="text-amber-200">{invite.topic}</span>.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-4">
                    {/* Wager Column */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2 text-yellow-500">
                        <Coins className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Apuesta</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-3">
                          {isNegotiating && <button className="h-6 w-6 rounded-lg bg-slate-700 hover:bg-amber-500 flex items-center justify-center transition-colors" onClick={() => setCounterWager(Math.max(1, counterWager - 1))}><Minus className="h-3 w-3" /></button>}
                          <span className="text-3xl font-black">{isNegotiating ? counterWager : invite.wager}</span>
                          {isNegotiating && <button className="h-6 w-6 rounded-lg bg-slate-700 hover:bg-amber-500 flex items-center justify-center transition-colors" onClick={() => setCounterWager(counterWager + 1)}><Plus className="h-3 w-3" /></button>}
                        </div>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] animate-pulse">Créditos</span>
                      </div>
                    </div>

                    {/* Handicap Type Toggle Column */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2 text-purple-400">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Ventaja</span>
                      </div>
                      {isNegotiating ? (
                        <div className="flex bg-black/20 p-1 rounded-xl gap-1">
                          <button 
                             onClick={() => setActiveHandicapTab('points')} 
                             className={`flex-1 text-[8px] font-black py-1 rounded transition-all relative ${activeHandicapTab === 'points' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                          >
                            PTS
                            {localHandicap.points !== 0 && <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-emerald-400 rounded-full" />}
                          </button>
                          <button 
                             onClick={() => setActiveHandicapTab('time')} 
                             className={`flex-1 text-[8px] font-black py-1 rounded transition-all relative ${activeHandicapTab === 'time' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                          >
                            SEG
                            {localHandicap.time !== 0 && <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-blue-400 rounded-full" />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1">
                           {(!invite.handicap || (!invite.handicap.points && !invite.handicap.time)) ? (
                               <span className="text-lg font-black uppercase leading-none text-slate-600">Nula</span>
                           ) : (
                               <div className="flex flex-col gap-1">
                                   {invite.handicap.points && (
                                       <div className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            <span className="text-[9px] font-black text-emerald-400 uppercase">+{invite.handicap.points.value} PTS para {invite.handicap.points.targetId === myNumberId ? 'ti' : 'él'}</span>
                                       </div>
                                   )}
                                   {invite.handicap.time && (
                                       <div className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                            <span className="text-[9px] font-black text-blue-400 uppercase">+{invite.handicap.time.value} SEG para {invite.handicap.time.targetId === myNumberId ? 'ti' : 'él'}</span>
                                       </div>
                                   )}
                               </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                     {isNegotiating && activeHandicapTab && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full max-w-sm overflow-hidden mb-6">
                             <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                                 <p className="text-[8px] font-black text-blue-400/60 text-center mb-4 uppercase tracking-[0.2em]">Usa la flechas para señalar quien tiene la ventaja</p>
                                 <div className="flex items-center justify-between gap-4">
                                      <div className="flex flex-col items-center flex-1 min-w-0">
                                          <span className="text-[8px] font-black text-slate-500 mb-1 uppercase truncate w-full text-center">TÚ</span>
                                          <div className={`w-full py-1.5 rounded-lg border flex items-center justify-center ${localHandicap[activeHandicapTab] < 0 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                              <span className="text-lg font-black">{localHandicap[activeHandicapTab] < 0 ? Math.abs(localHandicap[activeHandicapTab]) : 0}{activeHandicapTab === 'time' && localHandicap[activeHandicapTab] < 0 ? 's' : ''}</span>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-4 shrink-0">
                                          <button className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-emerald-400" onClick={() => updateHandicap(localHandicap[activeHandicapTab] - 1)}><ArrowLeft className="h-3 w-3" /></button>
                                          <button className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-emerald-400" onClick={() => updateHandicap(localHandicap[activeHandicapTab] + 1)}><ArrowRight className="h-3 w-3" /></button>
                                      </div>
                                      <div className="flex flex-col items-center flex-1 min-w-0">
                                          <span className="text-[8px] font-black text-slate-500 mb-1 uppercase truncate w-full text-center">{myNumberId === Number(invite.challengerId) ? invite.receiverName : invite.challengerName}</span>
                                          <div className={`w-full py-1.5 rounded-lg border flex items-center justify-center ${localHandicap[activeHandicapTab] > 0 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                              <span className="text-lg font-black">{localHandicap[activeHandicapTab] > 0 ? Math.abs(localHandicap[activeHandicapTab]) : 0}{activeHandicapTab === 'time' && localHandicap[activeHandicapTab] > 0 ? 's' : ''}</span>
                                          </div>
                                      </div>
                                   </div>
                             </div>
                         </motion.div>
                     )}
                   </AnimatePresence>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {isResponding ? (
                        <div className="w-full flex flex-col items-center gap-3 py-6">
                            <div className="flex gap-1.5">
                                {[0,1,2].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 h-2 rounded-full bg-amber-500" 
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">Esperando respuesta...</span>
                        </div>
                    ) : isNegotiating ? (
                      <>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 font-bold h-auto py-3 px-4 flex flex-col gap-0.5 min-w-[220px] rounded-xl shadow-lg shadow-green-900/20" 
                          onClick={() => respondToInvite(invite.duelId, 'accept')}
                        >
                          <span className="text-[10px] opacity-90 uppercase font-black tracking-widest leading-none">Aceptar Desafío</span>
                          <span className="text-[11px] font-black leading-tight">
                            {invite.wager} Créditos 
                            {invite.handicap?.points && ` + ${invite.handicap.points.value} PTS para ${invite.handicap.points.targetId === myNumberId ? 'ti' : 'él'}`}
                            {invite.handicap?.time && ` + ${invite.handicap.time.value} SEG para ${invite.handicap.time.targetId === myNumberId ? 'ti' : 'él'}`}
                          </span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-amber-600/20 border-amber-500/30 font-bold py-3 px-6 rounded-xl hover:bg-amber-600/30 transition-all flex flex-col gap-0.5" 
                          onClick={() => {
                            const payload: any = {};
                            const otherId = Number(myNumberId === Number(invite.challengerId) ? invite.receiverId : invite.challengerId);
                            
                            if (localHandicap.points !== 0) {
                                payload.points = {
                                    value: Math.abs(localHandicap.points),
                                    targetId: localHandicap.points > 0 ? otherId : myNumberId
                                };
                            }
                            if (localHandicap.time !== 0) {
                                payload.time = {
                                    value: Math.abs(localHandicap.time),
                                    targetId: localHandicap.time > 0 ? otherId : myNumberId
                                };
                            }
                            respondToInvite(invite.duelId, 'counter', counterWager, Object.keys(payload).length > 0 ? payload : null);
                          }}
                        >
                            <span className="text-[10px] font-black uppercase">Solo Contra-ofertar</span>
                        </Button>
                        <Button variant="ghost" className="text-red-400 hover:bg-red-400/10" onClick={() => respondToInvite(invite.duelId, 'reject')}>RECHAZAR</Button>
                        <Button variant="link" className="text-slate-500 text-[10px] font-bold w-full uppercase tracking-widest opacity-60" onClick={() => setIsNegotiating(false)}>Volver atrás</Button>
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
              {/* Header with Spectator Info */}
              <div className="flex items-center justify-between relative z-20 w-full px-6 pt-2 mb-2">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                    {isSpectator ? "Monitoreo" : "Arena"}
                  </span>
                </div>
                {isSpectator && <Badge className="bg-indigo-600 text-white animate-pulse text-[10px] h-5">MODO OBSERVADOR</Badge>}
                <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("¿Seguro que quieres salir del duelo en curso? PERDERÁS LOS CRÉDITOS APUESTADOS.")) {
                        resetDuel();
                    }
                }} className="h-6 w-6 text-slate-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative px-4 pb-2 flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/5 blur-[40px] rounded-full" />
                <div className="flex items-center justify-between relative z-10 w-full px-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-blue-400 font-black uppercase mb-1 truncate max-w-[80px]">
                        {isSpectator ? challengerNameLabel : 'TÚ'}
                    </span>
                    <motion.span 
                        key={isSpectator ? `challenger-${challengerScore}` : `me-${myScore}`} 
                        initial={{ scale: 1.4 }} 
                        animate={{ scale: 1 }} 
                        className="text-2xl sm:text-4xl font-black text-white"
                    >
                        {isSpectator ? challengerScore : myScore}
                    </motion.span>
                  </div>
                  
                  {/* CENTRAL SPEED CLOCK */}
                  <div className="px-2 sm:px-6">
                    <SpeedClock questionIndex={duel?.currentQuestion?.index ?? 0} lastFeedback={duel?.lastFeedback} />
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-red-400 font-black uppercase mb-1 truncate max-w-[60px] sm:max-w-[80px]">
                        {receiverNameLabel}
                    </span>
                    <motion.span 
                        key={isSpectator ? `receiver-${receiverScore}` : `opp-${oppScore}`} 
                        initial={{ scale: 1.4 }} 
                        animate={{ scale: 1 }} 
                        className="text-2xl sm:text-4xl font-black text-white"
                    >
                      {isSpectator ? receiverScore : oppScore}
                    </motion.span>
                  </div>
                </div>
                
                <div className="mt-1 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Pregunta {(duel.currentQuestion?.index ?? 0) + 1} / {duel.questionsCount}
                </div>
              </div>

              <div className="px-5 pb-5 mt-2 relative">
                {/* Handicap Notification Message */}
                <AnimatePresence>
                    {blurActive && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }}
                            className="absolute -top-2 left-0 right-0 flex justify-center z-30 pointer-events-none"
                        >
                            <Badge className="bg-red-500/90 text-white border-0 shadow-lg shadow-red-500/20 font-black px-4 py-1 animate-pulse">
                                <ShieldAlert className="w-3.5 h-3.5 mr-2" /> VENTAJA DE TIEMPO DEL RIVAL
                            </Badge>
                        </motion.div>
                    )}
                </AnimatePresence>

                {duel.currentQuestion && duel.currentQuestion.options?.length > 0 ? (
                  <motion.div key={duel.currentQuestion.index} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <AnimatePresence>
                      {speedBonusFlash && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 1.2, y: -20 }} 
                            className="absolute inset-x-0 -top-12 z-50 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-yellow-400 border-2 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.4)] rounded-2xl px-6 py-3 text-center flex items-center gap-3 transform -rotate-2">
                            <div className="bg-slate-900 rounded-full p-2">
                                <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                                <p className="text-slate-900 font-black text-xs uppercase tracking-tighter">¡BONO DE VELOCIDAD!</p>
                                <p className="text-slate-900/70 text-[9px] font-bold">
                                    {speedBonusFlash === 'Tú' ? '¡Has ganado +1 crédito extra!' : `${speedBonusFlash} ha ganado +1 crédito`}
                                </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* RESTORED: Question Content with Blur Effect */}
                    <div className={`text-base font-bold text-white mb-4 leading-tight text-center transition-all duration-700 ${blurActive ? 'blur-xl grayscale opacity-30 select-none scale-95 pointer-events-none' : ''}`}>
                        <ContentRenderer content={duel.currentQuestion.content} tight={true} />
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ${blurActive ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                      {duel.currentQuestion.options.map((option: any) => {
                        const styleClass = getOptionStyle(option);
                        const who = getWhoAnswered(option);
                        return (
                          <button
                            key={option.id}
                            disabled={isSpectator || selectedOptionId !== null || (!!duel.lastFeedback && (duel.lastFeedback as any).isCorrect) || (duel.allWrongAnswers || []).some((w: any) => Number(w.userId) === Number(myId)) || blurActive}
                            className={`relative flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all ${isSpectator ? 'cursor-default' : ''} ${styleClass}`}
                            onClick={() => { 
                                if (isSpectator) return;
                                setSelectedOptionId(option.id); 
                                submitAnswer(duel.duelId, duel.currentQuestion.index, option.id); 
                            }}
                          >
                            <div className="h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center bg-black/20">
                              {who?.meCorrect || who?.oppCorrect ? <CheckCircle2 className="h-4 w-4" /> : (who?.meWrong || who?.oppWrong) ? <XCircle className="h-4 w-4 text-red-300 opacity-50" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                            </div>
                            <span className="text-base font-bold flex-1 text-left leading-tight"><ContentRenderer content={option.content} tight={true} /></span>
                            {who && (
                               <div className="flex flex-col gap-1 items-end ml-1">
                                 {(who.meCorrect || who.meWrong) && (
                                   <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border-2 shadow-lg ${who.meCorrect ? 'bg-blue-500 border-blue-400 text-white' : 'bg-yellow-400 border-black text-slate-950 scale-110'}`}>
                                     TÚ
                                   </span>
                                 )}
                                 {(who.oppCorrect || who.oppWrong) && (
                                   <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border-2 shadow-lg max-w-[100px] truncate ${who.oppCorrect ? 'bg-yellow-400 border-yellow-200 text-slate-900 font-black' : 'bg-yellow-400 border-black text-slate-950 scale-110'}`}>
                                     {who.oppCorrect ? '⚡ ' : ''}{who.name}
                                   </span>
                                 )}
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
          {duel && duel.status === 'finished' && !isReviewing && duel.finalResults && (
            <motion.div
              key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/98 border border-white/10 p-0 rounded-[2.5rem] shadow-2xl text-center text-white overflow-hidden max-h-[96vh] flex flex-col"
              onViewportEnter={() => { 
                if (duel.finalResults?.winnerId === myId) {
                  confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#fbbf24', '#22c55e'] }); 
                } else if (duel.finalResults?.winnerId === null) {
                  confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: ['#f59e0b', '#3b82f6'] });
                }
              }}
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center">
                {isSpectator ? (
                   <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 p-1 mb-4"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><CheckCircle2 className="h-10 w-10 text-indigo-500" /></div></div>
                    <h2 className="text-3xl font-black text-indigo-400 uppercase italic tracking-tighter mb-2">DUELO FINALIZADO</h2>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-indigo-400 font-black text-2xl">Visualización de Observador</p>
                    </div>
                   </>
                ) : duel.finalResults?.winnerId === null ? (
                   <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-blue-600 p-1 mb-4 animate-pulse"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><Trophy className="h-10 w-10 text-amber-400" /></div></div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">¡HUBO EMPATE!</h2>
                    <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-amber-400 font-black text-2xl uppercase tracking-widest italic">Combate de Honor</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Sin pérdida de créditos</p>
                    </div>
                   </>
                ) : duel.finalResults?.winnerId === myId ? (
                  <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-1 mb-4 rotate-12"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><Trophy className="h-10 w-10 text-yellow-500" /></div></div>
                    <h2 className="text-3xl font-black text-yellow-400 uppercase italic tracking-tighter mb-2">¡VICTORIA TOTAL!</h2>
                    <div className="bg-green-500/10 border border-green-500/30 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-green-400 font-black text-3xl">+{duel.finalResults.wager} CRÉDITOS</p>
                        {duel.finalResults.speedBonuses > 0 && (
                            <p className="text-green-400/60 text-[9px] font-bold uppercase mt-1">Incluye +{duel.finalResults.speedBonuses} por velocidad</p>
                        )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 p-1 mb-4 -rotate-12"><div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center"><ShieldAlert className="h-10 w-10 text-red-500" /></div></div>
                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-2 italic">CAÍDA EN COMBATE</h2>
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-3xl mb-4">
                        <p className="text-red-400 font-black text-3xl">-{duel.finalResults?.wager} CRÉDITOS</p>
                        {duel.finalResults?.speedBonuses > 0 && (
                             <p className="text-red-400/60 text-[9px] font-bold uppercase mt-1">Incluye -{duel.finalResults.speedBonuses} por velocidad del rival</p>
                        )}
                    </div>
                  </>
                )}
                 {/* SPEED BONUS SUMMARY (Hidden on Tie) */}
                 {duel.finalResults?.bonusSummary && duel.finalResults?.winnerId !== null && (
                    <div className="w-full max-w-[280px] bg-white/5 border border-white/5 rounded-2xl p-4 mt-2 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-white/5 pb-2">
                            <Zap className="h-3 w-3" />
                            <span>Resumen de Bonos</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           {Object.entries(duel.finalResults.bonusSummary).map(([uid, bonus]: [string, any]) => {
                               if (bonus === 0) return null;
                               const isMe = Number(uid) === myId;
                               const name = isMe ? 'TÚ' : (Number(uid) === Number(duel?.challenger?.userId) ? duel.finalResults.challengerName : duel.finalResults.receiverName);
                               return (
                                   <div key={uid} className="flex items-center justify-between">
                                       <span className={`text-[10px] font-bold ${isMe ? 'text-blue-300' : 'text-slate-400'}`}>{name}</span>
                                       <span className={`text-xs font-black ${bonus > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                           {bonus > 0 ? `+${bonus}` : bonus} <span className="text-[8px] opacity-60">CRÉD.</span>
                                       </span>
                                   </div>
                               );
                           })}
                           {!Object.values(duel.finalResults.bonusSummary).some(b => b !== 0) && (
                               <p className="text-[9px] text-slate-500 font-bold italic">Nadie obtuvo bonos de velocidad</p>
                           )}
                        </div>
                    </div>
                 )}
                 <p className="text-slate-400 text-[10px] max-w-[240px] leading-relaxed mt-4 italic">El honor se gana en el campo de batalla. Pulsa abajo para revisar tus aciertos y fallos.</p>
              </div>
              <div className="p-6 bg-black/20 flex flex-col gap-2">
                <Button onClick={() => { setReviewIndex(0); setIsReviewing(true); }} className="bg-blue-600 hover:bg-blue-500 py-6 font-black rounded-2xl text-lg">REVISAR DETALLES</Button>
                {(!isSpectator && (duel?.finalResults?.winnerId !== myId || !duel)) && (
                  <button 
                    onClick={() => { 
                      const oppId = duel ? Number(Object.keys(duel.scores).find(id => Number(id) !== myId)) 
                                   : (sentChallengeInfo ? Number(sentChallengeInfo.receiverId) 
                                   : (invite ? Number(invite.challengerId) : null));
                      const oppName = duel?.opponentName || sentChallengeInfo?.receiverName || invite?.challengerName || "Oponente";
                      
                      if (!oppId) {
                          toast({ title: "No se encontró oponente", description: "No se puede iniciar la revancha.", variant: "destructive" });
                          return;
                      }

                      // First: fully close the current duel
                      if (duel) leaveResults(duel.duelId);
                      resetDuel();

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
                <Button variant="ghost" onClick={() => isSpectator ? resetDuel() : leaveResults(duel?.duelId || 0)} className="text-slate-500 py-4 font-bold uppercase text-[10px] tracking-widest">SALIR DE LA ARENA</Button>
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
                              <span className="text-base font-bold flex-1 leading-tight"><ContentRenderer content={option.content} tight={true} /></span>
                              <div className="flex gap-1">{option.selections && option.selections.map((sel: any) => <Badge key={sel.userId} className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-tighter rounded-full ${sel.userId === myId ? "bg-blue-500 text-white" : "bg-yellow-500 text-slate-900"}`}>{sel.userId === myId ? "TÚ" : sel.username}</Badge>)}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-slate-700 animate-spin mx-auto mb-4" /><p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin historial disponible</p></div>}
              </div>
              <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Button 
                      variant="outline" 
                      disabled={reviewIndex === 0} 
                      onClick={() => setReviewIndex(reviewIndex - 1)} 
                      className="flex-1 bg-slate-800 border-white/10 text-white hover:bg-slate-700 h-11 rounded-xl text-xs font-black tracking-widest transition-all"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      ANTERIOR
                    </Button>
                    <Button 
                      disabled={reviewIndex === (duel.history?.length || 0) - 1} 
                      onClick={() => setReviewIndex(reviewIndex + 1)} 
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 h-11 rounded-xl text-xs font-black tracking-widest transition-all active:scale-95"
                    >
                      SIGUIENTE
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="default" 
                    onClick={() => setIsReviewing(false)} 
                    className="w-full bg-slate-800/80 border-blue-500/30 text-white hover:bg-blue-600/20 h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/20"
                  >
                    <ArrowLeft className="mr-2 h-3.5 w-3.5 text-blue-400" />
                    VOLVER A RESULTADOS
                  </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
