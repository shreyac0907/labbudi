import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useGameState } from '../engine/GameState';
import CharacterSprite from './CharacterSprite';

// Live score pill — top-right of the canvas (the sun icon lives top-LEFT,
// so this mirrors it rather than sitting literally "below" it). Mounted
// once inside MicrogameRenderer so it appears on every microgame screen
// without any individual game file knowing about it.
export default function ScoreCounter({ hidden = false }) {
  const { state } = useGameState();
  const [pop, setPop] = useState(false);
  const prevRef = useRef(state.score);
  const motionScore = useMotionValue(prevRef.current);
  const [display, setDisplay] = useState(prevRef.current);

  useEffect(() => {
    const unsub = motionScore.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [motionScore]);

  useEffect(() => {
    if (state.score === prevRef.current) return;
    const increased = state.score > prevRef.current;
    prevRef.current = state.score;
    const controls = animate(motionScore, state.score, { duration: 0.5, ease: 'easeOut' });
    if (increased) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 700);
      return () => {
        clearTimeout(t);
        controls.stop();
      };
    }
    return () => controls.stop();
  }, [state.score, motionScore]);

  return (
    <div style={{ position: 'fixed', top: 14, right: 20, zIndex: 220, display: 'flex', alignItems: 'center', opacity: hidden ? 0 : 1, pointerEvents: 'none' }}>
      {/* Pip sits beside the score and wiggles whenever it goes up */}
      <CharacterSprite name="pip" height={60} wiggle={pop} style={{ marginRight: -10, zIndex: 1 }} />
      <motion.div
        animate={{ scale: pop ? [1, 1.2, 1] : 1 }}
        transition={{ type: 'spring', stiffness: 400, duration: 0.15 }}
        style={{
          padding: '8px 18px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #7AB648 0%, #3E8E5C 100%)',
          border: '3px solid rgba(255,255,255,0.9)',
          color: '#fff',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
        }}
      >
        <span>⭐</span>
        <span>{display}</span>
      </motion.div>
    </div>
  );
}
