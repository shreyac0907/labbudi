import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCircularDrag } from '../engine/InputManager';
import Slide from '../components/equipment/Slide';
import PipHand from '../components/PipHand';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const MIN_GOOD = 25;
const MAX_GOOD = 55;
// Cooking-Mama-style 3-tier zone, reusing the dial's own live angle as the
// "indicator position" instead of a second independent timing bar — the
// dial arc already IS that live indicator, so lowering the coverslip is
// the "tap" moment: blue (perfect, no bubbles), yellow (good, one small
// bubble but usable), red (miss, bubbles form, retry).
const MIN_OK = 15;
const MAX_OK = 65;
function zoneForAngle(a) {
  if (a >= MIN_GOOD && a <= MAX_GOOD) return 'blue';
  if (a >= MIN_OK && a <= MAX_OK) return 'yellow';
  return 'red';
}

// Lower the coverslip at the right approach angle — too flat or too steep
// and air gets trapped underneath (bubbles). A zoomed top-down view on the
// left carries the angle drag; a live cross-section on the right shows
// exactly why the angle matters, which a top-down view alone can't.
export default function CoverslipGame({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const { timeLimit = 20 } = step.parameters ?? {};
  const { actions } = useGameState();

  const [angle, setAngle] = useState(75);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const [bubbles, setBubbles] = useState(false);
  const [bubbleCount, setBubbleCount] = useState(3);
  const [resultText, setResultText] = useState(null); // 'PERFECT!' | 'GOOD!' | 'MISS!'

  // what to do goes up in the instruction bar
  useEffect(() => {
    onHint?.(t('game.coverslip_hint'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sceneRef = useRef(null);
  const dialRef = useRef(null);
  const lastPointerAngleRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const inGoodZone = angle >= MIN_GOOD && angle <= MAX_GOOD;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  const handleAngle = useCallback((pointerDeg) => {
    if (lastPointerAngleRef.current == null) {
      lastPointerAngleRef.current = pointerDeg;
      return;
    }
    let delta = pointerDeg - lastPointerAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastPointerAngleRef.current = pointerDeg;
    setAngle((a) => Math.max(0, Math.min(90, a - delta)));
  }, []);

  const { onPointerDown: onDialDown } = useCircularDrag({
    getCenter: () => {
      const rect = dialRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    },
    onAngleChange: handleAngle,
  });

  function handlePointerDown(e) {
    if (locked) return;
    lastPointerAngleRef.current = null;
    setDragging(true);
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointerup', up);
    onDialDown(e);
  }

  function lowerCoverslip() {
    if (locked) return;
    const zone = zoneForAngle(angle);
    setResultText(zone === 'blue' ? 'PERFECT!' : zone === 'yellow' ? 'GOOD!' : 'MISS!');
    setTimeout(() => setResultText(null), 700);
    actions.addScore(zone === 'blue' ? 100 : zone === 'yellow' ? 60 : 0);

    if (zone === 'blue') {
      setLocked(true);
      onFeedback?.(t('game.coverslip_perfect'));
      setTimeout(finish, 1200);
    } else if (zone === 'yellow') {
      setLocked(true);
      setBubbleCount(1);
      setBubbles(true);
      onFeedback?.(t('game.coverslip_one_bubble'), 'wrong');
      setTimeout(finish, 1400);
    } else {
      setBubbleCount(3);
      setBubbles(true);
      onFeedback?.(angle > MAX_OK ? t('game.coverslip_too_steep') : t('game.coverslip_too_flat'), 'wrong');
      setTimeout(() => setBubbles(false), 1200);
    }
  }

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
      {/* left 55% — zoomed top-down angle control */}
      <div style={{ width: '55%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Slide size={3.4} hasSample hasStain shadow={false} />
        </div>

        <div ref={dialRef} onPointerDown={handlePointerDown} style={{ position: 'relative', width: 210, height: 210, cursor: locked ? 'default' : 'grab', touchAction: 'none' }}>
          <svg width="210" height="210" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="#EDEFF2" strokeWidth="10" />
            {/* green valid zone arc, 25-55 mapped onto a 0-90 quarter circle from top (0) to right (90) */}
            <path
              d={describeArc(70, 70, 60, 90 - MAX_GOOD, 90 - MIN_GOOD)}
              fill="none"
              stroke="var(--color-mint)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <motion.line
              x1="70"
              y1="70"
              x2={70 + 55 * Math.cos(((90 - angle) * Math.PI) / 180)}
              y2={70 - 55 * Math.sin(((90 - angle) * Math.PI) / 180)}
              stroke={inGoodZone ? 'var(--color-mint)' : 'var(--color-start)'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="70" cy="70" r="8" fill="#B9C4CA" stroke="#8A96A0" strokeWidth="1.5" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, color: inGoodZone ? 'var(--color-mint)' : 'var(--color-dark)' }}>
            {Math.round(angle)}°
          </div>
        </div>

        <AnimatePresence>
          {resultText && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: resultText === 'PERFECT!' ? 38 : 30,
                color: resultText === 'PERFECT!' ? '#FFD700' : resultText === 'GOOD!' ? '#4FBFA8' : '#FF5555',
                textShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {resultText === 'PERFECT!' ? t('ui.perfect') : resultText === 'GOOD!' ? t('ui.good') : t('ui.miss')}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={lowerCoverslip}
          whileTap={{ scale: 0.95 }}
          disabled={locked}
          style={{
            padding: '14px 40px',
            borderRadius: 999,
            border: 'none',
            background: locked ? 'var(--color-mint)' : inGoodZone ? 'var(--color-start)' : 'var(--color-border)',
            color: locked || inGoodZone ? '#fff' : '#888',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 22,
            cursor: locked ? 'default' : 'pointer',
          }}
        >
          {locked ? t('game.locked_check') : t('game.lower_coverslip')}
        </motion.button>
      </div>

      {/* right 45% — live cross-section */}
      <div style={{ width: '45%', height: '100%', background: '#fff', borderLeft: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--color-dark)' }}>{t('game.cross_section')}</div>
        <svg width="400" height="240" viewBox="0 0 200 120">
          <rect x="20" y="80" width="160" height="10" fill="#D8D8D8" stroke="#999" strokeWidth="1" />
          <ellipse cx="100" cy="76" rx="60" ry="4" fill="#90B8E8" opacity={0.7} />
          <motion.line
            x1={100 - 70 * Math.cos((angle * Math.PI) / 180)}
            y1={76 - 70 * Math.sin((angle * Math.PI) / 180)}
            x2={locked ? 40 : 100 + 10}
            y2={locked ? 74 : 76 - 4}
            stroke="#B9C4CA"
            strokeWidth="4"
            strokeLinecap="round"
            animate={locked ? { x1: 30, y1: 74, x2: 170, y2: 74 } : {}}
            transition={{ duration: 0.5 }}
          />
          {bubbles &&
            Array.from({ length: bubbleCount }, (_, i) => i).map((i) => (
              <motion.circle
                key={i}
                cx={70 + i * 30}
                cy={76}
                r={0}
                fill="none"
                stroke="var(--color-start)"
                strokeWidth="1.5"
                animate={{ r: [0, 5, 5], opacity: [1, 1, 0], cy: [76, 70, 70] }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
        </svg>
        <AnimatePresence>
          {locked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: 'var(--color-mint)' }}>
              {t('game.no_bubbles')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'pointing'} active={!locked} />
    </div>
  );
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M${start.x},${start.y} A${r},${r} 0 ${largeArc} 0 ${end.x},${end.y}`;
}
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
