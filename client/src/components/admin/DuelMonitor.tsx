import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDuel } from '@/hooks/use-duel';
import { Swords, Eye, Trophy, Clock, User, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export const DuelMonitor: React.FC = () => {
  const { activeDuels, spectateDuel } = useDuel();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'ready':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'negotiating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'finished':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En Juego';
      case 'ready':
        return 'Preparando';
      case 'negotiating':
        return 'Negociando';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden transition-all duration-300">
      <CardHeader 
        className="border-b border-slate-800 pb-4 cursor-pointer hover:bg-slate-800/20 transition-colors select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Swords className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white leading-none mb-1">
                Duelos en Tiempo Real
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monitoreo de actividad en vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`transition-all duration-500 ${activeDuels.length > 0 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {activeDuels.length} Activos
            </Badge>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="w-5 h-5 text-slate-500" />
            </motion.div>
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="p-0 border-t border-slate-800/50">
        <ScrollArea className="h-[400px]">
          {activeDuels.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No hay duelos activos en este momento</p>
            </div>
          ) : (
            <div className="custom-scrollbar">
              <div className="grid gap-0 w-full">
                {activeDuels.map((duel) => (
                  <div 
                    key={duel.id} 
                    className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                         <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-white tracking-wide truncate max-w-[120px]">{duel.challengerName}</span>
                         </div>
                         <span className="text-slate-600 font-bold italic text-xs">VS</span>
                         <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-white tracking-wide truncate max-w-[120px]">{duel.receiverName}</span>
                         </div>
                         <Badge className={`px-2 py-0 h-5 text-[10px] uppercase font-bold ${getStatusColor(duel.status)}`}>
                          {getStatusText(duel.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-yellow-500/70" />
                          <span className="text-xs">{duel.wager} créditos</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                          <span className="text-[10px] text-slate-500 uppercase font-medium">Tema:</span>
                          <span className="text-slate-300 truncate max-w-[100px] sm:max-w-[150px] text-xs">{duel.topic || 'General'}</span>
                        </div>
                        {duel.status === 'in_progress' && (
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-16 sm:w-24 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 transition-all duration-500" 
                                  style={{ width: `${(duel.currentQuestionIndex / duel.questionsCount) * 100}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-mono text-indigo-400">
                               {duel.currentQuestionIndex}/{duel.questionsCount}
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
  
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                      <div className="flex flex-col items-start sm:items-end">
                          <span className="text-slate-500 text-[9px] uppercase tracking-widest">Puntaje</span>
                          <span className="text-indigo-400 font-black text-xl leading-none">
                            {duel.scores[Object.keys(duel.scores)[0]] || 0} - {duel.scores[Object.keys(duel.scores)[1]] || 0}
                          </span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => spectateDuel(duel.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-9 px-6 sm:px-4 font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        OBSERVAR
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
