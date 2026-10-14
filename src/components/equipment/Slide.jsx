import { useId } from 'react';
import { AmbientShadow, glassSheenGradient } from './materials';

const W = 60;
const H = 20;

// A glass microscope slide with an onion-cell sample smear and, once
// prepared, a coverslip laid over it — both pieces of glass get the same
// sheen treatment as the test tube so they read as transparent, not flat.
export default function Slide({ size = 1, hasSample = false, hasCoverslip = false, hasStain = false, isHeld = false, shadow = true }) {
  const id = useId();

  return (
    <svg
      width={W * size}
      height={(H + 10) * size}
      viewBox={`0 0 ${W} ${H + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.2))` : undefined }}
    >
      <defs>{glassSheenGradient(`${id}-sheen`)}</defs>

      {shadow && (
        <g transform={`translate(0 ${H + 8})`}>
          <AmbientShadow width={W} isHeld={isHeld} offsetX={2} />
        </g>
      )}

      <rect x={0} y={0} width={W} height={H} rx={1.5} fill="rgba(210,225,235,0.35)" stroke="#9AA6AD" strokeWidth="1" />

      {/* cheek-cell smear — pale salmon (matches CottonSwab's collected tint)
          until stained, then blue */}
      {hasSample && <ellipse cx={W / 2} cy={H / 2} rx={14} ry={4.5} fill={hasStain ? '#90B8E8' : '#F8E8E0'} opacity={hasStain ? 0.8 : 0.6} />}

      {hasCoverslip && (
        <rect x={W / 2 - 14} y={H / 2 - 7} width={28} height={14} rx={1} fill="rgba(255,255,255,0.4)" stroke="#B9C4CA" strokeWidth="0.8" />
      )}

      <path d={`M${W - 2},1 L${W * 0.7},1 L${W * 0.8},${H - 1} L${W - 2},${H - 1} Z`} fill={`url(#${id}-sheen)`} />
    </svg>
  );
}
