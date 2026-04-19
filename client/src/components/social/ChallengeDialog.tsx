import { 
  Sword, 
  MessageSquare, 
  Coins, 
  Minus, 
  Plus 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDuel } from "@/hooks/use-duel";

export function ChallengeDialog() {
  const { 
    challengingUser, 
    setChallengingUser, 
    challengeTopic, 
    setChallengeTopic, 
    challengeWager, 
    setChallengeWager, 
    isRevengeMode, 
    setIsRevengeMode,
    sendChallenge 
  } = useDuel();

  if (!challengingUser) return null;

  const handleChallenge = () => {
    sendChallenge(challengingUser.id, challengeWager, challengeTopic, isRevengeMode);
    setChallengingUser(null);
    setChallengeTopic("");
    setIsRevengeMode(false);
  };

  return (
    <Dialog open={!!challengingUser} onOpenChange={(open) => !open && setChallengingUser(null)}>
      <DialogContent className="bg-slate-900 border-white/10 text-white shadow-2xl shadow-blue-900/20 z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black text-blue-400">
            <Sword className="h-6 w-6" />
            {isRevengeMode ? '¡LANZAR REVANCHA!' : 'LANZAR DESAFÍO'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Retarás a <span className="text-blue-400 font-semibold">{challengingUser?.name}</span> a un duelo matemático rápido.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Topic/Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Tema o Descripción del Reto
            </label>
            <Input 
              placeholder="Ej: Fracciones, Ecuaciones de 2do grado, lógica..."
              value={challengeTopic}
              onChange={(e) => setChallengeTopic(e.target.value)}
              className="bg-slate-900/50 border-white/10 rounded-xl h-12 focus:ring-blue-500/50"
              autoFocus
            />
            <p className="text-[10px] text-slate-500 italic">
              *La IA generará preguntas basadas exactamente en lo que escribas aquí.
            </p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3 text-yellow-500 mb-4">
                <Coins className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Apuesta de Créditos</span>
              </div>
              <div className="flex items-center gap-6 justify-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => setChallengeWager(Math.max(1, challengeWager - 1))}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center min-w-[4rem]">
                  <span className="text-5xl font-black">{challengeWager}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => setChallengeWager(challengeWager + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 italic text-center mt-4">*El perdedor entregará estos créditos al ganador.</p>
           </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => setChallengingUser(null)}
            className="text-slate-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 px-8 rounded-xl font-bold h-12"
            onClick={handleChallenge}
          >
            {isRevengeMode ? 'Enviar Revancha' : 'Retar ahora'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
