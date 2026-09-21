import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Team } from '../../types';

interface RegistrationTabProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
  onRemoveTeam: (teamId: string) => void;
}

const PREDEFINED_COLORS = [
  { name: 'Emerald', hex: '#10B981', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-500/10 dark:bg-blue-500/15', border: 'border-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  { name: 'Amber', hex: '#F59E0B', bg: 'bg-amber-500/10 dark:bg-amber-500/15', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { name: 'Pink', hex: '#EC4899', bg: 'bg-pink-500/10 dark:bg-pink-500/15', border: 'border-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  { name: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500/10 dark:bg-purple-500/15', border: 'border-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  { name: 'Cyan', hex: '#06B6D4', bg: 'bg-cyan-500/10 dark:bg-cyan-500/15', border: 'border-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' }
];

export const RegistrationTab: React.FC<RegistrationTabProps> = ({ teams, onAddTeam, onRemoveTeam }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortName) return;

    const colorScheme = PREDEFINED_COLORS[selectedColorIdx];
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name,
      shortName,
      score: 0,
      color: colorScheme.hex,
      accentBg: colorScheme.bg,
      accentBorder: colorScheme.border,
      accentText: colorScheme.text,
    };
    onAddTeam(newTeam);
    setName('');
    setShortName('');
    setSelectedColorIdx((prev) => (prev + 1) % PREDEFINED_COLORS.length);
  };

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          Register New Team
        </h3>
        
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Team Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Brainiacs"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Short Name (Display)
              </label>
              <input
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Brains"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Team Color
            </label>
            <div className="flex gap-3">
              {PREDEFINED_COLORS.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${selectedColorIdx === idx ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColorIdx === idx && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto py-2.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
        </form>
      </div>

      {/* List of Teams */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-between">
          <span>Registered Teams</span>
          <span className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
            {teams.length}
          </span>
        </h3>

        {teams.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No teams registered yet. Add a team above to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div 
                key={team.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 flex flex-col relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: team.color }}
                />
                <div className="pl-3 flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-slate-900 dark:text-white uppercase">
                      {team.shortName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {team.name}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveTeam(team.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Remove Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
