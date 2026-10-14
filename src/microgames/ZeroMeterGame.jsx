import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NewtonMeter from '../components/equipment/NewtonMeter';
import ZoneTimingBar from '../components/ZoneTimingBar';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

// P2 setup step 2 — before anything is attached, the meter's indicator
// sits slightly off true zero. The student zooms in and taps a Cooking-
// Mama-style timing bar the instant the needle would land on the 0N mark.
// A small, honest lesson: a spring scale that isn't zeroed throws every
// later reading off by the same fixed amount.
export default function ZeroMeterGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { startOffset = 0.3, maxReading = 5, timeLimit = 0 } = parameters;
  const { actions } = useGameState();

  const [reading, setReading] = useState(startOffset);
  const [snapped, setSnapped] = useState(false);
  const [flash, setFlash] = useState(false);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const mistakesRef = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = mistakesRef.current === 0 ? 1 : Math.max(0.6, 1 - mistakesRef.current * 0.15);
    onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 90 + timing * 10), skipPause: true }); // it already held on the calibration message
  }, [onComplete, timeLimit]);

  const handleResult = useCallback(
    (zone) => {
      actions.addScore(zone === 'blue' ? 100 : zone === 'yellow' ? 60 : 0);
      if (zone === 'red') {
        mistakesRef.current += 1;
        onFeedback?.(t('game.not_quite_zero'), 'wrong');
        return;
      }

      setSnapped(true);
      if (zone === 'blue') {
        setReading(0);
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
      } else {
        // GOOD — lands close, wobbles, then corrects to true zero.
        setReading(0.25);
        setTimeout(() => setReading(0), 450);
      }
      // a pause before the next step, with the guide saying why this matters (read at its own pace)
      onFeedback?.(t('game.calibration'));
      setTimeout(finish, 5500);
    },
    [finish, onFeedback, actions],
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ position: 'relative', marginLeft: 70 }}>
        {/* big enough to read, small enough that the whole meter and the timing bar fit the canvas */}
        <NewtonMeter size={1.4} reading={reading} maxReading={maxReading} zoomed shadow={false} />

        {/* amber zero mark glowing on the scale, at the meter's own 0N tick */}
        <div
          style={{
            position: 'absolute',
            left: '18%',
            right: '17%',
            bottom: '15.3%',
            height: 3,
            background: '#E8A020',
            boxShadow: '0 0 8px 2px rgba(232,160,32,0.6)',
            pointerEvents: 'none',
          }}
        />

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: -20, background: '#fff', borderRadius: 24, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>
      </div>

      {!snapped && (
        <div style={{ width: '70%', maxWidth: 420 }}>
          <ZoneTimingBar onResult={handleResult} speedMs={2100} retryOnMiss />
        </div>
      )}
    </div>
  );
}
