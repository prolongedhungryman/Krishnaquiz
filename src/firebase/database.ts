import { 
  ref, 
  onValue, 
  set, 
  update, 
  get, 
  serverTimestamp,
  DataSnapshot 
} from 'firebase/database';
import { database, isFirebaseConfigured } from './config';
import { QuizData, QuizStatus, DisplayMode, QuizEvent, Team } from '../types';
import { INITIAL_QUIZ_DATA } from '../data/initialQuizData';

// ─── Runtime Firebase health flag ───────────────────────────────────────────
// Starts true when config looks valid, but flips to false permanently
// the moment any Firebase operation fails (404 DB, permission denied, etc.).
// Once false, ALL reads AND writes use localStorage + BroadcastChannel.
let firebaseAlive = isFirebaseConfigured && !!database;

// Helper to prevent infinite hangs when Firebase is unreachable
function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error("Firebase operation timed out")), ms)
    )
  ]);
}

function useFirebase(): boolean {
  return firebaseAlive && isFirebaseConfigured && !!database;
}

function killFirebase(reason: string) {
  if (firebaseAlive) {
    console.warn(`[Firebase] DISABLED — falling back to local mode. Reason: ${reason}`);
    firebaseAlive = false;
  }
}

// ─── Local storage + BroadcastChannel infrastructure ────────────────────────
const LOCAL_STORAGE_KEY = 'quiz_competition_state_v1';
const BROADCAST_CHANNEL_NAME = 'quiz_competition_broadcast';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable
}

// Listeners that get notified on local state changes (used after Firebase dies)
let localListeners: Array<(data: QuizData) => void> = [];

function getLocalState(): QuizData {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // ALWAYS use the latest hardcoded rounds/questions from source code, ignoring cached ones
      parsed.rounds = INITIAL_QUIZ_DATA.rounds;
      return parsed;
    }
  } catch (err) {
    console.warn('[Quiz State] Failed to read localStorage', err);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QUIZ_DATA));
  return INITIAL_QUIZ_DATA;
}

function saveLocalState(data: QuizData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    broadcastChannel?.postMessage({ type: 'STATE_UPDATED', data });
    // Notify any in-tab listeners (critical for same-tab reactivity)
    localListeners.forEach(fn => fn(data));
  } catch (err) {
    console.error('[Quiz State] Failed to save state', err);
  }
}

// ─── Local subscription (BroadcastChannel + storage events + in-tab) ────────
function subscribeLocal(onData: (data: QuizData) => void): () => void {
  // Immediately emit current state
  onData(getLocalState());

  // In-tab listener (for writes happening in the same tab)
  localListeners.push(onData);

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'STATE_UPDATED' && event.data.data) {
      onData(event.data.data);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      try {
        onData(JSON.parse(event.newValue));
      } catch {
        // ignore
      }
    }
  };

  broadcastChannel?.addEventListener('message', handleBroadcast);
  window.addEventListener('storage', handleStorage);

  return () => {
    localListeners = localListeners.filter(fn => fn !== onData);
    broadcastChannel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

// ─── Main subscription ──────────────────────────────────────────────────────
/**
 * Subscribe to realtime quiz state changes.
 * Tries Firebase first; if Firebase is dead, seamlessly falls back to local.
 */
export function subscribeToQuizState(
  onData: (data: QuizData) => void,
  onError?: (error: Error) => void
): () => void {
  if (!useFirebase()) {
    return subscribeLocal(onData);
  }

  const quizRef = ref(database!, 'quiz');
  let unsubFirebase: (() => void) | null = null;
  let unsubLocal: (() => void) | null = null;

  // Try a one-time read to verify Firebase is actually reachable
  withTimeout(get(quizRef), 5000)
    .then((snapshot: DataSnapshot) => {
      // Firebase is alive! Seed if needed and start listening
      if (!snapshot.exists()) {
        const seedData = {
          status: INITIAL_QUIZ_DATA.status,
          teams: {},
          events: INITIAL_QUIZ_DATA.events || {},
          answeredQuestions: {},
        };
        withTimeout(set(quizRef, seedData)).catch(() => {});
      }

      // Set up realtime listener
      unsubFirebase = onValue(
        quizRef,
        (snap: DataSnapshot) => {
          if (snap.exists()) {
            const val = snap.val() as Record<string, unknown>;
            onData(normalizeFirebaseData(val));
          } else {
            onData(INITIAL_QUIZ_DATA);
          }
        },
        (error) => {
          console.error('[Firebase] Listener error, switching to local:', error);
          killFirebase(error.message);
          unsubLocal = subscribeLocal(onData);
        }
      );
    })
    .catch((err) => {
      // Firebase is DEAD. Switch to local mode permanently.
      killFirebase(err.message || 'Initial read failed');
      unsubLocal = subscribeLocal(onData);
    });

  return () => {
    unsubFirebase?.();
    unsubLocal?.();
  };
}

/**
 * Normalize Firebase data: merge dynamic Firebase data with local static data.
 */
function normalizeFirebaseData(val: Record<string, unknown>): QuizData {
  if (!val) return INITIAL_QUIZ_DATA;

  const result: QuizData = {
    ...INITIAL_QUIZ_DATA,
    status: (val.status as QuizData['status']) || INITIAL_QUIZ_DATA.status,
    teams: (val.teams as QuizData['teams']) || {},
    events: (val.events as QuizData['events']) || {},
    rounds: INITIAL_QUIZ_DATA.rounds, // ALWAYS use latest hardcoded questions
  };

  const rawAQ = val.answeredQuestions as Record<string, unknown> | undefined;
  if (rawAQ && typeof rawAQ === 'object') {
    const normalizedAQ: Record<string, string[]> = {};
    for (const [roundId, answered] of Object.entries(rawAQ)) {
      if (answered && !Array.isArray(answered)) {
        normalizedAQ[roundId] = Object.values(answered as Record<string, string>);
      } else {
        normalizedAQ[roundId] = (answered as string[]) || [];
      }
    }
    result.answeredQuestions = normalizedAQ;
  } else {
    result.answeredQuestions = {};
  }

  return result;
}

// ─── Write operations ───────────────────────────────────────────────────────
// Every write checks useFirebase() at call time. If Firebase died mid-session,
// writes automatically go to local.

export async function updateTeamScore(
  teamId: string, 
  delta: number, 
  customDescription?: string
): Promise<void> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  if (useFirebase()) {
    try {
      const teamScoreRef = ref(database!, `quiz/teams/${teamId}/score`);
      const snapshot = await get(teamScoreRef);
      const currentScore = snapshot.exists() ? (snapshot.val() as number) : 0;
      const newScore = Math.max(0, currentScore + delta);

      await withTimeout(update(ref(database!), {
        [`quiz/teams/${teamId}/score`]: newScore,
        [`quiz/status/lastScoredTeamId`]: teamId,
        [`quiz/status/updatedAt`]: serverTimestamp(),
        [`quiz/events/${eventId}`]: {
          id: eventId,
          timestamp: Date.now(),
          type: 'POINT_AWARDED',
          teamId,
          points: delta,
          description: customDescription || `Awarded ${delta > 0 ? '+' : ''}${delta} points`,
        },
      }));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  // Local fallback
  const state = getLocalState();
  const team = state.teams[teamId];
  if (!team) return;

  team.score = Math.max(0, team.score + delta);
  state.status.lastScoredTeamId = teamId;
  state.status.updatedAt = Date.now();

  if (!state.events) state.events = {};
  state.events[eventId] = {
    id: eventId,
    timestamp: Date.now(),
    type: 'POINT_AWARDED',
    teamId,
    teamName: team.name,
    points: delta,
    description: customDescription || `Awarded ${delta > 0 ? '+' : ''}${delta} pts to ${team.name}`,
  };
  saveLocalState(state);
}

export async function setTeamScore(teamId: string, newScore: number): Promise<void> {
  const safeScore = Math.max(0, Math.floor(newScore));
  if (useFirebase()) {
    try {
      await withTimeout(update(ref(database!), {
        [`quiz/teams/${teamId}/score`]: safeScore,
        [`quiz/status/updatedAt`]: serverTimestamp(),
      }));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  if (state.teams[teamId]) {
    state.teams[teamId].score = safeScore;
    state.status.updatedAt = Date.now();
    saveLocalState(state);
  }
}

export async function updateQuizStatus(partialStatus: Partial<QuizStatus>): Promise<void> {
  if (useFirebase()) {
    try {
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(partialStatus)) {
        updates[`quiz/status/${key}`] = value === undefined ? null : value;
      }
      updates['quiz/status/updatedAt'] = serverTimestamp();
      await withTimeout(update(ref(database!), updates));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  state.status = {
    ...state.status,
    ...partialStatus,
    updatedAt: Date.now(),
  };
  saveLocalState(state);
}

export async function setActiveRound(roundId: string): Promise<void> {
  await updateQuizStatus({
    activeRoundId: roundId,
    currentQuestionIndex: 0,
    showQuestion: true,
  });
}

export async function setCurrentQuestion(index: number): Promise<void> {
  await updateQuizStatus({
    currentQuestionIndex: Math.max(0, index),
    showQuestion: true,
  });
}

export async function toggleShowQuestion(show: boolean): Promise<void> {
  await updateQuizStatus({ showQuestion: show });
}

export async function setDisplayMode(mode: DisplayMode): Promise<void> {
  await updateQuizStatus({ displayMode: mode });
}

export async function resetAllScores(): Promise<void> {
  if (useFirebase()) {
    try {
      const snapshot = await get(ref(database!, 'quiz/teams'));
      if (snapshot.exists()) {
        const teams = snapshot.val() as Record<string, unknown>;
        const updates: Record<string, unknown> = {};
        for (const teamId of Object.keys(teams)) {
          updates[`quiz/teams/${teamId}/score`] = 0;
        }
        updates['quiz/status/updatedAt'] = serverTimestamp();
        await withTimeout(update(ref(database!), updates));
        return;
      }
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  for (const key of Object.keys(state.teams)) {
    state.teams[key].score = 0;
  }
  state.status.updatedAt = Date.now();
  saveLocalState(state);
}

export async function resetEntireCompetition(): Promise<void> {
  if (useFirebase()) {
    try {
      await withTimeout(update(ref(database!), {
        'quiz/teams': {},
        'quiz/answeredQuestions': {},
        'quiz/status': {
          ...INITIAL_QUIZ_DATA.status,
          updatedAt: serverTimestamp(),
        },
      }));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const freshState: QuizData = {
    ...INITIAL_QUIZ_DATA,
    teams: {},
    answeredQuestions: {},
    status: {
      ...INITIAL_QUIZ_DATA.status,
      updatedAt: Date.now(),
    },
  };
  saveLocalState(freshState);
}

export async function addTeam(team: Team): Promise<void> {
  if (useFirebase()) {
    try {
      await withTimeout(update(ref(database!), {
        [`quiz/teams/${team.id}`]: team,
        [`quiz/status/updatedAt`]: serverTimestamp(),
      }));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  if (!state.teams) state.teams = {};
  state.teams[team.id] = team;
  state.status.updatedAt = Date.now();
  saveLocalState(state);
}

export async function removeTeam(teamId: string): Promise<void> {
  if (useFirebase()) {
    try {
      await withTimeout(set(ref(database!, `quiz/teams/${teamId}`), null));
      await withTimeout(update(ref(database!), {
        [`quiz/status/updatedAt`]: serverTimestamp(),
      }));
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  delete state.teams[teamId];
  state.status.updatedAt = Date.now();
  saveLocalState(state);
}

export async function markQuestionAnswered(roundId: string, questionId: string): Promise<void> {
  if (useFirebase()) {
    try {
      const answeredRef = ref(database!, `quiz/answeredQuestions/${roundId}`);
      const snapshot = await get(answeredRef);
      let currentList: string[] = [];
      if (snapshot.exists()) {
        currentList = snapshot.val() as string[];
      }
      if (!currentList.includes(questionId)) {
        currentList.push(questionId);
        await withTimeout(update(ref(database!), {
          [`quiz/answeredQuestions/${roundId}`]: currentList,
          [`quiz/status/updatedAt`]: serverTimestamp(),
        }));
      }
      return;
    } catch (err: any) {
      killFirebase(err.message);
    }
  }

  const state = getLocalState();
  if (!state.answeredQuestions) state.answeredQuestions = {};
  if (!state.answeredQuestions[roundId]) state.answeredQuestions[roundId] = [];
  if (!state.answeredQuestions[roundId].includes(questionId)) {
    state.answeredQuestions[roundId].push(questionId);
    state.status.updatedAt = Date.now();
    saveLocalState(state);
  }
}
