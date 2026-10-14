import { useId } from 'react';
import { mixHex } from './equipment/materials';

// The lab bench environment behind all physical equipment — a blurred 3/4
// perspective scene (back wall + bench surface + front edge) that gives
// the interactive equipment somewhere to sit, without competing with it
// for attention. Purely decorative: it never renders above z-index 0 and
// never receives pointer events. DeskScene (the accumulated equipment
// layer) renders on top of this, and the sharp interactive microgame
// renders on top of that.
//
// Every element in this scene shares one perspective system: a horizon
// line at 30% from the top (above it is environment, below it is bench),
// with objects scaling from 55% size / 70% width at the horizon up to
// 100%/100% at the bottom edge. BenchBackground itself is just the static
// backdrop for that system — equipment placement applying the actual
// scale/compression is a separate concern for whatever positions objects
// within the scene.
const WALL_HORIZON = 30; // % from top
const TABLETOP_HORIZON = 68; // the table-top variant: a plain wall behind, the table's top surface starts lower down

// Fix 3 — warmer, richer palette. Chemistry is the one true base palette;
// biology/physics are only a ~5% colour shift off it (mixHex nudges every
// channel by a flat amount), never a separately hand-picked palette, so
// all three variants read as the same bench under slightly different
// lighting rather than three different rooms.
const CHEM_BASE = {
  wallBase: '#EDE5D4',
  wallTile: '#E8DFC8',
  benchLeft: '#C8A87A',
  benchCenter: '#D4B896',
  benchRight: '#DCC4A0',
  benchFront: '#8A6E4A',
  wallLine: '#DDD0BC',
  grain: '#C0A07E',
};

// A table seen from the side, in front of a pale yellow wall: for equipment drawn side-on (the P2 ramp).
const TABLETOP = {
  wallBase: '#FFF3C2',
  wallTile: '#FBEBA8',
  wallLine: '#F2E3A0',
  benchLeft: '#9C6A38',
  benchCenter: '#AB7843',
  benchRight: '#B8844C',
  benchFront: '#6A4524',
  grain: '#7E5028',
  secondWindow: false,
};

function shiftVariant(amt, secondWindow) {
  const shifted = {};
  for (const key in CHEM_BASE) shifted[key] = mixHex(CHEM_BASE[key], amt);
  return { ...shifted, secondWindow };
}

const VARIANTS = {
  chemistry: { ...CHEM_BASE, secondWindow: false },
  biology: shiftVariant(-10, true), // microscopy wants a well-lit room — a second window
  physics: shiftVariant(8, false),
};

// 5 gentle wavy horizontal grain lines across the bench, in viewBox
// units (0-1000 x 0-1000, stretched to fill the bench area non-uniformly
// same as everything else in this scene).
const GRAIN_ROWS = [220, 400, 560, 720, 860];

// `tabletop` swaps the lab palette for a brown table in front of a pale yellow wall, with the table's top
// surface starting lower so equipment drawn side-on (the P2 ramp) has a surface to stand on.
export default function BenchBackground({ variant = 'chemistry', tabletop = false }) {
  const v = tabletop ? TABLETOP : (VARIANTS[variant] ?? VARIANTS.chemistry);
  const HORIZON = tabletop ? TABLETOP_HORIZON : WALL_HORIZON;
  const id = useId();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* LAYER 1 — back wall, furthest back, blurriest. A subtle aged-tile
          pattern instead of a flat colour. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${HORIZON}%`,
          overflow: 'hidden',
          background: v.wallBase,
          filter: 'blur(3.5px)',
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id={`${id}-tiles`} width={60} height={40} patternUnits="userSpaceOnUse">
              <rect width={60} height={40} fill={v.wallBase} />
              <rect width={30} height={20} fill={v.wallTile} opacity={0.6} />
              <rect x={30} y={20} width={30} height={20} fill={v.wallTile} opacity={0.6} />
              <rect width={60} height={40} fill="none" stroke={v.wallLine} strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id}-tiles)`} />
        </svg>
        {/* upper-right light source, consistent with the top-right key light everywhere else */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1), rgba(255,255,255,0) 70%)',
          }}
        />
      </div>

      {/* LAYER 2 — bench top surface, where equipment sits. Horizontal
          left-to-right gradient (the light comes from top-right, so the
          bench itself catches more light on that side), plus wood grain. */}
      <div
        style={{
          position: 'absolute',
          top: `${HORIZON}%`,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          background: `linear-gradient(90deg, ${v.benchLeft} 0%, ${v.benchCenter} 50%, ${v.benchRight} 100%)`,
          filter: 'blur(2px)',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          {GRAIN_ROWS.map((y, i) => (
            <path
              key={y}
              d={`M0,${y} Q250,${y - 14 + (i % 2) * 10} 500,${y} T1000,${y}`}
              fill="none"
              stroke={v.grain}
              strokeWidth={1}
              opacity={0.3}
            />
          ))}
        </svg>
        {/* edge vignette, left and right */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(90deg, rgba(0,0,0,0.14), rgba(0,0,0,0))' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(270deg, rgba(0,0,0,0.14), rgba(0,0,0,0))' }} />
      </div>

      {/* horizon line — the bench surface edge itself, at HORIZON% from the
          top. Every object in the scene sits ON the bench below this line;
          it's the one fixed reference point for placement. */}
      <div style={{ position: 'absolute', top: `${HORIZON}%`, left: 0, right: 0, height: 1, background: tabletop ? '#7E5028' : '#C0A070', zIndex: 1 }} />

      {/* z-index 1.5 — warm overhead light glow, centred top-right */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 65% 0%, rgba(255,240,200,0.15), rgba(255,240,200,0) 55%)',
        }}
      />

      {/* LAYER 4 — bench surface curving down into shadow just above the front edge */}
      <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: 40, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.12))' }} />

      {/* LAYER 3 — bench front edge, closest to the viewer, sharpest of the background layers */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10%', minHeight: 30, background: v.benchFront, filter: 'blur(1px)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#C8A070' }} />
      </div>

      {/* LAYER 5 — ambient occlusion at the bottom corners, grounds the scene */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 160, height: 160, background: 'radial-gradient(circle at 0% 100%, rgba(0,0,0,0.08), rgba(0,0,0,0) 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 160, height: 160, background: 'radial-gradient(circle at 100% 100%, rgba(0,0,0,0.08), rgba(0,0,0,0) 70%)' }} />
    </div>
  );
}
