import { QuizData, Team, Round, Question } from '../types';
import { generalQuestions } from './generalQuestions';

export const INITIAL_TEAMS: Record<string, Team> = {};

const generateDummyQuestions = (roundId: string, count: number): Question[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${roundId}-${i + 1}`,
    roundId,
    number: i + 1,
    question: `Placeholder question ${i + 1} for ${roundId}`,
    answer: `Placeholder answer ${i + 1}`,
    type: 'text',
    points: 10,
  }));
};

export const INITIAL_ROUNDS: Record<string, Round> = {
  general: {
    id: 'general',
    title: 'General Round',
    subtitle: 'Core Knowledge & Science',
    description: 'Direct verbal questions.',
    order: 1,
    defaultPoints: 10,
    totalQuestions: 50,
    questions: generalQuestions,
  },
  guessing: {
    id: 'guessing',
    title: 'Guessing Round',
    subtitle: 'Clue Deduction',
    description: 'Progressive clues.',
    order: 2,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('guessing', 10),
  },
  multimedia: {
    id: 'multimedia',
    title: 'Audio Visual / Musical Round',
    subtitle: 'Observation',
    description: 'Visual and Audio clues.',
    order: 3,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('multimedia', 10),
  },
  audience: {
    id: 'audience',
    title: 'Audience Round',
    subtitle: 'Crowd Interaction',
    description: 'Questions for the audience.',
    order: 4,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('audience', 10),
  },
  memory: {
    id: 'memory',
    title: 'Memory Round',
    subtitle: 'Recall and retain',
    description: 'Test the memory of the participants.',
    order: 5,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('memory', 10),
  },
  buzzer: {
    id: 'buzzer',
    title: 'Buzzer Round',
    subtitle: 'Speed and Accuracy',
    description: 'First to hit the buzzer answers.',
    order: 6,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('buzzer', 10),
  },
  rapidfire: {
    id: 'rapidfire',
    title: 'Rapid Fire Round',
    subtitle: 'Quick thinking',
    description: 'As many questions as possible in a short time.',
    order: 7,
    defaultPoints: 10,
    totalQuestions: 10,
    questions: generateDummyQuestions('rapidfire', 10),
  }
};

export const INITIAL_QUIZ_DATA: QuizData = {
  status: {
    state: 'READY',
    activeRoundId: 'general',
    currentQuestionIndex: 0,
    showQuestion: true,
    displayMode: 'GRID', // Default to grid
    competitionName: 'QUIZ COMPETITION',
    updatedAt: Date.now(),
  },
  teams: INITIAL_TEAMS,
  rounds: INITIAL_ROUNDS,
  answeredQuestions: {}, // Initially no questions answered
  events: {
    'init-event': {
      id: 'init-event',
      timestamp: Date.now(),
      type: 'STATE_CHANGED',
      description: 'Competition initialized',
    },
  },
};
