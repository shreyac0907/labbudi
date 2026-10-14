import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePressHold } from '../engine/InputManager';
import BunsenBurner from '../components/equipment/BunsenBurner';
import Tripod from '../components/equipment/Tripod';
import Gauze from '../components/equipment/Gauze';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import { useTranslation } from 'react-i18next';

// Hold to keep watching the dish heat — release early and the flame dies
// back down and the dish cools, same as HoldGame's slip-back. Holding the
// full duration carries the copper sulfate through its real colour
// journey: blue solution → deepening blue crystals as the water boils off
// → pale blue-white anhydrous powder once it's fully dehydrated.
export default function TimerWatchGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { duration = 4, timeLimit = 20 } = parameters;

  const [progress, setProgress] = useState(0);
  const [watching, setWatching] = useState(false);
  const [cooled, setCooled] = useState(false);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const finish = useCallback(
    (p) => {
      if (doneRef.current) return;
      doneRef.current = true;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      onComplete({ accuracy: p, timing, completion: p, mistakes: mistakesRef.current, score: Math.round(p * 88 + timing * 12) });
    },
    [timeLimit, onComplete],
  );

  const { onPointerDown } = usePressHold({
    durationMs: duration * 1000,
    onProgress: (p) => {
      setWatching(true);
      setCooled(false);
      setProgress(p);
    },
    onComplete: () => {
      setProgress(1);
      setTimeout(() => finish(1), 500);
    },
    onRelease: () => {
      mistakesRef.current += 1;
      setWatching(false);
      setCooled(true);
      onFeedback?.(t('game.watch_flame_lit'));
      setTimeout(() => {
        setCooled(false);
        setProgress(0);
      }, 500);
    },
  });

  const contentState = progress < 0.5 ? 'solution' : progress < 0.92 ? 'crystals' : 'powder';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
      {/* Stacked back-to-front so the DOM order matches depth: the burner
          sits furthest back (lowest z), then tripod, then gauze, then the
          dish closest to the viewer on top — a lower z-index object must
          never paint over one that's actually in front of it. */}
      <div style={{ position: 'relative', width: 160, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 118, zIndex: 2 }}>
          <BunsenBurner size={1.15} state={watching || progress > 0 ? 'roaring' : 'off'} />
        </div>
        <div style={{ position: 'absolute', top: 68, zIndex: 3 }}>
          <Tripod size={1.35} />
        </div>
        <div style={{ position: 'absolute', top: 74, zIndex: 4 }}>
          <Gauze size={1.5} contactShadow />
        </div>
        <div style={{ position: 'absolute', top: 30, zIndex: 5 }}>
          <EvaporatingDish size={1.6} contentState={contentState} contactShadow />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <motion.div
          onPointerDown={onPointerDown}
          animate={{ scale: watching ? 0.94 : 1 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: cooled ? '#B0B0B0' : watching ? 'var(--color-mint)' : 'var(--color-chem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            textAlign: 'center',
            cursor: 'pointer',
            touchAction: 'none',
            boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
            transition: 'background 0.2s',
          }}
        >
          {t('game.watch_closely')}
        </motion.div>
        <div style={{ width: 220, height: 10, background: '#eee', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.05 }} style={{ height: '100%', background: 'var(--color-chem)' }} />
        </div>
      </div>
    </div>
  );
}
