import React, { useState } from 'react';
import { Trophy, Edit3, Check, X, RefreshCw, Medal } from 'lucide-react';
import { Team, Round } from '../../types';

interface LeaderboardAdminViewProps {
  teams: Team[];
  rounds: Record<string, Round>;
  activeRoundId: string;
  onManualScoreUpdate: (teamId: string, newScore: number) => Promise<void>;
  onRefresh?: () => void;
}

export const LeaderboardAdminView: React.FC<LeaderboardAdminViewProps> = ({
  teams,
  rounds,
  activeRoundId,
  onManualScoreUpdate,
  onRefresh
}) => {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const roundList = Object.values(rounds).sort((a, b) => a.order - b.order);
  const activeRound = rounds[activeRoundId];

  const rankBadge = (idx: number) => {
    if (idx === 0) return <Medal className="w-5 h-5 text-amber-400" />;
    if (idx === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (idx === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</span>;
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team.id);
    setEditScore(String(team.score));
  };

  const saveEdit = async (teamId: string) => {
    const parsed = parseInt(editScore, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setIsSaving(true);
    try {
      await onManualScoreUpdate(teamId, parsed);
    } finally {
      setIsSaving(false);
      setEditingTeam(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white uppercase tracking-tight">
              Live Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current round: <strong className="text-indigo-500">{activeRound?.title || '—'}</strong>
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}
      </div>

      {/* Total Score Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Standings</span>
          <span className="text-xs text-slate-400 font-mono">{teams.length} teams</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-right">Total Score</th>
              <th className="px-4 py-3 text-right w-24">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedTeams.map((team, idx) => (
              <tr key={team.id} className={`transition-colors ${idx === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">{rankBadge(idx)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                    <div>
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase">{team.shortName}</span>
                      <span className="hidden sm:inline text-xs text-slate-400 ml-2">{team.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {editingTeam === team.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="0"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="w-20 text-right px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-indigo-400 text-sm font-bold focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(team.id);
                          if (e.key === 'Escape') setEditingTeam(null);
                        }}
                      />
                    </div>
                  ) : (
                    <span className="font-display font-black text-xl tabular-nums text-slate-900 dark:text-white">
                      {team.score}
                      <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingTeam === team.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => saveEdit(team.id)}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTeam(null)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(team)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                      title="Manually update score"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                  No teams registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Per-Round Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Round-by-Round Tracker</span>
          <p className="text-xs text-slate-400 mt-0.5">Scores update per round as you award points during each round.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left">Team</th>
                {roundList.map((r) => (
                  <th
                    key={r.id}
                    className={`px-4 py-3 text-center ${r.id === activeRoundId ? 'text-indigo-500' : ''}`}
                  >
                    {r.id === activeRoundId && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1 mb-0.5 animate-pulse" />
                    )}
                    R{r.order}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-amber-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedTeams.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">{team.shortName}</span>
                    </div>
                  </td>
                  {roundList.map((r) => (
                    <td key={r.id} className={`px-4 py-3 text-center text-sm tabular-nums ${r.id === activeRoundId ? 'text-indigo-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {r.id === activeRoundId ? team.score : '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-display font-black text-base text-amber-500 tabular-nums">
                    {team.score}
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={roundList.length + 2} className="text-center py-8 text-slate-400 text-sm">
                    No teams registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
