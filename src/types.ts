export type QuizState = 
  | 'IDLE' 
  | 'READY' 
  | 'QUESTION_ACTIVE' 
  | 'PAUSED' 
  | 'ROUND_COMPLETE' 
  | 'QUIZ_COMPLETE';

export type DisplayMode = 'QUESTION' | 'LEADERBOARD' | 'WELCOME' | 'GRID';

export type QuestionType = 
  | 'text' 
  | 'image' 
  | 'audio' 
  | 'video' 
  | 'guessing' 
  | 'multiple-choice' 
  | 'rapid-fire';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  score: number;
  color: string; // Tailwind color token or hex
  accentBg: string;
  accentBorder: string;
  accentText: string;
  logoUrl?: string;
  rank?: number;
}

export interface Question {
  id: string;
  roundId: string;
  number: number;
  question: string;
  answer?: string; // Revealed to admin only
  type: QuestionType;
  points: number;
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    caption?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface Round {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  defaultPoints: number;
  totalQuestions: number;
  questions: Question[];
}

export interface QuizStatus {
  state: QuizState;
  activeRoundId: string;
  currentQuestionIndex: number;
  showQuestion: boolean;
  displayMode: DisplayMode;
  competitionName: string;
  updatedAt: number;
  lastScoredTeamId?: string;
  selectedAnsweringTeamId?: string;
}

export interface QuizEvent {
  id: string;
  timestamp: number;
  type: 'POINT_AWARDED' | 'QUESTION_CHANGED' | 'ROUND_CHANGED' | 'STATE_CHANGED' | 'DISPLAY_MODE_CHANGED' | 'RESET';
  teamId?: string;
  teamName?: string;
  points?: number;
  description: string;
  roundId?: string;
  questionNumber?: number;
}

export interface QuizData {
  status: QuizStatus;
  teams: Record<string, Team>;
  rounds: Record<string, Round>;
  events?: Record<string, QuizEvent>;
  answeredQuestions?: Record<string, string[]>; // roundId -> array of question IDs
}
