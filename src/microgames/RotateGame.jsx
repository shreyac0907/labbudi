import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCircularDrag } from '../engine/InputManager';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';

// Drag in a circular arc around a cylindrical object to rotate it toward
// targetAngle — collars, taps, dials. The object itself spins via CSS
// rotateZ; a progress arc shows how far around the turn is.
export default function RotateGame({ step, onComplete }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { targetAngle, startAngle = 0, tolerance = 8, timeLimit = 12 } = parameters;

  const [angle, setAngle] = useState(startAngle);
  const [settled, setSettled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pointingDone, setPointingDone] = useState(false);
  const wrapRef = useRef(null);
  const sceneRef = useRef(null);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const lastPointerAngleRef = useRef(null);

  // Point at the knob for a beat when it first appears, then switch to the
  // normal open/grip pointer-following behaviour.
  useEffect(() => {
    const t = setTimeout(() => setPointingDone(true), 800);
    return () => clearTimeout(t);
  }, []);

  const within = Math.abs(((angle - targetAngle + 540) % 360) - 180) <= tolerance;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setSettled(true);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 0.9, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(0.85 * 88 + timing * 12) });
  }, [onComplete, timeLimit]);

  const handleAngleChange = useCallback(
    (pointerDeg) => {
      if (lastPointerAngleRef.current == null) {
        lastPointerAngleRef.current = pointerDeg;
        return;
      }
      let delta = pointerDeg - lastPointerAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastPointerAngleRef.current = pointerDeg;
      setAngle((a) => {
        const next = a + delta;
        if (Math.abs(((next - targetAngle + 540) % 360) - 180) <= tolerance) {
          setTimeout(finish, 250);
          return targetAngle;
        }
        return next;
      });
    },
    [targetAngle, tolerance, finish],
  );

  const { onPointerDown } = useCircularDrag({
    getCenter: () => {
      const rect = wrapRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    },
    onAngleChange: handleAngleChange,
  });

  function handlePointerDown(e) {
    lastPointerAngleRef.current = null;
    setDragging(true);
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointerup', up);
    onPointerDown(e);
  }

  return (
    <div ref={sceneRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div
        ref={wrapRef}
        onPointerDown={handlePointerDown}
        style={{ width: 160, height: 160, borderRadius: '50%', touchAction: 'none', cursor: 'grab', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="#EDEFF2" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={within ? 'var(--color-mint)' : 'var(--color-chem)'}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * 0.75}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            opacity={0.55}
          />
        </svg>
        <motion.div
          animate={{ rotate: angle }}
          transition={{ type: settled ? 'spring' : false, stiffness: 400, damping: 22 }}
          style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #EDEFF2, #8B919A)', border: '3px solid #5B616B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)' }}
        >
          <div style={{ width: 6, height: 40, background: '#3A3A3A', borderRadius: 3, transform: 'translateY(-30px)' }} />
        </motion.div>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: within ? 'var(--color-mint)' : 'var(--color-mid)' }}>
        {within ? t('game.locked_in') : t('game.drag_circle_rotate')}
      </div>

      <PipHand
        containerRef={sceneRef}
        state={!pointingDone ? 'pointing' : dragging ? 'grip' : 'open'}
        rotation={angle}
        active={!settled}
      />
    </div>
  );
}
