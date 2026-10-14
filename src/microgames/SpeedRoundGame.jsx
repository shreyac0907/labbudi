import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RampRig from '../components/equipment/RampRig';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const ROUND_MS = 30000;
const RAMPS = [
  { angle: 0, reading: 0.3 },
  { angle: 15, reading: 1.3 },
  { angle: 30, reading: 2.5 },
  { angle: 45, reading: 3.5 },
  { angle: 60, reading: 4.3 },
];

// Bonus "QUICK FIRE" speed round (Prompt 3) — after all 5 angle readings
// are done carefully, this is the fast, loose victory-lap version: one tap
// per mini-ramp (no real hold/physics), 30 seconds, pure live-score bonus.
// Its own onComplete result is always a flat, neutral score so it can
// never drag the checkpoint's real medal down or up — only actions.addScore
// (the live counter) reflects how the student actually did.
export default function SpeedRoundGame({ onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { actions } = useGameState();
  const [pulled, setPulled] = useState(() => RAMPS.map(() => false));
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [finished, setFinished] = useState(false);
  const [allBonus, setAllBonus] = useState(false);
  const doneRef = useRef(false);
  const rafRef = useRef(null);
  const startRef = useRef(Date.now());

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFinished(true);
    setTimeout(() => onComplete({ accuracy: 1, timing: 1, completion: 1, mistakes: 0, score: 100 }), 1200);
  }, [onComplete]);

  useEffect(() => {
    function tick() {
      const left = Math.max(0, ROUND_MS - (Date.now() - startRef.current));
      setTimeLeft(left);
      if (left <= 0) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [finish]);

  function pull(i) {
    if (finished || pulled[i]) return;
    const next = [...pulled];
    next[i] = true;
    setPulled(next);
    actions.addScore(50);
    onFeedback?.(t('game.quick_next'));
    if (next.every(Boolean)) {
      setAllBonus(true);
      actions.addScore(200);
      onFeedback?.(t('game.quick_champion_msg'));
      setTimeout(finish, 900);
    }
  }

  const seconds = Math.ceil(timeLeft / 1000);
  const doneCount = pulled.filter(Boolean).length;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, position: 'relative' }}>
      <BonusBanner active={allBonus} text={t('game.quick_champion_banner')} points={200} color="#FFD700" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: seconds <= 5 ? '#FF5555' : 'var(--color-phys)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 20,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          {seconds}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--color-dark)' }}>
          {t('game.quick_fire_counter', { done: doneCount })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {RAMPS.map((r, i) => (
          <div key={r.angle} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              onClick={() => pull(i)}
              style={{ width: 110, height: 100, cursor: pulled[i] || finished ? 'default' : 'pointer' }}
            >
              <RampRig angleDeg={r.angle} blockT={pulled[i] ? 1 : 0.06} taut size={0.55} />
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)' }}>{r.angle}°</div>
            <AnimatePresence>
              {pulled[i] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--color-mint)' }}
                >
                  {r.reading}N ✓
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {finished && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-mid)' }}>
          {doneCount === 5 ? t('game.all5_pulled') : t('game.times_up_practice')}
        </motion.div>
      )}
    </div>
  );
}
