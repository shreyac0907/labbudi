import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePointerDrag } from '../engine/InputManager';
import CellView from './shared/CellView';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const SHARP_FOCUS_MAX_DRAGS = 3; // "Sharp Focus" surprise bonus — in-focus within this many drag gestures

// Drag the focus knob up/down to bring the specimen into focus. The
// specimen view blurs by how far `focus` is from `targetFocus` — turn the
// knob until it's sharp, then let go. Releasing outside tolerance doesn't
// fail the step, it just leaves it blurry so the student can keep turning.
export default function ScrollKnobGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { targetFocus = 65, startFocus = 15, tolerance = 8, sampleColour = '#C7D98A', timeLimit = 18 } = parameters;
  const { actions } = useGameState();

  const [focus, setFocus] = useState(startFocus);
  const [dragging, setDragging] = useState(false);
  const [sharpFocusBonus, setSharpFocusBonus] = useState(false);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const lastYRef = useRef(0);
  const focusRef = useRef(startFocus);
  const dragCountRef = useRef(0);

  const distance = Math.abs(focus - targetFocus);
  const inFocus = distance <= tolerance;
  const blurPx = Math.min(10, (distance / 100) * 26);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = Math.max(0, 1 - distance / 100);
    onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 88 + timing * 12) });
  }, [distance, timeLimit, onComplete]);

  const { onPointerDown } = usePointerDrag({
    onStart: (point) => {
      setDragging(true);
      dragCountRef.current += 1;
      lastYRef.current = point.y;
    },
    onMove: (point) => {
      const dy = point.y - lastYRef.current;
      lastYRef.current = point.y;
      const next = Math.max(0, Math.min(100, focusRef.current + dy * 0.6));
      focusRef.current = next;
      setFocus(next);
    },
    onEnd: () => {
      setDragging(false);
      if (Math.abs(focusRef.current - targetFocus) <= tolerance) {
        // Sharp Focus surprise bonus — nailed it within a handful of turns.
        if (dragCountRef.current <= SHARP_FOCUS_MAX_DRAGS) {
          setSharpFocusBonus(true);
          actions.addScore(200);
          setTimeout(() => onFeedback?.(t('game.natural_talent')), 400);
          setTimeout(() => setSharpFocusBonus(false), 1400);
        }
        setTimeout(finish, 400);
      } else {
        mistakesRef.current += 1;
        onFeedback?.(t('game.still_blurry_knob'), 'wrong');
      }
    },
  });

  const knobRotation = (focus / 100) * 320;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56 }}>
      <BonusBanner active={sharpFocusBonus} text={t('ui.first_try_focus')} points={200} color="#4FBFA8" />
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 0 8px #2E2E2E, 0 6px 16px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: '50%',
            background: '#F4F0E4',
            filter: `blur(${blurPx}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CellView />
        </div>
        {inFocus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '3px solid var(--color-mint)' }}
          />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <motion.div
          onPointerDown={onPointerDown}
          animate={{ rotate: knobRotation, scale: dragging ? 1.06 : 1 }}
          transition={{ rotate: { type: 'tween', duration: 0.05 }, scale: { duration: 0.15 } }}
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #9A9A9A, #5A5A5A 70%)',
            border: '3px solid #3A3A3A',
            cursor: 'grab',
            touchAction: 'none',
            position: 'relative',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ position: 'absolute', top: 6, left: '50%', width: 4, height: 16, background: '#DDD', transform: 'translateX(-50%)', borderRadius: 2 }} />
        </motion.div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#999' }}>{t('game.drag_to_focus')}</div>
      </div>
    </div>
  );
}
