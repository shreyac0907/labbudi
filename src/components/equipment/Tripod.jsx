import { AmbientShadow, CHROME } from './materials';

const W = 100;
const H = 120; // legs noticeably long — visibly straddle a Bunsen burner, not perch on top of it
// The rear leg is further from the light and the viewer in this 3/4
// perspective — a cooler (bluer), darker grey than the front legs' chrome,
// plus reduced opacity, sells the distance.
const REAR_LEG = '#8A3D0A';
const LEG = '#E65100'; // bright orange legs, metallic highlight overlay keeps the chrome sheen

// Three chrome legs converging to a ring — holds the gauze (and dish)
// above the Bunsen burner's flame.
export default function Tripod({ size = 1, isHeld = false, shadow = true }) {
  return (
    <svg
      width={W * size}
      height={(H + 16) * size}
      viewBox={`0 0 ${W} ${H + 16}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 10 : 4}px 6px rgba(0,0,0,0.25))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${H + 14})`}>
          <AmbientShadow width={W * 1.3} isHeld={isHeld} offsetX={4} />
        </g>
      )}

      {/* back leg — partially occluded by the front two in 3/4 perspective,
          so it's rendered cooler, darker, and more translucent to read as
          further from the light source and the viewer. */}
      <line x1={W / 2} y1={14} x2={W / 2} y2={H + 8} stroke={REAR_LEG} strokeWidth="4.5" strokeLinecap="round" opacity={0.7} />
      {/* front-left leg */}
      <line x1={W / 2} y1={14} x2={8} y2={H + 8} stroke={LEG} strokeWidth="4.5" strokeLinecap="round" />
      <line x1={W / 2} y1={14} x2={8} y2={H + 8} stroke={CHROME.highlight} strokeWidth="1.4" strokeLinecap="round" opacity={0.7} />
      {/* front-right leg */}
      <line x1={W / 2} y1={14} x2={W - 8} y2={H + 8} stroke={LEG} strokeWidth="4.5" strokeLinecap="round" />
      <line x1={W / 2} y1={14} x2={W - 8} y2={H + 8} stroke={CHROME.highlight} strokeWidth="1.4" strokeLinecap="round" opacity={0.7} />

      {/* ring at top — where the gauze sits */}
      <ellipse cx={W / 2} cy={14} rx={W * 0.42} ry={9} fill="none" stroke={CHROME.base} strokeWidth="4" />
      <ellipse cx={W / 2} cy={14} rx={W * 0.42} ry={9} fill="none" stroke={CHROME.highlight} strokeWidth="1.3" />
    </svg>
  );
}
