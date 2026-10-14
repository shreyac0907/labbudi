import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// P2 results: put each force reading into the table next to its angle. Tap a reading, then tap the row it
// belongs to. A wrong row says so and reminds the student that a steeper ramp means a bigger force.
export default function ForceTableGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { rows, timeLimit = 0 } = step.parameters;

  const [chips] = useState(() => rows.map((r, i) => ({ id: i, force: r.force })).sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState({}); // row index -> chip id
  const [selected, setSelected] = useState(null);
  const [shake, setShake] = useState(null);
  const mistakesRef = useRef(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = mistakesRef.current === 0 ? 1 : Math.max(0.6, 1 - mistakesRef.current * 0.1);
    onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 90 + timing * 10) });
  }, [onComplete, timeLimit]);

  function pickRow(i) {
    if (doneRef.current || placed[i] !== undefined) return;
    if (selected === null) {
      onFeedback?.(t('game.table_pick_first'));
      return;
    }
    const chip = chips.find((c) => c.id === selected);
    if (chip.force === rows[i].force) {
      const next = { ...placed, [i]: chip.id };
      setPlaced(next);
      setSelected(null);
      if (Object.keys(next).length === rows.length) setTimeout(finish, 900);
    } else {
      mistakesRef.current += 1;
      setShake(i);
      setTimeout(() => setShake(null), 350);
      onFeedback?.(t('game.table_wrong', { angle: rows[i].angle }), 'wrong');
    }
  }

  const usedIds = new Set(Object.values(placed));
  const cell = { fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 22, color: '#2F3A45', textAlign: 'center' };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, padding: '12px 24px' }}>
      <div style={{ background: 'rgba(255,255,255,0.94)', border: '2px solid #D9CFAE', borderRadius: 18, padding: 18, minWidth: 340 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ ...cell, background: '#4C62D8', color: '#fff', borderRadius: 10, padding: '10px 14px' }}>{t('game.axis_angle')}</div>
          <div style={{ ...cell, background: '#4C62D8', color: '#fff', borderRadius: 10, padding: '10px 14px' }}>{t('game.axis_force')}</div>
          {rows.map((r, i) => {
            const chip = placed[i] !== undefined ? chips.find((c) => c.id === placed[i]) : null;
            return (
              <div key={r.angle} style={{ display: 'contents' }}>
                <div style={{ ...cell, background: '#F4EEDD', borderRadius: 10, padding: '12px 14px' }}>{r.angle}</div>
                <motion.div
                  animate={{ x: shake === i ? [0, -7, 7, -5, 5, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                  onPointerDown={() => pickRow(i)}
                  style={{
                    ...cell,
                    borderRadius: 10,
                    padding: '12px 14px',
                    minHeight: 28,
                    cursor: chip ? 'default' : 'pointer',
                    background: chip ? '#DDF3E6' : '#FFFBEA',
                    border: chip ? '2px solid #1E9E5A' : `2px dashed ${selected !== null ? '#E8A020' : '#C9BF9A'}`,
                  }}
                >
                  {chip ? chip.force : ''}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chips.map((c) => {
          const used = usedIds.has(c.id);
          const on = selected === c.id;
          return (
            <motion.div
              key={c.id}
              animate={{ scale: on ? 1.08 : 1, opacity: used ? 0.25 : 1 }}
              onPointerDown={() => !used && !doneRef.current && setSelected(on ? null : c.id)}
              style={{
                ...cell,
                padding: '10px 26px',
                borderRadius: 999,
                cursor: used ? 'default' : 'pointer',
                background: on ? '#FFD76A' : '#fff',
                border: `3px solid ${on ? '#E8A020' : '#8A6E3A'}`,
                touchAction: 'none',
                userSelect: 'none',
              }}
            >
              {c.force} N
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
