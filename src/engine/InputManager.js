// Abstracts mouse + touch into unified gesture hooks built on the Pointer
// Events API, so microgames never touch raw mouse/touch events directly.
// Emits (conceptually): TAP | DRAG | SWIPE | HOLD | CIRCULAR | SQUEEZE | RELEASE

import { useCallback, useRef } from 'react';

export function getPoint(e) {
  return { x: e.clientX, y: e.clientY };
}

// DRAG — an element follows the pointer from pointerdown until release.
export function usePointerDrag({ onStart, onMove, onEnd } = {}) {
  const activeRef = useRef(false);

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      activeRef.current = true;
      onStart?.(getPoint(e), e);

      function move(ev) {
        if (!activeRef.current) return;
        onMove?.(getPoint(ev), ev);
      }
      function up(ev) {
        if (!activeRef.current) return;
        activeRef.current = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        onEnd?.(getPoint(ev), ev);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [onStart, onMove, onEnd],
  );

  return { onPointerDown };
}

// HOLD / SQUEEZE — press and hold for durationMs, reports progress 0-1 as
// it goes, fires onComplete when the hold is satisfied, or onRelease if
// the pointer lifts before that.
//
// The progress callback is driven by requestAnimationFrame for a smooth
// ring/arc animation, but rAF is throttled to zero on some backgrounded or
// low-power tabs — so completion is ALSO checked authoritatively against
// wall-clock time in the pointerup handler. That way core game logic
// (was the hold actually long enough?) never depends on animation frames
// having been granted at all, only the cosmetic progress display does.
export function usePressHold({ durationMs = 600, onProgress, onComplete, onRelease } = {}) {
  const startRef = useRef(0);
  const rafRef = useRef(null);
  const holdingRef = useRef(false);
  const firedRef = useRef(false);

  const stop = useCallback(() => {
    holdingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const complete = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    stop();
    onComplete?.();
  }, [stop, onComplete]);

  const tick = useCallback(() => {
    if (!holdingRef.current) return;
    const elapsed = Date.now() - startRef.current;
    const progress = Math.min(1, elapsed / durationMs);
    onProgress?.(progress);
    if (progress >= 1) {
      complete();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, onProgress, complete]);

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      holdingRef.current = true;
      firedRef.current = false;
      startRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);

      function up() {
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        const wasHolding = holdingRef.current;
        const elapsed = Date.now() - startRef.current;
        stop();
        if (!wasHolding) return;
        if (elapsed >= durationMs) {
          complete();
        } else {
          onRelease?.();
        }
      }
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [tick, stop, onRelease, durationMs, complete],
  );

  return { onPointerDown, cancel: stop };
}

// TAP — simple click/tap detection (already unified by the browser for
// pointer-derived click events).
export function useTap(onTap) {
  return {
    onClick: (e) => onTap?.(e),
  };
}

// SWIPE — pointerdown + move past a distance threshold in a dominant axis.
export function useSwipe({ threshold = 40, onSwipe } = {}) {
  const startRef = useRef(null);

  const onPointerDown = useCallback((e) => {
    startRef.current = getPoint(e);
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (!startRef.current) return;
      const end = getPoint(e);
      const dx = end.x - startRef.current.x;
      const dy = end.y - startRef.current.y;
      startRef.current = null;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      const direction =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      onSwipe?.(direction, { dx, dy });
    },
    [threshold, onSwipe],
  );

  return { onPointerDown, onPointerUp };
}

// CIRCULAR — pointer move angle tracked around a centre point, useful for
// dial/wheel style microgames. Pass `getCenter: () => ({x, y})` to measure
// the centre fresh at the moment a drag starts (e.g. via
// getBoundingClientRect()) — a plain `center` value only reflects whatever
// it was at the component's last render, which goes stale if it's derived
// from a ref mutation that doesn't itself trigger a re-render.
export function useCircularDrag({ center, getCenter, onAngleChange } = {}) {
  const activeRef = useRef(false);
  const centerRef = useRef(center);

  const angleAt = useCallback((point) => {
    const c = centerRef.current;
    if (!c) return 0;
    return (Math.atan2(point.y - c.y, point.x - c.x) * 180) / Math.PI;
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      centerRef.current = getCenter ? getCenter() : center;
      activeRef.current = true;
      function move(ev) {
        if (!activeRef.current) return;
        onAngleChange?.(angleAt(getPoint(ev)));
      }
      function up() {
        activeRef.current = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      onAngleChange?.(angleAt(getPoint(e)));
    },
    [angleAt, onAngleChange, center, getCenter],
  );

  return { onPointerDown };
}

const InputManager = { getPoint, usePointerDrag, usePressHold, useTap, useSwipe, useCircularDrag };

export default InputManager;
