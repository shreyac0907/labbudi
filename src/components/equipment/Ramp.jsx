import { motion } from 'framer-motion';
import { AmbientShadow, woodGrainPaths, CHROME } from './materials';

const TOP_WOOD = '#C8A850';
const FRONT_WOOD = '#8B6914';
const SIDE_WOOD = '#A07832';

// A fixed-geometry wooden incline shown from a 3/4 angle (top surface,
// front edge, and a depth side face so it reads as a solid wedge, not a
// flat triangle). `angleDeg` drives a CSS perspective/rotateX tilt on top
// of that fixed geometry — the physical ramp shape doesn't change, it's
// the whole object leaning back further, exactly like propping a real
// wedge doorstop up onto its hinge.
export default function Ramp({ size = 1, angleDeg = 0, isHeld = false }) {
  const W = 210;
  const H = 90;
  const D = 42; // depth skew for the 3/4 side face

  // silhouette: base-front-left -> base-front-right(high end, ground) -> up
  // the vertical back -> along the incline back down to base-front-left.
  const topFace = `M0,${H} L${W},${H - 40} L${W + D * 0.6},${H - 40 - D * 0.4} L${D * 0.6},${H - D * 0.4} Z`;
  const frontFace = `M0,${H} L${W},${H - 40} L${W},${H} L0,${H + 14} Z`;
  const sideFace = `M${W},${H - 40} L${W + D * 0.6},${H - 40 - D * 0.4} L${W + D * 0.6},${H - D * 0.4 + 14} L${W},${H + 14} Z`;

  return (
    <div style={{ perspective: 900, width: (W + D) * size, height: (H + D + 20) * size }}>
      <motion.div
        animate={{ rotateX: -Math.min(angleDeg, 65) * 0.6 }}
        transition={{ type: 'spring', stiffness: 110, damping: 20 }}
        style={{ transformOrigin: '8% 100%', filter: `drop-shadow(0 ${isHeld ? 14 : 6}px 8px rgba(0,0,0,0.22))` }}
      >
        <svg width={(W + D) * size} height={(H + D + 20) * size} viewBox={`0 0 ${W + D} ${H + D + 20}`} style={{ overflow: 'visible', display: 'block' }}>
          {/* contact shadow sits at the ramp's actual base line (front-bottom
              edge, ~H+10), not near the SVG origin — it previously floated
              up near the ramp's back/top corner instead of under its feet. */}
          <g transform={`translate(0 ${H + 10})`}>
            <AmbientShadow width={W * 1.05} isHeld={isHeld} offsetX={W * 0.15} contactShadow />
          </g>

          {/* side depth face — darkest, the shadow-adjacent plane */}
          <path d={sideFace} fill={SIDE_WOOD} stroke="#5C3A1B" strokeWidth="1.5" />
          {woodGrainPaths(W + 2, H - 40 - D * 0.3, D * 0.5).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#5C3A1B" strokeWidth="1" opacity={0.18} />
          ))}

          {/* front face — the low vertical edge */}
          <path d={frontFace} fill={FRONT_WOOD} stroke="#5C3A1B" strokeWidth="1.5" />

          {/* top incline face — lightest, where the block travels */}
          <path d={topFace} fill={TOP_WOOD} stroke="#6B4522" strokeWidth="1.5" />
          {woodGrainPaths(D * 0.6, H - D * 0.4, W).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#6B4522" strokeWidth="1" opacity={0.2} />
          ))}
          <path d={`M${D * 0.6},${H - D * 0.4} L${W + D * 0.6},${H - 40 - D * 0.4}`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

          {/* hinge at the base — chrome cylinder */}
          <g transform={`translate(0 ${H + 6})`}>
            <ellipse cx={6} cy={0} rx={9} ry={6} fill={CHROME.highlight} stroke={CHROME.shadow} strokeWidth="1.3" />
            <ellipse cx={6} cy={2} rx={9} ry={6} fill={CHROME.base} stroke={CHROME.shadow} strokeWidth="1.3" opacity={0.6} />
            <ellipse cx={9} cy={-1.5} rx={2.5} ry={1.6} fill="#fff" opacity={0.7} />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
