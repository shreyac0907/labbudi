import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePressHold } from '../engine/InputManager';
import { GlossyTestTube, SOLUTION_TINT, WarmZone } from './shared/LabGraphics';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';

const RED = '#E53935';
const LOWER_MS = 600; // paper dips into the tube
const HOLD_MS = 1000; // held submerged
const TOTAL_MS = LOWER_MS + HOLD_MS;
const RAISE_MS = 600; // paper lifts back out, colour reveals as it rises

// Sub-Practical B — no bottle, no dropper: Pip holds a strip of red litmus
// paper above each tube. The student presses and holds to dip it in, holds
// it submerged, then the paper lifts back out on its own — the colour
// change sweeping up the paper as it clears the liquid, which is the
// physical-metaphor beat (Section 2.1) here rather than a separate
// "wait" step (Section-wide: no blank timer screens).
export default function LitmusGame({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { tubes, timeLimit = 40 } = parameters;

  const [index, setIndex] = useState(0);
  const [lowerProgress, setLowerProgress] = useState(0); // 0-1, dipping in
  const [holdProgress, setHoldProgress] = useState(0); // 0-1, submerged hold
  const [phase, setPhase] = useState('above'); // above | dipping | lifting | result
  const [liftReveal, setLiftReveal] = useState(0); // 0-1, colour sweep while lifting
  const [finalColors, setFinalColors] = useState([]);
  const [summary, setSummary] = useState(false);

  const sceneRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  const advance = useCallback(() => {
    if (index + 1 >= tubes.length) {
      setSummary(true);
      setTimeout(finish, 1600);
      return;
    }
    setIndex((i) => i + 1);
    setPhase('above');
    setLowerProgress(0);
    setHoldProgress(0);
    setLiftReveal(0);
  }, [index, tubes.length, finish]);

  const raise = useCallback(() => {
    const tube = tubes[index];
    setPhase('lifting');
    const start = Date.now();
    function tick() {
      const t = Math.min(1, (Date.now() - start) / RAISE_MS);
      setLiftReveal(t);
      setLowerProgress(1 - t);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setPhase('result');
        setFinalColors((prev) => [...prev, tube.resultColor]);
        onFeedback?.(tube.note);
        setTimeout(advance, 1500);
      }
    }
    requestAnimationFrame(tick);
  }, [index, tubes, onFeedback, advance]);

  const { onPointerDown } = usePressHold({
    durationMs: TOTAL_MS,
    onProgress: (p) => {
      setPhase('dipping');
      const elapsedMs = p * TOTAL_MS;
      setLowerProgress(Math.min(1, elapsedMs / LOWER_MS));
      setHoldProgress(Math.max(0, Math.min(1, (elapsedMs - LOWER_MS) / HOLD_MS)));
    },
    onComplete: raise,
    onRelease: () => {
      if (phase === 'dipping') {
        setPhase('above');
        setLowerProgress(0);
        setHoldProgress(0);
        onFeedback?.(t('game.litmus_hold'), 'wrong');
      }
    },
  });

  const activeTube = tubes[index];

  // the how-to line lives in the instruction bar, not over the scene
  const hintText = summary ? null : phase === 'above' ? t('game.litmus_hint_above') : t('game.litmus_testing', { tube: tv(activeTube.label) });
  useEffect(() => {
    onHint?.(hintText);
  }, [hintText, onHint]);

  if (summary) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 28 }}>
          {tubes.map((tube, i) => (
            <div key={tube.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 70, borderRadius: 3, background: finalColors[i] ?? RED, boxShadow: '0 3px 6px rgba(0,0,0,0.18)' }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', textAlign: 'center', width: 70 }}>{tube.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* the 5 tubes, all visible, holding their original solution colour */}
      <div style={{ position: 'absolute', top: '22%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 8%' }}>
        {tubes.map((tube, i) => {
          const isActive = i === index;
          // the paper's bottom edge (submerged tip) moves toward the tube
          // mouth as lowerProgress rises; 60px of travel into the tube.
          const dipY = isActive ? lowerProgress * 60 : 0;

          return (
            <div key={tube.label} style={{ position: 'relative', opacity: isActive ? 1 : 0.4 }}>
              <GlossyTestTube width={50} fillFraction={0.45} liquidColor={SOLUTION_TINT[tube.label] ?? '#F5F5F0'} active={isActive} />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 6,
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  color: '#444444',
                  whiteSpace: 'nowrap',
                }}
              >
                {tube.label}
              </div>

              {isActive && (
                <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)' }}>
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <WarmZone width={40} height={30} borderRadius={8} visible={phase === 'above'} bright={phase === 'dipping'} />
                    <div
                      onPointerDown={phase === 'above' || phase === 'dipping' ? onPointerDown : undefined}
                      style={{ position: 'absolute', top: -10, width: 60, height: 100, cursor: 'pointer', touchAction: 'none' }}
                    />

                    {/* the paper — sinks toward the tube as dipY grows, and
                        the colour reveals bottom-up while lifting. */}
                    <motion.div
                      animate={{ y: dipY }}
                      transition={{ duration: 0 }}
                      style={{ position: 'relative', width: 12, height: 70, borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: RED }} />
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: `${liftReveal * 100}%`,
                          background: activeTube.resultColor,
                        }}
                      />
                    </motion.div>

                    {/* hold progress arc — fills while submerged */}
                    {phase === 'dipping' && holdProgress > 0 && (
                      <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', top: 30, pointerEvents: 'none' }}>
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="#E8A020"
                          strokeWidth="5"
                          strokeDasharray={2 * Math.PI * 22}
                          strokeDashoffset={2 * Math.PI * 22 * (1 - holdProgress)}
                          strokeLinecap="round"
                          transform="rotate(-90 28 28)"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PipHand containerRef={sceneRef} state={phase === 'dipping' || phase === 'lifting' ? 'grip' : 'open'} active={phase !== 'result'} />
    </div>
  );
}
