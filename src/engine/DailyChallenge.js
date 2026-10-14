// Per-practical high score, persisted in localStorage — powers the "Daily
// Challenge: beat your best score!" variant (Prompt 3). Deliberately NOT
// part of GameState: it's read-only for the whole run (only written once,
// at the very end, from PracticalResultScreen), so every screen can just
// read it fresh from localStorage rather than threading it through state.
const KEY_PREFIX = 'labbudi_highscore_';

export function getHighScore(practicalId) {
  if (!practicalId) return null;
  try {
    const v = localStorage.getItem(KEY_PREFIX + practicalId);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

export function setHighScoreIfBeaten(practicalId, score) {
  if (!practicalId) return { beaten: false, prevBest: null };
  const prevBest = getHighScore(practicalId);
  const beaten = prevBest === null || score > prevBest;
  if (beaten) {
    try {
      localStorage.setItem(KEY_PREFIX + practicalId, String(score));
    } catch {
      // storage unavailable (private browsing, quota) — challenge just won't persist
    }
  }
  return { beaten, prevBest };
}
