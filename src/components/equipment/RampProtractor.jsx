// A protractor lying on the bench with its centre on the ramp's hinge and its 0° line along the table top, so
// the ramp's own edge reads the angle against it. Drawn in rig units (hinge at (0,0), up is -y) inside the same
// viewBox as RampRig; put it BEHIND the rig. `target` (degrees, ± `tolerance`) is shaded amber.
export const PROTRACTOR_R = 185;

const at = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return { x: r * Math.cos(a), y: -r * Math.sin(a) };
};

export default function RampProtractor({ viewBox, target, tolerance = 3 }) {
  const R = PROTRACTOR_R;
  const ticks = Array.from({ length: 19 }, (_, i) => i * 5);
  const lo = target != null ? at(Math.max(0, target - tolerance), R) : null;
  const hi = target != null ? at(Math.min(90, target + tolerance), R) : null;

  return (
    <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {/* the face */}
      <path d={`M0,0 L${R},0 A${R},${R} 0 0 0 0,${-R} Z`} fill="rgba(255,255,255,0.78)" stroke="#8A9096" strokeWidth="2" />
      {lo && hi && <path d={`M0,0 L${lo.x},${lo.y} A${R},${R} 0 0 0 ${hi.x},${hi.y} Z`} fill="#E8A020" opacity={0.4} />}

      {ticks.map((d) => {
        const major = d % 10 === 0;
        const p1 = at(d, R);
        const p2 = at(d, R - (major ? 15 : 8));
        const lbl = at(d, R - 32);
        return (
          <g key={d}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#4A5057" strokeWidth={major ? 2 : 1.2} />
            {major && (
              <text x={lbl.x} y={lbl.y + 5} fontSize="15" fontWeight="700" fill="#3A4047" textAnchor="middle" fontFamily="var(--font-body)">
                {d}
              </text>
            )}
          </g>
        );
      })}

      {/* the 0° line: the table top, dashed, running on past the protractor */}
      <line x1={-24} y1={0} x2={R + 70} y2={0} stroke="#3A4047" strokeWidth="2.5" strokeDasharray="9 7" strokeLinecap="round" />
    </svg>
  );
}
