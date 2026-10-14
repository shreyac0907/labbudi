import { useId } from 'react';
import { AmbientShadow, Specular, glassSheenGradient } from './materials';

const W = 36;
const H = 46;

// A light bulb with a visible zigzag filament and a screw-thread metal
// base. `lit` swaps the filament to a bright glowing orange and adds a
// soft radial glow behind the glass — the circuit's actual "did it work"
// signal.
export default function Bulb({ size = 1, lit = false, isHeld = false }) {
  const id = useId();

  return (
    <svg
      width={W * size}
      height={(H + 10) * size}
      viewBox={`0 0 ${W} ${H + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.22))` }}
    >
      <defs>
        {glassSheenGradient(`${id}-sheen`)}
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#FFD34D" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFD34D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(0 ${H + 8})`}>
        <AmbientShadow width={W} isHeld={isHeld} offsetX={2} />
      </g>

      {lit && <circle cx={W / 2} cy={20} r={26} fill={`url(#${id}-glow)`} />}

      {/* screw base / holder — warm yellow */}
      <rect x={W / 2 - 6} y={H - 12} width={12} height={12} fill="#F9A825" stroke="#B8791C" strokeWidth="1" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={W / 2 - 6} x2={W / 2 + 6} y1={H - 10 + i * 3.5} y2={H - 10 + i * 3.5} stroke="#B8791C" strokeWidth="1" />
      ))}

      {/* glass envelope */}
      <ellipse cx={W / 2} cy={20} rx={18} ry={20} fill="rgba(220,235,245,0.3)" stroke="#8FA0AA" strokeWidth="1.2" />

      {/* filament — dull grey when unlit, only orange once lit */}
      <path
        d={`M${W / 2 - 7},30 L${W / 2 - 7},22 L${W / 2 - 2},18 L${W / 2 + 2},22 L${W / 2 - 2},26 L${W / 2 + 2},30 L${W / 2 + 7},22 L${W / 2 + 7},30`}
        fill="none"
        stroke={lit ? '#FF8A00' : '#777777'}
        strokeWidth={lit ? 2 : 1.2}
        strokeLinecap="round"
        style={{ filter: lit ? 'drop-shadow(0 0 4px #FFB800)' : 'none' }}
      />

      <path d={`M${W / 2 + 12},4 L${W / 2 + 4},4 L${W / 2 + 7},20 L${W / 2 + 13},20 Z`} fill={`url(#${id}-sheen)`} />
      <Specular cx={W / 2 + 8} cy={8} r={2.4} opacity={0.6} />
    </svg>
  );
}
