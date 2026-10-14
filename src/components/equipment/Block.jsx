import { AmbientShadow, woodGrainPaths, CHROME } from './materials';

const TOP = '#D8A465';
const FRONT = '#B9803F';
const SIDE = '#8A5C2E';

// The wooden block pulled up the ramp — a simple cube shown from a 3/4
// angle (top, front, side faces) with a chrome hook on top for the string.
export default function Block({ size = 1, isHeld = false, shadow = true }) {
  const w = 52;
  const h = 40;
  const d = 16;

  return (
    <svg
      width={(w + d) * size}
      height={(h + d) * size}
      viewBox={`0 0 ${w + d} ${h + d}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 10 : 4}px 6px rgba(0,0,0,0.25))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${h + d + 4})`}>
          <AmbientShadow width={w + d} isHeld={isHeld} offsetX={4} />
        </g>
      )}

      {/* top face */}
      <path d={`M0,${d} L${w},${d} L${w + d},0 L${d},0 Z`} fill={TOP} stroke="#5C3A1B" strokeWidth="1.2" />
      {woodGrainPaths(d, -6, w - d, 4).map((p, i) => (
        <path key={i} d={p} fill="none" stroke="#5C3A1B" strokeWidth="0.8" opacity={0.18} />
      ))}
      {/* side face */}
      <path d={`M${w},${d} L${w + d},0 L${w + d},${h} L${w},${h + d} Z`} fill={SIDE} stroke="#4A2E15" strokeWidth="1.2" />
      {/* front face */}
      <rect x={0} y={d} width={w} height={h} fill={FRONT} stroke="#5C3A1B" strokeWidth="1.4" />
      <rect x={3} y={d + 3} width={w - 6} height={5} fill="rgba(255,255,255,0.28)" />

      {/* hook on top */}
      <circle cx={d + w * 0.5} cy={-3} r={4.4} fill="none" stroke={CHROME.base} strokeWidth="2.6" />
      <circle cx={d + w * 0.5} cy={-3} r={4.4} fill="none" stroke={CHROME.highlight} strokeWidth="0.9" />
    </svg>
  );
}
