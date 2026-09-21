import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  QuizData, 
  QuizStatus, 
  Team, 
  Round, 
  Question, 
  QuizEvent, 
  DisplayMode, 
  QuizState 
} from '../types';
import { INITIAL_QUIZ_DATA } from '../data/initialQuizData';
import { 
  subscribeToQuizState, 
  updateTeamScore, 
  setTeamScore,
  updateQuizStatus, 
  setActiveRound, 
  setCurrentQuestion, 
  toggleShowQuestion, 
  setDisplayMode,
  resetAllScores,
  resetEntireCompetition,
  addTeam as dbAddTeam,
  removeTeam as dbRemoveTeam,
  markQuestionAnswered as dbMarkQuestionAnswered
} from '../firebase/database';

export function useQuiz() {
  const [data, setData] = useState<QuizData>(INITIAL_QUIZ_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isScoringBusy, setIsScoringBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToQuizState(
      (freshData) => {
        setData(freshData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Quiz sync error:', err);
        setError('Realtime synchronization error. Reconnecting...');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const status: QuizStatus = data.status || INITIAL_QUIZ_DATA.status;
  const teams: Record<string, Team> = data.teams || INITIAL_QUIZ_DATA.teams;
  const rounds: Record<string, Round> = data.rounds || INITIAL_QUIZ_DATA.rounds;
  
  const eventsList: QuizEvent[] = useMemo(() => {
    if (!data.events) return [];
    return Object.values(data.events).sort((a, b) => b.timestamp - a.timestamp);
  }, [data.events]);

  const activeRound: Round | undefined = useMemo(() => {
    return rounds[status.activeRoundId] || Object.values(rounds)[0];
  }, [rounds, status.activeRoundId]);

  const currentQuestion: Question | undefined = useMemo(() => {
    if (!activeRound || !activeRound.questions) return undefined;
    return activeRound.questions[status.currentQuestionIndex] || activeRound.questions[0];
  }, [activeRound, status.currentQuestionIndex]);

  const teamsList: Team[] = useMemo(() => {
    return Object.values(teams);
  }, [teams]);

  // Award points with built-in double-click debounce protection
  const awardPoints = useCallback(async (teamId: string, customPoints?: number) => {
    if (isScoringBusy[teamId]) return;
    
    setIsScoringBusy((prev) => ({ ...prev, [teamId]: true }));
    const pointsToAdd = customPoints ?? (currentQuestion?.points || 1);
    const targetTeam = teams[teamId];
    const teamName = targetTeam ? targetTeam.name : teamId;

    try {
      await updateTeamScore(
        teamId, 
        pointsToAdd, 
        `+${pointsToAdd} pts to ${teamName} (Round: ${activeRound?.title || 'General'}, Q${(status.currentQuestionIndex + 1)})`
      );
    } catch (err) {
      console.error('Error awarding points:', err);
    } finally {
      // Small cooldown to prevent accidental double-tap on touchscreens or rapid double-clicks
      setTimeout(() => {
        setIsScoringBusy((prev) => ({ ...prev, [teamId]: false }));
      }, 400);
    }
  }, [isScoringBusy, currentQuestion, teams, activeRound, status.currentQuestionIndex]);

  const changeScoreDirect = useCallback(async (teamId: string, newScore: number) => {
    await setTeamScore(teamId, newScore);
  }, []);

  const nextQuestion = useCallback(async () => {
    if (!activeRound) return;
    const nextIdx = Math.min(activeRound.questions.length - 1, status.currentQuestionIndex + 1);
    await setCurrentQuestion(nextIdx);
  }, [activeRound, status.currentQuestionIndex]);

  const prevQuestion = useCallback(async () => {
    const prevIdx = Math.max(0, status.currentQuestionIndex - 1);
    await setCurrentQuestion(prevIdx);
  }, [status.currentQuestionIndex]);

  const selectQuestion = useCallback(async (index: number) => {
    await setCurrentQuestion(index);
  }, []);

  const selectRound = useCallback(async (roundId: string) => {
    await setActiveRound(roundId);
  }, []);

  const toggleQuestion = useCallback(async () => {
    await toggleShowQuestion(!status.showQuestion);
  }, [status.showQuestion]);

  const changeDisplayMode = useCallback(async (mode: DisplayMode) => {
    await setDisplayMode(mode);
  }, []);

  const setQuizStatusState = useCallback(async (state: QuizState) => {
    await updateQuizStatus({ state });
  }, []);

  const resetScores = useCallback(async () => {
    await resetAllScores();
  }, []);

  const resetAll = useCallback(async () => {
    await resetEntireCompetition();
  }, []);

  const addTeam = useCallback(async (team: Team) => {
    await dbAddTeam(team);
  }, []);

  const removeTeam = useCallback(async (teamId: string) => {
    await dbRemoveTeam(teamId);
  }, []);

  const markQuestionAnswered = useCallback(async (roundId: string, questionId: string) => {
    await dbMarkQuestionAnswered(roundId, questionId);
  }, []);

  const selectAnsweringTeam = useCallback(async (teamId: string | undefined) => {
    await updateQuizStatus({ selectedAnsweringTeamId: teamId });
  }, []);

  return {
    data,
    status,
    teams,
    teamsList,
    rounds,
    activeRound,
    currentQuestion,
    eventsList,
    loading,
    error,
    isScoringBusy,
    awardPoints,
    changeScoreDirect,
    nextQuestion,
    prevQuestion,
    selectQuestion,
    selectRound,
    toggleQuestion,
    changeDisplayMode,
    setQuizStatusState,
    resetScores,
    resetAll,
    addTeam,
    removeTeam,
    markQuestionAnswered,
    selectAnsweringTeam,
  };
}
