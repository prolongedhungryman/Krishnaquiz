import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../context/RouterContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-display">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-sm font-semibold tracking-wider uppercase text-slate-300">
            Verifying Authentication...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="font-display font-black text-2xl uppercase tracking-wider">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-400 max-w-sm">
          You must be authenticated as an administrator to access the quiz control room.
        </p>
        <button
          id="protected-goto-login-btn"
          onClick={() => navigate('/login')}
          className="mt-2 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
        >
          Proceed to Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
