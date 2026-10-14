import { motion } from 'framer-motion';
import { mixHex, AmbientShadow } from './materials';

const CERAMIC = '#F7F5F0';
const W = 56;
const H = 22;

const CONTENT_COLOUR = {
  solution: '#1565C0', // vivid, saturated copper sulfate blue — not pale
  crystals: '#4E8FE0',
  powder: '#E8E4DA',
  empty: null,
};
const RIM = '#4FC3F7'; // sky blue rim

// A shallow ceramic evaporating dish. `contentState` drives what's inside:
// 'solution' (blue copper sulfate solution), 'crystals' (deepening blue as
// water evaporates), 'powder' (white anhydrous copper sulfate once fully
// heated) — the same component serves the whole Heat checkpoint by just
// swapping this prop as the sub-steps advance.
export default function EvaporatingDish({ size = 1, contentState = 'solution', isHeld = false, contactShadow = false, shadow = true }) {
  const fill = CONTENT_COLOUR[contentState];

  return (
    <svg
      width={W * size}
      height={(H + 14) * size}
      viewBox={`0 0 ${W} ${H + 14}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.22))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${H + 12})`}>
          <AmbientShadow width={W * 1.1} isHeld={isHeld} offsetX={2} contactShadow={contactShadow} />
        </g>
      )}

      {/* outer rim — ceramic, 3/4 perspective */}
      <ellipse cx={W / 2} cy={H * 0.35} rx={W / 2} ry={H * 0.5} fill={CERAMIC} stroke={RIM} strokeWidth="2.2" />
      {/* inner bowl */}
      <ellipse cx={W / 2} cy={H * 0.42} rx={W / 2 - 6} ry={H * 0.38} fill={mixHex(CERAMIC, -18)} />

      {fill && (
        <motion.ellipse
          cx={W / 2}
          cy={H * 0.44}
          rx={W / 2 - 9}
          ry={H * 0.3}
          initial={false}
          animate={{ fill, opacity: contentState === 'powder' ? 0.95 : 0.88 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      )}
      {contentState === 'crystals' && (
        <>
          <ellipse cx={W / 2 - 8} cy={H * 0.42} rx={4} ry={2.2} fill="#2E5FB0" opacity={0.7} />
          <ellipse cx={W / 2 + 6} cy={H * 0.46} rx={3} ry={1.8} fill="#2E5FB0" opacity={0.7} />
        </>
      )}
      {contentState === 'powder' && (
        <>
          <circle cx={W / 2 - 6} cy={H * 0.4} r={1.6} fill="#D8D2C4" />
          <circle cx={W / 2 + 5} cy={H * 0.46} r={1.4} fill="#D8D2C4" />
          <circle cx={W / 2} cy={H * 0.36} r={1.2} fill="#D8D2C4" />
        </>
      )}
    </svg>
  );
}
