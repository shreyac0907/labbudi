import { useState, useCallback, useRef, useEffect } from 'react';
import { usePressHold } from '../engine/InputManager';
import { GlossyBottle, GlossyDropper, WarmZone } from './shared/LabGraphics';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';

const HOLD_MS = 400; // Section 2.5 / Fix 4 — forgiving, lowered from a stricter draw duration
const MIN_PARTIAL_MS = 300; // release before this and the draw doesn't even count as a genuine attempt

// Step A1 — the pipette's own microgame, split out from the carry+squeeze
// step it used to be bundled into: hold the bulb, watch the indicator rise
// into the glass body. This is the physical-metaphor beat (Section 2.1) —
// once the dropper is loaded, SqueezeGame picks up from here and never
// re-draws from the bottle.
export default function PipetteDrawGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { indicatorLabel = 'Universal Indicator', neutralColor = '#A6D7A8', introLine, timeLimit = 12 } = parameters;

  const [fillLevel, setFillLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [compressed, setCompressed] = useState(false);
  const [bright, setBright] = useState(false);
  const [done, setDone] = useState(false);

  const sceneRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const holdStartRef = useRef(0);

  useEffect(() => {
    if (introLine) onFeedback?.(introLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  const { onPointerDown } = usePressHold({
    durationMs: HOLD_MS,
    onProgress: (p) => {
      if (!holdStartRef.current) holdStartRef.current = Date.now();
      setBright(true);
      setCompressed(true);
      setProgress(p);
      setFillLevel(p * 0.55);
    },
    onComplete: () => {
      setCompressed(false);
      setProgress(0);
      setDone(true);
      setFillLevel(0.55);
      onFeedback?.(t('game.pipette_full'));
      setTimeout(finish, 900);
    },
    onRelease: () => {
      const held = Date.now() - (holdStartRef.current || Date.now());
      holdStartRef.current = 0;
      setCompressed(false);
      setBright(false);
      setProgress(0);
      if (held < MIN_PARTIAL_MS) {
        setFillLevel(0.2);
        onFeedback?.(t('game.pipette_hold_longer'), 'wrong');
        setTimeout(() => setFillLevel(0), 700);
      } else {
        setFillLevel(0);
      }
    },
  });

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Bottle — large and centred, top 30% of canvas, clearly the focus */}
      <div style={{ position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <GlossyBottle width={80} liquidColor={neutralColor} />
        <div style={{ width: 60, height: 12, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', filter: 'blur(2px)' }} />
        <div
          style={{
            marginTop: 2,
            padding: '3px 12px',
            background: '#FBF6EA',
            border: '1px solid #E0D4B8',
            borderRadius: 4,
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-dark)',
          }}
        >
          {tv(indicatorLabel)}
        </div>
      </div>

      {/* Pipette — tip sits inside the bottle neck, bulb is the interaction zone */}
      <div style={{ position: 'absolute', left: '50%', top: '8%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <WarmZone width={72} height={72} bright={bright} visible={!done} />
          <div
            onPointerDown={!done ? onPointerDown : undefined}
            style={{ position: 'absolute', top: -14, left: -14, width: 88, height: 88, cursor: done ? 'default' : 'pointer', touchAction: 'none' }}
          />
          <GlossyDropper width={50} fillColor={neutralColor} fillLevel={fillLevel} compressed={compressed} />
          {compressed && (
            <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: -14, left: -9, pointerEvents: 'none' }}>
              <circle
                cx="34"
                cy="34"
                r="26"
                fill="none"
                stroke="#E8A020"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - progress)}
                strokeLinecap="round"
                transform="rotate(-90 34 34)"
              />
            </svg>
          )}
        </div>
      </div>

      <PipHand containerRef={sceneRef} state={compressed ? 'grip' : 'open'} active={!done} />

    </div>
  );
}
