import { createContext, useContext, useReducer, useCallback, useMemo, createElement } from 'react';

export const SCREENS = [
  'HOME',
  'YEAR_SELECT',
  'PRACTICAL_SELECT',
  'ROADMAP',
  'MICROGAME',
  'STEP_RESULT',
  'PRACTICAL_RESULT',
];

export const MICROGAME_STATES = ['IDLE', 'INSTRUCTION', 'ACTIVE', 'EVALUATING', 'SUCCESS', 'FAILURE', 'RESULT'];

// A practical is a list of CHECKPOINTS (roadmap nodes); each checkpoint runs
// a small internal sequence of SUB-STEPS as one continuous scene (no
// roadmap round-trip between them). GameState tracks both levels.
const initialState = {
  screen: 'HOME',
  year: null,
  practicalId: null,
  checkpointIndex: 0,
  subStepIndex: 0,
  microgameState: 'IDLE',
  subStepResults: [], // results for the CURRENT checkpoint's sub-steps only; reset per checkpoint
  totalScore: 0,
  mistakes: 0,
  score: 0, // live gamification score (Prompt 3) — separate from totalScore, which is the medal-bearing checkpoint average
  streak: 0, // consecutive correct actions; resets to 0 on any miss
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_YEAR':
      return { ...state, year: action.year };
    case 'SET_PRACTICAL':
      return {
        ...state,
        practicalId: action.practicalId,
        checkpointIndex: action.checkpointIndex ?? 0,
        subStepIndex: 0,
        subStepResults: [],
        totalScore: 0,
        mistakes: 0,
        score: 0,
        streak: 0,
        microgameState: 'IDLE',
      };
    case 'SET_CHECKPOINT_INDEX':
      return { ...state, checkpointIndex: action.checkpointIndex, subStepIndex: 0, subStepResults: [], microgameState: 'IDLE' };
    case 'SET_SUBSTEP_INDEX':
      return { ...state, subStepIndex: action.subStepIndex, microgameState: 'IDLE' };
    case 'SET_MICROGAME_STATE':
      return { ...state, microgameState: action.microgameState };
    case 'ADD_SUBSTEP_RESULT': {
      const subStepResults = [...state.subStepResults];
      subStepResults[action.subStepIndex] = action.result;
      return {
        ...state,
        subStepResults,
        totalScore: state.totalScore + (action.result.score ?? 0),
        mistakes: state.mistakes + (action.result.mistakes || 0),
      };
    }
    case 'RESET_PRACTICAL':
      return { ...state, checkpointIndex: 0, subStepIndex: 0, subStepResults: [], totalScore: 0, mistakes: 0, score: 0, streak: 0, microgameState: 'IDLE' };
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.amount };
    case 'BUMP_STREAK':
      return { ...state, streak: state.streak + 1 };
    case 'RESET_STREAK':
      return state.streak === 0 ? state : { ...state, streak: 0 };
    default:
      return state;
  }
}

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      setScreen: (screen) => dispatch({ type: 'SET_SCREEN', screen }),
      setYear: (year) => dispatch({ type: 'SET_YEAR', year }),
      setPractical: (practicalId, checkpointIndex) => dispatch({ type: 'SET_PRACTICAL', practicalId, checkpointIndex }),
      setCheckpointIndex: (checkpointIndex) => dispatch({ type: 'SET_CHECKPOINT_INDEX', checkpointIndex }),
      setSubStepIndex: (subStepIndex) => dispatch({ type: 'SET_SUBSTEP_INDEX', subStepIndex }),
      setMicrogameState: (microgameState) => dispatch({ type: 'SET_MICROGAME_STATE', microgameState }),
      addSubStepResult: (subStepIndex, result) => dispatch({ type: 'ADD_SUBSTEP_RESULT', subStepIndex, result }),
      resetPractical: () => dispatch({ type: 'RESET_PRACTICAL' }),
      addScore: (amount) => amount && dispatch({ type: 'ADD_SCORE', amount }),
      bumpStreak: () => dispatch({ type: 'BUMP_STREAK' }),
      resetStreak: () => dispatch({ type: 'RESET_STREAK' }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return createElement(GameStateContext.Provider, { value }, children);
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within a GameStateProvider');
  return ctx;
}

// Small helper for code that needs a stable callback to sync GameState.screen
// with whatever the router currently shows, without re-subscribing every render.
export function useSyncScreen(screen) {
  const { actions } = useGameState();
  const setScreen = actions.setScreen;
  return useCallback(() => setScreen(screen), [setScreen, screen]);
}
