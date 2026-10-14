import { motion } from 'framer-motion';

const W = 96;
const H = 76;
const PIVOT = { x: W / 2, y: 50 };
const RADIUS = 29;
const SWEEP = 55; // the needle swings this many degrees either side of straight up

// A school analogue meter, like the ones on the lab bench: a grey case with a cream face, a curved scale, a needle, one big
// letter saying what it measures (A for the ammeter, V for the voltmeter) and two terminals along the bottom, red (+) on
// the left and black (−) on the right. The same case serves both, with a different letter, colour and range.
export default function MeterBlock({ size = 1, unit = 'A', reading = 0, maxReading = 1, zoomed = false, isHeld = false }) {
  const accent = unit === 'A' ? '#C62828' : '#1565C0';
  const angleFor = (v) => -SWEEP + (Math.max(0, Math.min(maxReading, v)) / maxReading) * 2 * SWEEP; // degrees from straight up
  const point = (r, deg) => ({ x: PIVOT.x + r * Math.sin((deg * Math.PI) / 180), y: PIVOT.y - r * Math.cos((deg * Math.PI) / 180) });
  const a0 = point(RADIUS, -SWEEP);
  const a1 = point(RADIUS, SWEEP);
  const majors = 6;
  const minors = 5;

  return (
    <svg
      width={W * size}
      height={H * size}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 ${isHeld ? 8 : 4}px 5px rgba(0,0,0,0.25))` }}
    >
      {/* the case */}
      <rect x={0} y={0} width={W} height={H} rx={9} fill="#74808B" />
      <rect x={0} y={0} width={W} height={H} rx={9} fill="none" stroke="#4E5964" strokeWidth="2" />
      <rect x={4} y={3} width={W - 8} height={3} rx={1.5} fill="rgba(255,255,255,0.28)" />

      {/* the face with its scale */}
      <rect x={6} y={7} width={W - 12} height={50} rx={5} fill="#FBF7EA" stroke="#3B434B" strokeWidth="1.6" />
      <path d={`M${a0.x},${a0.y} A${RADIUS},${RADIUS} 0 0 1 ${a1.x},${a1.y}`} fill="none" stroke="#2D3339" strokeWidth="1.6" />
      {Array.from({ length: (majors - 1) * minors + 1 }, (_, i) => {
        const major = i % minors === 0;
        const deg = -SWEEP + (i / ((majors - 1) * minors)) * 2 * SWEEP;
        const p1 = point(RADIUS, deg);
        const p2 = point(RADIUS - (major ? 5.5 : 3), deg);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#2D3339" strokeWidth={major ? 1.5 : 0.8} />;
      })}
      {zoomed &&
        Array.from({ length: majors }, (_, i) => {
          const v = (i / (majors - 1)) * maxReading;
          const p = point(RADIUS + 8.5, -SWEEP + (i / (majors - 1)) * 2 * SWEEP); // outside the scale, so they never sit on the letter or the needle
          return (
            <text key={i} x={p.x} y={p.y + 2.8} fontSize={7.5} fontWeight={800} fontFamily="var(--font-body)" fill="#2D3339" textAnchor="middle">
              {v.toFixed(Number.isInteger(v) ? 0 : 1)}
            </text>
          );
        })}

      {/* what it measures: in the corner, out of the way of the needle and the numbers */}
      <text x={19} y={54} fontSize={15} fontWeight={900} fontFamily="var(--font-heading)" fill={accent} textAnchor="middle">
        {unit}
      </text>

      {/* the needle */}
      <motion.g animate={{ rotate: angleFor(reading) }} initial={false} transition={{ type: 'spring', stiffness: 70, damping: 11 }} style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}>
        <line x1={PIVOT.x} y1={PIVOT.y + 4} x2={PIVOT.x} y2={PIVOT.y - RADIUS + 1} stroke="#D32F2F" strokeWidth={1.8} strokeLinecap="round" />
      </motion.g>
      <circle cx={PIVOT.x} cy={PIVOT.y} r={3.4} fill="#2D3339" />

      {/* terminals: red + on the left, black − on the right */}
      <rect x={6} y={59} width={W - 12} height={12} rx={4} fill="#4B555F" />
      <circle cx={24} cy={65} r={5.2} fill="#D32F2F" stroke="#7A1010" strokeWidth="1.4" />
      <circle cx={24} cy={65} r={1.8} fill="#F6B8B8" />
      <circle cx={W - 24} cy={65} r={5.2} fill="#1E1E1E" stroke="#000" strokeWidth="1.4" />
      <circle cx={W - 24} cy={65} r={1.8} fill="#8A8A8A" />
      <text x={36} y={68} fontSize={8} fontWeight={900} fontFamily="var(--font-heading)" fill="#fff" textAnchor="middle">+</text>
      <text x={W - 36} y={68} fontSize={9} fontWeight={900} fontFamily="var(--font-heading)" fill="#fff" textAnchor="middle">−</text>
    </svg>
  );
}
