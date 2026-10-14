import { useState } from 'react';
import { motion } from 'framer-motion';
import AssetImage from '../AssetImage';
import SpeechBubble from '../SpeechBubble';
import { PostIt } from '../corkboard/PostIt';
import { Pin } from '../corkboard/Pin';
import { StampBadge } from '../corkboard/Stickers';
import { ASSETS } from '../../config/assets';
import { SUBJECT_PIN } from '../../config/practicals';

const CARD_W = 300;
const CARD_H = 190;

function SummaryCard({ index, meta, flipped, active, onFlip }) {
  return (
    <div style={{ position: 'relative', width: CARD_W, height: CARD_H + 20 }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
        <Pin color={meta.pin} size={20} />
      </div>
      <motion.div
        onClick={() => !flipped && active && onFlip()}
        style={{
          position: 'relative',
          marginTop: 18,
          width: CARD_W,
          height: CARD_H,
          cursor: !flipped && active ? 'pointer' : 'default',
          transformStyle: 'preserve-3d',
          opacity: active ? 1 : 0.4,
          perspective: 900,
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: '#fff',
            border: '2px solid var(--color-border)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 6 }}>{index + 1}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#fff',
            border: '2px solid var(--color-border)',
            borderRadius: 16,
            padding: 18,
            overflowY: 'auto',
            boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
          }}
        >
          <h3 className="heading" style={{ fontSize: 15, margin: '0 0 8px' }}>
            {meta.header}
          </h3>
          {meta.bullets ? (
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: 'var(--font-body)', fontSize: 11.5, lineHeight: 1.6, color: 'var(--color-dark)' }}>
              {meta.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.6, color: 'var(--color-dark)', margin: 0 }}>{meta.body}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Shared shell for Screen 7 across every practical: 4 fixed-structure cards
// (aim, key result, pattern, key points) flipped one at a time in sequence.
export default function SummaryCards({ data, subject, onAllDone }) {
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [complete, setComplete] = useState(false);
  const [speaker, setSpeaker] = useState(null);

  const subjectPin = SUBJECT_PIN[subject] ?? 'yellow';
  const cards = [
    { character: 'pip', pin: 'green', header: 'What were we trying to find out?', body: data.aim.body, line: data.aim.line },
    { character: data.keyResult.character, pin: subjectPin, header: 'What did we find?', body: data.keyResult.body, line: data.keyResult.line },
    { character: 'lumi', pin: 'blue', header: 'What is the pattern telling us?', body: data.pattern.body, line: data.pattern.line },
    { character: 'pip', pin: 'red', header: 'Key points from this practical', bullets: data.keyPoints.bullets, line: data.keyPoints.line },
  ];

  function handleFlip(i) {
    setFlipped((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
    setSpeaker(i);
    if (i === cards.length - 1) {
      setTimeout(() => {
        setComplete(true);
        onAllDone?.();
      }, 400);
    }
  }

  const activeIndex = flipped.findIndex((f) => !f);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 30 }}>
        {cards.map((c, i) => (
          <motion.div
            key={i}
            animate={complete ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            style={{ transform: `rotate(${(i - 1.5) * 3}deg)` }}
          >
            <SummaryCard
              index={i}
              meta={c}
              flipped={flipped[i]}
              active={i === activeIndex || flipped[i]}
              onFlip={() => handleFlip(i)}
            />
          </motion.div>
        ))}
      </div>

      {speaker != null && flipped[speaker] && (
        <div style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 44, width: 120 }}>
          <div style={{ position: 'relative' }}>
            <SpeechBubble
              text={cards[speaker].line}
              visible
              maxWidth={220}
              style={{ bottom: '100%', right: 0, left: 'auto', marginBottom: 10 }}
              pointerStyle={{ left: 'auto', right: 30, transform: 'none' }}
            />
            <PostIt color="green" width={90} rotate={-3}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 6 }}>
                <AssetImage src={ASSETS.characters[cards[speaker].character]?.speaking} width={56} height={56} />
              </div>
            </PostIt>
          </div>
        </div>
      )}

      {complete && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <StampBadge kind="done" size={50} />
        </div>
      )}
    </div>
  );
}
