import { useId } from 'react';
import { motion } from 'framer-motion';

// A wavy, slightly-crumpled strip outline shared by every washi variant —
// only the fill/pattern inside changes.
function wavyPath(w, h) {
  const amp = 3.5;
  return `M0,${amp} Q${w * 0.125},0 ${w * 0.25},${amp} Q${w * 0.375},${amp * 2} ${w * 0.5},${amp}
    Q${w * 0.625},0 ${w * 0.75},${amp} Q${w * 0.875},${amp * 2} ${w},${amp}
    L${w},${h - amp} Q${w * 0.875},${h} ${w * 0.75},${h - amp} Q${w * 0.625},${h - amp * 2} ${w * 0.5},${h - amp}
    Q${w * 0.375},${h} ${w * 0.25},${h - amp} Q${w * 0.125},${h - amp * 2} 0,${h - amp} Z`;
}

function PatternFill({ variant, id }) {
  switch (variant) {
    case 'red_gingham':
      return (
        <>
          <rect width="100%" height="100%" fill="#F2E3E3" />
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#E0625C" opacity="0.55" />
            <rect width="5" height="5" fill="#F2E3E3" />
            <rect x="5" y="5" width="5" height="5" fill="#F2E3E3" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </>
      );
    case 'blue_dots':
      return (
        <>
          <rect width="100%" height="100%" fill="#8FB8E8" />
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="2.4" fill="#fff" opacity="0.85" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </>
      );
    case 'green_grid':
      return (
        <>
          <rect width="100%" height="100%" fill="#B7CBA8" />
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#7F9A6C" strokeWidth="1" />
            <line x1="0" y1="0" x2="10" y2="0" stroke="#7F9A6C" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </>
      );
    case 'pink_stars':
      return (
        <>
          <rect width="100%" height="100%" fill="#FFCBDA" />
          <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M9,3 L10.5,7.5 L15,7.5 L11.5,10 L13,14.5 L9,11.8 L5,14.5 L6.5,10 L3,7.5 L7.5,7.5 Z" fill="#FF8FAB" opacity="0.85" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </>
      );
    case 'stripe':
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="#FFD166" />
          <rect width="8" height="16" fill="#FF8FAB" />
        </pattern>
      );
    case 'yellow_plain':
    default:
      return <rect width="100%" height="100%" fill="#FFE29A" />;
  }
}

export function WashiTape({ variant = 'yellow_plain', width = 160, rotate = 0, style }) {
  const h = 32;
  const id = useId();
  const clipId = `washi-clip-${id}`;
  const patternId = `washi-pattern-${id}`;

  return (
    <motion.svg
      viewBox={`0 0 ${width} ${h}`}
      width={width}
      height={h}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        display: 'block',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))',
        opacity: 0.9,
        ...style,
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={wavyPath(width, h)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <PatternFill variant={variant} id={patternId} />
      </g>
    </motion.svg>
  );
}
