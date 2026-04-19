import { useState, useEffect, useRef } from "react";
import { useDuel } from "@/hooks/use-duel";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, X, ShieldAlert, Cpu, Coins, Zap, Loader2, Minus, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContentRenderer } from "@/components/ContentRenderer";
import confetti from 'canvas-confetti';

export function DuelOverlay() {
  const { duel, invite, respondToInvite, submitAnswer, isPreparing, setRevengeRequest, resetDuel } = useDuel();
  const { session } = useSession();
  const [counterWager, setCounterWager] = useState<number>(0);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // Speed bonus bar
  const [timeLeft, setTimeLeft] = useState(4000);
  const [bonusActive, setBonusActive] = useState(true);
  const [frozenAt, setFrozenAt] = useState<number | null>(null); // freeze when answered
  const [speedBonusFlash, setSpeedBonusFlash] = useState<string | null>(null); // winner name for flash

  useEffect(() => {
    if (invite) setCounterWager(invite.wager);
  }, [invite]);

  // Timer per question
  useEffect(() => {
    if (duel?.status === 'in_progress' && duel.currentQuestion) {
      setTimeLeft(4000);
      setBonusActive(true);
      setFrozenAt(null);
      setSpeedBonusFlash(null);
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

  // Freeze bar and show speed bonus flash when round ends
  useEffect(() => {
    if (duel?.lastFeedback) {
      const pct = (timeLeft / 4000) * 100;
      setFrozenAt(pct);
      // Show speed bonus celebration
      if (duel.lastFeedback.speedBonus && duel.lastFeedback.userName) {
        setSpeedBonusFlash(duel.lastFeedback.userName);
        setTimeout(() => setSpeedBonusFlash(null), 2800);
      }
    }
  }, [duel?.lastFeedback]);

  // Clear selection when question changes
  useEffect(() => {
    setSelectedOptionId(null);
    setFrozenAt(null);
  }, [duel?.currentQuestion?.index]);

  if (!duel && !invite && !isPreparing) return null;

  const myId = session?.userId!;
  const barPct = frozenAt !== null ? frozenAt : (timeLeft / 4000) * 100;

  // ─── Option styling helper ─────────────────────────────────────────────────
  const getOptionStyle = (option: any) => {
    const fb = duel?.lastFeedback;
    const isSelectedByMe = selectedOptionId === option.id;
    const isSelectedByOpponent = fb && fb.answerId === option.id && fb.userId !== myId;

    if (!fb) {
      // No feedback yet
      if (isSelectedByMe) return "bg-blue-600/40 border-blue-400 ring-2 ring-blue-400/50 text-white";
      return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white cursor-pointer";
    }

    // After feedback: highlight correct answer always (from round_result)
    const correctId = (fb as any).correctAnswerId;
    const isCorrect = correctId
      ? option.id === correctId
      : (fb.answerId === option.id && fb.isCorrect);

    if (isCorrect) {
      return "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]";
    }
    if (fb.answerId === option.id && !fb.isCorrect) {
      return "bg-red-700/60 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
    }
    if (isSelectedByMe) return "bg-slate-700/50 border-slate-500 text-slate-300";
    return "bg-white/3 border-white/5 text-slate-500";
  };

  const getWhoAnswered = (option: any) => {
    const fb = duel?.lastFeedback;
    if (!fb || fb.answerId !== option.id) return null;
    const isMe = fb.userId === myId;
    const isOpp = fb.userId !== myId;
    return { isMe, isOpp, name: fb.userName || duel?.opponentName };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Blurred background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {/* ── PREPARING ──────────────────────────────────────────────── */}
          {isPreparing && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-slate-900/90 border border-blue-500/30 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">
                Preparando el Campo de Batalla
              </h2>
              <p className="text-slate-400 max-w-sm text-sm">
                ¡AlanMath está preparando el duelo! Demuestra quién es el mejor en este desafío de velocidad y conocimiento.
              </p>
            </motion.div>
          )}

          {/* ── INVITATION / NEGOTIATION ───────────────────────────────── */}
          {invite && !isPreparing && (
            <motion.div
              key="invite"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
            >
              <Card className="bg-slate-900 border-amber-500/30 p-8 shadow-2xl shadow-amber-900/20 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Swords className="w-40 h-40 text-amber-500" />
                </div>

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

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-xs mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-4xl font-black">{isNegotiating ? counterWager : invite.wager}</span>
                      <span className="text-slate-500 font-bold uppercase text-xs">Créditos</span>
                    </div>

                    {isNegotiating && (
                      <div className="flex items-center justify-center gap-4 mt-3">
                        <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/20" onClick={() => setCounterWager(Math.max(1, counterWager - 1))}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-black w-12 text-center">{counterWager}</span>
                        <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/20" onClick={() => setCounterWager(counterWager + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isNegotiating ? (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button className="bg-green-600 hover:bg-green-700 text-base px-6 py-5 rounded-xl font-bold" onClick={() => respondToInvite(invite.duelId, 'accept', counterWager)}>
                        ACEPTAR CON {counterWager} CRÉDITOS
                      </Button>
                      <Button variant="outline" className="bg-amber-600/20 border-amber-500/30 hover:bg-amber-600/30 text-base px-6 py-5 rounded-xl" onClick={() => respondToInvite(invite.duelId, 'counter', counterWager)}>
                        CONTRA-OFERTAR
                      </Button>
                      <Button variant="ghost" className="text-slate-400 text-base px-6 py-5 rounded-xl" onClick={() => setIsNegotiating(false)}>
                        CANCELAR
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button className="bg-green-600 hover:bg-green-700 text-base px-6 py-5 rounded-xl font-bold shadow-lg shadow-green-900/40" onClick={() => respondToInvite(invite.duelId, 'accept')}>
                        ACEPTAR {invite.isRevenge ? 'REVANCHA' : 'DUELO'}
                      </Button>
                      <Button variant="outline" className="bg-slate-800 border-white/10 hover:bg-slate-700 text-base px-6 py-5 rounded-xl" onClick={() => setIsNegotiating(true)}>
                        NEGOCIAR
                      </Button>
                      <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-base px-6 py-5 rounded-xl" onClick={() => respondToInvite(invite.duelId, 'reject')}>
                        RECHAZAR
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── GAME ARENA ─────────────────────────────────────────────── */}
          {duel && duel.status === 'in_progress' && !isPreparing && (
            <motion.div
              key="arena"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/95 border border-blue-500/20 rounded-3xl shadow-2xl backdrop-blur-xl w-full overflow-hidden"
            >
              {/* ── Scoreboard ── */}
              <div className="relative px-4 pt-4 pb-2 flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="flex items-center justify-center gap-8 relative z-10 w-full">
                  {/* Me */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">TÚ</span>
                    <motion.span
                      key={duel.scores[myId] || 0}
                      initial={{ scale: 1.6, color: "#60a5fa" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      className="text-5xl font-black text-white drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                    >
                      {duel.scores[myId] || 0}
                    </motion.span>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center justify-center pt-4">
                    <div className="text-slate-600 font-black italic text-lg">VS</div>
                    <span className="mt-1 text-[9px] px-3 py-0.5 rounded-full bg-slate-800 border border-white/5 text-slate-400">
                      {(duel.currentQuestion?.index ?? 0) + 1} / {duel.questionsCount}
                    </span>
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 max-w-[90px] truncate">
                      {duel.opponentName}
                    </span>
                    <motion.span
                      key={Object.entries(duel.scores).find(([id]) => parseInt(id) !== myId)?.[1]}
                      initial={{ scale: 1.6, color: "#f87171" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      className="text-5xl font-black text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                    >
                      {Object.entries(duel.scores).find(([id]) => parseInt(id) !== myId)?.[1] || 0 as any}
                    </motion.span>
                  </div>
                </div>

                {duel.topic && (
                  <div className="mt-2 px-4 py-1 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-slate-400 font-medium">RETO: <span className="text-white font-bold italic">{duel.topic}</span></p>
                  </div>
                )}
              </div>

              {/* ── Speed Bonus Bar ── */}
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-3.5 h-3.5 ${bonusActive && frozenAt === null ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${bonusActive && frozenAt === null ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {bonusActive && frozenAt === null ? `Bono activo · ${(timeLeft / 1000).toFixed(1)}s` : 'Bono Expirado'}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: frozenAt !== null ? 0 : 0.05 }}
                    className={`h-full rounded-full ${bonusActive ? 'bg-gradient-to-r from-yellow-500 to-amber-300' : 'bg-slate-700'}`}
                  />
                </div>
              </div>

              {/* ── Question Area ── */}
              <div className="px-4 pb-4">
                {duel.currentQuestion ? (
                  <motion.div
                    key={duel.currentQuestion.index}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full"
                  >
                    {/* Speed Bonus Flash Overlay */}
                    <AnimatePresence>
                      {speedBonusFlash && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                          <div className="bg-yellow-500/90 backdrop-blur-sm rounded-2xl px-8 py-5 text-center shadow-[0_0_60px_rgba(234,179,8,0.6)]">
                            <Zap className="h-8 w-8 text-white mx-auto mb-1 animate-bounce" />
                            <p className="text-white font-black text-xl uppercase tracking-tight">
                              ⚡ {speedBonusFlash === (session?.username) ? '¡BONO DE VELOCIDAD!' : `${speedBonusFlash} fue más rápido/a`}
                            </p>
                            <p className="text-yellow-100 text-xs font-bold mt-1">
                              {speedBonusFlash === (session?.username) ? '+1 crédito de velocidad 🏆' : '-1 crédito de velocidad 😓'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Question Text */}
                    <div className="text-base font-bold text-white mb-3 leading-snug text-center px-1">
                      <ContentRenderer content={duel.currentQuestion.content} />
                    </div>

                    {/* Answer Options — compact grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {duel.currentQuestion.options.map((option: any) => {
                        const styleClass = getOptionStyle(option);
                        const whoAnswered = getWhoAnswered(option);
                        const fb = duel.lastFeedback;
                        const correctId = (fb as any)?.correctAnswerId;
                        const isCorrectOption = correctId
                          ? option.id === correctId
                          : (fb?.answerId === option.id && fb?.isCorrect);

                        return (
                          <button
                            key={option.id}
                            disabled={selectedOptionId !== null || !!fb}
                            className={`relative flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all duration-200 ${styleClass} disabled:cursor-not-allowed`}
                            onClick={() => {
                              setSelectedOptionId(option.id);
                              submitAnswer(duel.duelId, duel.currentQuestion.index, option.id);
                            }}
                          >
                            {/* Icon */}
                            <div className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                              selectedOptionId === option.id ? 'bg-blue-600' :
                              isCorrectOption && fb ? 'bg-emerald-600' :
                              fb?.answerId === option.id && !fb?.isCorrect ? 'bg-red-700' :
                              'bg-slate-800'
                            }`}>
                              {isCorrectOption && fb ? (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              ) : fb?.answerId === option.id && !fb?.isCorrect ? (
                                <XCircle className="h-4 w-4 text-red-300" />
                              ) : (
                                <div className={`w-2 h-2 rounded-full ${selectedOptionId === option.id ? 'bg-white' : 'bg-slate-600'}`} />
                              )}
                            </div>

                            {/* Answer text */}
                            <span className="text-sm font-semibold flex-1 text-left">
                              <ContentRenderer content={option.content} />
                            </span>

                            {/* Who answered badge */}
                            {whoAnswered && (
                              <div className="flex flex-col gap-1 items-end">
                                {whoAnswered.isMe && (
                                  <span className="text-[9px] font-black uppercase bg-blue-500 text-white px-2 py-0.5 rounded-full">TÚ</span>
                                )}
                                {whoAnswered.isOpp && (
                                  <motion.span
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[9px] font-black uppercase bg-white text-slate-900 px-2 py-0.5 rounded-full max-w-[80px] truncate"
                                  >
                                    {whoAnswered.name}
                                  </motion.span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* "Both missed" message */}
                    {duel.lastFeedback && duel.lastFeedback.userId === null && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-amber-400 font-bold text-xs mt-3 uppercase tracking-widest"
                      >
                        ¡Ambos fallaron! → Respuesta correcta revelada ↑
                      </motion.p>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin" />
                      <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-blue-200 font-bold uppercase tracking-widest text-xs animate-pulse">Iniciando Arena...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ────────────────────────────────────────────────── */}
          {duel && duel.status === 'finished' && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", damping: 15 } }}
              className="bg-slate-900/95 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl text-center text-white relative overflow-hidden"
              onViewportEnter={() => {
                if (duel.finalResults?.winnerId === myId) {
                  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#22c55e', '#3b82f6'] });
                }
              }}
            >
              <div className={`absolute -top-20 -left-20 w-72 h-72 ${duel.finalResults?.winnerId === myId ? 'bg-green-500/20' : 'bg-red-500/20'} blur-[100px] rounded-full`} />

              <div className="relative z-10">
                {duel.finalResults?.winnerId === myId ? (
                  <div className="flex flex-col items-center">
                    <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-yellow-400 to-amber-600 p-1 mb-5 rotate-12 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
                      <div className="h-full w-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center">
                        <Trophy className="h-14 w-14 text-yellow-500 drop-shadow-lg" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-tighter mb-4 italic">
                      ¡DOMINACIÓN TOTAL!
                    </h2>
                    <div className="bg-green-500/10 border border-green-500/30 px-6 py-4 rounded-2xl mb-4 w-full max-w-xs">
                      <p className="text-green-400 font-black text-3xl mb-1">+{duel.finalResults.wager} CRÉDITOS</p>
                      {duel.finalResults.speedBonuses > 0 && (
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <Zap className="h-3.5 w-3.5 text-yellow-400" />
                          <p className="text-yellow-400 text-xs font-black uppercase tracking-tight">
                            {duel.finalResults.speedBonuses} bonus de velocidad incluido{duel.finalResults.speedBonuses > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                      <p className="text-green-500/60 text-[10px] font-bold uppercase tracking-widest mt-1">Botín Asegurado</p>
                    </div>
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                      Has demostrado tu superioridad intelectual. Tus arcas crecen y tu honor se eleva.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-red-600 to-red-900 p-1 mb-5 -rotate-12 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                      <div className="h-full w-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center">
                        <ShieldAlert className="h-14 w-14 text-red-500" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-200 to-red-700 uppercase tracking-tighter mb-4 italic">
                      CAÍDA EN COMBATE
                    </h2>
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl mb-4 w-full max-w-xs">
                      <p className="text-red-400 font-black text-3xl mb-1">-{duel.finalResults?.wager} CRÉDITOS</p>
                      {duel.finalResults?.speedBonuses > 0 && (
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <Zap className="h-3.5 w-3.5 text-yellow-400" />
                          <p className="text-yellow-400/80 text-xs font-black uppercase tracking-tight">
                            Tu rival ganó {duel.finalResults.speedBonuses} crédito{duel.finalResults.speedBonuses > 1 ? 's' : ''} extra por velocidad ⚡
                          </p>
                        </div>
                      )}
                      <p className="text-red-600/60 text-[10px] font-bold uppercase tracking-widest mt-1">Saldo Perdido</p>
                    </div>
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                      Solo el conocimiento te permitirá recuperar lo perdido. Prepárate, estudia y reclama tu honor.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-6 w-full max-w-xs mx-auto">
                  {duel.finalResults?.winnerId !== myId && (
                    <Button
                      onClick={() => {
                        setRevengeRequest({
                          opponentId: Number(Object.keys(duel.scores).find(id => Number(id) !== myId)),
                          opponentName: duel.opponentName
                        });
                        resetDuel();
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white text-lg py-6 font-black rounded-2xl shadow-[0_8px_16px_rgba(220,38,38,0.3)] border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all"
                    >
                      SOLICITAR REVANCHA
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => window.location.reload()}
                    className="text-slate-500 hover:text-white hover:bg-white/5 py-3 rounded-2xl font-bold text-sm"
                  >
                    SALIR DE LA ARENA
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
