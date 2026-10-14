import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Shared "glossy" lab-equipment art: gradients, specular highlights, and a
// detached ground shadow give these SVGs real depth instead of flat,
// single-colour vector shapes — the closest a lightweight web scene gets to
// Cooking Mama's shaded, lit ingredient sprites without a 3D engine.

// Every indicator/solution colour used across Sub-Practicals A/B/C, shared
// so PipetteDrawGame (draw-up) and SqueezeGame (carry + squeeze) always
// agree on what's in the bottle/dropper/tube. Flat pre-blended hex, not
// rgba() — these feed GlossyBottle/GlossyDropper/GlossyTestTube, all of
// which run colours through mixHex() below, which only parses plain
// #RRGGBB and silently breaks on an rgba() string.
//
// Universal Indicator is genuinely green at rest (#4CAF50 @ 50% opacity
// over white) — that's the real, scientifically-correct neutral colour,
// not a "same pale neutral for every indicator" placeholder. Litmus never
// uses a bottle/dropper at all (see LitmusGame), so it has no entry here.
export const NEUTRAL_INDICATOR_COLOR = {
  'Universal Indicator': '#A6D7A8', // #4CAF50 @ 50% over white
  Phenolphthalein: '#FAFAF7', // effectively colourless — just glass
};

// The solution already sitting in the tube before any indicator is added.
export const SOLUTION_TINT = {
  'Lemon juice': '#FFFEEC', // #FFFDE0 @ 60% over white
  Vinegar: '#FFFCF6', // #FFF8E8 @ 40% over white
  Water: '#F5FAFC', // #E8F4F8 @ 45% over white
  Bicarbonate: '#FCFCFA', // #F8F8F4 @ 50% over white
  Bleach: '#F8FAFC', // #F0F4F8 @ 50% over white
};

function mixHex(hex, amt) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (num & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

// The shared "warm yellow" interaction-zone highlight used everywhere a
// student needs to know where to interact — grab zones, drop zones,
// squeeze zones. Pulses gently until the student's pointer is on/over it
// (`bright`), at which point it stops pulsing and brightens to signal
// "you're in the right place, go ahead." Caller positions it (absolute +
// top/left/transform); this only owns the fill/border/pulse itself so it
// can be dropped into a circle, an oval, or a rectangle alike.
export function WarmZone({ width, height, borderRadius = '50%', bright = false, visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: bright ? 1 : [1, 1.05, 1] }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{
            opacity: { duration: 0.2 },
            scale: bright ? { duration: 0.2 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute',
            width,
            height,
            borderRadius,
            background: bright ? 'rgba(255,220,80,0.44)' : 'rgba(255,220,80,0.22)',
            border: '2px dashed #E8A020',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}

// Ground shadow that grows, softens and drifts as an object is "lifted" off
// the surface — the classic 2.5D affordance for "this thing is now floating
// above the scene, follow it."
export function LiftShadow({ lifted, width = 60 }) {
  return (
    <motion.ellipse
      cx={width / 2}
      cy={0}
      animate={{
        rx: lifted ? width * 0.32 : width * 0.42,
        ry: lifted ? width * 0.1 : width * 0.16,
        opacity: lifted ? 0.16 : 0.28,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      fill="#000"
    />
  );
}

export function GlossyDropper({ width = 46, fillColor, fillLevel = 0, compressed = false, lifted = false }) {
  const id = useId();
  const height = width * 3.2;
  const bulbR = width * 0.42;
  const shaftW = width * 0.34;
  const shaftX = (width - shaftW) / 2;
  const shaftTop = bulbR * 1.55;
  const tipY = height - 6;
  const liquidTop = tipY - (tipY - shaftTop) * fillLevel;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', display: 'block', filter: lifted ? 'drop-shadow(0 14px 10px rgba(0,0,0,0.28))' : 'drop-shadow(0 3px 3px rgba(0,0,0,0.15))' }}
      animate={{ scaleY: compressed ? 0.82 : 1 }}
      transition={{ duration: 0.14, ease: 'easeIn' }}
    >
      <defs>
        <radialGradient id={`${id}-bulb`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor={mixHex(fillColor || '#E8A020', 90)} />
          <stop offset="55%" stopColor={fillColor || '#E8A020'} />
          <stop offset="100%" stopColor={mixHex(fillColor || '#E8A020', -55)} />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="18%" stopColor="rgba(210,220,228,0.35)" />
          <stop offset="55%" stopColor="rgba(160,175,185,0.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
        </linearGradient>
        <clipPath id={`${id}-shaftclip`}>
          <path d={`M${shaftX},${shaftTop} L${shaftX + shaftW},${shaftTop} L${shaftX + shaftW},${tipY - 10} L${width / 2 + 3},${tipY} L${width / 2 - 3},${tipY} L${shaftX},${tipY - 10} Z`} />
        </clipPath>
      </defs>

      {/* rubber bulb */}
      <ellipse cx={width / 2} cy={bulbR * 0.85} rx={bulbR} ry={bulbR * 0.95} fill={`url(#${id}-bulb)`} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <ellipse cx={width / 2 - bulbR * 0.35} cy={bulbR * 0.5} rx={bulbR * 0.22} ry={bulbR * 0.32} fill="rgba(255,255,255,0.55)" />

      {/* glass shaft + tapered tip */}
      <path
        d={`M${shaftX},${shaftTop} L${shaftX + shaftW},${shaftTop} L${shaftX + shaftW},${tipY - 10} L${width / 2 + 3},${tipY} L${width / 2 - 3},${tipY} L${shaftX},${tipY - 10} Z`}
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(120,130,140,0.55)"
        strokeWidth="1.5"
      />

      {/* liquid inside, clipped to shaft shape */}
      {fillLevel > 0 && (
        <g clipPath={`url(#${id}-shaftclip)`}>
          <motion.rect
            x={shaftX - 2}
            width={shaftW + 4}
            fill={fillColor || '#E8A020'}
            initial={false}
            animate={{ y: liquidTop, height: Math.max(0, tipY - liquidTop + 4) }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <motion.ellipse
            cx={width / 2}
            rx={shaftW / 2}
            ry={2.2}
            fill="rgba(255,255,255,0.5)"
            initial={false}
            animate={{ cy: liquidTop }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </g>
      )}

      {/* glass sheen overlay on top of everything */}
      <path
        d={`M${shaftX},${shaftTop} L${shaftX + shaftW},${shaftTop} L${shaftX + shaftW},${tipY - 10} L${width / 2 + 3},${tipY} L${width / 2 - 3},${tipY} L${shaftX},${tipY - 10} Z`}
        fill={`url(#${id}-glass)`}
      />
      <rect x={shaftX + shaftW * 0.15} y={shaftTop + 4} width={shaftW * 0.18} height={tipY - shaftTop - 16} rx={2} fill="rgba(255,255,255,0.5)" />
    </motion.svg>
  );
}

export function GlossyBottle({ width = 44, liquidColor, label, squeezing = false }) {
  const id = useId();
  const height = width * 2; // 80×160 at the spec's minimum bottle width
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', display: 'block', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.18))' }}
      animate={{ scaleX: squeezing ? [1, 0.9, 1] : 1 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="30%" stopColor={mixHex(liquidColor || '#9AA0A6', 20)} stopOpacity="0.5" />
          <stop offset="70%" stopColor={mixHex(liquidColor || '#9AA0A6', -20)} stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mixHex(liquidColor || '#9AA0A6', 40)} />
          <stop offset="100%" stopColor={mixHex(liquidColor || '#9AA0A6', -30)} />
        </linearGradient>
      </defs>
      <rect x={width * 0.38} y={0} width={width * 0.24} height={height * 0.16} rx={3} fill="#C7CBD1" stroke="rgba(0,0,0,0.15)" />
      <rect x={width * 0.3} y={height * 0.13} width={width * 0.4} height={height * 0.16} rx={4} fill="#fff" stroke="#9AA0A6" strokeWidth="1.2" />
      <path
        d={`M${width * 0.22},${height * 0.28} Q${width * 0.22},${height * 0.24} ${width * 0.3},${height * 0.24} L${width * 0.7},${height * 0.24} Q${width * 0.78},${height * 0.24} ${width * 0.78},${height * 0.28} L${width * 0.78},${height * 0.86} Q${width * 0.78},${height} ${width * 0.6},${height} L${width * 0.4},${height} Q${width * 0.22},${height} ${width * 0.22},${height * 0.86} Z`}
        fill={`url(#${id}-liquid)`}
        stroke="#9AA0A6"
        strokeWidth="1.2"
      />
      <path
        d={`M${width * 0.22},${height * 0.28} Q${width * 0.22},${height * 0.24} ${width * 0.3},${height * 0.24} L${width * 0.7},${height * 0.24} Q${width * 0.78},${height * 0.24} ${width * 0.78},${height * 0.28} L${width * 0.78},${height * 0.86} Q${width * 0.78},${height} ${width * 0.6},${height} L${width * 0.4},${height} Q${width * 0.22},${height} ${width * 0.22},${height * 0.86} Z`}
        fill={`url(#${id}-body)`}
      />
      <rect x={width * 0.28} y={height * 0.36} width={width * 0.08} height={height * 0.46} rx={2} fill="rgba(255,255,255,0.6)" />
      {label && (
        <text x={width / 2} y={height * 0.62} textAnchor="middle" fontSize={width * 0.15} fontFamily="var(--font-heading)" fill="rgba(0,0,0,0.55)">
          {label}
        </text>
      )}
    </motion.svg>
  );
}

export function GlossyTestTube({ width = 60, fillFraction = 0, liquidColor, active = false, noChange = false, rippleAt = 0 }) {
  const id = useId();
  // Fix 6 — taller, more legible proportions (60×200 at the default
  // width) than the old squatter 1:2.68 tube.
  const height = width * 3.34;
  const rimY = height * 0.045;
  const bodyBottom = height * 0.86;
  const liquidTop = bodyBottom - (bodyBottom - rimY - 6) * fillFraction;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="20%" stopColor="rgba(180,190,198,0.15)" />
          <stop offset="60%" stopColor="rgba(150,162,172,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
        </linearGradient>
        <clipPath id={`${id}-tubeclip`}>
          <path
            d={`M${width * 0.2},${rimY} L${width * 0.2},${bodyBottom} Q${width * 0.2},${height} ${width * 0.5},${height} Q${width * 0.8},${height} ${width * 0.8},${bodyBottom} L${width * 0.8},${rimY} Z`}
          />
        </clipPath>
      </defs>

      {/* Cast shadow — a narrow ellipse at the tube's actual base contact
          point (not a generic blob at the top of the viewBox, which is
          where this used to render — the rim, not the base). Offset
          toward the light (top-right): x+4, y+3. These tubes sit in a
          bench-top row, close to the surface, so the shadow is tight and
          soft rather than the deeper one a lifted/held object would cast. */}
      <ellipse
        cx={width / 2 + 4}
        cy={height + 3}
        rx={width * 0.24}
        ry={width * 0.06}
        fill="rgba(0,0,0,0.14)"
        style={{ filter: 'blur(2px)' }}
      />

      {active && (
        <motion.rect
          x={2}
          y={0}
          width={width - 4}
          height={height - 2}
          rx={14}
          fill="none"
          stroke="var(--color-chem)"
          strokeWidth="2.5"
          strokeDasharray="7 6"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        />
      )}

      {/* glass outline */}
      <path
        d={`M${width * 0.2},${rimY} L${width * 0.2},${bodyBottom} Q${width * 0.2},${height} ${width * 0.5},${height} Q${width * 0.8},${height} ${width * 0.8},${bodyBottom} L${width * 0.8},${rimY}`}
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(120,130,140,0.65)"
        strokeWidth="2"
      />
      {/* rim ellipse — suggests the circular 3D opening */}
      <ellipse cx={width / 2} cy={rimY} rx={width * 0.3} ry={width * 0.065} fill="rgba(255,255,255,0.4)" stroke="rgba(120,130,140,0.65)" strokeWidth="2" />

      {/* liquid — a flat animatable colour (not a gradient url) specifically
          so the reaction colour change can transition smoothly via
          framer-motion rather than snapping instantly. Height/position
          animate on their own (slower) timeline than colour: a chemical
          colour change should read as a colour SWEEP, not a level change,
          so the two are deliberately decoupled. */}
      {fillFraction > 0 && (
        <g clipPath={`url(#${id}-tubeclip)`}>
          <motion.rect
            x={width * 0.15}
            width={width * 0.7}
            initial={false}
            animate={{
              y: liquidTop,
              height: Math.max(0, bodyBottom - liquidTop + 40),
              fill: liquidColor || '#4FBFA8',
              opacity: noChange ? 0.18 : 1,
            }}
            transition={{
              y: { duration: 0.6, ease: 'easeOut' },
              height: { duration: 0.6, ease: 'easeOut' },
              fill: { duration: 1.2, ease: 'easeInOut' },
              opacity: { duration: 1.2, ease: 'easeInOut' },
            }}
          />
          <motion.ellipse
            cx={width / 2}
            rx={width * 0.28}
            ry={3.2}
            initial={false}
            animate={{ cy: liquidTop, fill: mixHex(liquidColor || '#4FBFA8', 55), opacity: noChange ? 0.1 : 0.7 }}
            transition={{ cy: { duration: 0.6, ease: 'easeOut' }, fill: { duration: 1.2 }, opacity: { duration: 1.2 } }}
          />

          {/* ripple — a small ring expanding from the drop's landing point,
              confirming contact even when the colour itself doesn't change
              (e.g. phenolphthalein in an acid). */}
          <AnimatePresence>
            {rippleAt > 0 && (
              <motion.circle
                key={rippleAt}
                cx={width / 2}
                cy={liquidTop}
                r={2}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={1.5}
                initial={{ r: 2, opacity: 0.9 }}
                animate={{ r: width * 0.32, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </g>
      )}

      {/* glass sheen overlay */}
      <path
        d={`M${width * 0.2},${rimY} L${width * 0.2},${bodyBottom} Q${width * 0.2},${height} ${width * 0.5},${height} Q${width * 0.8},${height} ${width * 0.8},${bodyBottom} L${width * 0.8},${rimY} Z`}
        fill={`url(#${id}-glass)`}
        opacity={0.7}
      />
      {/* Fix 7 — glass refraction highlight, left-front edge */}
      <rect x={width * 0.24} y={rimY + 10} width={4} height={bodyBottom - rimY - 20} rx={2} fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Ramp/ClampStand/NewtonMeter/Block moved to src/components/equipment/ (the
// dedicated 3D-equipment system, built on the shared materials.jsx layer
// vocabulary). Only the Protractor overlay stays here — it's an instrument
// reading, not a physical prop the student drags or places.
// ─────────────────────────────────────────────────────────────────────────

// A half-circle protractor with 0-90deg markings and a needle arm. Pass
// `interactive` + `onAngleChange` to let the student drag the arm; the
// target window is highlighted in amber.
export function Protractor({ width = 220, angle = 0, targetAngle, tolerance = 2, interactive = false, onAngleChange }) {
  const id = useId();
  const r = width / 2 - 10;
  const cx = width / 2;
  const cy = width / 2;

  function angleToPoint(deg, radius) {
    const rad = ((180 - deg) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  }

  function handlePointer(e) {
    if (!interactive) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const move = (ev) => {
      const x = ev.clientX - rect.left - cx;
      const y = cy - (ev.clientY - rect.top);
      let deg = (Math.atan2(y, x) * 180) / Math.PI;
      deg = 180 - deg;
      deg = Math.max(0, Math.min(90, deg));
      onAngleChange?.(deg);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const ticks = Array.from({ length: 10 }, (_, i) => i * 10);
  const needleEnd = angleToPoint(angle, r - 14);
  const targetStart = targetAngle != null ? angleToPoint(Math.max(0, targetAngle - tolerance), r) : null;
  const targetEnd = targetAngle != null ? angleToPoint(Math.min(90, targetAngle + tolerance), r) : null;

  return (
    <svg
      width={width}
      height={width / 2 + 24}
      viewBox={`0 0 ${width} ${width / 2 + 24}`}
      style={{ display: 'block', overflow: 'visible', touchAction: 'none' }}
      onPointerDown={handlePointer}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="100%" stopColor="rgba(230,235,225,0.75)" />
        </linearGradient>
      </defs>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} Z`} fill={`url(#${id}-face)`} stroke="#9AA0A6" strokeWidth="1.5" />

      {targetStart && targetEnd && (
        <path
          d={`M${cx},${cy} L${targetStart.x},${targetStart.y} A${r},${r} 0 0 0 ${targetEnd.x},${targetEnd.y} Z`}
          fill="var(--color-chem)"
          opacity={0.28}
        />
      )}

      {ticks.map((t) => {
        const p1 = angleToPoint(t, r);
        const p2 = angleToPoint(t, r - 10);
        const lbl = angleToPoint(t, r - 24);
        return (
          <g key={t}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#5B6169" strokeWidth="1.4" />
            <text x={lbl.x} y={lbl.y} fontSize="9" fill="#5B6169" textAnchor="middle" fontFamily="var(--font-body)">
              {t}
            </text>
          </g>
        );
      })}

      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="var(--color-start)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="var(--color-start)" />
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="15" fontFamily="var(--font-heading)" fill="var(--color-dark)">
        {Math.round(angle)}°
      </text>
    </svg>
  );
}
