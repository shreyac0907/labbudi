import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ForceGraph, { gy } from '../components/ForceGraph';

// P2 results: an already plotted graph with four numbered badges. Pick a word (scale, axis, plots, units),
// then tap the badge that points at that part. A wrong match says what the badge really points at.
const PARTS = ['scale', 'axis', 'plots', 'units'];
const BADGES = [
  { part: 'scale', x: 46, y: 92, to: { x: 80, y: gy(4) } }, // the numbers up the side
  { part: 'axis', x: 520, y: 280, to: { x: 520, y: gy(0) - 4 } }, // the line along the bottom
  { part: 'plots', x: 478, y: 172, to: { x: 430, y: 130 } }, // a cross
  { part: 'units', x: 570, y: 392, to: { x: 414, y: 392 } }, // the (°) in the axis title
];

export default function GraphPartsGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { points, timeLimit = 0 } = step.parameters;

  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState([]); // parts matched so far
  const mistakesRef = useRef(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    onFeedback?.(t('game.graph_start'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = mistakesRef.current === 0 ? 1 : Math.max(0.6, 1 - mistakesRef.current * 0.1);
    onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 90 + timing * 10) });
  }, [onComplete, timeLimit]);

  function tapBadge(badge) {
    if (doneRef.current || done.includes(badge.part)) return;
    if (!selected) {
      onFeedback?.(t('game.graph_pick_first'));
      return;
    }
    if (selected === badge.part) {
      const next = [...done, badge.part];
      setDone(next);
      setSelected(null);
      onFeedback?.(`${t('game.graph_yes')} ${t(`game.part_${badge.part}_def`)}`);
      if (next.length === PARTS.length) setTimeout(finish, 1500);
    } else {
      mistakesRef.current += 1;
      onFeedback?.(`${t('game.graph_wrong')} ${t(`game.part_${badge.part}_def`)}`, 'wrong');
    }
  }

  const chip = { fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 22, letterSpacing: 1, userSelect: 'none', touchAction: 'none' };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '10px 20px' }}>
      <div style={{ flex: '1 1 auto', height: '96%', maxWidth: 'calc(100% - 230px)' }}>
        <ForceGraph points={points}>
          {BADGES.map((b, i) => {
            const ok = done.includes(b.part);
            return (
              <g key={b.part}>
                <line x1={b.x} y1={b.y} x2={b.to.x} y2={b.to.y} stroke={ok ? '#1E9E5A' : '#4C62D8'} strokeWidth={3} strokeDasharray="6 5" />
                <g onPointerDown={() => tapBadge(b)} style={{ cursor: ok ? 'default' : 'pointer' }}>
                  <circle cx={b.x} cy={b.y} r={30} fill="transparent" />
                  <circle cx={b.x} cy={b.y} r={19} fill={ok ? '#1E9E5A' : '#4C62D8'} stroke="#fff" strokeWidth={3} />
                  <text x={b.x} y={b.y + 7} textAnchor="middle" fontSize={21} fontWeight={800} fill="#fff" fontFamily="var(--font-body)">
                    {ok ? '✓' : i + 1}
                  </text>
                </g>
              </g>
            );
          })}
        </ForceGraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PARTS.map((p) => {
          const ok = done.includes(p);
          const on = selected === p;
          return (
            <motion.div
              key={p}
              animate={{ scale: on ? 1.08 : 1, opacity: ok ? 0.35 : 1 }}
              onPointerDown={() => !ok && !doneRef.current && setSelected(on ? null : p)}
              style={{
                ...chip,
                padding: '12px 22px',
                borderRadius: 999,
                textAlign: 'center',
                cursor: ok ? 'default' : 'pointer',
                background: ok ? '#DDF3E6' : on ? '#FFD76A' : '#fff',
                border: `3px solid ${ok ? '#1E9E5A' : on ? '#E8A020' : '#8A6E3A'}`,
                color: '#2F3A45',
              }}
            >
              {t(`game.part_${p}`)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
