import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Check, Zap, ArrowRight, BookOpen } from 'lucide-react';

interface PremiumUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function PremiumUpgradeModal({
  open,
  onOpenChange,
  title = "Desbloquea las Explicaciones Paso a Paso",
  description = "Aprende el desarrollo matemático completo con explicaciones detalladas y rigurosas creadas para acelerar tu aprendizaje."
}: PremiumUpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleGoToSubscription = () => {
    onOpenChange(false);
    setLocation('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 border border-purple-500/30 text-slate-100 max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Badge & Icon Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-purple-500/30 to-blue-500/30 blur-xl rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Característica Premium
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white pt-1">
              {title}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm leading-relaxed max-w-md">
              {description}
            </DialogDescription>
          </div>

          {/* Beneficios */}
          <div className="w-full bg-slate-950/60 border border-white/5 rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-inner">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Con AlanMath Premium obtienes:
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span><strong>Soluciones paso a paso</strong> con notación matemática formal en LaTeX.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span><strong>Procedimientos en aciertos y fallos:</strong> comprende el método exacto aunque hayas adivinado.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span><strong>Acceso ilimitado</strong> a cuestionarios, pistas y herramientas avanzadas.</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 pt-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/5 order-2 sm:order-1 text-sm font-medium"
          >
            Continuar practicando
          </Button>
          <Button
            type="button"
            onClick={handleGoToSubscription}
            className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-600 hover:via-purple-700 hover:to-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-purple-600/30 gap-2 order-1 sm:order-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Ver Planes Premium</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
