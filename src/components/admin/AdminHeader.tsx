import React from 'react';
import { 
  Sliders, 
  Tv, 
  Trophy, 
  Layers, 
  LogOut, 
  LayoutDashboard,
  ExternalLink 
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { FirebaseBanner } from '../ui/FirebaseBanner';

interface AdminHeaderProps {
  competitionName?: string;
  activeRoundTitle?: string;
  currentQuestionNumber?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  competitionName = 'OXFORD QUIZ CONTROL',
  activeRoundTitle,
  currentQuestionNumber,
}) => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { name: 'Live Control', to: '/admin/quiz', icon: Sliders },
    { name: 'Rounds', to: '/admin/rounds', icon: Layers },
  ];

  return (
    <header 
      id="admin-top-header"
      className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Control Title */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="font-display font-black text-lg tracking-wider text-slate-900 dark:text-white uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {competitionName}
            </span>
          </div>

          <Badge variant="live" className="text-[11px] px-2.5 py-0.5">
            LIVE ●
          </Badge>

          {activeRoundTitle && (
            <span className="hidden md:inline-flex text-xs font-mono text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
              {activeRoundTitle} {currentQuestionNumber ? `• Q${String(currentQuestionNumber).padStart(2, '0')}` : ''}
            </span>
          )}
        </div>

        {/* Center: Main Nav Links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = path === item.to;
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                id={`admin-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Displays */}
        <div className="flex items-center gap-2 sm:gap-3">
          <FirebaseBanner compact />

          {/* Quick Display Openers */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3 gap-1.5">
            <button
              id="header-open-display-btn"
              onClick={() => navigate('/display')}
              title="Projector Display Screen"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              id="header-open-leaderboard-btn"
              onClick={() => navigate('/leaderboard')}
              title="Live Standalone Leaderboard"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {/* Logout */}
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              title={`Sign out (${user?.email || 'Admin'})`}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
