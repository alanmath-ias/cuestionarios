import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Zap, Loader2, CheckCircle2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIMarkdown } from '@/components/ui/ai-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface MathTipCardProps {
  userId: number;
}

export const MathTipCard: React.FC<MathTipCardProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tipData, isLoading: isLoadingTip } = useQuery({
    queryKey: ["math-tip"],
    queryFn: async () => {
      const res = await fetch("/api/user/math-tip");
      if (!res.ok) throw new Error("Error al cargar el tip");
      return res.json();
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/math-tip/generate", { method: 'POST' });
      if (!res.ok) throw new Error("Error al generar el chispazo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["math-tip"] });
      setIsOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el chispazo matemático.",
        variant: "destructive"
      });
    }
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/math-tip/claim", { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al reclamar");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["math-tip"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "¡Recompensa reclamada!",
        description: data.message,
        className: "bg-emerald-900 border-emerald-500 text-emerald-50"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleOpen = () => {
    if (tipData?.isToday && tipData?.tip) {
      setIsOpen(true);
    } else {
      generateMutation.mutate();
    }
  };

  const isGenerating = generateMutation.isPending;
  const isClaiming = claimMutation.isPending;
  const hasTipForToday = tipData?.isToday && tipData?.tip;
  const isClaimed = tipData?.claimed;

  return (
    <>
      <Card className="relative overflow-hidden group bg-slate-900/40 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 shadow-lg shadow-amber-900/10 h-full flex flex-col">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-orange-600/5 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] group-hover:bg-amber-500/20 transition-all duration-700" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-600/10 rounded-full blur-[40px]" />

        <div className="relative p-5 flex flex-col h-full z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 leading-tight">Chispazo Matemático</h3>
                <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-wider">Tip del Día</p>
              </div>
            </div>
            {isClaimed && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-2">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-3">
            {hasTipForToday 
              ? "¡Tu chispazo de hoy está listo! Míralo para ganar tu recompensa." 
              : "Un consejo personalizado basado en tus últimos desafíos. ¿Listo para aprender algo nuevo?"}
          </p>

          <Button 
            onClick={handleOpen}
            disabled={isGenerating || isLoadingTip}
            className={cn(
              "w-full h-10 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group/btn",
              isClaimed 
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5" 
                : "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white border-none shadow-lg shadow-amber-900/30"
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
            )}
            <span>{isClaimed ? "Revisar Chispazo" : "Ver Chispazo (+1 💎)"}</span>
            
            {!isClaimed && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            )}
          </Button>
        </div>
      </Card>

      {/* Dialog for the Tip */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-950 border-amber-500/30 text-slate-100 rounded-[2rem] overflow-hidden p-0 max-h-[90vh] flex flex-col">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500 z-50" />
          
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <DialogHeader className="mb-6">
              <div className="flex justify-center mb-4">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Lightbulb className="w-8 h-8 text-amber-400 fill-amber-400/20" />
                </motion.div>
              </div>
              <DialogTitle className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                ¡Chispazo Matemático!
              </DialogTitle>
              <DialogDescription className="text-center text-slate-400 font-medium">
                Sube de nivel con este consejo de AlanMath
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5 mb-8 min-h-[120px] flex items-center relative group overflow-x-auto custom-scrollbar">
              {/* Internal Glow */}
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              <div className="relative z-10 w-full flex flex-col gap-4">
                {tipData?.context && (
                  <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 mb-2 flex flex-col gap-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Pregunta de Referencia
                    </p>
                    
                    {tipData.imageUrl && (
                      <div className="relative w-full rounded-lg overflow-hidden border border-white/5 bg-slate-900/50">
                        <img 
                          src={tipData.imageUrl} 
                          alt="Contexto visual" 
                          className="w-full h-auto max-h-40 object-contain mx-auto"
                        />
                      </div>
                    )}

                    <p className="text-slate-300 text-sm italic line-clamp-3">
                      "{tipData.context}"
                    </p>
                  </div>
                )}
                
                <AIMarkdown 
                  content={tipData?.tip || ""} 
                  className="text-slate-200 text-center [&_p]:leading-relaxed [&_p]:text-base [&_p]:mb-3 [&_strong]:text-amber-300 [&_.katex]:text-amber-100 prose-invert w-full overflow-x-auto custom-scrollbar" 
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-center">
              {!isClaimed ? (
                <Button 
                  onClick={() => claimMutation.mutate()}
                  disabled={isClaiming}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black text-lg shadow-xl shadow-amber-900/40 border-none group relative overflow-hidden"
                >
                  {isClaiming ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  ) : (
                    <Trophy className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                  )}
                  <span>Reclamar +1 Crédito</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              ) : (
                <div className="flex flex-col items-center w-full gap-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Recompensa Reclamada!
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 hover:text-white hover:bg-white/5"
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper for class names if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
