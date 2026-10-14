import { motion } from 'framer-motion';
import CorkFrame from './corkboard/CorkFrame';

// Screen 5's intentional break from the corkboard look: a whiteboard sheet
// pinned inside the same wood frame as every other screen, with a few
// marker-style doodles scattered around the edges instead of cork texture.
// The Wet Lab is the one screen that gets a noticeably bigger canvas than
// the rest of the app — its bench layouts need the extra room — so its
// inset is much smaller than CorkBoard's standard margin.
export const LAB_BOARD_INSET = 20;

function Doodle({ children, top, left, rotate = 0, size = 46, color = '#9FB6D9' }) {
  return (
    <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: `rotate(${rotate}deg)`, opacity: 0.55, pointerEvents: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  );
}

function DoodleLayer() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Doodle top={4} left={6} rotate={-8} color="#9FB6D9">
        {/* lightbulb */}
        <circle cx="30" cy="24" r="14" />
        <path d="M24,36 L36,36 M25,42 L35,42 M27,47 L33,47" />
        <path d="M30,10 L30,4 M14,24 L8,24 M52,24 L46,24" />
      </Doodle>
      <Doodle top={5} left={92} rotate={10} color="#E8A9B8" size={40}>
        {/* squiggle */}
        <path d="M5,40 Q15,10 30,30 Q45,50 55,20" />
      </Doodle>
      <Doodle top={90} left={4} rotate={6} color="#9AC7A6" size={42}>
        {/* simple atom */}
        <ellipse cx="30" cy="30" rx="24" ry="9" />
        <ellipse cx="30" cy="30" rx="24" ry="9" transform="rotate(60 30 30)" />
        <ellipse cx="30" cy="30" rx="24" ry="9" transform="rotate(120 30 30)" />
        <circle cx="30" cy="30" r="4" fill="#9AC7A6" stroke="none" />
      </Doodle>
      <Doodle top={88} left={93} rotate={-6} color="#D9B36A" size={38}>
        {/* star scribble */}
        <path d="M30,6 L36,24 L54,24 L39,35 L45,53 L30,42 L15,53 L21,35 L6,24 L24,24 Z" />
      </Doodle>
      <Doodle top={45} left={2} rotate={0} color="#B7A6D9" size={30}>
        {/* arrow */}
        <path d="M6,15 L24,15 M17,7 L26,15 L17,23" />
      </Doodle>
    </div>
  );
}

export default function LabBoard({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fff' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: LAB_BOARD_INSET,
          overflow: 'hidden',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: '#F7F8FA' }} />
        <DoodleLayer />
        <CorkFrame />
        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>{children}</div>
      </motion.div>
    </div>
  );
}
