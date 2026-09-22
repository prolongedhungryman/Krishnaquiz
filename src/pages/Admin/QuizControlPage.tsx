import React, { useState, useEffect } from 'react';
import {
  Check,
  Maximize,
  Minimize,
  BookOpen,
  Trophy,
  ChevronLeft,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Timer,
} from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { useRouter } from '../../context/RouterContext';
import { Badge } from '../../components/ui/Badge';

// General Round Rules
const GENERAL_ROUND_RULES = [
  'Each team will be asked questions one by one in rotation.',
  'Each correct answer awards +10 points.',
  'If a team answers incorrectly, NO points are deducted.',
  'If a team says "PASS", the question moves to the next team.',
  'If the next team answers the passed question correctly, they get +5 points (half marks).',
  'If the passed question is also answered incorrectly by the second team, no points are given.',
  'Teams have 60 seconds to answer each question.',
  'The quiz master\'s decision is final.',
];

export const QuizControlPage: React.FC = () => {
  const {
    status,
    teams,
    rounds,
    activeRound,
    currentQuestion,
    awardPoints,
    selectQuestion,
    selectRound,
    changeDisplayMode,
    isScoringBusy,
    markQuestionAnswered,
    selectAnsweringTeam,
    data,
  } = useQuiz();

  const { navigate } = useRouter();

  const [localMode, setLocalMode] = useState<'GRID' | 'QUESTION'>('GRID');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isPassed, setIsPassed] = useState(false); // Track if current question was passed

  // Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerExpired(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Reset on question change
  useEffect(() => {
    setTimeLeft(60);
    setIsTimerRunning(false);
    setTimerExpired(false);
    setShowAnswer(false);
    setIsPassed(false);
    selectAnsweringTeam(undefined);
  }, [currentQuestion?.id]);

  // Sync localMode
  useEffect(() => {
    if (status.displayMode === 'GRID') setLocalMode('GRID');
    else if (status.displayMode === 'QUESTION') setLocalMode('QUESTION');
  }, [status.displayMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectQuestion = async (idx: number) => {
    await selectQuestion(idx);
    setLocalMode('QUESTION');
    setShowAnswer(false);
    setIsPassed(false);
    changeDisplayMode('QUESTION');
  };

  const handleBackToGrid = () => {
    setLocalMode('GRID');
    changeDisplayMode('GRID');
  };

  const handleCorrect = async (teamId: string) => {
    const pts = isPassed ? 5 : (currentQuestion?.points || 10); // Half marks for passed questions
    await awardPoints(teamId, pts);
    if (activeRound && currentQuestion) {
      await markQuestionAnswered(activeRound.id, currentQuestion.id);
    }
    selectAnsweringTeam(undefined);
    setLocalMode('GRID');
    changeDisplayMode('GRID');
  };

  const handleWrong = async () => {
    // No points deducted, just go back to grid
    if (activeRound && currentQuestion && !isPassed) {
      // If not passed, mark as answered (wrong, no retry)
      // But if passed once already, also mark done
    }
    if (isPassed && activeRound && currentQuestion) {
      // Passed and second team also wrong — mark done, no points
      await markQuestionAnswered(activeRound.id, currentQuestion.id);
    }
    selectAnsweringTeam(undefined);
    setLocalMode('GRID');
    changeDisplayMode('GRID');
  };

  const handlePass = () => {
    setIsPassed(true);
    selectAnsweringTeam(undefined); // Clear selection so admin picks next team
  };

  const teamList = Object.values(teams);
  const questionNumStr = currentQuestion
    ? String(currentQuestion.number).padStart(2, '0')
    : String(status.currentQuestionIndex + 1).padStart(2, '0');

  const timerColor =
    timerExpired ? 'text-red-500' : timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div id="admin-quiz-control-page" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">

      {/* Compact Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white text-xs font-bold uppercase flex items-center gap-1 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold text-white uppercase">{activeRound?.title || 'General Round'}</span>
          <span className="text-xs text-indigo-400 font-mono">Q{questionNumStr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowRules(true)} className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
            <BookOpen className="w-3 h-3 inline mr-1" />Rules
          </button>
          <button onClick={() => navigate('/admin')} className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer">
            <Trophy className="w-3 h-3 inline mr-1" />Leaderboard
          </button>
          <button onClick={toggleFullscreen} className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
          </button>
        </div>
      </header>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">General Round Rules</h2>
              <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-2">
              {GENERAL_ROUND_RULES.map((rule, i) => (
                <p key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  {rule}
                </p>
              ))}
              <button onClick={() => setShowRules(false)} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5">
        {localMode === 'GRID' ? (
          /* ---- GRID VIEW ---- */
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base uppercase text-white flex items-center gap-2">
                Questions <Badge variant="accent">{activeRound?.questions.length || 0}</Badge>
              </h3>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {activeRound?.questions.map((q, idx) => {
                const isAnswered = data.answeredQuestions?.[activeRound.id]?.includes(q.id);
                if (isAnswered) {
                  return (
                    <div key={q.id} className="aspect-square rounded-lg border border-slate-700 bg-slate-800/50 opacity-30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-slate-500" />
                    </div>
                  );
                }
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className="aspect-square text-sm font-bold rounded-lg cursor-pointer transition-all bg-slate-800 text-indigo-300 hover:bg-indigo-900/40 hover:text-white border border-slate-700 hover:border-indigo-500"
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ---- QUESTION VIEW ---- */
          <div className="space-y-3">
            {/* Back + timer row */}
            <div className="flex items-center justify-between">
              <button onClick={handleBackToGrid} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" /> Grid
              </button>

              {/* Compact inline timer */}
              <div className="flex items-center gap-2">
                <div className={`font-mono font-black text-xl tabular-nums ${timerColor}`}>
                  {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
                {timerExpired && <span className="text-[10px] font-bold text-red-400 animate-pulse">TIME UP</span>}
                <button
                  onClick={() => { setIsTimerRunning(!isTimerRunning); setTimerExpired(false); }}
                  className={`p-1.5 rounded-lg cursor-pointer ${isTimerRunning ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setTimeLeft(60); setIsTimerRunning(false); setTimerExpired(false); }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <Badge variant="accent" className="font-mono text-xs ml-2">Q{questionNumStr}/{activeRound?.totalQuestions || 50}</Badge>
              </div>
            </div>

            {/* Question Display — takes main space */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Question {questionNumStr} · {activeRound?.title} · {currentQuestion?.points || 10} pts
                {isPassed && <span className="ml-2 text-amber-400">⟫ PASSED (half marks: 5 pts)</span>}
              </span>
              <p className="font-bold text-xl sm:text-2xl lg:text-3xl text-white leading-snug">
                {currentQuestion?.question || 'No question available.'}
              </p>

              {/* Answer reveal — below the question */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Answer
                  </span>
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors ${
                      showAnswer ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {showAnswer ? <><EyeOff className="w-3 h-3 inline mr-1" />Hide</> : <><Eye className="w-3 h-3 inline mr-1" />Reveal</>}
                  </button>
                </div>
                {showAnswer ? (
                  <p className="mt-2 text-base font-semibold text-amber-100 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    {currentQuestion?.answer || 'No answer provided.'}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600 italic">Click Reveal to see the answer.</p>
                )}
              </div>
            </div>

            {/* Answering Team + Actions — immediately visible, no scrolling */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-white uppercase tracking-tight">
                  {isPassed ? '⟫ Select Next Team (Passed Question — 5 pts)' : 'Select Answering Team'}
                </h3>
                {!isPassed && (
                  <button
                    onClick={handlePass}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Pass
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teamList.map((team) => {
                  const isSelected = status.selectedAnsweringTeamId === team.id;
                  return (
                    <div
                      key={team.id}
                      className={`rounded-lg border p-3 relative overflow-hidden transition-all ${
                        isSelected
                          ? 'border-indigo-500 ring-1 ring-indigo-500/30 bg-indigo-950/30'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: team.color }} />
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white uppercase">{team.shortName}</span>
                        <span className="text-[10px] text-slate-400">{team.score} pts</span>
                      </div>

                      {!isSelected ? (
                        <button
                          onClick={() => selectAnsweringTeam(team.id)}
                          className="w-full py-1.5 rounded-md font-bold text-[10px] uppercase bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer"
                        >
                          Select
                        </button>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCorrect(team.id)}
                            className="flex-1 py-1.5 rounded-md font-bold text-[10px] uppercase text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-0.5"
                          >
                            <CheckCircle2 className="w-3 h-3" /> +{isPassed ? 5 : (currentQuestion?.points || 10)}
                          </button>
                          <button
                            onClick={handleWrong}
                            className="flex-1 py-1.5 rounded-md font-bold text-[10px] uppercase text-red-400 bg-red-500/10 hover:bg-red-500/20 cursor-pointer flex items-center justify-center gap-0.5"
                          >
                            <XCircle className="w-3 h-3" /> Wrong
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {teamList.length === 0 && (
                  <div className="col-span-4 text-center py-4 text-slate-500 text-sm">
                    No teams registered. Go to Registration to add teams.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
