import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award } from 'lucide-react';
import { Team } from '../../types';
import { useLeaderboard } from '../../hooks/useLeaderboard';

interface LeaderboardViewProps {
  teams: Record<string, Team>;
  isBroadcastMode?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  teams,
  isBroadcastMode = false 
}) => {
  const { rankedTeams, maxScore } = useLeaderboard(teams);

  return (
    <div 
      id="live-leaderboard-card"
      className={`w-full rounded-2xl border transition-colors ${
        isBroadcastMode
          ? 'bg-transparent border-transparent'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
              Live Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Rankings dynamically computed from live Firebase scores
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Auto-updating
        </span>
      </div>

      {/* Dynamic Ranked List with Smooth Layout Motion */}
      <div className="mt-6 space-y-3">
        {rankedTeams.map((team) => {
          const scorePercent = maxScore > 0 ? Math.min(100, Math.round((team.score / maxScore) * 100)) : 0;
          const isLeader = team.rank === 1;

          return (
            <motion.div
              layout
              key={team.id}
              id={`leaderboard-row-${team.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { type: 'spring', stiffness: 350, damping: 28 },
                opacity: { duration: 0.2 },
              }}
              className={`relative overflow-hidden rounded-xl p-4 sm:p-5 flex items-center justify-between border transition-all ${
                isLeader
                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Left Accent Bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: team.color }}
              />

              {/* Rank & Team Info */}
              <div className="flex items-center gap-4 pl-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-lg text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-800 shrink-0">
                  {team.badge}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {team.name}
                    </h4>
                    {isLeader && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        1st Place
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {team.shortName}
                  </span>
                </div>
              </div>

              {/* Score & Progress Indicator */}
              <div className="flex items-center gap-6">
                {/* Visual score bar for visual scale */}
                <div className="hidden md:flex flex-col items-end gap-1 w-32">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: team.color }}
                      animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Big Score Value */}
                <div className="text-right shrink-0">
                  <motion.span 
                    key={team.score}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tabular-nums tracking-tight"
                  >
                    {team.score}
                  </motion.span>
                  <span className="block text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    Points
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {rankedTeams.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No team records found.
        </div>
      )}
    </div>
  );
};
