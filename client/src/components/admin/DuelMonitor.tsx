import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDuel } from '@/hooks/use-duel';
import { Swords, Eye, Trophy, Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const DuelMonitor: React.FC = () => {
  const { activeDuels, spectateDuel } = useDuel();

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
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Swords className="w-6 h-6 text-indigo-400" />
            Duelos en Tiempo Real
          </CardTitle>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {activeDuels.length} Activos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {activeDuels.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No hay duelos activos en este momento</p>
            </div>
          ) : (
            <div className="grid gap-0">
              {activeDuels.map((duel) => (
                <div 
                  key={duel.id} 
                  className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-white tracking-wide">{duel.challengerName}</span>
                       </div>
                       <span className="text-slate-600 font-bold italic">VS</span>
                       <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-white tracking-wide">{duel.receiverName}</span>
                       </div>
                       <Badge className={`ml-2 px-2 py-0 h-5 text-[10px] uppercase font-bold ${getStatusColor(duel.status)}`}>
                        {getStatusText(duel.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500/70" />
                        <span>{duel.wager} créditos</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                        <span className="text-[11px] text-slate-500 uppercase font-medium">Tema:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{duel.topic || 'General'}</span>
                      </div>
                      {duel.status === 'in_progress' && (
                        <div className="flex items-center gap-2 ml-2">
                           <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-500" 
                                style={{ width: `${(duel.currentQuestionIndex / duel.questionsCount) * 100}%` }}
                              />
                           </div>
                           <span className="text-[11px] font-mono text-indigo-400">
                             {duel.currentQuestionIndex}/{duel.questionsCount}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 pr-2">
                    <div className="flex gap-3 text-xs font-mono mb-1">
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[9px] uppercase">Puntaje</span>
                            <span className="text-indigo-400 font-bold text-base">
                              {duel.scores[Object.keys(duel.scores)[0]] || 0} - {duel.scores[Object.keys(duel.scores)[1]] || 0}
                            </span>
                        </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => spectateDuel(duel.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-8 px-4 font-bold shadow-lg shadow-indigo-500/20"
                    >
                      <Eye className="w-4 h-4" />
                      OBSERVAR
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
