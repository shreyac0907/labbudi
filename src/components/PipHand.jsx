import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pip's hand is switched off in every practical: the normal mouse cursor is used
// instead. Set this back to true to bring the hand (and the hidden cursor) back;
// the games still mount <PipHand /> so nothing else needs to change.
const HAND_ENABLED = false;

const GREEN = '#7AB648';
const DARK_GREEN = '#4D7A28';
const LIGHT_GREEN = '#A8D87A';

// Pip's hand is the touch/cursor replacement during physical interaction
// steps — it appears at the pointer, changes shape to communicate what
// the student is doing (open/grip/point/squeeze/swipe), and gives every
// drag, hold, and turn a bit of Cooking-Mama-style physical weight instead
// of a bare mouse cursor.
//
// FINGER_POSE gives each state's finger/thumb group transforms — curling
// is faked with rotate/translateY on each digit rather than true SVG path
// morphing, which reads just as smoothly for shapes this simple and keeps
// every state a plain, readable set of numbers instead of hand-fitted
// path interpolation.
const FINGER_POSE = {
  open: { left: { rotate: 0, y: 0 }, mid: { rotate: 0, y: 0 }, right: { rotate: 0, y: 0 }, thumb: { rotate: -25 }, palmScaleX: 1 },
  grip: { left: { rotate: 48, y: 5 }, mid: { rotate: 52, y: 6 }, right: { rotate: 48, y: 5 }, thumb: { rotate: -4 }, palmScaleX: 0.96 },
  pointing: { left: { rotate: 60, y: 7 }, mid: { rotate: 0, y: -5 }, right: { rotate: 60, y: 7 }, thumb: { rotate: -8 }, palmScaleX: 1 },
  squeeze: { left: { rotate: 42, y: 4 }, mid: { rotate: 46, y: 5 }, right: { rotate: 42, y: 4 }, thumb: { rotate: 5 }, palmScaleX: 0.92 },
  swipe: { left: { rotate: 0, y: 0 }, mid: { rotate: 0, y: 0 }, right: { rotate: 0, y: 0 }, thumb: { rotate: -25 }, palmScaleX: 1 },
};

// Base tilt (12° clockwise, "naturally held") plus any state/parent-driven
// extra rotation — RotateGame passes its own knob angle here so the hand
// visibly turns with whatever it's gripping, and SWIPE rotates a further
// -90° so the hand reads as held sideways.
function HandSvg({ state, size = 1 }) {
  const pose = FINGER_POSE[state] ?? FINGER_POSE.open;
  const scale = state === 'squeeze' ? 1.1 : 1;

  return (
    <motion.svg
      width={52 * size}
      height={58 * size}
      viewBox="0 0 52 58"
      animate={{ scale }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* thumb — stubby, angled outward on the left */}
      <motion.g
        animate={{ rotate: pose.thumb.rotate }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        style={{ transformOrigin: '10px 32px' }}
      >
        <rect x={0} y={26} width={11} height={17} rx={5} fill={GREEN} stroke={DARK_GREEN} strokeWidth={2.5} />
      </motion.g>

      {/* palm */}
      <motion.rect
        x={7}
        y={20}
        width={38}
        height={36}
        rx={16}
        fill={GREEN}
        stroke={DARK_GREEN}
        strokeWidth={2.5}
        animate={{ scaleX: pose.palmScaleX }}
        transition={
          state === 'squeeze'
            ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' }
            : { duration: 0.15, ease: 'easeInOut' }
        }
        style={{ transformOrigin: '26px 40px' }}
      />
      <ellipse cx={26} cy={39} rx={11} ry={13} fill={LIGHT_GREEN} opacity={0.4} />
      {[16, 26, 36].map((cx) => (
        <circle key={cx} cx={cx} cy={24} r={1.5} fill={DARK_GREEN} opacity={0.3} />
      ))}

      {/* left finger */}
      <motion.g animate={{ rotate: pose.left.rotate, y: pose.left.y }} transition={{ duration: 0.15, ease: 'easeInOut' }} style={{ transformOrigin: '15px 20px' }}>
        <rect x={9} y={4} width={12} height={17} rx={6} fill={GREEN} stroke={DARK_GREEN} strokeWidth={2.5} />
      </motion.g>
      {/* middle finger — taller */}
      <motion.g animate={{ rotate: pose.mid.rotate, y: pose.mid.y }} transition={{ duration: 0.15, ease: 'easeInOut' }} style={{ transformOrigin: '26px 20px' }}>
        <rect x={20} y={0} width={12} height={21} rx={6} fill={GREEN} stroke={DARK_GREEN} strokeWidth={2.5} />
      </motion.g>
      {/* right finger */}
      <motion.g animate={{ rotate: pose.right.rotate, y: pose.right.y }} transition={{ duration: 0.15, ease: 'easeInOut' }} style={{ transformOrigin: '37px 20px' }}>
        <rect x={31} y={4} width={12} height={17} rx={6} fill={GREEN} stroke={DARK_GREEN} strokeWidth={2.5} />
      </motion.g>
    </motion.svg>
  );
}

// A plain CSS ellipse (not SVG — this sits in the same HTML-context div as
// the hand's own translate/rotate/skew wrapper, not inside <HandSvg>'s
// <svg>, so an <ellipse> element here would be invalid outside an <svg>).
// Shadow the hand casts on the surface below it — a plain CSS ellipse (not
// SVG — this sits in the same HTML-context div as the hand's own
// translate/rotate/skew wrapper). `raised` (gripping/holding something
// above the surface) pushes the shadow further down/right, implying the
// hand is physically lifted off the bench in 3D space.
function HandShadow({ gripped, size = 1 }) {
  const yOffset = (gripped ? 14 : 4) * size;
  return (
    <div
      style={{
        position: 'absolute',
        left: (gripped ? 18 : 16) * size - 30 * size,
        top: yOffset + 50 * size,
        width: 60 * size,
        height: 12 * size,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.25)',
        filter: 'blur(4px)',
        transition: 'all 0.15s ease-out',
      }}
    />
  );
}

const HOTSPOT_OFFSET_BASE = { x: -20, y: -8 };
// Default hand size — ~120x140px (was a fixed 52x58px cursor-scale icon).
// `holdingLarge` (dropper bulb, Newton meter handle, cotton swab) bumps it
// a further 1.4x so it visually reads as gripping something substantial.
const DEFAULT_SIZE = 2.3;
const HOLDING_MULTIPLIER = 1.4;

// containerRef — the interactive scene element to track the pointer over;
// the hand only appears once the pointer has actually entered it.
// state — 'open' | 'grip' | 'pointing' | 'squeeze' | 'swipe'.
// rotation — extra degrees on top of the base 12° tilt (RotateGame passes
// the knob's live angle here so the hand visibly turns with it).
// swiping — while true, renders the fading 3-copy motion trail behind the
// hand in its current direction of travel.
// active — when false the hand never shows, even if the pointer is inside
// the container (used once a step has finished and shouldn't react to a
// leftover cursor position).
export default function PipHand({ containerRef, state = 'open', rotation = 0, swiping = false, active = true, holdingLarge = false }) {
  const [pos, setPos] = useState(null); // page {x,y} of the pointer, or null if never entered
  const [inside, setInside] = useState(false);
  const trailRef = useRef([]);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return undefined;

    function handleMove(e) {
      const next = { x: e.clientX, y: e.clientY };
      setPos(next);
      if (swiping) {
        trailRef.current = [next, ...trailRef.current].slice(0, 4);
        setTrail(trailRef.current);
      }
    }
    function handleEnter() {
      setInside(true);
    }
    function handleLeave() {
      setInside(false);
    }

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerenter', handleEnter);
    el.addEventListener('pointerleave', handleLeave);
    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerenter', handleEnter);
      el.removeEventListener('pointerleave', handleLeave);
      el.style.cursor = '';
    };
  }, [containerRef, swiping]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return undefined;
    el.style.cursor = HAND_ENABLED && active ? 'none' : '';
    return () => {
      el.style.cursor = '';
    };
  }, [containerRef, active]);

  useEffect(() => {
    if (!swiping) {
      trailRef.current = [];
      setTrail([]);
    }
  }, [swiping]);

  const visible = HAND_ENABLED && active && inside && !!pos;

  // 3/4 perspective: the hand reads slightly smaller and more distant near
  // the top of its container (the back of the bench) than near the bottom
  // (right in front of the viewer).
  const rect = containerRef?.current?.getBoundingClientRect();
  const verticalT = pos && rect && rect.height > 0 ? Math.max(0, Math.min(1, (pos.y - rect.top) / rect.height)) : 1;
  const perspectiveScale = 0.85 + verticalT * 0.15;

  const totalRotation = 12 + rotation + (state === 'swipe' ? -90 : 0);
  const effectiveSize = DEFAULT_SIZE * (holdingLarge ? HOLDING_MULTIPLIER : 1);
  const hotspot = { x: HOTSPOT_OFFSET_BASE.x * effectiveSize, y: HOTSPOT_OFFSET_BASE.y * effectiveSize };
  const originStr = `${20 * effectiveSize}px ${8 * effectiveSize}px`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pip-hand"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
          exit={{ opacity: 0, scale: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
          transition={{
            opacity: { duration: 0.2 },
            scale: { type: 'spring', stiffness: 400 },
            x: { type: 'spring', stiffness: 600, damping: 35 },
            y: { type: 'spring', stiffness: 600, damping: 35 },
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 200,
            pointerEvents: 'none',
            transformOrigin: originStr,
          }}
        >
          {/* swipe motion trail — ghost copies fading out behind the hand */}
          {swiping &&
            trail.slice(1).map((p, i) => (
              <div
                key={`${p.x}-${p.y}-${i}`}
                style={{
                  position: 'absolute',
                  left: p.x - pos.x + hotspot.x,
                  top: p.y - pos.y + hotspot.y,
                  opacity: [0.3, 0.2, 0.1][i] ?? 0,
                  transform: `rotate(${totalRotation}deg) scale(${perspectiveScale})`,
                  transformOrigin: originStr,
                  transition: 'opacity 0.15s ease-out',
                }}
              >
                <HandSvg state="swipe" size={effectiveSize} />
              </div>
            ))}

          <div
            style={{
              position: 'relative',
              transform: `translate(${hotspot.x}px, ${hotspot.y}px) rotate(${totalRotation}deg) skewX(-3deg) scale(${perspectiveScale})`,
              transformOrigin: originStr,
              transition: 'transform 0.1s linear',
            }}
          >
            <HandShadow gripped={state === 'grip' || state === 'squeeze'} size={effectiveSize} />
            <HandSvg state={state} size={effectiveSize} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A one-shot pose used by HoldGame when a hold completes: the hand isn't
// following the pointer any more, it's raised and celebrating in place at
// a fixed screen position, fingers spread like a thumbs-up, before fading
// out. Not pointer-tracked — the parent positions and times it directly.
export function PipHandCelebrate({ x, y, size = DEFAULT_SIZE }) {
  if (!HAND_ENABLED) return null;
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: [1, 1, 0], y: -14, scale: 1.08 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ position: 'fixed', left: x + HOTSPOT_OFFSET_BASE.x * size, top: y + HOTSPOT_OFFSET_BASE.y * size, zIndex: 200, pointerEvents: 'none' }}
    >
      <div style={{ transform: 'rotate(12deg)' }}>
        <HandSvg state="pointing" size={size} />
      </div>
    </motion.div>
  );
}
