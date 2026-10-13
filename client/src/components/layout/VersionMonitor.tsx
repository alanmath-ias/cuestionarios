import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, Palette, X, ChevronRight } from 'lucide-react';
import { ThemeSelectorDialog } from '@/components/theme/ThemeSelectorDialog';

interface VersionData {
  version: string;
  timestamp: string;
  highlight?: boolean;
  tag?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  action?: string | null;
}

const CHECK_INTERVAL = 1000 * 60 * 5; // Cada 5 minutos

export const VersionMonitor: React.FC = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(false);
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  const myVersion = (import.meta as any).env.VITE_BUILD_ID;

  const checkVersion = async () => {
    try {
      // Agregamos t= para evitar cache del navegador al pedir el archivo de version
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (response.ok) {
        const data: VersionData = await response.json();
        setVersionData(data);

        // 1. Detección de nueva versión para recarga (si el usuario ya tenía la app abierta)
        if (myVersion && data.version && data.version !== myVersion) {
          console.log(`🚀 New version detected: ${data.version} (Current: ${myVersion})`);
          setNewVersionAvailable(true);
        }

        // 2. Anuncio de novedad destacada al abrir la app (si está marcada con highlight: true)
        if (data.highlight && data.version) {
          const lastSeen = localStorage.getItem('last_seen_feature_version');
          if (lastSeen !== data.version) {
            setShowFeatureAnnouncement(true);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Version check failed:', err);
    }
  };

  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Chequear también cuando el usuario regrese a la pestaña
    window.addEventListener('focus', checkVersion);

    // Escuchar evento global para abrir el selector de temas desde cualquier parte
    const handleGlobalOpenTheme = () => setIsThemeSelectorOpen(true);
    window.addEventListener('open-theme-selector', handleGlobalOpenTheme);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkVersion);
      window.removeEventListener('open-theme-selector', handleGlobalOpenTheme);
    };
  }, []);

  const handleUpdate = () => {
    // Forzar recarga completa para cargar los assets de la nueva versión
    window.location.reload();
  };

  const handleDismissFeature = () => {
    if (versionData?.version) {
      localStorage.setItem('last_seen_feature_version', versionData.version);
    }
    setShowFeatureAnnouncement(false);
  };

  const handleActionClick = () => {
    if (versionData?.version) {
      localStorage.setItem('last_seen_feature_version', versionData.version);
    }
    setShowFeatureAnnouncement(false);

    if (versionData?.action === 'open-theme-selector') {
      setIsThemeSelectorOpen(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* CASO 1: Hay una nueva versión pendiente de recarga (usuario con la app abierta) */}
        {newVersionAvailable && (
          <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[200] w-[92%] sm:w-[420px] max-w-md pointer-events-auto">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="relative p-0.5 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.6)] bg-gradient-to-r from-blue-600 via-fuchsia-600 to-purple-600 animate-pulse-slow"
            >
              <div className="relative bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest block">
                        {versionData?.tag || 'Nueva Actualización'}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {versionData?.title || '¡Nueva versión disponible!'}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewVersionAvailable(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    title="Cerrar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {versionData?.description && (
                  <p className="text-xs text-slate-300/90 leading-relaxed pl-1">
                    {versionData.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => setNewVersionAvailable(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Más tarde
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                    ACTUALIZAR AHORA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CASO 2: Anuncio de nueva función destacada (apenas abren la app o tras recargar) */}
        {!newVersionAvailable && showFeatureAnnouncement && (
          <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[200] w-[92%] sm:w-[430px] max-w-md pointer-events-auto">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="relative p-0.5 rounded-2xl overflow-hidden shadow-[0_0_45px_rgba(217,70,239,0.5)] bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-500"
            >
              <div className="relative bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-400/40 flex items-center justify-center flex-shrink-0 text-fuchsia-300 shadow-inner">
                      <Palette className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-300 mb-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>{versionData?.tag || 'Novedad'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {versionData?.title || '¡Nueva funcionalidad disponible!'}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={handleDismissFeature}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    title="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {versionData?.description && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                    {versionData.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={handleDismissFeature}
                    className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Entendido
                  </button>
                  {versionData?.action ? (
                    <button
                      onClick={handleActionClick}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-fuchsia-900/40"
                    >
                      <span>{versionData.ctaText || 'Probar Ahora'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDismissFeature}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      ¡Genial!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diálogo global de selección de tema accesible directamente */}
      <ThemeSelectorDialog
        open={isThemeSelectorOpen}
        onOpenChange={setIsThemeSelectorOpen}
      />
    </>
  );
};
