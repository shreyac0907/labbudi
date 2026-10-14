import { PLANK_L, PLANK_TK } from './rampSetup';
import { woodGrainPaths } from './materials';

// The flat plank of the P2 ramp, drawn exactly as RampRig draws it at 0 degrees (same wood, grain,
// underside sliver, highlight and chrome hinge pin), so the ramp the student places on the bench is
// the one they tilt later. `scale` is screen pixels per rig unit (see rigGeometry). The box is the
// plank itself, so its centre is the plank's centre and the hinge pin is at the bottom-left corner.
export default function RampPlank({ scale = 1 }) {
  return (
    <svg
      width={PLANK_L * scale}
      height={PLANK_TK * scale}
      viewBox={`0 ${-PLANK_TK} ${PLANK_L} ${PLANK_TK}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <rect x={0} y={-4} width={PLANK_L} height={4} fill="#8B6030" />
      <rect x={0} y={-PLANK_TK} width={PLANK_L} height={PLANK_TK} fill="#C8A850" stroke="#8A6E3A" strokeWidth="2" />
      <rect x={0} y={-PLANK_TK} width={PLANK_L} height={4} fill="rgba(255,255,255,0.35)" />
      {woodGrainPaths(4, -PLANK_TK + 2, PLANK_L - 8, 3).map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#8A6E3A" strokeWidth="1" opacity={0.3} />
      ))}
      <circle cx={0} cy={0} r={8} fill="#8B919A" stroke="#5B616B" strokeWidth="1.5" />
      <circle cx={-2} cy={-2} r={2.4} fill="#fff" opacity={0.6} />
    </svg>
  );
}
