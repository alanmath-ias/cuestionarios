import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTheme, APP_THEMES } from '@/lib/theme';
import { Check, Palette, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeSelectorDialog({ open, onOpenChange }: ThemeSelectorDialogProps) {
  const { theme, setTheme, themeConfig } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-slate-950/95 border border-white/10 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Personalizar Apariencia
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Elige la paleta visual que mejor se adapte a tu estilo. Se aplicará a toda la plataforma.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2">
          {APP_THEMES.map((t) => {
            const isSelected = theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(t.id)}
                className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-white/40 bg-white/[0.08] shadow-[0_0_25px_rgba(255,255,255,0.12)]'
                    : 'border-white/5 bg-slate-900/60 hover:bg-slate-900/90 hover:border-white/20'
                }`}
              >
                {/* Background glow when selected */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top right, ${t.previewColors[0]}, transparent 70%)`
                    }}
                  />
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-white group-hover:text-white flex items-center gap-1.5">
                      {t.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                        {t.tag}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed mb-3">
                    {t.subtitle}
                  </p>
                </div>

                {/* Color swatch bubbles preview */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                  <div className="flex items-center -space-x-1.5">
                    {t.previewColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full border-2 border-slate-950 shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div 
                    className={`h-2 w-14 rounded-full bg-gradient-to-r ${t.previewGradient} shadow-sm`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Live Preview Sample */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Tema Activo</span>
            <span className="text-sm font-black theme-text-gradient">{themeConfig.name}</span>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="theme-btn-primary px-5 py-2 rounded-xl text-white font-bold text-xs shadow-lg"
          >
            Guardar y Listo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
