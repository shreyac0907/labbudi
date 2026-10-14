import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AssetImage from '../components/AssetImage';
import CorkBoard from '../components/CorkBoard';
import { NoteCardWithClip, NoteCard, PostIt } from '../components/corkboard/PostIt';
import { Pin } from '../components/corkboard/Pin';
import { WashiTape } from '../components/corkboard/WashiTape';
import { SubjectBadge, Starburst, StampBadge } from '../components/corkboard/Stickers';
import { PinDrop } from '../components/corkboard/PinDrop';
import { ASSETS } from '../config/assets';
import { PRACTICALS, SUBJECT_META, SUBJECT_PIN, YEAR_LABELS } from '../config/practicals';
import { zoomOrigin } from '../utils/zoomNav';

function isCompleted(year, index) {
  return localStorage.getItem(`labbudi_${year}_${index}_complete`) === 'true';
}

const CARD_LAYOUT = [
  { top: 34, left: 26, rotate: -6 },
  { top: 32, left: 50, rotate: 4 },
  { top: 66, left: 30, rotate: 5 },
  { top: 36, left: 74, rotate: -4 },
  { top: 68, left: 66, rotate: -7 },
];

// All four pinned in a tilted column down the left edge of the board.
const CHAR_LAYOUT = [
  { name: 'pip', color: 'green', pin: 'red', rotate: -5, top: 14, left: 8 },
  { name: 'lili', color: 'pink', pin: 'pink', rotate: 6, top: 37, left: 7 },
  { name: 'madu', color: 'yellow', pin: 'yellow', rotate: -4, top: 60, left: 8 },
  { name: 'lumi', color: 'blue', pin: 'blue', rotate: 5, top: 83, left: 7 },
];

function PracticalCard({ practical, index, year, available, completed, onStart, onLocked }) {
  const [hover, setHover] = useState(false);
  const layout = CARD_LAYOUT[index % CARD_LAYOUT.length];
  const meta = SUBJECT_META[practical.subject];
  const pinColor = SUBJECT_PIN[practical.subject] ?? 'red';

  return (
    <div
      style={{
        position: 'absolute',
        top: `${layout.top}%`,
        left: `${layout.left}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: hover ? 15 : 4,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <PinDrop rotate={layout.rotate} delay={index * 0.08}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
            <Pin color={pinColor} size={22} />
          </div>

          <div style={{ position: 'absolute', top: -8, right: 4, zIndex: 6, transform: 'rotate(8deg)' }}>
            <WashiTape variant={index % 2 === 0 ? 'yellow_plain' : 'blue_dots'} width={70} rotate={0} />
          </div>

          <motion.div
            animate={{
              y: hover ? -8 : 0,
              rotate: hover ? layout.rotate * 0.4 : layout.rotate,
              boxShadow: hover ? '6px 14px 22px rgba(0,0,0,0.25)' : '2px 4px 8px rgba(0,0,0,0.15)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{ cursor: 'pointer', opacity: available ? 1 : 0.6 }}
            onClick={(e) => (available ? onStart(index, e) : onLocked())}
          >
            <NoteCard width={228} height={196}>
              <div style={{ position: 'relative', width: '100%', height: '100%', padding: '20px 16px 14px' }}>
                <div style={{ position: 'absolute', top: 6, right: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SubjectBadge subject={practical.subject} width={62} />
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: meta.color,
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12,
                  }}
                >
                  {index + 1}
                </div>

                <h3
                  className="heading"
                  style={{ fontSize: 14, margin: '8px 0 4px', lineHeight: 1.25, maxWidth: 150 }}
                >
                  {practical.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 10.5,
                    color: 'var(--color-mid)',
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: 175,
                  }}
                >
                  {practical.teaser}
                </p>

                <div style={{ position: 'absolute', bottom: 8, right: 10 }}>
                  <Starburst width={62} color="var(--color-start)">
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 9, color: '#fff' }}>
                      {available ? 'Start →' : 'Locked'}
                    </span>
                  </Starburst>
                </div>
              </div>
            </NoteCard>
          </motion.div>

          {completed && (
            <motion.div
              initial={{ scale: 1.8, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              style={{ position: 'absolute', top: -10, left: -10, zIndex: 7 }}
            >
              <StampBadge kind="done" size={56} />
            </motion.div>
          )}
        </div>
      </PinDrop>
    </div>
  );
}

function CharacterPostIt({ name, color, pin, rotate, top, left }) {
  return (
    <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
      <PinDrop rotate={rotate}>
        <div style={{ position: 'relative', width: 96 }}>
          <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
            <Pin color={pin} size={16} />
          </div>
          <PostIt color={color} width={96} rotate={rotate}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 8 }}>
              <AssetImage src={ASSETS.characters[name].idle} width={58} height={58} />
            </div>
          </PostIt>
        </div>
      </PinDrop>
    </div>
  );
}

export default function CorkboardPage() {
  const { year } = useParams();
  const navigate = useNavigate();
  const yearData = PRACTICALS[year] ?? PRACTICALS.y7;
  const yearLabel = YEAR_LABELS[year] ?? 'Year 7';
  const [toast, setToast] = useState(false);

  function handleStart(index, e) {
    navigate(`/journey/${year}/${index}`, { state: zoomOrigin(e) });
  }

  function handleLocked() {
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  return (
    <CorkBoard>
      <div className="page-root">
        <div style={{ position: 'absolute', top: '4%', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <NoteCardWithClip width={320} height={110}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <h1 className="heading" style={{ fontSize: 24, margin: 0, textAlign: 'center' }}>
                {yearLabel} Practicals
              </h1>
            </div>
          </NoteCardWithClip>
        </div>

        {yearData.list.map((practical, index) => (
          <PracticalCard
            key={index}
            practical={practical}
            index={index}
            year={year}
            available={yearData.available}
            completed={yearData.available && isCompleted(year, index)}
            onStart={handleStart}
            onLocked={handleLocked}
          />
        ))}

        {CHAR_LAYOUT.map((c) => (
          <CharacterPostIt key={c.name} {...c} />
        ))}

        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '10px 20px',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Pip: "Coming soon!"
          </div>
        )}
      </div>
    </CorkBoard>
  );
}
