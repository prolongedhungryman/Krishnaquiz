import React from 'react';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { useRouter } from '../../context/RouterContext';
import { LeaderboardView } from '../../components/leaderboard/LeaderboardView';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Badge } from '../../components/ui/Badge';

export const LeaderboardPage: React.FC = () => {
  const { teams, status, loading } = useQuiz();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-display">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <span className="text-lg font-bold tracking-wider uppercase">Loading Leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="standalone-leaderboard-page"
      className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            id="lb-back-to-display-btn"
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            title="Return to Public Display"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-xl text-slate-900 dark:text-white uppercase">
              {status.competitionName || 'OXFORD QUIZ'}
            </h1>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Official Tournament Standings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="live" className="text-xs">
            LIVE ●
          </Badge>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Center Leaderboard Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full">
          <LeaderboardView teams={teams} isBroadcastMode={false} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800/80">
        Dynamic Realtime Calculations • Firebase Synchronized
      </footer>
    </div>
  );
};
