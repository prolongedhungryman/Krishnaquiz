import { useMemo } from 'react';
import { Team } from '../types';

export interface RankedTeam extends Team {
  rank: number;
  badge: string;
}

export function useLeaderboard(teams: Record<string, Team> | undefined) {
  const rankedTeams: RankedTeam[] = useMemo(() => {
    if (!teams) return [];
    
    const list = Object.values(teams);
    // Sort primarily by score descending
    const sorted = [...list].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });

    return sorted.map((team, index) => {
      const rank = index + 1;
      let badge = `${rank}`;
      if (rank === 1) badge = '🥇';
      else if (rank === 2) badge = '🥈';
      else if (rank === 3) badge = '🥉';

      return {
        ...team,
        rank,
        badge,
      };
    });
  }, [teams]);

  const topTeam = rankedTeams[0];
  const maxScore = topTeam?.score || 1;

  return {
    rankedTeams,
    topTeam,
    maxScore,
  };
}
