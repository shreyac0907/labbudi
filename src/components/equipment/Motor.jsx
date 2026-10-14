import { AmbientShadow, Specular, CHROME } from './materials';

const W = 40;
const H = 40;

// A small DC motor — chrome casing with a spinning fan/propeller once the
// circuit carrying it is live. Same 5-layer material vocabulary as the
// rest of the equipment set (base/shadow/highlight/specular/ambient).
export default function Motor({ size = 1, spinning = false }) {
  return (
    <svg
      width={W * size}
      height={(H + 10) * size}
      viewBox={`0 0 ${W} ${H + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.22))' }}
    >
      <g transform={`translate(0 ${H + 8})`}>
        <AmbientShadow width={W} offsetX={2} />
      </g>

      {/* casing */}
      <rect x={4} y={6} width={W - 8} height={H - 14} rx={6} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1.2" />
      <rect x={4} y={6} width={(W - 8) * 0.4} height={H - 14} rx={6} fill={CHROME.highlight} opacity={0.5} />
      <Specular cx={W / 2 + 4} cy={12} r={2.6} opacity={0.7} />

      {/* front hub + fan blades */}
      <circle cx={W / 2} cy={(H - 14) / 2 + 6} r={11} fill="#4A4A4A" stroke="#2A2A2A" strokeWidth="1" />
      <g
        style={
          spinning
            ? { transformOrigin: `${W / 2}px ${(H - 14) / 2 + 6}px`, animation: 'motor-spin 0.35s linear infinite' }
            : { transformOrigin: `${W / 2}px ${(H - 14) / 2 + 6}px` }
        }
      >
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx={W / 2}
            cy={(H - 14) / 2 + 6 - 7}
            rx={3}
            ry={6}
            fill={spinning ? '#DDD' : '#888'}
            transform={`rotate(${deg} ${W / 2} ${(H - 14) / 2 + 6})`}
          />
        ))}
      </g>
      <circle cx={W / 2} cy={(H - 14) / 2 + 6} r={3} fill="#222" />

      {/* two terminal leads at the base */}
      <line x1={W / 2 - 8} y1={H - 8} x2={W / 2 - 8} y2={H - 2} stroke="#B8791C" strokeWidth="2" />
      <line x1={W / 2 + 8} y1={H - 8} x2={W / 2 + 8} y2={H - 2} stroke="#B8791C" strokeWidth="2" />

      <style>{'@keyframes motor-spin { to { transform: rotate(360deg); } }'}</style>
    </svg>
  );
}
