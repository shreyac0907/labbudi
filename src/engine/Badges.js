// One-off achievement badges (Prompt 3's "CIRCUIT MASTER" and similar),
// persisted in localStorage so PracticalResultScreen can show them even
// though they're earned mid-practical, well before the result screen
// itself mounts. Same reasoning as DailyChallenge.js — read-only for the
// rest of the run once earned.
const KEY_PREFIX = 'labbudi_badge_';

// Display metadata for every badge that can be earned. Add an entry here
// whenever a new badge-earning moment is built — PracticalResultScreen
// renders whichever of these localStorage confirms were actually earned.
// labelKey points at the locale files (this is a plain module-level
// object, not a component, so it can't call t() itself) — the screen that
// renders these resolves the key with its own useTranslation() hook.
export const BADGE_DEFS = {
  circuit_master: { labelKey: 'ui.circuit_master' },
  master_chemist: { labelKey: 'ui.master_chemist' },
};

export function getEarnedBadges(practicalId) {
  return Object.keys(BADGE_DEFS).filter((id) => hasBadge(practicalId, id));
}

export function earnBadge(practicalId, badgeId) {
  if (!practicalId || !badgeId) return;
  try {
    localStorage.setItem(`${KEY_PREFIX}${practicalId}_${badgeId}`, '1');
  } catch {
    // storage unavailable — badge just won't persist to the result screen
  }
}

export function hasBadge(practicalId, badgeId) {
  if (!practicalId || !badgeId) return false;
  try {
    return localStorage.getItem(`${KEY_PREFIX}${practicalId}_${badgeId}`) === '1';
  } catch {
    return false;
  }
}
