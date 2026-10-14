import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CharacterSprite from '../components/CharacterSprite';
import UnderstandScrapbook from './UnderstandScrapbook';
import { isUnderstandStep } from '../utils/stepKinds';

// Each card gets its own colour (front gradient, darker flat back) and a character
// perched on its top-right corner. The character bobs while idle and wiggles when
// the card is hovered or has been flipped.
const PALETTE = [
  { front: 'linear-gradient(145deg, #FF6B6B 0%, #FF8E53 100%)', back: '#D94B4B' },
  { front: 'linear-gradient(145deg, #FFC233 0%, #FB8500 100%)', back: '#D77200' },
  { front: 'linear-gradient(145deg, #4FBFA8 0%, #7AB648 100%)', back: '#3E8E5C' },
  { front: 'linear-gradient(145deg, #5B6FE0 0%, #4FBFA8 100%)', back: '#4558C0' },
  { front: 'linear-gradient(145deg, #FF8FAB 0%, #C06AE0 100%)', back: '#A24FC0' },
];
const CHARACTERS = ['lili', 'madu', 'lumi', 'pip'];

const CARD_H = 'min(290px, 40vh)';

function Card({ target, index, count, flipped, onTap, showCharacters = true }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);
  const colour = PALETTE[index % PALETTE.length];
  const character = CHARACTERS[index % CHARACTERS.length];
  const backText = target.rule ?? target.content;
  const cardW = `min(270px, calc((100% - 48px) / ${count} - 28px))`;
  const longText = backText.length > 110;
  const face = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 22, textAlign: 'center', boxSizing: 'border-box' };
  return (
    <motion.div
      whileHover={flipped ? undefined : { y: -6, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: cardW, height: CARD_H, margin: showCharacters ? '84px 10px 0' : '10px', cursor: flipped ? 'default' : 'pointer' }}
      onClick={onTap}
    >
      <div style={{ perspective: 1000, width: '100%', height: '100%' }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        >
          <div style={{ ...face, background: colour.front, border: '5px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(22px, 2.3vw, 32px)', lineHeight: 1.15, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{target.label}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.22)', padding: '5px 14px', borderRadius: 999 }}>{t('game.tap_to_reveal')}</div>
          </div>
          <div style={{ ...face, transform: 'rotateY(180deg)', background: colour.back, border: '5px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: longText ? 'clamp(13px, 1.15vw, 16px)' : 'clamp(15px, 1.4vw, 19px)', color: '#fff', lineHeight: 1.45 }}>{backText}</div>
          </div>
        </motion.div>
      </div>

      {/* the character perched on the card's top-right corner (a step can turn this off with `showCharacters: false`) */}
      {showCharacters && (
      <motion.div
        animate={{ y: flipped || hover ? [0, -8, 0] : [0, -5, 0] }}
        transition={{ duration: flipped || hover ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', right: -34, top: -84, zIndex: 2, pointerEvents: 'none' }}
      >
        <CharacterSprite name={character} height={150} wiggle={flipped || hover} />
      </motion.div>
      )}

      {flipped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            zIndex: 3,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--color-mint)',
            border: '3px solid #fff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

// Tap every card to flip it and reveal its content. Used for both the
// safety-check step and the "what does it mean" reflection step.
function TapCards({ step, onComplete, onFeedback }) {
  const { parameters } = step;
  const { targets, requiredTaps, showCharacters = true } = parameters;
  const [flipped, setFlipped] = useState({});
  const tapCountRef = useRef(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  const handleTap = useCallback(
    (target) => {
      if (flipped[target.id] || doneRef.current) return;
      setFlipped((prev) => ({ ...prev, [target.id]: true }));
      tapCountRef.current += 1;
      onFeedback?.(target.rule ?? target.content);

      if (tapCountRef.current >= requiredTaps) {
        doneRef.current = true;
        const elapsed = (Date.now() - startRef.current) / 1000;
        const timeLimit = parameters.timeLimit || 0;
        const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
        setTimeout(() => {
          onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: 100 });
        }, 500);
      }
    },
    [flipped, requiredTaps, onFeedback, onComplete, parameters.timeLimit],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {targets.map((target, i) => (
        <Card key={target.id} target={target} index={i} count={targets.length} flipped={!!flipped[target.id]} onTap={() => handleTap(target)} showCharacters={showCharacters} />
      ))}
    </div>
  );
}

// The "What does it mean?" steps are a scrapbook; every other tap step is the flip cards.
export default function TapGame(props) {
  return isUnderstandStep(props.step) ? <UnderstandScrapbook {...props} /> : <TapCards {...props} />;
}
