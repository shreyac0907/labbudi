// The central controller. Loads practical data, tracks the current
// checkpoint and the sub-step within it, receives sub-step results,
// advances the student, and aggregates each checkpoint's score. Screens
// drive the UI; this hook is the single place that knows how a practical
// actually progresses.
//
// Two levels: CHECKPOINTS are what the roadmap shows and what gets saved.
// SUB-STEPS run inside a checkpoint as one continuous scene — advancing
// between them never leaves the current screen or touches SaveManager.

import { useCallback, useMemo } from 'react';
import { getPractical } from '../data/practicals';
import EvaluationEngine from './EvaluationEngine';
import SaveManager from './SaveManager';
import { useGameState } from './GameState';

export function usePracticalEngine(practicalId) {
  const { state, actions } = useGameState();

  const practical = useMemo(() => getPractical(practicalId), [practicalId]);
  const checkpoints = practical?.checkpoints ?? [];
  const totalCheckpoints = checkpoints.length;

  const sameId = state.practicalId === practicalId;
  const checkpointIndex = sameId ? state.checkpointIndex : 0;
  const subStepIndex = sameId ? state.subStepIndex : 0;
  const subStepResults = sameId ? state.subStepResults : [];

  const currentCheckpoint = checkpoints[checkpointIndex] ?? null;
  const subSteps = currentCheckpoint?.subSteps ?? [];
  const currentSubStep = subSteps[subStepIndex] ?? null;
  const isLastSubStep = subStepIndex === subSteps.length - 1;
  const isLastCheckpoint = checkpointIndex === totalCheckpoints - 1;

  const loadPractical = useCallback(
    (startAtCheckpoint = 0) => {
      actions.setPractical(practicalId, startAtCheckpoint);
    },
    [actions, practicalId],
  );

  const advanceSubStep = useCallback(() => {
    actions.setSubStepIndex(subStepIndex + 1);
  }, [actions, subStepIndex]);

  // Jump to any sub-step of the current checkpoint (the step strip's flowers use
  // this to go back to a step the student wants to redo).
  const goToSubStep = useCallback(
    (index) => {
      actions.setSubStepIndex(Math.max(0, Math.min(index, subSteps.length - 1)));
    },
    [actions, subSteps.length],
  );

  // Called once per sub-step, after its microgame evaluates. Returns
  // { result, checkpointDone, isLastCheckpoint } — checkpointDone is true
  // once every sub-step in the current checkpoint has reported in, at
  // which point the checkpoint's aggregate score is computed and saved.
  const submitSubStepResult = useCallback(
    (rawResult) => {
      if (!currentCheckpoint) return null;
      const result = EvaluationEngine.buildResult(rawResult);
      actions.addSubStepResult(subStepIndex, result);

      if (!isLastSubStep) {
        return { result, checkpointDone: false };
      }

      // Aggregate this checkpoint's score from all its sub-step results.
      const allResults = [...subStepResults];
      allResults[subStepIndex] = result;
      const scores = allResults.filter(Boolean).map((r) => r.score);
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const checkpointResult = EvaluationEngine.buildResult({ score: avgScore, mistakes: 0 });

      const existing = SaveManager.load(practicalId);
      const completedCheckpoints = Array.from(new Set([...(existing?.completedCheckpoints ?? []), checkpointIndex]));
      const checkpointResults = [...(existing?.checkpointResults ?? [])];
      checkpointResults[checkpointIndex] = checkpointResult;
      const totalScore = checkpointResults.reduce((sum, r) => sum + (r?.score ?? 0), 0);
      const medalRank = { none: 0, bronze: 1, silver: 2, gold: 3 };
      const bestMedal =
        medalRank[checkpointResult.medal] > medalRank[existing?.bestMedal ?? 'none'] ? checkpointResult.medal : existing?.bestMedal ?? 'none';

      SaveManager.save(practicalId, {
        completedCheckpoints,
        checkpointResults,
        totalScore,
        bestMedal,
        completed: isLastCheckpoint,
      });

      return { result: checkpointResult, checkpointDone: true, isLastCheckpoint, completedCheckpoints };
    },
    [currentCheckpoint, actions, subStepIndex, isLastSubStep, subStepResults, practicalId, checkpointIndex, isLastCheckpoint],
  );

  const goToCheckpoint = useCallback(
    (index) => {
      actions.setCheckpointIndex(Math.max(0, Math.min(index, totalCheckpoints - 1)));
    },
    [actions, totalCheckpoints],
  );

  return {
    practical,
    checkpoints,
    currentCheckpoint,
    currentSubStep,
    subSteps,
    checkpointIndex,
    subStepIndex,
    totalCheckpoints,
    isLastSubStep,
    isLastCheckpoint,
    loadPractical,
    advanceSubStep,
    goToSubStep,
    subStepResults,
    submitSubStepResult,
    goToCheckpoint,
  };
}

export default { usePracticalEngine };
