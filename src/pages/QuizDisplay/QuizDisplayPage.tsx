import React from 'react';
import { Lock } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { useRouter } from '../../context/RouterContext';
import { PublicDisplayView } from '../../components/quiz/PublicDisplayView';

export const QuizDisplayPage: React.FC = () => {
  const { status, teams, activeRound, currentQuestion, loading, data } = useQuiz();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div 
        id="public-display-loading"
        className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-display"
      >
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300">
          Connecting to Oxford Quiz Live...
        </h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicDisplayView 
        status={status}
        teams={teams}
        activeRound={activeRound}
        currentQuestion={currentQuestion}
        answeredQuestionsForRound={activeRound ? (data.answeredQuestions?.[activeRound.id] || []) : []}
        isProjectorPage={true}
      />

      {/* Discreet Admin Login Access Button in corner (unobtrusive for projector operator) */}
      <div className="absolute bottom-2 right-2 opacity-30 hover:opacity-100 transition-opacity z-20">
        <button
          id="projector-admin-login-link"
          onClick={() => navigate('/login')}
          title="Admin Control Room Login"
          className="p-1.5 rounded-full bg-slate-900/60 text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
