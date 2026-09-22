import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus,
  Sparkles, 
  RotateCcw,
  Sliders,
  Tv,
  HelpCircle,
  Award,
  Maximize,
  Minimize,
  Timer,
  BookOpen,
  Trophy
} from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
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
    changeScoreDirect,
    nextQuestion,
    prevQuestion,
    selectQuestion,
    selectRound,
    toggleQuestion,
    changeDisplayMode,
    isScoringBusy,
    markQuestionAnswered,
    selectAnsweringTeam,
    data,
  } = useQuiz();

  const [pointsDelta, setPointsDelta] = useState<number>(1);
  const [showAnswer, setShowAnswer] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
    setIsTimerRunning(false);
  }, [currentQuestion?.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const teamList = Object.values(teams);
  const roundList = Object.values(rounds);
  const questionNumStr = currentQuestion 
    ? String(currentQuestion.number).padStart(2, '0') 
    : String(status.currentQuestionIndex + 1).padStart(2, '0');

  const isFirstQuestion = status.currentQuestionIndex === 0;
  const isLastQuestion = activeRound ? status.currentQuestionIndex >= activeRound.questions.length - 1 : false;

  return (
    <div 
      id="admin-quiz-control-page"
      className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <AdminHeader 
        competitionName="OXFORD QUIZ CONTROL"
        activeRoundTitle={activeRound?.title}
        currentQuestionNumber={currentQuestion?.number}
      />

      {/* Main Control Room Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Operational Status Strip */}
        <div 
          id="control-status-strip"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Active Round
              </span>
              <span className="font-display font-black text-xl text-slate-900 dark:text-white uppercase">
                {activeRound?.title || 'GENERAL ROUND'}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 text-2xl font-light">/</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Active Question
              </span>
              <span className="font-display font-black text-xl text-indigo-600 dark:text-indigo-400">
                QUESTION {questionNumStr}
              </span>
            </div>
          </div>

          {/* Quick Display Mode Selectors */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              <BookOpen className="w-3.5 h-3.5" /> Rules
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />} 
              {isFullscreen ? 'Exit FS' : 'Fullscreen'}
            </button>
          </div>
        </div>

        {/* Fullscreen Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold uppercase tracking-wider">Rules: {activeRound?.title}</h2>
                <button onClick={() => setShowRules(false)} className="text-slate-500 hover:text-slate-700">Close</button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-lg font-medium">{activeRound?.description}</p>
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                  <p className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">1</span> 
                    Each question is worth {activeRound?.defaultPoints} points.
                  </p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">2</span> 
                    You have 30 seconds to answer.
                  </p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">3</span> 
                    Wait for the quiz master's confirmation.
                  </p>
                </div>
                <div className="pt-6">
                  <button 
                    onClick={() => setShowRules(false)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm uppercase tracking-widest"
                  >
                    Close Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Viewer & Question Navigation Controls */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Question Grid or Active Question View */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col space-y-6">
            {status.displayMode === 'GRID' ? (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg uppercase text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Available Questions</span>
                  <Badge variant="accent">{activeRound?.questions.length || 0} Total</Badge>
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {activeRound?.questions.map((q, idx) => {
                    const isAnswered = data.answeredQuestions?.[activeRound.id]?.includes(q.id);
                    if (isAnswered) {
                      return (
                         <div key={q.id} className="py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-50 flex items-center justify-center">
                           <Check className="w-6 h-6 text-slate-400" />
                         </div>
                      );
                    }
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          selectQuestion(idx);
                          changeDisplayMode('QUESTION');
                        }}
                        className="py-4 text-xl font-bold rounded-xl cursor-pointer transition-colors bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/50 shadow-xs"
                      >
                        {q.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" className="font-mono">
                      Q{questionNumStr}
                    </Badge>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Type: {currentQuestion?.type || 'text'} • Value: {currentQuestion?.points || 10} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeDisplayMode('GRID')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      Back to Grid
                    </button>
                  </div>
                </div>

                {/* Timer Component */}
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3">
                    <Timer className={`w-8 h-8 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`} />
                    <span className={`font-display font-black text-3xl tabular-nums ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      00:{String(timeLeft).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg uppercase text-xs"
                    >
                      {isTimerRunning ? 'Pause' : 'Start Timer'}
                    </button>
                    <button 
                      onClick={() => { setTimeLeft(30); setIsTimerRunning(false); }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg uppercase text-xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 flex-1 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Question Prompt
                  </span>
                  <p className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
                    "{currentQuestion?.question || 'No question available.'}"
                  </p>
                </div>

                {/* Admin Answer Key */}
                <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Admin Answer Key
                    </span>
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="text-[11px] text-amber-600 underline cursor-pointer"
                    >
                      {showAnswer ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  {showAnswer && (
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                      {currentQuestion?.answer || 'No official answer provided.'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* ANSWERING TEAM LOGIC IN QUESTION MODE */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 mb-4">
                  <div>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                      Answering Team
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select who is answering to award points.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamList.map((team) => {
                    const isSelected = status.selectedAnsweringTeamId === team.id;
                    return (
                      <div
                        key={team.id}
                        className={`rounded-2xl border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/60 dark:bg-slate-850/50 p-5 flex flex-col space-y-4 relative overflow-hidden transition-all`}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: team.color }} />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white uppercase">
                              {team.shortName}
                            </h4>
                            <span className="text-xs font-bold text-slate-500">
                              SCORE: {team.score}
                            </span>
                          </div>
                        </div>

                        {!isSelected ? (
                          <button
                            onClick={() => selectAnsweringTeam(team.id)}
                            className="w-full py-2.5 rounded-xl font-bold text-xs uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                          >
                            Select to Answer
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={async () => {
                                const pts = currentQuestion?.points || 10;
                                await awardPoints(team.id, pts);
                                if (activeRound && currentQuestion) {
                                  await markQuestionAnswered(activeRound.id, currentQuestion.id);
                                }
                                selectAnsweringTeam(undefined);
                                changeDisplayMode('GRID');
                              }}
                              className="w-full py-2 rounded-lg font-bold text-xs uppercase text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-4 h-4" /> Correct (+{currentQuestion?.points || 10})
                            </button>
                            <button
                              onClick={() => selectAnsweringTeam(undefined)}
                              className="w-full py-2 rounded-lg font-bold text-xs uppercase text-red-600 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 cursor-pointer"
                            >
                              Incorrect / Clear
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
