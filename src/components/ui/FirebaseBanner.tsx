import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { isFirebaseConfigured, firebaseEnvConfig } from '../../firebase/config';

export const FirebaseBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && compact) return null;

  if (isFirebaseConfigured) {
    if (compact) {
      return (
        <span 
          id="firebase-status-pill"
          title={`Connected to Firebase Realtime Database (${firebaseEnvConfig.projectId || 'Custom URL'})`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Firebase RTDB Connected</span>
        </span>
      );
    }
    return null;
  }

  // Development simulation notice
  if (compact) {
    return (
      <button
        id="dev-sim-status-btn"
        onClick={() => setIsExpanded(true)}
        title="Running in real-time dev mode. Click to view Firebase configuration info."
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-colors"
      >
        <Database className="w-3 h-3 animate-pulse" />
        <span>Dev Simulation Active</span>
      </button>
    );
  }

  return (
    <>
      <div 
        id="firebase-dev-banner"
        className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 text-xs text-amber-900 dark:text-amber-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Local Real-time Simulation:</strong> Firebase environment variables are not yet configured. Real-time multi-tab broadcasting is active for UI evaluation.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="view-firebase-env-btn"
              onClick={() => setIsExpanded(true)}
              className="underline font-medium hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
            >
              Setup Guide
            </button>
            <button
              id="dismiss-banner-btn"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div 
          id="firebase-setup-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-base">
                <Database className="w-5 h-5 text-amber-500" />
                <span>Connecting Production Firebase</span>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              The quiz architecture uses Firebase Authentication and Firebase Realtime Database as its single authoritative source of truth. When running without configured credentials, it automatically provides full real-time cross-tab state synchronization.
            </p>

            <div className="bg-slate-950 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
              <div className="text-slate-500"># Provide these in .env or Settings:</div>
              <div>VITE_FIREBASE_API_KEY="..."</div>
              <div>VITE_FIREBASE_AUTH_DOMAIN="..."</div>
              <div>VITE_FIREBASE_DATABASE_URL="https://...firebaseio.com"</div>
              <div>VITE_FIREBASE_PROJECT_ID="..."</div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:opacity-90 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
