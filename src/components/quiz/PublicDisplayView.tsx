import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Minimize, Trophy, Radio, HelpCircle } from 'lucide-react';
import { QuizStatus, Team, Round, Question } from '../../types';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LeaderboardView } from '../leaderboard/LeaderboardView';

interface PublicDisplayViewProps {
  status: QuizStatus;
  teams: Record<string, Team>;
  activeRound?: Round;
  currentQuestion?: Question;
  answeredQuestionsForRound?: string[];
  isProjectorPage?: boolean;
}

export const PublicDisplayView: React.FC<PublicDisplayViewProps> = ({
  status,
  teams,
  activeRound,
  currentQuestion,
  answeredQuestionsForRound = [],
  isProjectorPage = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Pulse effect when a team receives a point
  useEffect(() => {
    if (status.lastScoredTeamId) {
      setHighlightedTeamId(status.lastScoredTeamId);
      const timer = setTimeout(() => {
        setHighlightedTeamId(null);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [status.updatedAt, status.lastScoredTeamId]);

  const teamList = Object.values(teams);
  const questionNumStr = currentQuestion 
    ? String(currentQuestion.number).padStart(2, '0') 
    : String(status.currentQuestionIndex + 1).padStart(2, '0');

  return (
    <div 
      id="public-display-container"
      className="relative w-full h-full min-h-[90vh] flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 select-none overflow-hidden"
    >
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-radial from-blue-500/10 dark:from-blue-600/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-radial from-amber-500/5 dark:from-amber-500/10 to-transparent blur-2xl pointer-events-none" />

      {/* Top Header Broadcast Banner */}
      <header 
        id="display-header"
        className="relative z-10 px-6 lg:px-12 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-wider text-xl lg:text-2xl text-slate-900 dark:text-white uppercase">
              {status.competitionName || 'OXFORD QUIZ'}
            </span>
            <span className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              {activeRound?.title || 'GENERAL ROUND'}
              {activeRound?.subtitle && (
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">
                  • {activeRound.subtitle}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="live" className="text-xs px-3 py-1 font-bold">
            LIVE ●
          </Badge>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              id="fullscreen-toggle-btn"
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              title="Fullscreen Mode"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Center Area */}
      <main 
        id="display-center-stage"
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-16 py-8 max-w-6xl mx-auto w-full text-center"
      >
        {status.displayMode === 'LEADERBOARD' ? (
          <div className="w-full max-w-3xl">
            <LeaderboardView teams={teams} isBroadcastMode={true} />
          </div>
        ) : status.displayMode === 'WELCOME' ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
              <Trophy className="w-12 h-12" />
            </div>
            <h1 className="font-display font-black text-4xl lg:text-6xl tracking-tight text-slate-900 dark:text-white uppercase">
              {status.competitionName || 'OXFORD QUIZ'}
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Welcome to the live inter-school championship. 4 Teams competing in knowledge, speed, and accuracy.
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Stand by for Round Commencement</span>
            </div>
          </div>
        ) : status.displayMode === 'GRID' ? (
          /* Question Grid Display */
          <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="font-display font-black text-3xl lg:text-5xl tracking-tight text-slate-900 dark:text-white uppercase mb-8">
              Select a Question
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-6">
              {activeRound?.questions.map((q) => {
                const isAnswered = answeredQuestionsForRound.includes(q.id);
                return (
                  <motion.div
                    key={q.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`aspect-square rounded-2xl flex items-center justify-center font-display font-black text-3xl lg:text-4xl shadow-md transition-all ${
                      isAnswered 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-slate-700 opacity-60' 
                        : 'bg-indigo-600 text-white border border-indigo-500 shadow-indigo-500/30 ring-2 ring-transparent'
                    }`}
                  >
                    {q.number}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Question Display */
          <div className="w-full flex flex-col items-center justify-center">
            {/* Question Number Badge */}
            <motion.div
              key={`q-badge-${currentQuestion?.id || status.currentQuestionIndex}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 lg:mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm lg:text-base font-display font-bold tracking-widest uppercase bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs">
                QUESTION {questionNumStr}
                {currentQuestion?.points && (
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    [{currentQuestion.points} PTS]
                  </span>
                )}
              </span>
            </motion.div>

            {/* Question Text with Suspense Reveal */}
            <AnimatePresence mode="wait">
              {status.showQuestion ? (
                <motion.div
                  key={`q-text-${currentQuestion?.id || status.currentQuestionIndex}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-6 max-w-4xl"
                >
                  <h2 
                    id="active-question-headline"
                    className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-slate-900 dark:text-white leading-tight lg:leading-tight tracking-tight text-balance"
                  >
                    "{currentQuestion?.question || 'Question text not loaded.'}"
                  </h2>

                  {/* Multimedia cue indicator if question is image/audio/guessing */}
                  {currentQuestion?.type && currentQuestion.type !== 'text' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium uppercase bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                      <span>Type: {currentQuestion.type} Round</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="q-hidden-suspense"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 space-y-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <HelpCircle className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="font-display font-bold text-2xl lg:text-3xl text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                    Verbal Answer In Progress
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Question is active with quiz master
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Bottom Teams 4-Column Live Scoreboard */}
      <footer 
        id="display-scoreboard"
        className="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {teamList.map((team) => {
            const isTarget = highlightedTeamId === team.id || status.selectedAnsweringTeamId === team.id;
            const isAnswering = status.selectedAnsweringTeamId === team.id;
            
            return (
              <motion.div
                key={team.id}
                id={`display-team-card-${team.id}`}
                animate={{
                  scale: isTarget ? 1.05 : 1,
                  y: isTarget ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative rounded-xl p-4 lg:p-5 flex flex-col items-center justify-center border transition-all duration-200 ${
                  isAnswering
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xl shadow-amber-500/30 ring-4 ring-amber-400 z-10'
                  : isTarget
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50'
                }`}
              >
                {/* Answering Indicator Badge */}
                {isAnswering && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md animate-pulse whitespace-nowrap">
                    Answering
                  </div>
                )}
                
                {/* Team Accent Color Bar */}
                <div 
                  className={`absolute ${isAnswering ? 'top-3' : 'top-0'} left-0 right-0 h-1 rounded-t-xl`}
                  style={{ backgroundColor: team.color }}
                />

                <span className="text-xs sm:text-sm font-display font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  {team.shortName || team.name}
                </span>

                <motion.span
                  key={team.score}
                  initial={{ scale: 1.2, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="mt-1 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tabular-nums tracking-tight"
                >
                  {team.score}
                </motion.span>

                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                  Points
                </span>
              </motion.div>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
