import { AmbientShadow, Specular, CHROME } from './materials';

const GREEN = '#388E3C'; // forest green body — chrome stays for the shading/highlight accents

// A retort/clamp stand: heavy circular base, chrome vertical rod, and a
// boss + clamp arm partway up. Static apparatus — no moving parts — so it
// only needs the resting depth treatment, not rotation.
export default function ClampStand({ size = 1, isHeld = false }) {
  const W = 90;
  const H = 220;

  return (
    <svg
      width={W * size}
      height={H * size}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible', filter: `drop-shadow(0 ${isHeld ? 12 : 5}px 7px rgba(0,0,0,0.2))` }}
    >
      <g transform={`translate(0 ${H - 4})`}>
        <AmbientShadow width={W * 1.1} isHeld={isHeld} offsetX={4} />
      </g>

      {/* heavy circular base — light is top-right, so the highlight sits on that side */}
      <ellipse cx={W / 2} cy={H - 10} rx={W * 0.42} ry={11} fill={GREEN} stroke={CHROME.shadow} strokeWidth="1.5" />
      <ellipse cx={W / 2 + 8} cy={H - 13} rx={W * 0.3} ry={7} fill={CHROME.highlight} opacity={0.7} />
      <Specular cx={W / 2 + 16} cy={H - 15} r={3} />

      {/* vertical rod — shadow face (left) + highlight face (right) */}
      <rect x={W / 2 - 6} y={22} width={12} height={H - 30} rx={5} fill={GREEN} stroke={CHROME.shadow} strokeWidth="1.2" />
      <rect x={W / 2 - 5} y={24} width={3} height={H - 34} fill={CHROME.shadow} opacity={0.4} />
      <rect x={W / 2 + 1.5} y={24} width={3.5} height={H - 34} fill="rgba(255,255,255,0.55)" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={W / 2 - 5} x2={W / 2 + 5} y1={40 + i * (H - 70) / 4} y2={40 + i * (H - 70) / 4} stroke="#fff" strokeWidth="0.6" opacity={0.15} />
      ))}

      {/* boss + clamp arm */}
      <rect x={W / 2 - 4} y={26} width={W * 0.42} height={13} rx={5} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1.2" />
      <rect x={W / 2 - 4} y={27} width={W * 0.42} height={4} fill="rgba(255,255,255,0.5)" />
      <circle cx={W / 2 + W * 0.36} cy={32.5} r={5.5} fill="#8B6914" stroke="#5C4610" strokeWidth="1" />
      <Specular cx={W / 2 + W * 0.36 - 1.5} cy={31} r={1.6} opacity={0.7} />
    </svg>
  );
}
