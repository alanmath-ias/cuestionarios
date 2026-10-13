import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTheme, APP_THEMES, ThemeConfig } from '@/lib/theme';
import { Check, Palette, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeSelectorDialog({ open, onOpenChange }: ThemeSelectorDialogProps) {
  const { theme, setTheme, themeConfig } = useTheme();

  const girlsThemes = APP_THEMES.filter(t => t.category === 'girls');
  const generalThemes = APP_THEMES.filter(t => t.category === 'general');

  const renderThemeCard = (t: ThemeConfig) => {
    const isSelected = theme === t.id;
    return (
      <motion.button
        key={t.id}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => setTheme(t.id)}
        className={`group relative text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
          isSelected
            ? 'border-white/40 bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
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
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="font-bold text-xs sm:text-sm text-white group-hover:text-white flex items-center gap-1">
              {t.name}
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                t.category === 'girls'
                  ? 'bg-pink-500/15 border border-pink-400/30 text-pink-300'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {t.tag}
              </span>
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium line-clamp-1 leading-snug mb-2">
            {t.subtitle}
          </p>
        </div>

        {/* Color swatch bubbles preview */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-auto">
          <div className="flex items-center -space-x-1">
            {t.previewColors.map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-slate-950 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div 
            className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${t.previewGradient} shadow-sm`}
          />
        </div>
      </motion.button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[88vh] overflow-y-auto custom-scrollbar bg-slate-950/95 border border-white/10 text-white backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
        <DialogHeader className="mb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Personalizar Apariencia
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[11px] sm:text-xs">
                Elige la paleta visual para tu perfil, mapas de cursos y cuestionarios.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 my-1 overflow-y-auto pr-0.5">
          {/* SECCIÓN 1: TEMAS FEMENINOS (CHICAS) */}
          <div className="p-2.5 rounded-xl bg-pink-500/[0.04] border border-pink-500/15">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-pink-300">
                <Heart className="w-3.5 h-3.5 fill-pink-400/40 text-pink-400" />
                <span>🌸 Estilos Femeninos (Especial Chicas)</span>
              </div>
              <span className="text-[10px] text-pink-400/80 font-medium hidden sm:inline">
                Adapta los mapas con temática de exploradoras
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {girlsThemes.map(renderThemeCard)}
            </div>
          </div>

          {/* SECCIÓN 2: TEMAS CLÁSICOS Y GENERALES */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>⚡ Estilos Clásicos & Generales</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {generalThemes.map(renderThemeCard)}
            </div>
          </div>
        </div>

        {/* Live Preview & Action bar */}
        <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Tema Activo</span>
            <span className="text-xs sm:text-sm font-black theme-text-gradient">{themeConfig.name}</span>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="theme-btn-primary px-4 py-1.5 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Guardar y Listo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
