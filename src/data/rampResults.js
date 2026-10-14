import { screenFiveResultsKey, screenFiveProgressKey, screenFiveCompleteKey } from './practicalStorage';

export const ANGLES = [0, 15, 30, 45, 60];

// F = 5 x sin(angle), rounded to the values quoted in the practical brief.
export const FORCE_AT_ANGLE = {
  0: 0.0,
  15: 1.3,
  30: 2.5,
  45: 3.5,
  60: 4.3,
};

export const FORCE_MAX = 5.0;
export const TOTAL_READINGS = ANGLES.length;

export const rampResultsKey = screenFiveResultsKey;
export const rampProgressKey = screenFiveProgressKey;
export const rampCompleteKey = screenFiveCompleteKey;
