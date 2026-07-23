import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Medal, Coins, Check, Sparkles } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface MedalCelebrationProps {
  alert: {
    quizId: number;
    type: 'gold' | 'silver';
    credits: number;
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

  const isGold = alert.type === 'gold';
  const imgUrl = isGold 
    ? '/aritmetica_imagenes/alanmath_medalla_oro.png' 
    : '/aritmetica_imagenes/alanmath_medalla_plata.png';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 overflow-hidden backdrop-blur-md">
      {/* Dynamic background glow based on medal type */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 animate-pulse",
          isGold ? "bg-yellow-500/10" : "bg-slate-400/10"
        )} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className={cn(
          "w-full max-w-lg mx-4 bg-slate-900/90 border rounded-[2.8rem] overflow-hidden flex flex-col items-center p-8 text-center relative shadow-2xl",
          isGold ? "border-yellow-500/40 shadow-yellow-500/10" : "border-slate-500/30 shadow-slate-500/10"
        )}
      >
        {/* Color bar at top */}
        <div 
          className={cn(
            "absolute inset-x-0 top-0 h-2",
            isGold 
              ? "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600" 
              : "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500"
          )} 
        />

        {/* Medal Image Card with intelligent CSS cropping to hide baked-in bottom text */}
        <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 bg-black mb-6 flex items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            <img 
              src={imgUrl} 
              alt={isGold ? "Medalla de Oro" : "Medalla de Plata"} 
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
            <span 
              className={cn(
                "text-lg font-black uppercase tracking-wider block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]",
                isGold 
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]" 
                  : "text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 drop-shadow-[0_0_12px_rgba(203,213,225,0.4)]"
              )}
            >
              {isGold ? "¡MEDALLA DE ORO! 🥇" : "¡MEDALLA DE PLATA! 🥈"}
            </span>
          </div>
          
          <div className="fallback-icon hidden flex flex-col items-center gap-2 relative z-10">
            {isGold ? (
              <Award className="w-24 h-24 text-yellow-500 fill-yellow-500/20 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
            ) : (
              <Medal className="w-24 h-24 text-slate-300 fill-slate-300/20 drop-shadow-[0_0_20px_rgba(203,213,225,0.5)]" />
            )}
            <p className="text-sm font-black uppercase text-slate-400 tracking-wider">
              {isGold ? "Medalla de Oro" : "Medalla de Plata"}
            </p>
          </div>

          {/* Sparkle effects for Gold */}
          {isGold && (
            <div className="absolute top-3 right-3 text-yellow-400 z-10">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          )}
        </div>

        {/* Congratulatory Text */}
        <h3 
          className={cn(
            "text-2xl font-black italic uppercase tracking-tight mb-2",
            isGold ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" : "text-slate-200"
          )}
        >
          {isGold ? "¡Excelente Desempeño!" : "¡Gran Logro!"}
        </h3>
        
        <p className="text-slate-300 text-sm leading-relaxed px-2 mb-6">
          {isGold 
            ? "¡Excelente trabajo! Has logrado una calificación perfecta en este cuestionario. Tu maestría y esfuerzo han sido recompensados." 
            : "¡Muy bien hecho! Has conseguido una calificación alta en el cuestionario y has obtenido una merecida medalla de plata."
          }
        </p>

        {/* Credit counting area with Zoom effect */}
        <motion.div
          animate={isCounting ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3, repeat: isCounting ? Infinity : 0 }}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-[1.8rem] bg-slate-950 border transition-all mb-8 shadow-xl",
            isCounting 
              ? isGold 
                ? "border-yellow-400 shadow-yellow-500/20" 
                : "border-slate-300 shadow-slate-300/10" 
              : "border-white/5"
          )}
        >
          <Coins className="w-6 h-6 text-yellow-500 animate-spin" />
          <span className="text-2xl font-black font-mono text-yellow-400">{displayedCredits}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
            +{alert.credits} créditos
          </span>
        </motion.div>

        {/* Dismiss Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDismiss}
          className={cn(
            "px-8 py-3.5 rounded-[1.8rem] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all w-full",
            isGold 
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-yellow-500/30" 
              : "bg-gradient-to-r from-slate-400 to-slate-500 hover:shadow-slate-400/20"
          )}
        >
          <span>¡Gracias, Alanmath! 🚀</span>
          <Check className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};
