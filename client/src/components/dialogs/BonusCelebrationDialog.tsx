import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, HeartHandshake, CheckCircle2, X } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PendingBonus {
  credits: number;
  message: string;
  grantedAt?: string;
}

interface BonusCelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingBonus: PendingBonus | null;
  username: string;
}

export function BonusCelebrationDialog({
  open,
  onOpenChange,
  pendingBonus,
  username,
}: BonusCelebrationDialogProps) {
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (open && pendingBonus) {
      // Trigger festive confetti explosion
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#3b82f6", "#10b981", "#ec4899"],
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#3b82f6", "#10b981", "#ec4899"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open, pendingBonus]);

  if (!pendingBonus) return null;

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await apiRequest("POST", "/api/user/clear-pending-bonus");
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.invalidateQueries({ queryKey: ["user-quizzes"] });
      onOpenChange(false);
    } catch (err) {
      console.error("Error claiming bonus:", err);
      onOpenChange(false);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClaim()}>
      <DialogContent className="max-w-2xl w-[94vw] bg-slate-950/95 border-amber-500/30 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={handleClaim}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative p-6 md:p-8 space-y-6">
          {/* Header Tag */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
              ¡Premio Especial del Profesor!
            </motion.div>
          </div>

          {/* Main Content Grid: Image on Left, Details on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column: Full Unclipped Character Image */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 flex justify-center items-center"
            >
              <div className="relative w-full max-w-[240px] md:max-w-none bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-md overflow-hidden flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <img
                  src="/alanmath_entrega_bonus_monedas.png"
                  alt="AlanMath entregando premio"
                  className="w-full h-auto max-h-[250px] object-contain rounded-2xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                />
              </div>
            </motion.div>

            {/* Right Column: Greetings, Credits Badge & Teacher Message */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-7 flex flex-col space-y-4 text-left"
            >
              {/* Greeting */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  ¡Hola, <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{username}</span>! 🎉
                </h3>
                <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
                  Tu profesor te ha enviado una recompensa especial por tu <strong className="text-amber-300">gran trabajo</strong>.
                </p>
              </div>

              {/* Reward Badge (Moved off the image so hands & coins are completely visible) */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Coins className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Premio Ganado</span>
                  <span className="text-xl md:text-2xl font-black text-amber-400 leading-none">
                    +{pendingBonus.credits} Créditos
                  </span>
                </div>
              </div>

              {/* Teacher Message Box */}
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Mensaje de tu profesor:</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 italic leading-relaxed pl-2 border-l-2 border-amber-500/60">
                  "{pendingBonus.message}"
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-2"
          >
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full h-12 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wide rounded-2xl shadow-xl shadow-amber-500/25 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              ¡RECIBIR PREMIO E IR AL DASHBOARD!
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
