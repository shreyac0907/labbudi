import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssetImage from '../AssetImage';
import SpeechBubble from '../SpeechBubble';
import { PostIt } from '../corkboard/PostIt';
import { Pin } from '../corkboard/Pin';
import { WashiTape } from '../corkboard/WashiTape';
import { SubjectBadge, StampBadge, StarSticker } from '../corkboard/Stickers';
import { ASSETS } from '../../config/assets';

const INTRO_LINE =
  "A graph is only useful if you can READ it. Let's make sure you know exactly what every part of this graph is telling you.";
const COMPLETE_LINE = 'Perfect graph reading. These skills apply to every graph you will ever see in science.';

function ArrowIcon({ rotate = 0 }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" style={{ transform: `rotate(${rotate}deg)`, display: 'block' }}>
      <line x1="4" y1="14" x2="20" y2="14" stroke="#C0503D" strokeWidth="2.5" />
      <path d="M14,7 L21,14 L14,21" fill="none" stroke="#C0503D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LabelArrow({ arrow, filled, open, wrong, onToggle, onSelect }) {
  return (
    <div style={{ position: 'absolute', top: `${arrow.top}%`, left: `${arrow.left}%`, zIndex: open ? 40 : 6 }}>
      <ArrowIcon rotate={arrow.arrowRotate ?? 0} />
      <motion.div
        animate={wrong ? { x: [0, -5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.3 }}
        onClick={onToggle}
        style={{
          marginTop: 2,
          minWidth: 92,
          maxWidth: 140,
          minHeight: 38,
          background: filled ? '#EAF7F3' : '#FFF8E7',
          border: `1.5px solid ${filled ? '#4FBFA8' : '#E4D3AC'}`,
          borderRadius: 8,
          padding: '6px 8px',
          cursor: filled ? 'default' : 'pointer',
          fontFamily: filled ? 'var(--font-heading)' : 'var(--font-body)',
          fontSize: filled ? 10.5 : 11,
          color: 'var(--color-dark)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {filled ? arrow.correct : '?'}
        {filled && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: -10, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
            style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }}
          >
            <Pin color="green" size={14} />
          </motion.div>
        )}
        {filled && (
          <div style={{ position: 'absolute', bottom: -6, right: -6 }}>
            <StarSticker color="teal" size={16} />
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {open && !filled && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            style={{
              transformOrigin: 'top left',
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              background: '#fff',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 8px 22px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              width: 210,
              zIndex: 50,
            }}
          >
            {arrow.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                style={{
                  textAlign: 'left',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: '#F7F4EF',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared shell for Screen 6 across every practical: a pre-drawn, always-
// correct graph (passed in as `children`) surrounded by clickable label
// arrows the student has to identify — no manual plotting.
export default function GraphLabelBoard({ subject, bullets, arrows, children, onFeedback, onComplete }) {
  const [answered, setAnswered] = useState({});
  const [openId, setOpenId] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [liliVisible, setLiliVisible] = useState(true);
  const [liliText, setLiliText] = useState(INTRO_LINE);
  const [completeShown, setCompleteShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLiliVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const allDone = arrows.every((a) => answered[a.id]);

  useEffect(() => {
    if (allDone && !completeShown) {
      setCompleteShown(true);
      setLiliText(COMPLETE_LINE);
      setLiliVisible(true);
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  function handleSelect(arrow, option) {
    if (option === arrow.correct) {
      setAnswered((prev) => ({ ...prev, [arrow.id]: true }));
      setOpenId(null);
      setLiliText(arrow.explanation);
      setLiliVisible(true);
      setTimeout(() => setLiliVisible(false), 4000);
    } else {
      setWrongId(arrow.id);
      onFeedback?.(arrow.hint ?? 'Look at where the arrow is pointing…');
      setTimeout(() => setWrongId(null), 300);
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 620 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 8 }}>
        <div style={{ position: 'relative', width: 190 }}>
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
            <Pin color="yellow" size={18} />
          </div>
          <PostIt color="peach" width={190} rotate={-2}>
            <div style={{ padding: '18px 14px 10px', fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--color-dark)', lineHeight: 1.5 }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  • {b}
                </div>
              ))}
            </div>
          </PostIt>
          <div style={{ position: 'absolute', bottom: -8, right: -8 }}>
            <SubjectBadge subject={subject} width={56} />
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 560, margin: '84px auto 0' }}>
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <Pin color="red" size={22} />
        </div>
        <div style={{ position: 'absolute', top: -6, right: 6, transform: 'rotate(8deg)', zIndex: 3 }}>
          <WashiTape variant="yellow_plain" width={60} />
        </div>
        <div
          style={{
            background: '#FFF8E7',
            border: '1.5px solid #E4D3AC',
            borderRadius: 16,
            padding: 24,
            boxShadow: '2px 6px 18px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          {children}

          {completeShown && (
            <motion.div
              initial={{ scale: 1.8, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 16 }}
              style={{ position: 'absolute', top: -16, left: -16 }}
            >
              <StampBadge kind="done" size={56} />
            </motion.div>
          )}
        </div>

        {arrows.map((a) => (
          <LabelArrow
            key={a.id}
            arrow={a}
            filled={!!answered[a.id]}
            open={openId === a.id}
            wrong={wrongId === a.id}
            onToggle={() => setOpenId((cur) => (cur === a.id ? null : a.id))}
            onSelect={(opt) => handleSelect(a, opt)}
          />
        ))}
      </div>

      <div style={{ position: 'absolute', top: 4, right: 4, width: 110, zIndex: 45 }}>
        <div style={{ position: 'relative' }}>
          <SpeechBubble
            text={liliText}
            visible={liliVisible}
            maxWidth={200}
            style={{ bottom: '100%', right: 0, left: 'auto', marginBottom: 10 }}
            pointerStyle={{ left: 'auto', right: 30, transform: 'none' }}
          />
          <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
            <Pin color="pink" size={16} />
          </div>
          <PostIt color="pink" width={110} rotate={3}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 8 }}>
              <AssetImage src={ASSETS.characters.lili.speaking} width={68} height={68} />
            </div>
          </PostIt>
        </div>
      </div>
    </div>
  );
}
