import React, { useState } from 'react';
import { 
  Play, 
  Tv, 
  Layers, 
  Trophy, 
  RotateCcw, 
  Check, 
  Plus, 
  Sliders, 
  ExternalLink, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useQuiz } from '../../hooks/useQuiz';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { RegistrationTab } from '../../components/admin/RegistrationTab';
import { RoundSelectionTab } from '../../components/admin/RoundSelectionTab';

export type AdminTab = 'DASHBOARD' | 'REGISTRATION' | 'ROUNDS';

export const AdminDashboard: React.FC = () => {
  const { navigate } = useRouter();
  const { 
    status, 
    teams, 
    rounds, 
    activeRound, 
    currentQuestion, 
    eventsList, 
    awardPoints, 
    isScoringBusy, 
    resetScores,
    changeDisplayMode,
    addTeam,
    removeTeam,
    selectRound
  } = useQuiz();

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [showResetModal, setShowResetModal] = useState(false);

  const teamList = Object.values(teams);
  const questionNum = currentQuestion ? String(currentQuestion.number).padStart(2, '0') : String(status.currentQuestionIndex + 1).padStart(2, '0');

  const handleConfirmReset = async () => {
    await resetScores();
    setShowResetModal(false);
  };

  return (
    <div 
      id="admin-dashboard-page"
      className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <AdminHeader 
        competitionName="OXFORD QUIZ CONTROL"
        activeRoundTitle={activeRound?.title}
        currentQuestionNumber={currentQuestion?.number}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {(['DASHBOARD', 'REGISTRATION', 'ROUNDS'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Top Status & Quick Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Active Round & Question Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current Round
                  </span>
                  <Badge variant="neutral" className="font-mono text-[11px]">
                    Round {activeRound?.order || 1}
                  </Badge>
                </div>
                
                <div className="my-3">
                  <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                    {activeRound?.title || 'GENERAL ROUND'}
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {activeRound?.subtitle || 'Standard verbal questions'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">Question</span>
                  <span className="font-display font-black text-lg text-slate-900 dark:text-white">
                    {questionNum} <span className="text-xs font-normal text-slate-400">/ {activeRound?.totalQuestions || 8}</span>
                  </span>
                </div>
              </div>

              {/* Quiz State & Mode Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Quiz Status
                  </span>
                  <Badge variant="live" className="text-[11px]">
                    LIVE ●
                  </Badge>
                </div>

                <div className="my-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400 uppercase">
                      {status.state.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Public display showing: <strong className="text-slate-700 dark:text-slate-300 uppercase">{status.displayMode}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="dash-mode-q-btn"
                    onClick={() => changeDisplayMode('GRID')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded uppercase transition-colors cursor-pointer ${
                      status.displayMode === 'GRID'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Question Grid
                  </button>
                  <button
                    id="dash-mode-lb-btn"
                    onClick={() => changeDisplayMode('LEADERBOARD')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded uppercase transition-colors cursor-pointer ${
                      status.displayMode === 'LEADERBOARD'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Leaderboard
                  </button>
                </div>
              </div>

              {/* Quick Primary Actions Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Direct Operation
                  </span>
                  <h3 className="font-display font-black text-xl tracking-tight mt-1">
                    Quiz Control Console
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Full-featured control room for question navigation, verbal answers, and live scoring.
                  </p>
                </div>

                <button
                  id="dash-launch-control-btn"
                  onClick={() => navigate('/admin/quiz')}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Launch Quiz Control</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            </div>

            {/* Current Team Scores & Quick Scoring Matrix */}
            <section 
              id="dash-teams-scoring-section"
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                    Team Scores & Quick Awarding
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Single-click score attribution. Syncs immediately to Firebase Realtime Database.
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400">
                  {teamList.length} Teams Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamList.map((team) => {
                  const isBusy = isScoringBusy[team.id];
                  return (
                    <div
                      key={team.id}
                      id={`dash-team-${team.id}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: team.color }}
                      />

                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 uppercase">
                          {team.shortName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {team.name}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-black text-4xl text-slate-900 dark:text-white tabular-nums tracking-tight">
                          {team.score}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase">
                          PTS
                        </span>
                      </div>

                      <button
                        id={`dash-award-btn-${team.id}`}
                        type="button"
                        disabled={isBusy}
                        onClick={() => awardPoints(team.id, 1)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white dark:hover:border-indigo-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isBusy ? 'Saving...' : '+1 Point'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Navigation & Display Launchers */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                id="dash-nav-display-btn"
                onClick={() => navigate('/display')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left cursor-pointer transition-all shadow-xs group"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Tv className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase flex items-center justify-between">
                  <span>Open Projector Display</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Full-screen 16:9 view for audience & stage displays.
                </p>
              </button>

              <button
                id="dash-nav-leaderboard-btn"
                onClick={() => navigate('/leaderboard')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left cursor-pointer transition-all shadow-xs group"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase flex items-center justify-between">
                  <span>Standalone Leaderboard</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dedicated rankings board for auxiliary screens.
                </p>
              </button>
            </section>

            {/* Recent Realtime Scoring Activity & Dangerous Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Activity Log */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase">
                      Realtime Event Stream
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last {Math.min(5, eventsList.length)} events
                  </span>
                </div>

                <div className="space-y-2">
                  {eventsList.slice(0, 5).map((evt) => (
                    <div 
                      key={evt.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {evt.description}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {eventsList.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-4">
                      No scoring events recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Reset / End Quiz Controls */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase">
                    Competition Reset
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Reset team scores back to zero at the start of a new tournament session. All destructive actions require confirmation.
                  </p>
                </div>

                <button
                  id="dash-reset-scores-btn"
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Scores (0 PTS)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'REGISTRATION' && (
          <RegistrationTab 
            teams={teamList}
            onAddTeam={addTeam}
            onRemoveTeam={removeTeam}
          />
        )}

        {activeTab === 'ROUNDS' && (
          <RoundSelectionTab 
            rounds={Object.values(rounds)}
            activeRoundId={status.activeRoundId}
            onSelectRound={selectRound}
            onStartRound={(roundId) => {
              selectRound(roundId);
              changeDisplayMode('GRID');
              navigate('/admin/quiz');
            }}
          />
        )}

      </main>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All Competition Scores?"
        message="This action will reset the scores of all 4 teams to 0 in Firebase. The live display and leaderboard will reflect 0 immediately."
        confirmLabel="Reset to 0"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
