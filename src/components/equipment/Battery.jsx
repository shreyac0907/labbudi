import { mixHex, AmbientShadow, Specular, CHROME } from './materials';

const WRAP = '#D32F2F'; // classic red battery body
const W = 26;
const H = 56;

// A cylindrical cell — green wrap label, a flat metal - terminal at the
// bottom and a raised metal + button at the top, matte-metal end caps.
export default function Battery({ size = 1, isHeld = false }) {
  return (
    <svg
      width={W * size}
      height={(H + 10) * size}
      viewBox={`0 0 ${W} ${H + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.22))` }}
    >
      <g transform={`translate(0 ${H + 8})`}>
        <AmbientShadow width={W * 1.3} isHeld={isHeld} offsetX={2} />
      </g>

      {/* - terminal, bottom */}
      <rect x={2} y={H - 6} width={W - 4} height={6} rx={1} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1" />

      {/* body — light is top-right: shadow strip left, highlight strip right */}
      <rect x={0} y={8} width={W} height={H - 10} rx={3} fill={WRAP} stroke={mixHex(WRAP, -60)} strokeWidth="1.2" />
      <rect x={2} y={8} width={3} height={H - 10} fill="rgba(0,0,0,0.12)" />
      <rect x={W - 6} y={8} width={4} height={H - 10} fill="rgba(255,255,255,0.3)" />
      <rect x={0} y={H * 0.55} width={W} height={H * 0.14} fill="#fff" opacity={0.9} />
      {/* label text sits on the flat white strip, not the gradient body, in a
          dark shade for proper contrast against that near-white background */}
      <text x={W / 2} y={H * 0.55 + 9} textAnchor="middle" fontSize="8" fontFamily="var(--font-heading)" fill={mixHex(WRAP, -70)}>
        1.5V
      </text>

      {/* + terminal, top — same chrome family as the end cap, not a separate colour */}
      <rect x={4} y={2} width={W - 8} height={7} rx={1.5} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1" />
      <rect x={W / 2 - 4} y={-3} width={8} height={7} rx={1.5} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1" />
      <Specular cx={W / 2 + 2} cy={0} r={1.4} opacity={0.6} />
    </svg>
  );
}
