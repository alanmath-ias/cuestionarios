import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Radio,
  Copy,
  Check,
  ExternalLink,
  Users,
  Eye,
  PowerOff,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface LiveShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSharing: boolean;
  shareCode: string | null;
  spectatorCount: number;
  isConnecting: boolean;
  onStartSharing: () => Promise<string | null>;
  onStopSharing: () => void;
  quizTitle?: string;
}

export function LiveShareDialog({
  isOpen,
  onClose,
  isSharing,
  shareCode,
  spectatorCount,
  isConnecting,
  onStartSharing,
  onStopSharing,
  quizTitle,
}: LiveShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = shareCode
    ? `${window.location.origin}/quiz/live/${shareCode}`
    : '';

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      setCopied(true);
      toast({
        title: '📋 Enlace copiado',
        description: 'Compártelo con quien quieras para que sigan tu cuestionario en directo.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast({
        title: 'Error al copiar',
        description: 'Por favor copia el enlace manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleStart = async () => {
    await onStartSharing();
  };

  const handleOpenSpectator = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Transmitir en Tiempo Real
                {isSharing && (
                  <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-300 text-xs px-2 py-0.5">
                    🔴 EN VIVO
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs sm:text-sm">
                Permite que profesores, amigos o compañeros sigan tu progreso en directo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSharing && shareCode ? (
          <div className="space-y-4 py-2">
            {/* Live Stats Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Transmisión activa
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                    {quizTitle || 'Cuestionario'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{spectatorCount} {spectatorCount === 1 ? 'espectador' : 'espectadores'}</span>
              </div>
            </div>

            {/* Share Link Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Enlace para espectadores</span>
                <span className="text-[11px] text-slate-500 lowercase">Solo lectura</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="bg-slate-950 border-slate-700 text-xs sm:text-sm font-mono text-slate-200 select-all focus:border-rose-500/50"
                />
                <Button
                  onClick={handleCopyLink}
                  className={`shrink-0 transition-all font-semibold ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Privacy & Guarantee Info */}
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300/90 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Los espectadores verán tus preguntas, respuestas seleccionadas y el temporizador en tiempo real. <strong>No pueden alterar ni enviar respuestas por ti.</strong>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenSpectator}
                className="flex-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs h-9 font-medium shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Abrir como espectador
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onStopSharing();
                  onClose();
                }}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 text-xs h-9 font-medium shadow-sm transition-all"
              >
                <PowerOff className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                Detener transmisión
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-rose-400" />
                ¿Cómo funciona la transmisión en vivo?
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>Se genera un enlace único para que cualquier persona pueda entrar desde su navegador.</li>
                <li>Verán en tiempo real qué pregunta estás resolviendo, qué opción marcas y el tiempo que llevas.</li>
                <li>Funciona en teléfonos, tablets y computadoras <strong>sin necesidad de iniciar sesión</strong>.</li>
              </ul>
            </div>

            <DialogFooter className="pt-2 sm:justify-between">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStart}
                disabled={isConnecting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/30"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 mr-2" />
                    Iniciar Transmisión
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
