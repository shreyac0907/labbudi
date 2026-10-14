// Shared localStorage key builders for any practical's Screen 5 (Wet Lab) —
// used by wetLabResults.js (P1) and every new practical's results data file.
export function screenFiveResultsKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_results`;
}

export function screenFiveProgressKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_wetlab_progress`;
}

export function screenFiveCompleteKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_wetlab_complete`;
}
