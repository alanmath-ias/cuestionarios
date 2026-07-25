import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Coins, Check, Sparkles } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface MedalCelebrationProps {
  alert: {
    quizId: number;
    type: 'gold' | 'silver';
    credits: number;
    hasScoreBonus?: boolean;
  };
  currentCredits: number; // Current credits before adding the reward
  onClose?: () => void;
}

export const MedalCelebration: React.FC<MedalCelebrationProps> = ({
  alert,
  currentCredits,
  onClose
}) => {
  const [displayedCredits, setDisplayedCredits] = useState(currentCredits - alert.credits);
  const [isCounting, setIsCounting] = useState(false);

  const hasBonus = alert.hasScoreBonus || alert.credits >= 8;

  useEffect(() => {
    // Start counting animation
    setIsCounting(true);
    const duration = 1500; // 1.5 seconds
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;
    const initialCreditsVal = currentCredits - alert.credits;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(initialCreditsVal + (alert.credits * easeProgress));

      setDisplayedCredits(currentVal);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayedCredits(currentCredits);
        setIsCounting(false);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [alert.credits, currentCredits]);

  const handleDismiss = async () => {
    try {
      await apiRequest('POST', '/api/user/clear-medal-alert');
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error clearing medal alert:', error);
    }
  };

  const imgUrl = '/aritmetica_imagenes/alanmath_medalla_plata.png';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 overflow-hidden backdrop-blur-md">
      {/* Dynamic background glow */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 animate-pulse",
          hasBonus ? "bg-amber-500/15" : "bg-slate-400/10"
        )} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-lg mx-4 bg-slate-900/90 border border-slate-500/30 shadow-slate-500/10 rounded-[2.8rem] overflow-hidden flex flex-col items-center p-8 text-center relative shadow-2xl"
      >
        {/* Color bar at top */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500" />

        {/* Medal Image Card */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 bg-black mb-5 flex items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            <img 
              src={imgUrl} 
              alt="Medalla de Plata" 
              className="w-full h-full object-cover object-top scale-[1.28] origin-top transition-transform duration-500 group-hover:scale-135"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement?.parentElement;
                if (parent) {
                  const icon = parent.querySelector('.fallback-icon');
                  if (icon) icon.classList.remove('hidden');
                }
              }}
            />
          </div>

          {/* Floating High-Contrast Badge over Alanmath */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] py-2 px-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-center shadow-xl z-10">
            <span className="text-lg font-black uppercase tracking-wider block text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 drop-shadow-[0_0_12px_rgba(203,213,225,0.4)]">
              ¡MEDALLA DE PLATA! 🥈
            </span>
          </div>
          
          <div className="fallback-icon hidden flex flex-col items-center gap-2 relative z-10">
            <Medal className="w-24 h-24 text-slate-300 fill-slate-300/20 drop-shadow-[0_0_20px_rgba(203,213,225,0.5)]" />
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">
              Medalla de Plata
            </p>
          </div>
        </div>

        {/* Highlighted Bonus Notice for Score >= 8 */}
        {hasBonus && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full py-2.5 px-4 mb-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>¡BONUS DESEMPEÑO SOBRESALIENTE! +3 Créditos adicionales por tu excelente nota (≥ 8/10)</span>
          </motion.div>
        )}

        {/* Congratulatory Text */}
        <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 text-slate-200">
          ¡Excelente Logro!
        </h3>
        
        <p className="text-slate-300 text-sm leading-relaxed px-2 mb-6">
          ¡Muy bien hecho! Has completado el cuestionario y has obtenido tu merecida Medalla de Plata.
        </p>

        {/* Credit counting area with Zoom effect */}
        <motion.div
          animate={isCounting ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3, repeat: isCounting ? Infinity : 0 }}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-[1.8rem] bg-slate-950 border transition-all mb-8 shadow-xl",
            isCounting ? "border-amber-400 shadow-amber-500/20" : "border-white/5"
          )}
        >
          <Coins className="w-6 h-6 text-yellow-500 animate-spin" />
          <span className="text-2xl font-black font-mono text-yellow-400">{displayedCredits}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
            +{alert.credits} créditos {hasBonus ? '(5 + 3 bonus)' : ''}
          </span>
        </motion.div>

        {/* Dismiss Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDismiss}
          className="px-8 py-3.5 rounded-[1.8rem] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all w-full bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400 hover:shadow-slate-400/30"
        >
          <span>¡Gracias, Alanmath! 🚀</span>
          <Check className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};
