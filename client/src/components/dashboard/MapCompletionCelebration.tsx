import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, ArrowRight, Sparkles, AlertCircle, Medal, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface MapCompletionCelebrationProps {
  categoryId: number;
  initialCredits: number;
  onClose?: () => void;
}

export const MapCompletionCelebration: React.FC<MapCompletionCelebrationProps> = ({
  categoryId,
  initialCredits,
  onClose
}) => {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [displayedCredits, setDisplayedCredits] = useState(initialCredits);
  const [isCounting, setIsCounting] = useState(false);
  const targetCredits = initialCredits + 1000;

  let subjectName = "Aritmética";
  let nextSubjectName = "Álgebra";
  let trophyImage = "/aritmetica_imagenes/copa_de_oro_trofeo.png";
  let avatarImage = "/aritmetica_imagenes/entrega_copa.png";
  let silverCupTrophyImage = "/aritmetica_imagenes/copa_de_plata_trofeo.png";

  if (categoryId === 2) {
    subjectName = "Álgebra";
    nextSubjectName = "Trigonometría";
    trophyImage = "/aritmetica_imagenes/copa_de_oro_trofeo_algebra.png";
    avatarImage = "/aritmetica_imagenes/entrega_copa_algebra.png";
    silverCupTrophyImage = "/aritmetica_imagenes/copa_de_plata_trofeo_algebra.png";
  } else if (categoryId === 4) {
    subjectName = "Cálculo Diferencial";
    nextSubjectName = "Cálculo Integral";
    trophyImage = "/aritmetica_imagenes/copa_de_oro_trofeo_calculo_diferencial.png";
    avatarImage = "/aritmetica_imagenes/entrega_copa_calculo_diferencial.png";
    silverCupTrophyImage = "/aritmetica_imagenes/copa_de_plata_trofeo_calculo_diferencial.png";
  }

  // Confetti particles
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * -20 - 10, // above screen
      size: Math.random() * 8 + 4,
      color: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
      xOffset: Math.random() * 100 - 50
    }));
    setParticles(newParticles);
  }, []);

  // Handle credits counting animation on step 2 (aumento de creditos)
  useEffect(() => {
    if (step === 2) {
      setIsCounting(true);
      
      let cancelId: number;
      const startTime = performance.now();
      
      // Total duration parameters (in ms)
      const p1Duration = 1000;
      const pause1 = 500;
      const p2Duration = 1200;
      const pause2 = 500;
      const p3Duration = 1000;
      
      const totalDuration = p1Duration + pause1 + p2Duration + pause2 + p3Duration;
      
      const p1Target = initialCredits + 327; // random-like end values
      const p2Target = initialCredits + 784;
      const p3Target = initialCredits + 1000;
      
      const tick = (now: number) => {
        const elapsed = now - startTime;
        
        if (elapsed < p1Duration) {
          // Phase 1 counting
          const progress = elapsed / p1Duration;
          const ease = progress * (2 - progress); // easeOutQuad
          const mainVal = initialCredits + (p1Target - initialCredits) * ease;
          
          if (progress < 0.9) {
            const baseVal = Math.floor(mainVal / 100) * 100;
            const units = Math.floor(Math.random() * 10);
            const tens = Math.floor(Math.random() * 10);
            setDisplayedCredits(baseVal + tens * 10 + units);
          } else {
            setDisplayedCredits(Math.round(mainVal));
          }
        } 
        else if (elapsed < p1Duration + pause1) {
          // Pause 1: keep at p1Target
          setDisplayedCredits(p1Target);
        } 
        else if (elapsed < p1Duration + pause1 + p2Duration) {
          // Phase 2 counting
          const phaseElapsed = elapsed - (p1Duration + pause1);
          const progress = phaseElapsed / p2Duration;
          const ease = progress * (2 - progress);
          const mainVal = p1Target + (p2Target - p1Target) * ease;
          
          if (progress < 0.9) {
            const baseVal = Math.floor(mainVal / 100) * 100;
            const units = Math.floor(Math.random() * 10);
            const tens = Math.floor(Math.random() * 10);
            setDisplayedCredits(baseVal + tens * 10 + units);
          } else {
            setDisplayedCredits(Math.round(mainVal));
          }
        } 
        else if (elapsed < p1Duration + pause1 + p2Duration + pause2) {
          // Pause 2: keep at p2Target
          setDisplayedCredits(p2Target);
        } 
        else if (elapsed < totalDuration) {
          // Phase 3: final counting to target
          const phaseElapsed = elapsed - (p1Duration + pause1 + p2Duration + pause2);
          const progress = phaseElapsed / p3Duration;
          // Smooth easeOutCubic for final settling
          const ease = 1 - Math.pow(1 - progress, 3);
          const mainVal = p2Target + (p3Target - p2Target) * ease;
          
          if (progress < 0.85) {
            const baseVal = Math.floor(mainVal / 100) * 100;
            const units = Math.floor(Math.random() * 10);
            const tens = Math.floor(Math.random() * 10);
            setDisplayedCredits(baseVal + tens * 10 + units);
          } else {
            setDisplayedCredits(Math.round(mainVal));
          }
        } 
        else {
          // Finished
          setDisplayedCredits(p3Target);
          setIsCounting(false);
          return;
        }
        
        cancelId = requestAnimationFrame(tick);
      };
      
      cancelId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(cancelId);
    }
  }, [step, initialCredits, targetCredits]);

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      handleFinalize();
    }
  };

  const handleFinalize = async () => {
    try {
      await apiRequest('POST', '/api/user/clear-map-celebration', { categoryId });
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      // Redirect to dashboard with the cofre open query parameter
      setLocation('/dashboard?openAwardsCategory=' + categoryId);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error completing celebration:', error);
    }
  };

  // Step dialog contents
  const dialogues = [
    {
      title: "¡Logro Monumental!",
      text: `¡Felicidades, campeón! 🌟 Has completado el 100% de la materia de ${subjectName}. ¡Esta es una hazaña verdaderamente extraordinaria!`,
      buttonText: "Ver mi recompensa"
    },
    {
      title: "Tu Copa de Oro 🏆",
      text: `Te presento tu Copa de Oro oficial como reconocimiento a tu gran esfuerzo y dominio absoluto de los números en ${subjectName}.`,
      buttonText: "Continuar"
    },
    {
      title: "Premios Especiales",
      text: "Para celebrar tu dedicación, ¡has ganado un superbono de 1,000 créditos para pistas! Mira cómo se multiplican:",
      buttonText: "Siguiente"
    },
    {
      title: "El Verdadero Tesoro",
      text: "Recuerda que lo más valioso de este camino no son solo las respuestas correctas... Es tu persistencia, tu fuerza de voluntad y tu decisión de no rendirte. ¡Eso es aprender!",
      buttonText: "Siguiente"
    },
    {
      title: "Consejo de Alanmath 🧠",
      text: "Para mantener tu mente en forma y no olvidar lo aprendido, te aconsejo practicar con regularidad en tus ratos libres. ¡La constancia te hará invencible!",
      buttonText: "Siguiente"
    },
    {
      title: "¡Siguiente Destino!",
      text: `Estás más que preparado para nuevos retos. Te invito a reclamar tu Copa en tu Cofre de Tesoros de ${subjectName} y luego avanzar al curso de ${nextSubjectName}. ¡El viaje continúa!`,
      buttonText: `Ir a mi Cofre de ${subjectName}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 overflow-hidden backdrop-blur-md">
      {/* Background glowing rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[100px] -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[80px] -z-10" />

      {/* Confetti particles rain */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: '110vh',
              x: p.xOffset,
              rotate: 360,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              left: `${p.x}vw`,
              top: `${p.y}px`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size % 2 === 0 ? '50%' : '2px',
              zIndex: 10
            }}
          />
        ))}
      </AnimatePresence>

      {/* Relative container for the main box and its surrounding medals/cup */}
      <div className="relative w-full max-w-xl flex flex-col items-center justify-center py-2 px-4">
        
        {/* Mobile-only row of earned rewards (appears at top on small screens to avoid overflow/overlap) */}
        <div className="flex md:hidden items-center justify-center gap-4 mb-6 w-full">
          <AnimatePresence>
            {step >= 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 0.7 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-slate-300/40 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200/50 bg-slate-950/90 flex items-center justify-center shadow-lg">
                  <Medal className="w-8 h-8 text-slate-100" />
                </div>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 0.7 }}
                className="relative animate-bounce-subtle"
              >
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-slate-200/50 bg-slate-950/95 flex items-center justify-center shadow-xl">
                  <img src={silverCupTrophyImage} className="w-10 h-10 object-contain" />
                </div>
              </motion.div>
            )}
            
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 0.7 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-yellow-500/50 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/60 bg-slate-950/90 flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Silver Cup — in flow above the card, centered with the card */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              key="flow-silver-cup"
              initial={{ opacity: 0, scale: 0.4, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="hidden md:flex flex-col items-center mb-1 pointer-events-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200/50 bg-slate-950/95 flex items-center justify-center shadow-[0_0_60px_rgba(203,213,225,0.9)] backdrop-blur-md">
                  <img src={silverCupTrophyImage} alt="Copa de Plata" className="w-18 h-18 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full animate-ping scale-125" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-400/20 rounded-full animate-ping scale-150" />
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Copa de Plata</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card wrapper — relative so medals can be absolute relative to THIS, not the outer wrapper */}
        <div className="relative w-full">
          {/* Desktop medals — absolute relative to card wrapper, not clipped by card's overflow */}
          <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
            <AnimatePresence>
              {step >= 0 && (
                <motion.div
                  key="desktop-silver-medal"
                  initial={{ opacity: 0, scale: 0.4, x: -100, y: "-50%" }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
                  className="absolute right-[calc(100%+1.5rem)] top-1/2"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-slate-300/40 blur-3xl rounded-full scale-150 animate-pulse" />
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200/50 bg-slate-950/90 flex items-center justify-center shadow-[0_0_60px_rgba(203,213,225,0.7)] backdrop-blur-md">
                        <Medal className="w-16 h-16 text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full animate-ping scale-150" />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Medalla Plata</span>
                  </div>
                </motion.div>
              )}
              {step >= 1 && (
                <motion.div
                  key="desktop-gold-medal"
                  initial={{ opacity: 0, scale: 0.4, x: 100, y: "-50%" }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
                  className="absolute left-[calc(100%+1.5rem)] top-1/2"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500/50 blur-3xl rounded-full scale-150 animate-pulse" />
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/60 bg-slate-950/90 flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.8)] backdrop-blur-md">
                        <Award className="w-16 h-16 text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_30px_rgba(234,179,8,0.9)]" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-yellow-400/50 rounded-full animate-ping scale-150" />
                    </div>
                    <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Medalla Oro</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Celebration Box — NO overflow-hidden so medals aren't clipped */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full bg-slate-900/90 border border-amber-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col items-center p-4 md:p-5 text-center relative"
          >
            {/* Golden border accent */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-t-[2rem]" />


            {/* Alanmath Avatar & Scene Header */}
            <div className="relative mb-3 flex flex-col items-center">
            {/* Sparkles around character */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 border border-dashed border-amber-500/25 rounded-full -z-10"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 text-yellow-400"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </motion.div>

            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.5)] bg-gradient-to-b from-slate-900 via-amber-950 to-slate-950 flex items-center justify-center p-1">
              <img src={avatarImage} className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest mt-1">Alanmath</span>
          </div>


          {/* Content Area with Dynamic Visual representation */}
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[100px] mb-3">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl mb-1 animate-bounce">🎉</div>
                  <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tight">
                    {dialogues[0].title}
                  </h2>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src={trophyImage}
                    alt="Copa de Oro"
                    className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = parent.querySelector('.fallback-icon');
                        if (icon) icon.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="fallback-icon hidden">
                    <Trophy className="w-16 h-16 text-yellow-500 fill-yellow-500/20 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-400 italic uppercase tracking-tight mt-2">
                    {dialogues[1].title}
                  </h2>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  {/* Glowing counting badge */}
                  <motion.div
                    animate={isCounting ? { scale: [1, 1.2, 1], shadow: '0 0 40px rgba(245,158,11,0.8)' } : {}}
                    transition={{ duration: 0.3, repeat: isCounting ? Infinity : 0 }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-[1.5rem] bg-slate-950 border-2 transition-all shadow-2xl",
                      isCounting ? "border-amber-400 shadow-amber-500/40" : "border-white/10"
                    )}
                  >
                    <Coins className="w-7 h-7 text-yellow-500 animate-spin" />
                    <span className="text-3xl md:text-4xl font-black font-mono text-yellow-400">
                      {displayedCredits}
                    </span>
                  </motion.div>
                  <div className="text-xs font-black text-amber-500/80 uppercase tracking-widest mt-2">
                    +{isCounting ? "Sumando créditos..." : "1,000 Créditos Añadidos"}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center max-w-sm"
                >
                  <div className="text-4xl mb-2">🔥</div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">La Persistencia de Acero</h3>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">📈</div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Práctica Continua</h3>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">🏁</div>
                  <h3 className="text-lg font-black text-yellow-400 uppercase italic tracking-tight">¡Siguiente Nivel!</h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dialogue Text */}
            <motion.p
              key={`dialogue-${step}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium mt-3 px-2"
            >
              {dialogues[step].text}
            </motion.p>
          </div>

          {/* Buttons and steps indicator */}
          <div className="w-full flex flex-col items-center gap-2 mt-auto">
            {/* Step dots */}
            <div className="flex gap-2">
              {dialogues.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    idx === step ? "bg-amber-400 w-6" : "bg-slate-700"
                  )}
                />
              ))}
            </div>

            <ButtonCelebrate
              onClick={handleNext}
              text={dialogues[step].buttonText}
              icon={step === 5 ? Trophy : ArrowRight}
            />
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

const ButtonCelebrate = ({ onClick, text, icon: Icon }: any) => (
  <motion.button
    whileHover={{ scale: 1.05, shadow: '0 0 25px rgba(245,158,11,0.5)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-6 py-3 rounded-[1.5rem] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all w-full md:w-auto"
  >
    <span>{text}</span>
    <Icon className="w-4 h-4" />
  </motion.button>
);
