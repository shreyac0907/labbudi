// Reads and writes practical progress to localStorage.
// Save key pattern: labbudi_save_[practicalId]

const SAVE_PREFIX = 'labbudi_save_';

function saveKey(practicalId) {
  return `${SAVE_PREFIX}${practicalId}`;
}

// Save is checkpoint-granular: completedCheckpoints holds indices of fully
// finished checkpoints, checkpointResults holds each checkpoint's
// aggregated {score, medal} (this is what the roadmap node displays — the
// individual sub-step results inside a checkpoint aren't persisted, only
// used live while that checkpoint is in progress).
function save(practicalId, partial) {
  const existing = load(practicalId);
  const record = {
    practicalId,
    completedCheckpoints: partial.completedCheckpoints ?? existing?.completedCheckpoints ?? [],
    checkpointResults: partial.checkpointResults ?? existing?.checkpointResults ?? [],
    totalScore: partial.totalScore ?? existing?.totalScore ?? 0,
    bestMedal: partial.bestMedal ?? existing?.bestMedal ?? 'none',
    completed: partial.completed ?? existing?.completed ?? false,
    lastSaved: Date.now(),
  };
  localStorage.setItem(saveKey(practicalId), JSON.stringify(record));
  return record;
}

function load(practicalId) {
  const raw = localStorage.getItem(saveKey(practicalId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clear(practicalId) {
  localStorage.removeItem(saveKey(practicalId));
}

function hasProgress(practicalId) {
  return load(practicalId) !== null;
}

const SaveManager = { save, load, clear, hasProgress, saveKey };

export default SaveManager;
export { save, load, clear, hasProgress, saveKey };
