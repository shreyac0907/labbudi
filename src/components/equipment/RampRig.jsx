import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import NewtonMeter from './NewtonMeter';
import Block from './Block';
import { woodGrainPaths } from './materials';
import { PLANK_L, PLANK_TK, METER_SIZE, rigLayout } from './rampSetup';

export { PLANK_L, PLANK_TK };
const BOOK_COLORS = ['#4A7FC1', '#3A6BAE', '#5B8FD1']; // stacked book covers, propping the raised end up

// The whole P2 physics rig — ramp, block, string, and a Newton meter held
// PARALLEL to the ramp — drawn once, in a single rotated <g>, so tilting
// the ramp automatically carries the block and meter (and the string
// between them) along with it. No separate angle-dependent repositioning
// math: the "tilt IS the angle" (CSS rotate() around the hinge at local
// origin), exactly as the physical object would behave.
//
// `viewBox` (from rigViewBox) maps the whole step canvas onto rig units, hinge at (0,0). The meter is held
// by the student and travels with the block: its hook stays one string-length from the block's hook, so
// pulling it along the ramp keeps the string taut; at rest the hooks sit a little closer and the string sags.
export default function RampRig({ viewBox, angleDeg = 0, blockT = 0, taut = false, reading = 0, maxReading = 5, size = 1, isPulling = false }) {
  // 0 = slack, 1 = taut: eased towards the target so the string pulls straight rather than snapping
  const [pull, setPull] = useState(taut ? 1 : 0);
  const pullRef = useRef({ v: taut ? 1 : 0 });
  useEffect(() => {
    const tween = gsap.to(pullRef.current, { v: taut ? 1 : 0, duration: 0.35, ease: 'power2.out', onUpdate: () => setPull(pullRef.current.v) });
    return () => tween.kill();
  }, [taut]);

  const { blockTranslate, blockHook, meterHook, meterAnchor } = rigLayout(blockT, pull);
  const sag = 22 * (1 - pull);
  const stringPath = `M${blockHook.x},${blockHook.y} Q${(blockHook.x + meterHook.x) / 2},${(blockHook.y + meterHook.y) / 2 + sag} ${meterHook.x},${meterHook.y}`;

  // Book-stack support — how a real ramp actually gets propped up. Sits in
  // the SAME unrotated bench space the hinge itself is anchored in (i.e.
  // outside the rotated <g>), directly under where the ramp's raised end
  // ends up once tilted: rotating local point (PLANK_L, 0) by -angleDeg
  // lands at (PLANK_L·cosθ, -PLANK_L·sinθ) — the books grow to meet it.
  const angleRad = (angleDeg * Math.PI) / 180;
  const raisedEndX = PLANK_L * Math.cos(angleRad);
  const raisedEndY = -PLANK_L * Math.sin(angleRad);
  const bookH = Math.max(0, -raisedEndY - PLANK_TK * 0.6);
  const bookX = raisedEndX - 46;
  const bookW = 44;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" viewBox={viewBox} style={{ overflow: 'visible', position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        {/* book stack — bench-anchored (unrotated), grows to meet the
            raised end as the angle increases; how a real ramp gets propped. */}
        {bookH > 4 && (
          <g>
            {[0.55, 0.3, 0.15].map((frac, i) => {
              const h = bookH * frac;
              const yTop = -bookH + bookH * [0, 0.55, 0.85][i];
              return (
                <rect
                  key={i}
                  x={bookX - i * 3}
                  y={yTop}
                  width={bookW + i * 6}
                  height={h + 3}
                  rx={2}
                  fill={BOOK_COLORS[i]}
                  stroke="#2C4A70"
                  strokeWidth="1.2"
                  style={{ transition: 'y 0.5s cubic-bezier(0.34, 1.1, 0.64, 1), height 0.5s cubic-bezier(0.34, 1.1, 0.64, 1)' }}
                />
              );
            })}
          </g>
        )}

        <g transform={`rotate(${-angleDeg})`} style={{ transition: 'transform 0.5s cubic-bezier(0.34, 1.1, 0.64, 1)' }}>
          {/* underside — a darker wood sliver along the plank's bottom
              edge, the wedge's underside coming into view as it tilts */}
          <rect x={0} y={-4} width={PLANK_L} height={4} fill="#8B6030" />
          {/* plank — a literal 2D tilt around the hinge at the local origin */}
          <rect x={0} y={-PLANK_TK} width={PLANK_L} height={PLANK_TK} fill="#C8A850" stroke="#8A6E3A" strokeWidth="2" />
          <rect x={0} y={-PLANK_TK} width={PLANK_L} height={4} fill="rgba(255,255,255,0.35)" />
          {woodGrainPaths(4, -PLANK_TK + 2, PLANK_L - 8, 3).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#8A6E3A" strokeWidth="1" opacity={0.3} />
          ))}

          {/* hinge pin — sits exactly at the local origin, i.e. the horizon line */}
          <circle cx={0} cy={0} r={8} fill="#8B919A" stroke="#5B616B" strokeWidth="1.5" />
          <circle cx={-2} cy={-2} r={2.4} fill="#fff" opacity={0.6} />

          <path d={stringPath} fill="none" stroke="#6A4A20" strokeWidth={2.5} strokeLinecap="round" />

          <g transform={`translate(${blockTranslate.x} ${blockTranslate.y})`}>
            <Block size={size} isHeld={isPulling} shadow={false} />
          </g>

          <g transform={`translate(${meterAnchor.x} ${meterAnchor.y}) rotate(-90)`}>
            <NewtonMeter size={METER_SIZE} reading={reading} maxReading={maxReading} isHeld={isPulling} shadow={false} />
          </g>
        </g>
      </svg>
    </div>
  );
}
