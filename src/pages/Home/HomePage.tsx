import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Tv,
  Trophy,
  Layers,
  ChevronRight,
  Sparkles,
  BookOpen,
  Zap,
  Music,
  Users,
  Brain,
  Bell,
  Timer,
  Sun,
  Moon,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useTheme } from '../../hooks/useTheme';

const ROUNDS_INFO = [
  {
    id: 'general',
    order: 1,
    title: 'General Round',
    subtitle: 'Core Knowledge & Science',
    description: 'Direct verbal questions testing broad knowledge across multiple disciplines.',
    icon: BookOpen,
    gradient: 'from-blue-600 to-indigo-700',
    iconBg: 'bg-blue-500/15 text-blue-500',
  },
  {
    id: 'guessing',
    order: 2,
    title: 'Guessing Round',
    subtitle: 'Clue Deduction',
    description: 'Progressive clues narrow down the answer — fewer clues mean more points.',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/15 text-amber-500',
  },
  {
    id: 'multimedia',
    order: 3,
    title: 'Audio Visual Round',
    subtitle: 'Observation & Listening',
    description: 'Identify answers from images, audio clips, and video fragments.',
    icon: Music,
    gradient: 'from-purple-600 to-fuchsia-600',
    iconBg: 'bg-purple-500/15 text-purple-500',
  },
  {
    id: 'audience',
    order: 4,
    title: 'Audience Round',
    subtitle: 'Crowd Interaction',
    description: 'The audience gets a chance to answer — points go to teams they support.',
    icon: Users,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/15 text-pink-500',
  },
  {
    id: 'memory',
    order: 5,
    title: 'Memory Round',
    subtitle: 'Recall & Retain',
    description: 'Memorize a set of facts and answer questions after the reveal.',
    icon: Brain,
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-500/15 text-teal-500',
  },
  {
    id: 'buzzer',
    order: 6,
    title: 'Buzzer Round',
    subtitle: 'Speed & Accuracy',
    description: 'First team to buzz in gets the right to answer. Wrong answers cost points.',
    icon: Bell,
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-500/15 text-red-500',
  },
  {
    id: 'rapidfire',
    order: 7,
    title: 'Rapid Fire Round',
    subtitle: 'Quick Thinking',
    description: 'Maximum questions in minimum time. Speed is everything.',
    icon: Timer,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/15 text-cyan-500',
  },
];



export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [hoveredRound, setHoveredRound] = useState<string | null>(null);

  return (
    <div
      id="home-page"
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-radial from-indigo-500/10 dark:from-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-radial from-amber-500/8 dark:from-amber-500/12 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-blue-500/5 dark:from-blue-500/8 to-transparent blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 px-6 lg:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg tracking-wider uppercase text-slate-900 dark:text-white">
              Quiz Tournament
            </h1>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              Krishna Sir's Competition Platform
            </span>
          </div>
        </div>

        <button
          id="home-theme-toggle"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            <span>Live • Real-time • Firebase Powered</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
            Inter-School
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Quiz Championship
            </span>
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            7 thrilling rounds. Real-time scoring. Live leaderboard projections.
            The ultimate quiz tournament management platform.
          </p>
        </motion.div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="relative z-10 px-6 lg:px-12 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Admin Login */}
          <motion.button
            id="home-nav-admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-left cursor-pointer shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-white/15 w-fit mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider mb-1">
                Admin Login
              </h3>
              <p className="text-sm text-indigo-100/80 mb-4">
                Access the quiz control room. Manage rounds, scoring, and displays.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                <span>Sign In</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Public Display */}
          <motion.button
            id="home-nav-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate('/display')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left cursor-pointer shadow-lg hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Tv className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                Public Display
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Full-screen projector view for audiences. Questions & live scores.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                <span>Open Display</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Leaderboard */}
          <motion.button
            id="home-nav-leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate('/leaderboard')}
            className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left cursor-pointer shadow-lg hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                Leaderboard
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Real-time team rankings. Perfect for auxiliary screens.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                <span>View Rankings</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Rounds Overview */}
      <section className="relative z-10 px-6 lg:px-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Competition Structure</span>
            </div>
            <h3 className="font-display font-black text-3xl lg:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
              7 Rounds of Excellence
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
              Each round tests a different skill — from raw knowledge to speed, memory, and teamwork.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {ROUNDS_INFO.map((round, idx) => {
              const Icon = round.icon;
              const isHovered = hoveredRound === round.id;
              return (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx + 0.5 }}
                  onMouseEnter={() => setHoveredRound(round.id)}
                  onMouseLeave={() => setHoveredRound(null)}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                    isHovered
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-lg -translate-y-1'
                      : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${round.iconBg} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-slate-400">
                          Round {String(round.order).padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase tracking-tight">
                        {round.title}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1.5">
                        {round.subtitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {round.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 text-center border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Powered by ICT Club, Oxford Secondary School
        </p>
      </footer>
    </div>
  );
};
