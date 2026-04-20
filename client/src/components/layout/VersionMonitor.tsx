import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';

const CHECK_INTERVAL = 1000 * 60 * 5; // Cada 5 minutos

export const VersionMonitor: React.FC = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const myVersion = (import.meta as any).env.VITE_BUILD_ID;

  const checkVersion = async () => {
    // Si estamos en desarrollo, no molestamos
    if (import.meta.env.MODE === 'development') return;
    
    try {
      // Agregamos t= para evitar cache del navegador al pedir el archivo de version
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.version && data.version !== myVersion) {
          console.log(`🚀 New version detected: ${data.version} (Current: ${myVersion})`);
          setNewVersionAvailable(true);
        }
      }
    } catch (err) {
      // Fallido silencioso (red inestable, etc)
      console.warn('⚠️ Version check failed:', err);
    }
  };

  useEffect(() => {
    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // También chequear cuando el usuario regrese a la pestaña
    window.addEventListener('focus', checkVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkVersion);
    };
  }, []);

  const handleUpdate = () => {
    // Forzar recarga completa
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {newVersionAvailable && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md pointer-events-auto">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="relative p-0.5 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.5)] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"
          >
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white leading-tight">¡Nueva actualización!</span>
                  <span className="text-[10px] text-blue-300/80 uppercase font-black tracking-widest">Optimización & Mejoras</span>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-black text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                ACTUALIZAR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
