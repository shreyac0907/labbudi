import { useId } from 'react';
import { motion } from 'framer-motion';
import { mixHex, hexToRgba, Specular, glassSheenGradient } from './materials';

const BASE_W = 40;
const BASE_H = 180;

// The test tube: simplest glass object, built first to prove out the
// depth system before anything more complex. Height 180 / width 40 at
// size=1, rounded bottom with a slight taper, full glass treatment
// (translucent base fill, light/dark edge strokes, interior sheen strip),
// a liquid fill with a proper concave meniscus, and an optional label
// wrap. Props: size (scale), colour (glass tint/outline), state
// (idle | hot | lit | filled), liquidColour, liquidLevel (0-1), rotation
// (deg), isHeld, label.
export default function TestTube({
  size = 1,
  colour = '#9AA0A6',
  state = 'idle',
  liquidColour,
  liquidLevel = 0,
  rotation = 0,
  isHeld = false,
  inRack = false,
  label,
}) {
  const id = useId();
  const w = BASE_W;
  const h = BASE_H;

  // Tube silhouette: straight sides tapering into a rounded, slightly
  // narrowed bottom.
  const topY = 4;
  const shoulderY = h * 0.78;
  const bottomY = h - 4;
  const outerL = w * 0.2;
  const outerR = w * 0.8;
  const bodyPath = `M${outerL},${topY} L${outerL},${shoulderY} Q${outerL},${bottomY} ${w / 2},${bottomY} Q${outerR},${bottomY} ${outerR},${shoulderY} L${outerR},${topY} Z`;

  const liquidTop = bottomY - (bottomY - topY - 10) * liquidLevel;
  const hot = state === 'hot';

  return (
    <div
      style={{
        width: w * size,
        height: h * size + 14,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center bottom',
      }}
    >
      <svg
        width={w * size}
        height={h * size + 14}
        viewBox={`0 0 ${w} ${h + 14}`}
        style={{ display: 'block', overflow: 'visible', filter: hot ? 'drop-shadow(0 0 6px rgba(255,120,40,0.35))' : 'none' }}
      >
        <defs>
          {glassSheenGradient(`${id}-sheen`)}
          <clipPath id={`${id}-clip`}>
            <path d={bodyPath} />
          </clipPath>
        </defs>

        {/* Cast shadow — a narrow ellipse at the tube's actual base contact
            point, not a generic blob under the whole body. A test tube is
            a thin cylinder standing on one small footprint, so the shadow
            reads as a coin lying flat there, offset toward the light
            (top-right) source: x+4, y+3 from the base. Held/dragging drops
            it further and softens it (implies lift off the surface); in a
            rack it's tighter and fainter (the surface is right there). */}
        <ellipse
          cx={w / 2 + 4}
          cy={bottomY + (isHeld ? 10 : 3)}
          rx={(outerR - outerL) * 0.4}
          ry={(outerR - outerL) * 0.1}
          fill={`rgba(0,0,0,${isHeld ? 0.22 : inRack ? 0.14 : 0.22})`}
          style={{ filter: `blur(${isHeld ? 8 : inRack ? 2 : 3}px)`, transition: 'all 0.2s ease-out' }}
        />

        {/* Layer 1 — base glass shape, near-transparent */}
        <path d={bodyPath} fill={hexToRgba(colour, 0.15)} />

        {/* rim — a slim ellipse suggesting the circular 3D opening */}
        <ellipse cx={w / 2} cy={topY} rx={outerR - outerL} ry={2.6} fill={hexToRgba(colour, 0.2)} stroke={mixHex(colour, -20)} strokeWidth="1.4" />

        {/* liquid fill, clipped to the tube body */}
        {liquidLevel > 0 && (
          <g clipPath={`url(#${id}-clip)`}>
            <motion.rect
              x={outerL - 2}
              width={outerR - outerL + 4}
              fill={liquidColour || '#4FBFA8'}
              initial={false}
              animate={{ y: liquidTop, height: Math.max(0, bottomY - liquidTop + 20) }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            {/* meniscus — concave top edge of the liquid, a touch lighter */}
            <motion.ellipse
              cx={w / 2}
              rx={(outerR - outerL) / 2}
              ry={2.6}
              fill={mixHex(liquidColour || '#4FBFA8', 35)}
              initial={false}
              animate={{ cy: liquidTop }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </g>
        )}

        {/* Layer 2 — shadow face: thin darker stroke down the left edge (light is top-right) */}
        <path d={`M${outerL},${topY} L${outerL},${shoulderY} Q${outerL},${bottomY} ${w / 2},${bottomY}`} fill="none" stroke={hexToRgba(mixHex(colour, -40), 0.4)} strokeWidth="1.6" />

        {/* Layer 3 — highlight face: light stroke down the right edge */}
        <path d={`M${outerR},${topY} L${outerR},${shoulderY} Q${outerR},${bottomY} ${w / 2},${bottomY}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" />

        {/* interior sheen strip — the glass-specific highlight, right third */}
        <path
          d={`M${outerR - 1.5},${topY + 4} L${outerR - w * 0.34},${topY + 6} L${outerR - w * 0.24},${shoulderY} L${outerR - 1.5},${shoulderY} Z`}
          fill={`url(#${id}-sheen)`}
        />

        {hot && (
          <path
            d={bodyPath}
            fill="none"
            stroke="rgba(255,110,40,0.55)"
            strokeWidth="1.5"
          />
        )}

        {/* Layer 4 — specular highlight, top-right of the rim */}
        <Specular cx={outerR - 4} cy={topY + 6} r={2.4} opacity={0.7} />

        {label && (
          <g>
            <rect x={outerL - 3} y={shoulderY - 34} width={outerR - outerL + 6} height={16} rx={2} fill="#FBF3DE" stroke="#D8C9A0" strokeWidth="1" />
            <text x={w / 2} y={shoulderY - 22.5} textAnchor="middle" fontSize="7" fontFamily="var(--font-body)" fill="#6B5B3A">
              {label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
