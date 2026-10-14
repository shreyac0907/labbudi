import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AssetImage from '../AssetImage';
import SpeechBubble from '../SpeechBubble';
import CorkFrame from '../corkboard/CorkFrame';
import { PostIt, NoteCard } from '../corkboard/PostIt';
import { Pin } from '../corkboard/Pin';
import { WashiTape } from '../corkboard/WashiTape';
import { SubjectBadge } from '../corkboard/Stickers';
import { ASSETS } from '../../config/assets';
import { SUBJECT_PIN } from '../../config/practicals';

export const SCREEN5_INSET = 20;

const CORK_BG = {
  backgroundImage: 'url(/assets/textures/cork_texture.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#C8935A',
};

// A speech bubble that points LEFT (toward the whiteboard) instead of the
// usual downward pointer — every cork-panel character talks "at" the lab.
function LeftSpeechBubble({ text, visible }) {
  return (
    <SpeechBubble
      text={text}
      visible={visible}
      maxWidth={190}
      style={{ left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 12, transformOrigin: 'left center', zIndex: 20 }}
      pointerStyle={{
        top: '50%',
        left: -8,
        bottom: 'auto',
        transform: 'translateY(-50%)',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: '8px solid #fff',
        borderLeft: 'none',
      }}
    />
  );
}

function CharacterNote({ character, color, pin, rotate, top, left, trigger }) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!trigger?.text) return;
    setText(trigger.text);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [trigger?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, zIndex: 10 }}>
      <div style={{ position: 'relative', width: 80 }}>
        <LeftSpeechBubble text={text} visible={visible} />
        <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <Pin color={pin} size={16} />
        </div>
        <motion.div
          animate={visible ? { y: 0 } : { y: [0, -3, 0] }}
          transition={visible ? { duration: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PostIt color={color} width={80} rotate={rotate}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 6 }}>
              <AssetImage src={ASSETS.characters[character]?.[visible ? 'speaking' : 'idle']} width={52} height={52} />
            </div>
          </PostIt>
        </motion.div>
      </div>
    </div>
  );
}

function NotesCard({ notesCard, top, left }) {
  return (
    <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, zIndex: 8 }}>
      <div style={{ position: 'relative', width: 195 }}>
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <Pin color="blue" size={16} />
        </div>
        <div style={{ position: 'absolute', top: -6, right: -8, transform: 'rotate(10deg)', zIndex: 3 }}>
          <WashiTape variant="blue_dots" width={40} />
        </div>
        <NoteCard width={195} height={132} rotate={-2}>
          <div style={{ padding: '16px 12px 8px' }}>
            <div className="heading" style={{ fontSize: 12.5, marginBottom: 6, lineHeight: 1.2 }}>
              {notesCard.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: 14, fontFamily: 'var(--font-body)', fontSize: 10.5, lineHeight: 1.5, color: 'var(--color-dark)' }}>
              {notesCard.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </NoteCard>
      </div>
    </div>
  );
}

function DoodleCard({ doodle, subject, top, left }) {
  return (
    <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, zIndex: 6 }}>
      <div style={{ position: 'relative', width: 108 }}>
        <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <Pin color="yellow" size={14} />
        </div>
        <PostIt color="peach" width={108} rotate={7}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: 10 }}>
            {doodle}
          </div>
        </PostIt>
        <div style={{ position: 'absolute', bottom: -8, right: -8 }}>
          <SubjectBadge subject={subject} width={38} />
        </div>
      </div>
    </div>
  );
}

// The master Screen 5 shell: cork frame border, a hard-split whiteboard
// (left, interactive) / cork panel (right, decorative + characters) layout.
// Shared by every practical's Wet Lab so the look is identical across all
// of them — only `children` (the current slide's whiteboard content),
// `notesCard` and `doodle` change per practical/slide.
export default function Screen5Layout({
  subject,
  subjectCharacter,
  slideIndex,
  totalSlides,
  notesCard,
  doodle,
  pipTrigger,
  subjectTrigger,
  instruction,
  onBack,
  onNext,
  nextEnabled,
  nextLabel = 'Next →',
  onReset,
  children,
}) {
  const subjectColor = SUBJECT_PIN[subject] ?? 'yellow';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fff' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: SCREEN5_INSET,
          overflow: 'hidden',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* LEFT — whiteboard, the active lab zone */}
          <div style={{ position: 'relative', width: '50%', height: '100%', background: '#fff', overflow: 'hidden', boxShadow: '4px 0 10px rgba(0,0,0,0.06)' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 32px)',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>

              {instruction && (
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', padding: '0 16px 6px' }}>
                  {instruction}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 18px',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div onClick={onBack} style={{ cursor: 'pointer', position: 'relative', width: 66, height: 28 }}>
                  <WashiTape variant="blue_dots" width={66} />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 12,
                      color: '#2A4A6C',
                    }}
                  >
                    ← Back
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#888' }}>
                  Step {slideIndex + 1} of {totalSlides}
                </span>
                {nextEnabled ? (
                  <motion.button
                    onClick={onNext}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: 'none',
                      background: 'var(--color-start)',
                      color: '#fff',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {nextLabel}
                  </motion.button>
                ) : (
                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      background: 'var(--color-border)',
                      color: '#999',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                    }}
                  >
                    {nextLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider — the hard boundary between whiteboard and cork */}
          <div style={{ width: 3, background: '#8B6914', height: '100%', flexShrink: 0 }} />

          {/* RIGHT — cork panel, decorative + characters only */}
          <div style={{ position: 'relative', width: '50%', height: '100%', ...CORK_BG, overflow: 'hidden' }}>
            <CharacterNote character="pip" color="green" pin="red" rotate={-4} top={4} left={8} trigger={pipTrigger} />
            <CharacterNote character={subjectCharacter} color={subjectColor} pin={subjectColor} rotate={5} top={4} left={54} trigger={subjectTrigger} />
            <NotesCard notesCard={notesCard} top={38} left={16} />
            <DoodleCard doodle={doodle} subject={subject} top={76} left={22} />

            {onReset && (
              <button
                onClick={onReset}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: '1px solid rgba(192,80,61,0.5)',
                  background: 'rgba(255,255,255,0.85)',
                  color: '#C0503D',
                  cursor: 'pointer',
                  zIndex: 12,
                }}
              >
                Reset practical
              </button>
            )}
          </div>
        </div>

        <CorkFrame />
      </motion.div>
    </div>
  );
}
