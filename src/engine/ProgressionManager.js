// Reads SaveManager and answers questions about what's unlocked, locked,
// completed, and what medal was earned — pure functions, no React.
// Operates at CHECKPOINT granularity (roadmap nodes), not individual
// sub-steps — sub-step progress only exists live inside GameState while a
// checkpoint is in progress.

import SaveManager from './SaveManager';

function getCompletedCheckpoints(practicalId) {
  return SaveManager.load(practicalId)?.completedCheckpoints ?? [];
}

function isCheckpointCompleted(practicalId, checkpointIndex) {
  return getCompletedCheckpoints(practicalId).includes(checkpointIndex);
}

// A checkpoint is playable if it's already completed (replay) or it's the
// very next one after the highest completed checkpoint. Everything further
// ahead is locked.
function isCheckpointLocked(practicalId, checkpointIndex) {
  if (checkpointIndex === 0) return false;
  const completed = getCompletedCheckpoints(practicalId);
  if (completed.includes(checkpointIndex)) return false;
  const highestCompleted = completed.length ? Math.max(...completed) : -1;
  return checkpointIndex > highestCompleted + 1;
}

function getBestMedal(practicalId) {
  return SaveManager.load(practicalId)?.bestMedal ?? 'none';
}

function isPracticalComplete(practicalId) {
  return !!SaveManager.load(practicalId)?.completed;
}

function getNextIncompleteCheckpoint(practicalId, totalCheckpoints) {
  const completed = getCompletedCheckpoints(practicalId);
  for (let i = 0; i < totalCheckpoints; i += 1) {
    if (!completed.includes(i)) return i;
  }
  return Math.max(0, totalCheckpoints - 1);
}

function getCheckpointResults(practicalId) {
  return SaveManager.load(practicalId)?.checkpointResults ?? [];
}

const ProgressionManager = {
  getCompletedCheckpoints,
  isCheckpointCompleted,
  isCheckpointLocked,
  getBestMedal,
  isPracticalComplete,
  getNextIncompleteCheckpoint,
  getCheckpointResults,
};

export default ProgressionManager;
export {
  getCompletedCheckpoints,
  isCheckpointCompleted,
  isCheckpointLocked,
  getBestMedal,
  isPracticalComplete,
  getNextIncompleteCheckpoint,
  getCheckpointResults,
};
