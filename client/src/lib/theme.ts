import { useState, useEffect } from 'react';

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  previewColors: string[]; // 3-4 hex colors for the swatch preview
  previewGradient: string; // Tailwind gradient class or CSS linear-gradient
  tag: string;
  category: 'general' | 'girls';
}

export const APP_THEMES: ThemeConfig[] = [
  {
    id: 'original-dark',
    name: 'Original Clásico',
    subtitle: 'Modo Oscuro Puro • Producción estándar',
    description: 'La apariencia exacta y sobria de AlanMath: fondo negro limpio, sin orbes externos y diseño clásico de producción.',
    previewColors: ['#020617', '#1e293b', '#3b82f6'],
    previewGradient: 'from-slate-900 via-slate-800 to-black',
    tag: 'Original',
    category: 'general'
  },
  {
    id: 'cosmic-blue',
    name: 'Azul Cósmico',
    subtitle: 'Galáctico & Luminoso • Orbes celestiales y halo azul',
    description: 'Versión estelar iluminada con orbes celestiales azules/cian, bordes reactivos y atmósfera espacial profunda.',
    previewColors: ['#2563eb', '#06b6d4', '#60a5fa'],
    previewGradient: 'from-blue-600 via-cyan-500 to-indigo-500',
    tag: 'Galáctico',
    category: 'general'
  },
  {
    id: 'emerald-mint',
    name: 'Esmeralda & Menta Tech',
    subtitle: 'Naturaleza & Hacker Cuántico',
    description: 'Tonos frescos de verde esmeralda, menta fluorescente y turquesa tecnológico.',
    previewColors: ['#10b981', '#14b8a6', '#06b6d4'],
    previewGradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    tag: 'Fresco',
    category: 'general'
  },
  {
    id: 'amber-sunset',
    name: 'Atardecer Dorado & Ámbar',
    subtitle: 'Fuego, Energía & Corona Solar',
    description: 'Calidez radiante con oro brillante, naranja atardecer y destellos ámbar.',
    previewColors: ['#f59e0b', '#f97316', '#ef4444'],
    previewGradient: 'from-amber-500 via-orange-500 to-red-500',
    tag: 'Cálido',
    category: 'general'
  },
  {
    id: 'amethyst-rose',
    name: 'Amatista & Rosa Neón',
    subtitle: 'Especial Chicas • Fantasía Rosa & Glam',
    description: 'Elegancia vibrante con violetas profundos, magenta radiante y mapas adaptados para exploradoras.',
    previewColors: ['#d946ef', '#ec4899', '#8b5cf6'],
    previewGradient: 'from-fuchsia-600 via-pink-500 to-purple-500',
    tag: '🌸 Femenino',
    category: 'girls'
  },
  {
    id: 'nebula-indigo',
    name: 'Nebulosa Índigo',
    subtitle: 'Especial Chicas • Violeta Místico & Noche Estrellada',
    description: 'Acentos en azul índigo profundo, púrpura galáctico y atmósfera mágica de constelaciones.',
    previewColors: ['#6366f1', '#8b5cf6', '#3b82f6'],
    previewGradient: 'from-indigo-600 via-purple-600 to-blue-500',
    tag: '🔮 Místico',
    category: 'girls'
  }
];

const THEME_STORAGE_KEY = 'alanmath_theme_preference';

export function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'original-dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && APP_THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return 'original-dark';
}

export function applyTheme(themeId: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  if (document.body) {
    document.body.setAttribute('data-theme', themeId);
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    // ignore
  }
  // Dispatch a custom event so all listeners re-render if needed
  window.dispatchEvent(new CustomEvent('alanmath_theme_changed', { detail: { themeId } }));
}

/**
 * React hook to read and change active theme across the app
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(getStoredTheme);

  useEffect(() => {
    // Apply current theme on mount
    applyTheme(currentTheme);

    const handleThemeChange = (e: any) => {
      if (e.detail?.themeId) {
        setCurrentTheme(e.detail.themeId);
      }
    };

    window.addEventListener('alanmath_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('alanmath_theme_changed', handleThemeChange);
    };
  }, []);

  const setTheme = (themeId: string) => {
    applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  const themeConfig = APP_THEMES.find(t => t.id === currentTheme) || APP_THEMES[0];

  return {
    theme: currentTheme,
    themeConfig,
    setTheme,
    themes: APP_THEMES
  };
}
