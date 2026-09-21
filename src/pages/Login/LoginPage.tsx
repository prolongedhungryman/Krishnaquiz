import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../context/RouterContext';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { FirebaseBanner } from '../../components/ui/FirebaseBanner';

export const LoginPage: React.FC = () => {
  const { login, isSubmitting, authError, sendReset, clearError } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      navigate('/admin');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    await sendReset(resetEmail);
    setResetSent(true);
  };

  return (
    <div 
      id="admin-login-page"
      className="min-h-screen flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
    >
      <FirebaseBanner />

      {/* Top Bar with quick return to Public Display & Theme toggle */}
      <div className="p-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          id="login-back-to-display-btn"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Display</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Main Login Shell Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-display font-black text-2xl lg:text-3xl tracking-wider uppercase text-slate-900 dark:text-white">
              QUIZ CONTROL
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Welcome, Administrator
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div 
              id="login-error-alert"
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  clearError();
                  setEmail(e.target.value);
                }}
                placeholder="admin@schoolquiz.org"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  clearError();
                  setPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>

            <button
              id="admin-sign-in-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 cursor-pointer transition-all duration-150"
            >
              {isSubmitting ? 'Verifying...' : 'SIGN IN'}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="text-center pt-2">
            <button
              id="forgot-password-btn"
              type="button"
              onClick={() => {
                setResetEmail(email);
                setShowForgotModal(true);
              }}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 underline underline-offset-4 cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Authorized personnel only • Real-time Quiz Platform
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Administrator Password
            </h3>
            {resetSent ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Password reset instructions have been dispatched to {resetEmail}.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered administrator email to receive a password reset link.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@schoolquiz.org"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
            {resetSent && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="p-4 text-center text-xs text-slate-400 dark:text-slate-600">
        School Quiz Competition Platform • Single Source of Truth: Firebase Realtime Database
      </footer>
    </div>
  );
};
