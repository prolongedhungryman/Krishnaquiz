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

/**
 * Firebase RTDB stores JS arrays as objects with numeric keys.
 * This function restores data from Firebase and merges in local questions data.
 * We only store dynamic data (status, teams, events, answeredQuestions) in Firebase,
 * not the full question bank, to keep writes small and fast.
 */
function normalizeFirebaseData(val: Record<string, unknown>): QuizData {
  if (!val) return INITIAL_QUIZ_DATA;

  // Start with full local initial data (includes all questions)
  const result: QuizData = {
    ...INITIAL_QUIZ_DATA,
    // Override with Firebase dynamic data
    status: (val.status as QuizData['status']) || INITIAL_QUIZ_DATA.status,
    teams: (val.teams as QuizData['teams']) || {},
    events: (val.events as QuizData['events']) || {},
  };

  // Normalize answeredQuestions - Firebase may store arrays as objects too
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

const LOCAL_STORAGE_KEY = 'quiz_competition_state_v1';
const BROADCAST_CHANNEL_NAME = 'quiz_competition_broadcast';

// Create broadcast channel for multi-tab realtime synchronization in development mode
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable
}

function getLocalState(): QuizData {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('[Quiz State] Failed to read localStorage, falling back to initial data', err);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QUIZ_DATA));
  return INITIAL_QUIZ_DATA;
}

function saveLocalState(data: QuizData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    broadcastChannel?.postMessage({ type: 'STATE_UPDATED', data });
  } catch (err) {
    console.error('[Quiz State] Failed to save state to localStorage', err);
  }
}

/**
 * Subscribe to realtime quiz state changes.
 * When Firebase Realtime Database is configured, listens to `ref(database, 'quiz')`.
 * In development preview mode, listens via BroadcastChannel + storage events.
 */
export function subscribeToQuizState(
  onData: (data: QuizData) => void,
  onError?: (error: Error) => void
): () => void {
  if (isFirebaseConfigured && database) {
    const quizRef = ref(database, 'quiz');
    
    // Check if initial data exists on Firebase; if not, bootstrap it
    // Only seed the dynamic data (NOT questions, to keep Firebase writes small)
    get(quizRef).then((snapshot: DataSnapshot) => {
      if (!snapshot.exists()) {
        console.info('[Firebase] Initializing database with minimal seed data...');
        const seedData = {
          status: INITIAL_QUIZ_DATA.status,
          teams: {},
          events: INITIAL_QUIZ_DATA.events || {},
          answeredQuestions: {},
        };
        set(quizRef, seedData).catch((err) => {
          console.error('[Firebase] Failed to seed database:', err);
        });
      }
    }).catch((err) => {
      console.warn('[Firebase] Read check error:', err);
    });

    const unsubscribe = onValue(
      quizRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() as QuizData;
          onData(normalizeFirebaseData(val));
        } else {
          onData(INITIAL_QUIZ_DATA);
        }
      },
      (error) => {
        console.error('[Firebase] Realtime listener error:', error);
        onError?.(error);
      }
    );

    return () => unsubscribe();
  } else {
    // Local / multi-tab dev mode
    onData(getLocalState());

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
          // ignore parsing error
        }
      }
    };

    broadcastChannel?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);

    return () => {
      broadcastChannel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }
}

/**
 * Award points to a team.
 * Increments the score, registers a log event, and updates Firebase.
 */
export async function updateTeamScore(
  teamId: string, 
  delta: number, 
  customDescription?: string
): Promise<void> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  if (isFirebaseConfigured && database) {
    const teamScoreRef = ref(database, `quiz/teams/${teamId}/score`);
    const snapshot = await get(teamScoreRef);
    const currentScore = snapshot.exists() ? (snapshot.val() as number) : 0;
    const newScore = Math.max(0, currentScore + delta);

    const updates: Record<string, unknown> = {
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
    };

    await update(ref(database), updates);
  } else {
    const state = getLocalState();
    const team = state.teams[teamId];
    if (!team) return;

    const newScore = Math.max(0, team.score + delta);
    team.score = newScore;
    state.status.lastScoredTeamId = teamId;
    state.status.updatedAt = Date.now();

    const newEvent: QuizEvent = {
      id: eventId,
      timestamp: Date.now(),
      type: 'POINT_AWARDED',
      teamId,
      teamName: team.name,
      points: delta,
      description: customDescription || `Awarded ${delta > 0 ? '+' : ''}${delta} pts to ${team.name}`,
    };

    if (!state.events) state.events = {};
    state.events[eventId] = newEvent;

    saveLocalState(state);
  }
}

/**
 * Directly set a team's score.
 */
export async function setTeamScore(teamId: string, newScore: number): Promise<void> {
  const safeScore = Math.max(0, Math.floor(newScore));
  if (isFirebaseConfigured && database) {
    await update(ref(database), {
      [`quiz/teams/${teamId}/score`]: safeScore,
      [`quiz/status/updatedAt`]: serverTimestamp(),
    });
  } else {
    const state = getLocalState();
    if (state.teams[teamId]) {
      state.teams[teamId].score = safeScore;
      state.status.updatedAt = Date.now();
      saveLocalState(state);
    }
  }
}

/**
 * Update the overall quiz status model.
 */
export async function updateQuizStatus(partialStatus: Partial<QuizStatus>): Promise<void> {
  if (isFirebaseConfigured && database) {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(partialStatus)) {
      updates[`quiz/status/${key}`] = value === undefined ? null : value;
    }
    updates['quiz/status/updatedAt'] = serverTimestamp();
    await update(ref(database), updates);
  } else {
    const state = getLocalState();
    state.status = {
      ...state.status,
      ...partialStatus,
      updatedAt: Date.now(),
    };
    saveLocalState(state);
  }
}

/**
 * Switch active round.
 */
export async function setActiveRound(roundId: string): Promise<void> {
  await updateQuizStatus({
    activeRoundId: roundId,
    currentQuestionIndex: 0,
    showQuestion: true,
  });
}

/**
 * Change current question index.
 */
export async function setCurrentQuestion(index: number): Promise<void> {
  await updateQuizStatus({
    currentQuestionIndex: Math.max(0, index),
    showQuestion: true,
  });
}

/**
 * Toggle question visibility on public display.
 */
export async function toggleShowQuestion(show: boolean): Promise<void> {
  await updateQuizStatus({
    showQuestion: show,
  });
}

/**
 * Toggle public screen display mode: 'QUESTION' | 'LEADERBOARD' | 'WELCOME'
 */
export async function setDisplayMode(mode: DisplayMode): Promise<void> {
  await updateQuizStatus({
    displayMode: mode,
  });
}

/**
 * Reset team scores to 0 (protected with confirmation).
 */
export async function resetAllScores(): Promise<void> {
  if (isFirebaseConfigured && database) {
    const snapshot = await get(ref(database, 'quiz/teams'));
    if (snapshot.exists()) {
      const teams = snapshot.val() as Record<string, unknown>;
      const updates: Record<string, unknown> = {};
      for (const teamId of Object.keys(teams)) {
        updates[`quiz/teams/${teamId}/score`] = 0;
      }
      updates['quiz/status/updatedAt'] = serverTimestamp();
      await update(ref(database), updates);
    }
  } else {
    const state = getLocalState();
    for (const key of Object.keys(state.teams)) {
      state.teams[key].score = 0;
    }
    state.status.updatedAt = Date.now();
    saveLocalState(state);
  }
}

/**
 * Reset full competition back to initial default seed state.
 * Only clears teams and answered questions — preserves rounds.
 */
export async function resetEntireCompetition(): Promise<void> {
  const resetData: Partial<QuizData> = {
    teams: {},
    answeredQuestions: {},
    status: {
      ...INITIAL_QUIZ_DATA.status,
      updatedAt: Date.now(),
    },
  };
  if (isFirebaseConfigured && database) {
    await update(ref(database), {
      'quiz/teams': {},
      'quiz/answeredQuestions': {},
      'quiz/status': resetData.status,
      'quiz/status/updatedAt': serverTimestamp(),
    });
  } else {
    const state = getLocalState();
    state.teams = {};
    state.answeredQuestions = {};
    state.status = {
      ...INITIAL_QUIZ_DATA.status,
      updatedAt: Date.now(),
    };
    saveLocalState(state);
  }
}

/**
 * Add a new team dynamically.
 */
export async function addTeam(team: Team): Promise<void> {
  if (isFirebaseConfigured && database) {
    await update(ref(database), {
      [`quiz/teams/${team.id}`]: team,
      [`quiz/status/updatedAt`]: serverTimestamp(),
    });
  } else {
    const state = getLocalState();
    state.teams[team.id] = team;
    state.status.updatedAt = Date.now();
    saveLocalState(state);
  }
}

/**
 * Remove a team.
 */
export async function removeTeam(teamId: string): Promise<void> {
  if (isFirebaseConfigured && database) {
    // using set(ref, null) to delete
    await set(ref(database, `quiz/teams/${teamId}`), null);
    await update(ref(database), {
      [`quiz/status/updatedAt`]: serverTimestamp(),
    });
  } else {
    const state = getLocalState();
    delete state.teams[teamId];
    state.status.updatedAt = Date.now();
    saveLocalState(state);
  }
}

/**
 * Mark a question as answered.
 */
export async function markQuestionAnswered(roundId: string, questionId: string): Promise<void> {
  if (isFirebaseConfigured && database) {
    const answeredRef = ref(database, `quiz/answeredQuestions/${roundId}`);
    const snapshot = await get(answeredRef);
    let currentList: string[] = [];
    if (snapshot.exists()) {
      currentList = snapshot.val() as string[];
    }
    if (!currentList.includes(questionId)) {
      currentList.push(questionId);
      await update(ref(database), {
        [`quiz/answeredQuestions/${roundId}`]: currentList,
        [`quiz/status/updatedAt`]: serverTimestamp(),
      });
    }
  } else {
    const state = getLocalState();
    if (!state.answeredQuestions) {
      state.answeredQuestions = {};
    }
    if (!state.answeredQuestions[roundId]) {
      state.answeredQuestions[roundId] = [];
    }
    if (!state.answeredQuestions[roundId].includes(questionId)) {
      state.answeredQuestions[roundId].push(questionId);
      state.status.updatedAt = Date.now();
      saveLocalState(state);
    }
  }
}
