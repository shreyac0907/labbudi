import { AmbientShadow } from './materials';

const MAT = '#455A64';
const W = 140;
const H = 30;

// A heat-proof mat — the very first thing that goes down, directly on the
// bench, before anything else in the stack.
export default function HeatMat({ size = 1, isHeld = false, shadow = true }) {
  return (
    <svg
      width={W * size}
      height={(H + 10) * size}
      viewBox={`0 0 ${W} ${H + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 8 : 2}px 4px rgba(0,0,0,0.2))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${H + 8})`}>
          <AmbientShadow width={W * 1.05} isHeld={isHeld} offsetX={2} contactShadow />
        </g>
      )}
      <ellipse cx={W / 2} cy={H * 0.5} rx={W / 2} ry={H * 0.5} fill={MAT} stroke="#2C3A40" strokeWidth="1.4" />
      <ellipse cx={W / 2} cy={H * 0.44} rx={W / 2 - 6} ry={H * 0.4} fill="none" stroke="#546E7A" strokeWidth="1" opacity={0.6} />
    </svg>
  );
}
