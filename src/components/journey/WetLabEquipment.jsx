import { useId } from 'react';
import { motion } from 'framer-motion';

export function PipetteSVG({ fillColor, fillLevel = 0, width = 26 }) {
  const clipId = useId();
  const tubeTop = 22;
  const tubeBottom = 88;
  const tubeHeight = tubeBottom - tubeTop;
  const fillTop = tubeBottom - fillLevel * tubeHeight;

  return (
    <svg width={width} height={width * 3.4} viewBox="0 0 30 96" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <clipPath id={clipId}>
          <path d="M11,22 L19,22 L19,80 L15,92 L11,80 Z" />
        </clipPath>
      </defs>
      {fillColor && fillLevel > 0 && (
        <rect
          x="9"
          y={fillTop}
          width="12"
          height={Math.max(0, tubeBottom - fillTop + 4)}
          fill={fillColor}
          clipPath={`url(#${clipId})`}
          style={{ transition: 'y 0.6s ease-in, height 0.6s ease-in' }}
        />
      )}
      <ellipse cx="15" cy="10" rx="10" ry="10" fill="rgba(255,255,255,0.65)" stroke="#9AA0A6" strokeWidth="1.5" />
      <path
        d="M11,22 L19,22 L19,80 L15,92 L11,80 Z"
        fill="rgba(255,255,255,0.12)"
        stroke="#9AA0A6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SolutionBottleSVG({ liquidColor, width = 42 }) {
  return (
    <svg width={width} height={width * 1.32} viewBox="0 0 44 58" style={{ display: 'block' }}>
      <rect x="17" y="0" width="10" height="8" rx="2" fill="#C7CBD1" />
      <rect x="15" y="6" width="14" height="10" rx="3" fill="#fff" stroke="#9AA0A6" strokeWidth="1.5" />
      <path
        d="M13,16 Q13,14 16,14 L28,14 Q31,14 31,16 L31,50 Q31,56 25,56 L19,56 Q13,56 13,50 Z"
        fill={liquidColor}
        stroke="#9AA0A6"
        strokeWidth="1.5"
      />
      <path d="M15,20 L17,20 L17,48 L15,48 Z" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

export function IndicatorBottleSVG({ liquidColor, width = 36 }) {
  return (
    <svg width={width} height={width * 1.9} viewBox="0 0 36 68" style={{ display: 'block' }}>
      <rect x="14" y="0" width="8" height="10" rx="2" fill="#C7CBD1" />
      <rect x="12" y="8" width="12" height="10" rx="3" fill="#fff" stroke="#9AA0A6" strokeWidth="1.5" />
      <path
        d="M9,18 Q9,16 12,16 L24,16 Q27,16 27,18 L27,58 Q27,66 18,66 Q9,66 9,58 Z"
        fill={liquidColor ?? 'rgba(210,210,210,0.18)'}
        stroke="#9AA0A6"
        strokeWidth="1.5"
      />
      <path d="M11,22 L13,22 L13,60 L11,60 Z" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

export function DraggableBottle({ liquidColor, squeezing, indicator, width }) {
  const Shape = indicator ? IndicatorBottleSVG : SolutionBottleSVG;
  return (
    <motion.div animate={{ scale: squeezing ? [1, 0.96, 1] : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
      <Shape liquidColor={liquidColor} width={width} />
    </motion.div>
  );
}

export function Well({ color, highlighted, stage, size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color ?? (stage === 'solution' ? '#fff' : '#fff'),
        border: `2px solid ${highlighted ? 'var(--color-indigo)' : '#D8D2C4'}`,
        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.15)${highlighted ? ', 0 0 0 4px rgba(91,111,224,0.2)' : ''}`,
        transition: 'background-color 1.5s ease-in-out, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        transform: highlighted ? 'scale(1.1)' : 'scale(1)',
      }}
    />
  );
}

export function FallingDrops({ color }) {
  return (
    <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 6, pointerEvents: 'none' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 22, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.55, delay: i * 0.14, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: i * 6 - 6,
            width: 6,
            height: 8,
            borderRadius: '50% 50% 50% 0',
            background: color ?? '#B7A9D6',
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
}
