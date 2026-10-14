import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CharacterSprite from './CharacterSprite';

// The step's character (Pip / Madu / Lili / Lumi) in its speaking pose, at full size in the guide column,
// with a speech bubble of extra information. The bubble steps through its items on
// its own, giving each one time to be read (longer text stays longer), and stops on
// the last. Below the bubble are back / forward arrows so a student can return to
// something they missed; using them restarts the reading timer. Moving the pointer
// over the bubble holds it still.

const MIN_MS = 4200;
const MS_PER_CHAR = 65;
const readingTime = (text) => Math.max(MIN_MS, (text?.length ?? 0) * MS_PER_CHAR);

function Arrow({ dir, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '3px solid #fff',
        background: disabled ? '#D9D4CA' : 'linear-gradient(135deg, #FFC233, #FB8500)',
        boxShadow: disabled ? 'none' : '0 3px 8px rgba(0,0,0,0.2)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        pointerEvents: 'auto',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points={dir === 'back' ? '15 5 8 12 15 19' : '9 5 16 12 9 19'} />
      </svg>
    </button>
  );
}

// items: [{ text, wrong }]. A wrong item (the student did something off) shows the character's react pose.
export default function CharacterGuide({ character, items, characterHeight = 250, onShow }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const lastStamp = useRef(items[items.length - 1]?.at ?? null);
  const cause = useRef('nav'); // why the bubble changed: 'message' (the game said something new) or 'nav' (the student went back/forward, or it moved on by itself)
  const count = items.length;
  const safeIndex = Math.min(index, Math.max(0, count - 1));
  const current = items[safeIndex];
  const text = current?.text ?? '';

  // a message arriving from the game (new, or the same mistake again) is shown straight away
  const stamp = items[items.length - 1]?.at ?? null;
  useEffect(() => {
    if (stamp !== null && stamp !== lastStamp.current) {
      cause.current = 'message';
      setIndex(items.length - 1);
    }
    lastStamp.current = stamp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  // auto-advance: wait long enough to read this item, then move on (stops at the last)
  useEffect(() => {
    if (held || safeIndex >= count - 1) return undefined;
    const timer = setTimeout(() => setIndex(safeIndex + 1), readingTime(text));
    return () => clearTimeout(timer);
  }, [safeIndex, count, held, text]);

  // the game is told which bubble is showing, and whether the student moved to it (so it can show what that bubble was about)
  useEffect(() => {
    onShow?.(current, cause.current === 'nav');
    cause.current = 'nav';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, current?.at, current?.text]);

  // the character perks up whenever the bubble changes
  useEffect(() => {
    if (!text) return undefined;
    setWiggle(true);
    const timer = setTimeout(() => setWiggle(false), 900);
    return () => clearTimeout(timer);
  }, [text]);

  if (!count) return null;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 6, pointerEvents: 'none' }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
        <div
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          style={{
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 96,
            padding: '14px 16px',
            background: '#fff',
            borderRadius: 22,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            pointerEvents: 'auto',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontFamily: 'Inter, var(--font-body)', fontSize: 15, lineHeight: 1.45, color: '#2D2D2D' }}
            >
              {text}
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Arrow dir="back" label={t('game.guide_back')} disabled={safeIndex <= 0} onClick={() => setIndex(safeIndex - 1)} />
          <div style={{ minWidth: 40, textAlign: 'center', fontFamily: 'Inter, var(--font-body)', fontWeight: 600, fontSize: 13, color: '#8A8478' }}>
            {safeIndex + 1} / {count}
          </div>
          <Arrow dir="next" label={t('game.guide_next')} disabled={safeIndex >= count - 1} onClick={() => setIndex(safeIndex + 1)} />
        </div>
      </div>

      <motion.div animate={{ y: wiggle ? [0, -8, 0] : [0, -4, 0] }} transition={{ duration: wiggle ? 0.45 : 2.8, repeat: Infinity, ease: 'easeInOut' }} style={{ flex: '0 0 auto', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        <CharacterSprite name={character} height={characterHeight} pose={current?.wrong ? 'react' : 'speaking'} />
      </motion.div>
    </div>
  );
}
