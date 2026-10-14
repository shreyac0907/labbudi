import { useId } from 'react';
import { motion } from 'framer-motion';
import { mixHex, hexToRgba, AmbientShadow, Specular, glassSheenGradient, CHROME } from './materials';

const CASING = '#00897B'; // bright teal casing
const W = 90;
const H = 300;

// A spring-scale Newton meter: cream casing, a glass-fronted scale face
// with a sliding needle, and chrome hooks top and bottom. `reading`
// (0-maxReading) drives the needle's vertical position directly, so the
// same component serves both the "at rest" apparatus view and the
// zoomed-in reading view.
//
// The scale face itself follows the readability spec: it fills 60% of the
// casing width (up from the old ~40%), ticks step down in weight from
// major (every 1N) to minor (0.5N) to sub-minor (0.1N, zoomed view only),
// and every major tick gets a bold number label plus a faint horizontal
// rule across the white face — so the reading is legible without having to
// squint at a cramped scale.
export default function NewtonMeter({ size = 1, reading = 0, maxReading = 5, isHeld = false, zoomed = false, unit = 'N', draggable = false, shadow = true, onDrag, onDragEnd }) {
  const id = useId();
  const faceW = W * 0.65;
  const faceX = (W - faceW) / 2;
  const faceTop = 34;
  const faceBottom = H - 46;
  const faceH = faceBottom - faceTop;
  const clampedReading = Math.max(0, Math.min(maxReading, reading));

  const yForValue = (n) => faceBottom - (faceH * n) / maxReading;

  const majors = Array.from({ length: maxReading + 1 }, (_, i) => i);
  const minors = [];
  const subMinors = [];
  for (let n = 0; n <= maxReading; n += 0.5) {
    if (Number.isInteger(n)) continue;
    minors.push(n);
  }
  if (zoomed) {
    for (let n = 0; n <= maxReading; n += 0.1) {
      const rounded = Math.round(n * 10) / 10;
      if (Number.isInteger(rounded) || Number.isInteger(rounded * 2)) continue;
      subMinors.push(rounded);
    }
  }

  return (
    <svg
      width={W * size}
      height={H * size}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 12 : 5}px 7px rgba(0,0,0,0.22))` : undefined }}
    >
      <defs>{glassSheenGradient(`${id}-sheen`)}</defs>

      {/* elongated horizontal shadow — the meter hangs rather than sits flat */}
      {shadow && (
        <g transform={`translate(0 ${H + 4})`}>
          <AmbientShadow width={W * 1.6} isHeld={isHeld} offsetX={W * 0.1} blur={6} />
        </g>
      )}

      {/* top hook — chrome ring */}
      <circle cx={W / 2} cy={12} r={9} fill="none" stroke={CHROME.base} strokeWidth="5" />
      <circle cx={W / 2} cy={12} r={9} fill="none" stroke={CHROME.highlight} strokeWidth="1.6" />

      {/* casing — layers 1-3. Light is top-right: shadow face left, highlight face right. */}
      <rect x={3} y={22} width={W - 6} height={H - 44} rx={14} fill={CASING} stroke={mixHex(CASING, -60)} strokeWidth="2" />
      <rect x={3} y={22} width={7} height={H - 44} rx={3.5} fill={hexToRgba(mixHex(CASING, -50), 0.35)} />
      <rect x={W - 10} y={22} width={7} height={H - 44} rx={3.5} fill="rgba(255,255,255,0.55)" />
      <Specular cx={W - 14} cy={34} r={4} opacity={0.6} />

      {/* raised bezel — implies the scale face is recessed into the casing */}
      <rect x={faceX - 2} y={faceTop - 2} width={faceW + 4} height={faceH + 4} rx={6} fill="none" stroke={mixHex(CASING, -70)} strokeWidth="3" />

      {/* scale face — per the readability rebuild (was a tinted-glass look) */}
      <rect x={faceX} y={faceTop} width={faceW} height={faceH} rx={5} fill="#FAFAFA" stroke="#CCCCCC" strokeWidth="1" />

      {/* faint horizontal rule at every major tick */}
      {majors.map((n) => (
        <line key={`rule-${n}`} x1={faceX + 2} x2={faceX + faceW - 2} y1={yForValue(n)} y2={yForValue(n)} stroke="#F0F0F0" strokeWidth="1" />
      ))}

      {/* sub-minor ticks — 0.1N, zoomed view only. Ticks anchor to the LEFT
          edge of the face (growing inward) so the number labels, which sit
          just outside that same edge, stay tight against their tick. */}
      {subMinors.map((n) => (
        <line key={`sub-${n}`} x1={faceX} x2={faceX + 4} y1={yForValue(n)} y2={yForValue(n)} stroke="#999999" strokeWidth="1" />
      ))}

      {/* minor ticks — 0.5N */}
      {minors.map((n) => (
        <line key={`min-${n}`} x1={faceX} x2={faceX + 7} y1={yForValue(n)} y2={yForValue(n)} stroke="#666666" strokeWidth="1.3" />
      ))}

      {/* major ticks — 1N, with bold number labels. Numbers sit to the LEFT of their
          tick; zoomed, they move out past the casing's left edge (with a short leader
          across it) so they never run over the meter body. */}
      {majors.map((n) => {
        const y = yForValue(n);
        return (
          <g key={`maj-${n}`}>
            <line x1={faceX} x2={faceX + 10} y1={y} y2={y} stroke="#333333" strokeWidth="2" />
            {zoomed && <line x1={-3} x2={3} y1={y} y2={y} stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />}
            <text
              x={zoomed ? -8 : faceX - 6}
              y={y + 4}
              fontSize={zoomed ? 13 : 11}
              fontWeight="700"
              fontFamily="var(--font-body)"
              fill="#1A1A1A"
              textAnchor="end"
            >
              {n}
              {zoomed ? unit : ''}
            </text>
          </g>
        );
      })}

      {/* Fix 7 — the visible coil spring behind the needle, anchored at the
          top of the face and running down to the current reading. A real
          spring balance works by a spring stretching under load with the
          indicator riding along with it — this makes that mechanism
          visible rather than just a bare sliding line. */}
      {(() => {
        const springTop = faceTop + 6;
        const springBottom = yForValue(clampedReading) - 4;
        const coilSpacing = 6;
        const coilCount = Math.max(2, Math.floor((springBottom - springTop) / coilSpacing));
        const coils = Array.from({ length: coilCount }, (_, i) => springTop + i * ((springBottom - springTop) / coilCount));
        return (
          <g>
            {coils.map((cy, i) => (
              <ellipse key={i} cx={faceX + faceW * 0.55} cy={cy} rx={6} ry={2} fill="none" stroke="#888888" strokeWidth="1" opacity={0.7} />
            ))}
          </g>
        );
      })()}

      {/* needle — a horizontal pointer that TRANSLATES to the reading's tick,
          not a rotating arm. The scale beneath it is a straight ruler (ticks
          laid out linearly by value), so a needle that swings on a pivot
          would only ever line up with its tick at one particular reading —
          everywhere else it'd cross the face at an angle and point past the
          casing entirely. A sliding pointer always lands exactly on its
          tick, the way a real linear spring-scale indicator works. */}
      <motion.g
        animate={{ y: yForValue(clampedReading) }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        onPointerDown={
          draggable
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                const svg = e.currentTarget.closest('svg');
                const svgRect = svg.getBoundingClientRect();
                const pxPerUnit = svgRect.height / H; // client px per viewBox unit
                const move = (ev) => {
                  const localY = (ev.clientY - svgRect.top) / pxPerUnit;
                  const value = ((faceBottom - localY) * maxReading) / faceH;
                  onDrag?.(Math.max(-1, Math.min(maxReading + 1, value)));
                };
                const up = (ev) => {
                  move(ev);
                  window.removeEventListener('pointermove', move);
                  window.removeEventListener('pointerup', up);
                  onDragEnd?.();
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
              }
            : undefined
        }
        style={draggable ? { cursor: 'grab', touchAction: 'none' } : undefined}
      >
        {draggable && <rect x={faceX - 6} y={-14} width={faceW + 12} height={28} fill="transparent" />}
        <line x1={faceX + 4} x2={faceX + faceW - 2} y1={0} y2={0} stroke="#CC0000" strokeWidth="2" strokeLinecap="round" />
        <path d={`M${faceX + 4},0 L${faceX + 11},-5 L${faceX + 11},5 Z`} fill="#CC0000" />
        <circle cx={faceX + 4} cy={0} r={3} fill="#333333" />
      </motion.g>

      {/* glass sheen overlay on the face — right third, light is top-right */}
      <path
        d={`M${faceX + faceW - 3},${faceTop + 2} L${faceX + faceW * 0.7},${faceTop + 2} L${faceX + faceW * 0.82},${faceBottom - 2} L${faceX + faceW - 3},${faceBottom - 2} Z`}
        fill={`url(#${id}-sheen)`}
      />

      {!zoomed && (
        <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="13" fontFamily="var(--font-heading)" fill="#5B6169">
          {unit}
        </text>
      )}

      {/* bottom hook — chrome J */}
      <path
        d={`M${W / 2},${H - 24} Q${W / 2 - 13},${H - 24} ${W / 2 - 13},${H - 9} Q${W / 2 - 13},${H + 2} ${W / 2},${H + 2}`}
        fill="none"
        stroke={CHROME.base}
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d={`M${W / 2},${H - 24} Q${W / 2 - 13},${H - 24} ${W / 2 - 13},${H - 9} Q${W / 2 - 13},${H + 2} ${W / 2},${H + 2}`}
        fill="none"
        stroke={CHROME.highlight}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
