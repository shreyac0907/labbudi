import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const TIERS = {
  3: { text: 'ui.streak_3', fontSize: 16, scale: 1 },
  5: { text: 'ui.streak_5', fontSize: 20, scale: 1.15 },
  10: { text: 'ui.streak_10', fontSize: 24, scale: 1.3 },
};

// Flashes briefly above the ScoreCounter pill when the streak first crosses
// 3, 5, or 10 consecutive correct actions. `onOnFire` fires once, the
// moment the streak hits exactly 10, so the caller can layer in a bigger
// celebration (MicrogameRenderer wires this to a character-reaction beat).
export default function StreakBadge({ onOnFire }) {
  const { t } = useTranslation();
  const { state } = useGameState();
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(state.streak);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state.streak;
    if (state.streak <= prev) return; // only fire on increase, never on reset
    const tier = TIERS[state.streak];
    if (!tier) return;
    setFlash(tier);
    if (state.streak === 10) onOnFire?.();
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [state.streak, onOnFire]);

  return (
    <div style={{ position: 'fixed', top: 62, right: 20, zIndex: 220, pointerEvents: 'none', display: 'flex', justifyContent: 'flex-end' }}>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, flash.scale, flash.scale, 0], opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: flash.fontSize,
              color: '#E8720C',
              textShadow: '0 2px 6px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {t(flash.text)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
