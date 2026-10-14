import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Tap a set of targets in the required order. Used here to connect the
// block's hook to the Newton meter's hook — tapping in order draws a
// string between them.
export default function SequenceTapGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { sequence = [], labels = [], timeLimit = 12 } = parameters;

  const [doneCount, setDoneCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  function handleTap(i) {
    if (doneRef.current) return;
    if (i === doneCount) {
      const next = doneCount + 1;
      setDoneCount(next);
      if (next === sequence.length) {
        doneRef.current = true;
        setConnected(true);
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
        setTimeout(() => {
          onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round((1 - mistakesRef.current * 0.15) * 88 + timing * 12) });
        }, 900);
      }
    } else {
      mistakesRef.current += 1;
      onFeedback?.(t('game.tap_first', { label: labels[doneCount] ?? sequence[doneCount] }), 'wrong');
    }
  }

  const n = sequence.length;
  const positions = sequence.map((_, i) => 15 + (i / Math.max(1, n - 1)) * 70);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none" viewBox="0 0 100 100">
        {connected && (
          <motion.line
            x1={positions[0]}
            y1={50}
            x2={positions[n - 1]}
            y2={50}
            stroke="#8B6914"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {sequence.map((id, i) => {
        const tapped = i < doneCount;
        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: `${positions[i]}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <motion.div
              onClick={() => handleTap(i)}
              animate={tapped ? { scale: [1, 1.15, 1] } : {}}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                border: `3px solid ${tapped ? 'var(--color-mint)' : 'var(--color-border)'}`,
                background: tapped ? 'var(--color-mint)' : '#fff',
                color: tapped ? '#fff' : 'var(--color-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
              }}
            >
              {tapped ? '✓' : i + 1}
            </motion.div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', whiteSpace: 'nowrap' }}>{labels[i] ?? id}</div>
          </div>
        );
      })}
    </div>
  );
}
