import { useEffect, useState } from 'react';
import { isGuideFreeStep } from '../utils/stepKinds';

// Shared layout constants for the ribbon banner (top) / step strip (bottom)
// chrome, so CheckpointScreen and MicrogameRenderer agree on how much
// vertical space to reserve without importing from each other.
export const TOP_BANNER_CLEARANCE = 124; // ribbon banner height + landing bounce room
export const BOTTOM_STRIP_HEIGHT = 80; // StepStrip height

// The character guide (Pip / Madu / Lili / Lumi with the tip bubble) lives in a
// reserved column down the left of every step's canvas, so it never covers the
// game. The canvas starts to the right of this column; the bench and desk
// backdrops use the same offset so their art lines up with the game's own
// percentage coordinates. Every step type gets the column; only small screens do not.
export const CANVAS_LEFT = 48;
export const GUIDE_TOP = 214; // where the tip bubble starts: below the Back button and the cloud
const GUIDE_MIN_VIEWPORT = 960;
export const NO_GUIDE_TYPES = new Set([]);

export function guideWidthFor(viewportWidth) {
  if (viewportWidth < GUIDE_MIN_VIEWPORT) return 0;
  return Math.round(Math.max(240, Math.min(320, viewportWidth * 0.22)));
}

// Width in px of the guide column for a step (0 when there is none: the understand slides
// and small screens).
export function useGuideWidth(step) {
  const [w, setW] = useState(() => guideWidthFor(window.innerWidth));
  useEffect(() => {
    const onResize = () => setW(guideWidthFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return !step || NO_GUIDE_TYPES.has(step.type) || isGuideFreeStep(step) ? 0 : w;
}
