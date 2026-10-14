import { useId } from 'react';
import { motion } from 'framer-motion';
import { mixHex, AmbientShadow, Specular, CHROME } from './materials';

const BRASS = '#1976D2'; // bright cobalt blue barrel
const BASE = '#424242';
const GAS_INLET = '#D32F2F'; // bright red rubber connector nozzle
const W = 44;
const H = 150;
const BARREL_H = 118; // spec minimum 120px barrel — noticeably long, not stubby

// A real Bunsen burner: heavy dark metal base, a brass barrel with a
// rotating collar (the air hole), and a flame that changes with `state` —
// 'off' (none), 'safety' (yellow, tall, flickering — air hole closed) or
// 'roaring' (blue, short, hissing — air hole open). The collar itself
// rotates a little further open for the roaring state, echoing what the
// student just did in the "adjust the air hole" sub-step.
export default function BunsenBurner({ size = 1, state = 'off', isHeld = false, collarOpenAmount = null, shadow = true }) {
  // collarOpenAmount (0-1), when provided, drives a CONTINUOUS collar/flame
  // interpolation instead of the binary state above — the "twist the
  // collar and watch the flame change live" mechanic. Purely additive: no
  // existing caller passes this, so every other usage renders exactly as
  // before.
  const clipId = useId();
  const continuous = collarOpenAmount != null;
  const collarOpen = continuous ? collarOpenAmount > 0.5 : state === 'roaring';
  const openAmt = continuous ? collarOpenAmount : collarOpen ? 1 : 0;

  return (
    <svg
      width={W * size}
      height={(H + 40) * size}
      viewBox={`0 0 ${W} ${H + 40}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 10 : 4}px 6px rgba(0,0,0,0.25))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${H + 8})`}>
          <AmbientShadow width={W * 1.7} isHeld={isHeld} offsetX={W * 0.1} />
        </g>
      )}

      {/* gas inlet — bright red rubber connector nozzle, visibly plugged into the base */}
      <rect x={W * 0.08} y={H - 7} width={W * 0.26} height={7} rx={3} fill={GAS_INLET} stroke={mixHex(GAS_INLET, -40)} strokeWidth="1" />
      <ellipse cx={W * 0.08} cy={H - 3.5} rx={3} ry={3} fill={mixHex(GAS_INLET, -30)} stroke="#222" strokeWidth="1" />

      {/* base — heavy dark metal disc, 3/4 perspective */}
      <ellipse cx={W / 2} cy={H} rx={W * 0.46} ry={7} fill={mixHex(BASE, -20)} stroke="#222" strokeWidth="1.2" />
      <ellipse cx={W / 2} cy={H - 3} rx={W * 0.46} ry={7} fill={BASE} stroke="#222" strokeWidth="1.2" />
      <ellipse cx={W / 2} cy={H - 5} rx={W * 0.3} ry={3.4} fill={mixHex(BASE, 25)} opacity={0.5} />

      {/* barrel — brass. Extends 3px into the base so the join has no gap. */}
      <rect x={W / 2 - 6} y={H - BARREL_H} width={12} height={BARREL_H + 3} fill={BRASS} stroke={mixHex(BRASS, -60)} strokeWidth="1.2" />
      <rect x={W / 2 - 5} y={H - BARREL_H} width={3} height={BARREL_H} fill="rgba(255,255,255,0.35)" />

      {/* collar: a brass sleeve round the barrel with a rounded window in it, like the real air hole. The barrel
          has its own hole behind; sliding the collar round moves the window over that hole (open) or away from
          it (closed), so the hole only shows where the window and the hole overlap. */}
      <defs>
        <linearGradient id={`${clipId}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B8862B" />
          <stop offset="0.35" stopColor="#F1CE74" />
          <stop offset="0.7" stopColor="#D9A441" />
          <stop offset="1" stopColor="#9A6E1E" />
        </linearGradient>
        <clipPath id={`${clipId}-win`}>
          <motion.rect x={W / 2 - 8} y={H - 24.5} width={16} height={12} rx={5} animate={{ x: -18 * (1 - openAmt) }} transition={{ duration: continuous ? 0 : 0.4 }} />
        </clipPath>
      </defs>
      <rect x={W / 2 - 13} y={H - 28} width={26} height={22} rx={3.5} fill={`url(#${clipId}-brass)`} stroke="#7A5412" strokeWidth="1.2" />
      <rect x={W / 2 - 13} y={H - 28} width={26} height={2.6} fill="rgba(255,255,255,0.35)" />
      <rect x={W / 2 - 13} y={H - 8.6} width={26} height={2.6} fill="rgba(0,0,0,0.18)" />
      {/* the window: the barrel shows through it, and its dark hole where the two overlap */}
      <motion.rect x={W / 2 - 8} y={H - 24.5} width={16} height={12} rx={5} fill={BRASS} stroke="#7A5412" strokeWidth="1.2" animate={{ x: -18 * (1 - openAmt) }} transition={{ duration: continuous ? 0 : 0.4 }} />
      <rect x={W / 2 - 7} y={H - 23.5} width={14} height={10} rx={4} fill="#10151A" clipPath={`url(#${clipId}-win)`} />
      <Specular cx={W / 2 + 4} cy={H - 42} r={1.8} opacity={0.6} />

      {/* jet nozzle */}
      <rect x={W / 2 - 3} y={H - BARREL_H - 4} width={6} height={5} fill={CHROME.base} />

      {(continuous || state !== 'off') && (
        <motion.g
          animate={
            continuous
              ? {}
              : state === 'safety'
                ? { scaleY: [1, 1.08, 0.96, 1], scaleX: [1, 0.95, 1.05, 1] }
                : { scaleY: [1, 1.04, 0.97, 1] }
          }
          transition={{ duration: state === 'safety' ? 0.5 : 0.25, repeat: continuous ? 0 : Infinity }}
          style={{ transformOrigin: `${W / 2}px ${H - BARREL_H}px` }}
        >
          {/* yellow safety flame — large, wide and bushy, fades out as the collar opens */}
          <g style={{ opacity: continuous ? 1 - openAmt : state === 'safety' ? 1 : 0 }}>
            <path
              d={`M${W / 2},${H - BARREL_H - 56} C${W / 2 - 6},${H - BARREL_H - 42} ${W / 2 - 20},${H - BARREL_H - 28} ${W / 2 - 17},${H - BARREL_H - 13} C${W / 2 - 15},${H - BARREL_H - 3} ${W / 2 - 6},${H - BARREL_H} ${W / 2},${H - BARREL_H} C${W / 2 + 6},${H - BARREL_H} ${W / 2 + 15},${H - BARREL_H - 3} ${W / 2 + 17},${H - BARREL_H - 13} C${W / 2 + 20},${H - BARREL_H - 28} ${W / 2 + 6},${H - BARREL_H - 42} ${W / 2},${H - BARREL_H - 56} Z`}
              fill="#F2A227"
              opacity={0.92}
            />
            <path
              d={`M${W / 2},${H - BARREL_H - 38} C${W / 2 - 4},${H - BARREL_H - 28} ${W / 2 - 11},${H - BARREL_H - 18} ${W / 2 - 9},${H - BARREL_H - 8} C${W / 2 - 7},${H - BARREL_H - 2} ${W / 2 - 3},${H - BARREL_H} ${W / 2},${H - BARREL_H} C${W / 2 + 3},${H - BARREL_H} ${W / 2 + 7},${H - BARREL_H - 2} ${W / 2 + 9},${H - BARREL_H - 8} C${W / 2 + 11},${H - BARREL_H - 18} ${W / 2 + 4},${H - BARREL_H - 28} ${W / 2},${H - BARREL_H - 38} Z`}
              fill="#FFD34D"
              opacity={0.9}
            />
          </g>

          {/* blue roaring flame — long and narrow, fades in as the collar opens */}
          <g style={{ opacity: continuous ? openAmt : state === 'roaring' ? 1 : 0 }}>
            <path
              d={`M${W / 2},${H - BARREL_H - 38} C${W / 2 - 3.6},${H - BARREL_H - 26} ${W / 2 - 3.4},${H - BARREL_H - 8} ${W / 2},${H - BARREL_H} C${W / 2 + 3.4},${H - BARREL_H - 8} ${W / 2 + 3.6},${H - BARREL_H - 26} ${W / 2},${H - BARREL_H - 38} Z`}
              fill="#4A7FE8"
              opacity={0.92}
            />
            {/* the pale inner cone, the key feature students learn to
                identify: ~60% of the outer flame's height, ~40% of its
                width, centred inside it. */}
            <path
              d={`M${W / 2},${H - BARREL_H - 23} C${W / 2 - 1.5},${H - BARREL_H - 15} ${W / 2 - 1.4},${H - BARREL_H - 5} ${W / 2},${H - BARREL_H} C${W / 2 + 1.4},${H - BARREL_H - 5} ${W / 2 + 1.5},${H - BARREL_H - 15} ${W / 2},${H - BARREL_H - 23} Z`}
              fill="rgba(200,230,255,0.9)"
            />
          </g>
        </motion.g>
      )}
    </svg>
  );
}
