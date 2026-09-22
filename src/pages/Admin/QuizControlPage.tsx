import React, { useState, useEffect } from 'react';
import {
  Check,
  Maximize,
  Minimize,
  Timer,
  BookOpen,
  Trophy,
  ChevronLeft,
  RefreshCw,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { useRouter } from '../../context/RouterContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Badge } from '../../components/ui/Badge';

export const QuizControlPage: React.FC = () => {
  const {
    status,
    teams,
    rounds,
    activeRound,
    currentQuestion,
    awardPoints,
    nextQuestion,
    prevQuestion,
    selectQuestion,
    selectRound,
    changeDisplayMode,
    isScoringBusy,
    markQuestionAnswered,
    selectAnsweringTeam,
    data,
  } = useQuiz();

  const { navigate } = useRouter();

  // Local display mode to avoid async delays making question disappear
  const [localMode, setLocalMode] = useState<'GRID' | 'QUESTION'>('GRID');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Timer state — 60 seconds as requested
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerExpired(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Reset timer and answer when question changes
  useEffect(() => {
    setTimeLeft(60);
    setIsTimerRunning(false);
    setTimerExpired(false);
    setShowAnswer(false);
  }, [currentQuestion?.id]);

  // Sync localMode with Firebase displayMode on mount / external changes
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
    changeDisplayMode('QUESTION'); // fire async, don't await
  };

  const handleBackToGrid = async () => {
    setLocalMode('GRID');
    changeDisplayMode('GRID');
  };

  const teamList = Object.values(teams);
  const questionNumStr = currentQuestion
    ? String(currentQuestion.number).padStart(2, '0')
    : String(status.currentQuestionIndex + 1).padStart(2, '0');

  const timerColor =
    timerExpired
      ? 'text-red-500'
      : timeLeft <= 10
      ? 'text-red-500'
      : timeLeft <= 20
      ? 'text-amber-500'
      : 'text-emerald-500';

  return (
    <div
      id="admin-quiz-control-page"
      className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors"
    >
      <AdminHeader
        competitionName="OXFORD QUIZ CONTROL"
        activeRoundTitle={activeRound?.title}
        currentQuestionNumber={currentQuestion?.number}
      />

      {/* Main Control Room */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">

        {/* Top Status Strip */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Active Round</span>
              <span className="font-display font-black text-lg text-white uppercase">
                {activeRound?.title || 'GENERAL ROUND'}
              </span>
            </div>
            <span className="text-slate-700 text-xl">/</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Question</span>
              <span className="font-display font-black text-lg text-indigo-400">Q{questionNumStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5" /> Rules
            </button>
            <button
              onClick={() => { changeDisplayMode('LEADERBOARD'); navigate('/leaderboard'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
            >
              <Trophy className="w-3.5 h-3.5" /> Leaderboard
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              {isFullscreen ? 'Exit FS' : 'Fullscreen'}
            </button>
          </div>
        </div>

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-wider text-white">Rules: {activeRound?.title}</h2>
                <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-sm text-slate-300">{activeRound?.description}</p>
                <div className="space-y-2 mt-3">
                  {['Each question is worth ' + (activeRound?.defaultPoints || 10) + ' points.', 'You have 60 seconds to answer.', 'Wait for the quiz master\'s confirmation.'].map((rule, i) => (
                    <p key={i} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">{i + 1}</span>
                      {rule}
                    </p>
                  ))}
                </div>
                <button onClick={() => setShowRules(false)} className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm uppercase tracking-widest">
                  Close Rules
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        {localMode === 'GRID' ? (
          /* ---- GRID VIEW ---- */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg uppercase text-white flex items-center gap-2">
                Available Questions
                <Badge variant="accent">{activeRound?.questions.length || 0} Total</Badge>
              </h3>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2.5">
              {activeRound?.questions.map((q, idx) => {
                const isAnswered = data.answeredQuestions?.[activeRound.id]?.includes(q.id);
                const isActive = idx === status.currentQuestionIndex;
                if (isAnswered) {
                  return (
                    <div key={q.id} className="aspect-square rounded-xl border border-slate-700 bg-slate-800/50 opacity-40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-slate-500" />
                    </div>
                  );
                }
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`aspect-square text-base font-bold rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                        : 'bg-slate-800 text-indigo-300 hover:bg-indigo-900/40 hover:text-white border border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ---- QUESTION VIEW ---- */
          <div className="space-y-4">
            {/* Top row: back button */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToGrid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Grid
              </button>
              <Badge variant="accent" className="font-mono text-sm px-3 py-1">Q{questionNumStr} / {activeRound?.totalQuestions || 50}</Badge>
            </div>

            {/* Main question layout: Question Center + Timer Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* ---- CENTER: Big Question Display ---- */}
              <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col justify-center min-h-[240px]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">
                  Question {questionNumStr} · {activeRound?.title} · {currentQuestion?.points || 10} pts
                </span>
                <p className="font-display font-bold text-2xl sm:text-3xl text-white leading-snug">
                  {currentQuestion?.question || 'No question available.'}
                </p>
              </div>

              {/* ---- RIGHT: Timer + Reveal Answer ---- */}
              <div className="flex flex-col gap-4">

                {/* Timer Card */}
                <div className={`bg-slate-900 rounded-2xl border p-6 flex flex-col items-center gap-4 ${timerExpired ? 'border-red-500/50' : 'border-slate-800'}`}>
                  <div className="text-center">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Timer</span>
                    <span className={`font-display font-black text-5xl tabular-nums ${timerColor}`}>
                      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                    {timerExpired && (
                      <span className="block text-xs font-bold text-red-400 mt-1 animate-pulse">TIME UP!</span>
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => { setIsTimerRunning(!isTimerRunning); setTimerExpired(false); }}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        isTimerRunning
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      onClick={() => { setTimeLeft(60); setIsTimerRunning(false); setTimerExpired(false); }}
                      className="px-3 py-2.5 rounded-xl font-bold text-xs uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reveal Answer Card */}
                <div className="bg-slate-900 rounded-2xl border border-amber-500/20 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Answer Key
                    </span>
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors ${
                        showAnswer
                          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {showAnswer ? <><EyeOff className="w-3.5 h-3.5 inline mr-1" />Hide</> : <><Eye className="w-3.5 h-3.5 inline mr-1" />Reveal</>}
                    </button>
                  </div>
                  {showAnswer ? (
                    <p className="text-sm font-semibold text-amber-100 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                      {currentQuestion?.answer || 'No answer provided.'}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 italic">Click Reveal to see the answer.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ---- ANSWERING TEAM SECTION ---- */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                    Answering Team
                  </h3>
                  <p className="text-xs text-slate-500">Select the team that answered to award points. Auto-returns to grid after marking.</p>
                </div>
                {status.selectedAnsweringTeamId && (
                  <button
                    onClick={() => selectAnsweringTeam(undefined)}
                    className="text-xs font-bold uppercase text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {teamList.map((team) => {
                  const isSelected = status.selectedAnsweringTeamId === team.id;
                  return (
                    <div
                      key={team.id}
                      className={`rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden transition-all ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/30'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: team.color }} />
                      <div>
                        <h4 className="font-display font-extrabold text-base text-white uppercase">{team.shortName}</h4>
                        <span className="text-xs text-slate-400">{team.score} pts</span>
                      </div>

                      {!isSelected ? (
                        <button
                          onClick={() => selectAnsweringTeam(team.id)}
                          className="w-full py-2 rounded-lg font-bold text-xs uppercase bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white cursor-pointer transition-colors"
                        >
                          Select
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <button
                            onClick={async () => {
                              const pts = currentQuestion?.points || 10;
                              await awardPoints(team.id, pts);
                              if (activeRound && currentQuestion) {
                                await markQuestionAnswered(activeRound.id, currentQuestion.id);
                              }
                              selectAnsweringTeam(undefined);
                              setLocalMode('GRID');
                              changeDisplayMode('GRID');
                            }}
                            className="w-full py-2 rounded-lg font-bold text-xs uppercase text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> +{currentQuestion?.points || 10} Correct
                          </button>
                          <button
                            onClick={() => selectAnsweringTeam(undefined)}
                            className="w-full py-2 rounded-lg font-bold text-xs uppercase text-red-400 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 inline mr-1" /> Wrong
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {teamList.length === 0 && (
                  <div className="col-span-4 text-center py-6 text-slate-500 text-sm">
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
