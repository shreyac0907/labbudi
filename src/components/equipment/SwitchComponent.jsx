import { motion } from 'framer-motion';
import { mixHex, AmbientShadow, CHROME } from './materials';

const BASE = '#D8A465';
const W = 48;
const H = 16;

// A lever switch on a small wooden base — two chrome contact studs and a
// metal lever that lies flat to close the circuit or tilts up to break it.
export default function SwitchComponent({ size = 1, closed = false, isHeld = false }) {
  return (
    <svg
      width={W * size}
      height={(H + 20) * size}
      viewBox={`0 0 ${W} ${H + 20}`}
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.22))` }}
    >
      <g transform={`translate(0 ${H + 18})`}>
        <AmbientShadow width={W} isHeld={isHeld} offsetX={2} />
      </g>

      <rect x={0} y={2} width={W} height={H} rx={2} fill={BASE} stroke={mixHex(BASE, -60)} strokeWidth="1.2" />
      <rect x={2} y={4} width={W - 4} height={3} fill="rgba(255,255,255,0.3)" />

      {/* contact studs — 8px diameter, matching every other circuit
          component's terminal-screw size for a consistent visual language */}
      <circle cx={10} cy={2} r={4} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1" />
      <circle cx={W - 10} cy={2} r={4} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1" />

      {/* lever */}
      <motion.g animate={{ rotate: closed ? 0 : -28 }} transition={{ duration: 1.0, ease: 'easeInOut' }} style={{ transformOrigin: '10px 2px' }}>
        <line x1={10} y1={2} x2={W - 10} y2={2} stroke="#E65100" strokeWidth="3.4" strokeLinecap="round" />
        <line x1={10} y1={2} x2={W - 10} y2={2} stroke="#FFB74D" strokeWidth="1" strokeLinecap="round" />
        <circle cx={W - 10} cy={2} r={2.6} fill={CHROME.highlight} />
      </motion.g>

      {/* pivot pin — without it the lever appears to float at the hinge */}
      <circle cx={10} cy={2} r={2.5} fill="#666666" />
    </svg>
  );
}
