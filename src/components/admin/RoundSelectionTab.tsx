import React from 'react';
import { Play, Layers } from 'lucide-react';
import { Round } from '../../types';

interface RoundSelectionTabProps {
  rounds: Round[];
  activeRoundId: string;
  onSelectRound: (roundId: string) => void;
  onStartRound: (roundId: string) => void;
}

export const RoundSelectionTab: React.FC<RoundSelectionTabProps> = ({ 
  rounds, 
  activeRoundId, 
  onSelectRound, 
  onStartRound 
}) => {
  // Sort rounds by order
  const sortedRounds = [...rounds].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
            Competition Rounds
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a round to configure or start.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRounds.map((round) => {
          const isActive = activeRoundId === round.id;

          return (
            <div 
              key={round.id}
              className={`rounded-xl border ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/60 p-5 flex flex-col justify-between space-y-4 transition-all`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    Round {round.order}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white uppercase leading-tight">
                  {round.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {round.subtitle}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 line-clamp-2">
                  {round.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {!isActive ? (
                  <button
                    onClick={() => onSelectRound(round.id)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                  >
                    Set as Active
                  </button>
                ) : (
                  <button
                    onClick={() => onStartRound(round.id)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs shadow-indigo-500/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Round</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
