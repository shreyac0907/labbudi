// Turns raw per-step performance numbers into the structured result shape
// every microgame and screen in the app agrees on.

export const MEDAL_THRESHOLDS = { gold: 90, silver: 70, bronze: 50 };

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function medalForScore(score) {
  if (score >= MEDAL_THRESHOLDS.gold) return 'gold';
  if (score >= MEDAL_THRESHOLDS.silver) return 'silver';
  if (score >= MEDAL_THRESHOLDS.bronze) return 'bronze';
  return 'none';
}

// Microgames each compute `score` (0-100) with their own formula (see the
// individual microgame files) and pass it here along with the raw factors
// that produced it, purely for display/debugging. This function's only real
// job is to clamp the score and attach the medal.
export function buildResult({ accuracy = 0, timing = 0, completion = 1, mistakes = 0, score }) {
  const a = clamp01(accuracy);
  const t = clamp01(timing);
  const c = clamp01(completion);
  const computedScore = typeof score === 'number' ? score : Math.round((a * 0.7 + t * 0.3) * 100);
  const finalScore = Math.max(0, Math.min(100, Math.round(computedScore)));
  return {
    accuracy: a,
    timing: t,
    completion: c,
    mistakes,
    score: finalScore,
    medal: medalForScore(finalScore),
  };
}

const EvaluationEngine = { medalForScore, buildResult, MEDAL_THRESHOLDS };

export default EvaluationEngine;
