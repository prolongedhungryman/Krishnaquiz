import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, HelpCircle, FileText, Image, Volume2, Sparkles } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Badge } from '../../components/ui/Badge';
import { QuestionType } from '../../types';

export const RoundsPage: React.FC = () => {
  const { rounds, status, selectRound, selectQuestion } = useQuiz();
  const [selectedRoundId, setSelectedRoundId] = useState<string>(status.activeRoundId);

  const roundList = Object.values(rounds);
  const viewingRound = rounds[selectedRoundId] || roundList[0];

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'image': return <Image className="w-3.5 h-3.5 text-blue-500" />;
      case 'audio': return <Volume2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'guessing': return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div 
      id="admin-rounds-page"
      className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <AdminHeader competitionName="OXFORD QUIZ CONTROL" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
              Round Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modular round infrastructure. Detailed round rules and mechanics will be attached to each round schema.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Active in Competition:</span>
            <Badge variant="accent" className="font-bold">
              {rounds[status.activeRoundId]?.title || status.activeRoundId}
            </Badge>
          </div>
        </div>

        {/* Rounds Grid & Question Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Modular Rounds List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Competition Rounds ({roundList.length})
            </span>

            {roundList.map((rnd) => {
              const isSelected = rnd.id === selectedRoundId;
              const isLive = rnd.id === status.activeRoundId;

              return (
                <div
                  key={rnd.id}
                  id={`round-card-${rnd.id}`}
                  onClick={() => setSelectedRoundId(rnd.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-mono tracking-widest uppercase text-slate-400">
                      Round 0{rnd.order}
                    </span>
                    {isLive && (
                      <Badge variant="live" className="text-[10px] py-0 px-2">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase">
                      {rnd.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {rnd.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {rnd.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      {rnd.questions.length} Questions
                    </span>

                    {!isLive ? (
                      <button
                        id={`activate-round-btn-${rnd.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectRound(rnd.id);
                        }}
                        className="py-1 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Make Live</span>
                      </button>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live on Screen</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Round Details & Questions List (Span 2) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Round Schema & Question Registry
                </span>
                <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white uppercase">
                  {viewingRound?.title}
                </h3>
              </div>

              {viewingRound && viewingRound.id !== status.activeRoundId && (
                <button
                  id="activate-viewed-round-btn"
                  onClick={() => selectRound(viewingRound.id)}
                  className="py-2 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Set as Active Competition Round</span>
                </button>
              )}
            </div>

            {/* Questions Table/List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Questions ({viewingRound?.questions.length || 0})
              </span>

              <div className="space-y-3">
                {viewingRound?.questions.map((q, idx) => {
                  const isCurrentInQuiz = viewingRound.id === status.activeRoundId && idx === status.currentQuestionIndex;

                  return (
                    <div
                      key={q.id}
                      id={`round-q-item-${q.id}`}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrentInQuiz
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 ring-1 ring-indigo-400/20'
                          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                            {q.number}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase">
                            {getTypeIcon(q.type)}
                            <span>{q.type}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {q.points} PTS
                          </span>
                          {viewingRound.id === status.activeRoundId && (
                            <button
                              id={`jump-to-q-btn-${idx}`}
                              onClick={() => selectQuestion(idx)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                                isCurrentInQuiz
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                              }`}
                            >
                              {isCurrentInQuiz ? 'Current' : 'Go to'}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {q.question}
                      </p>

                      {q.answer && (
                        <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-md font-mono">
                          Answer: {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
