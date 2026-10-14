// Inline SVG equipment for Y7 Practical 2 (Measuring Force on a Ramp).
// Simple, clean line-art matching WetLabEquipment.jsx's style — swap for
// hand-drawn PNGs later with no code changes needed by callers.

export function RampSVG({ angle = 0, width = 220 }) {
  return (
    <div
      style={{
        width,
        transform: `rotate(${-angle}deg)`,
        transformOrigin: '5% 90%',
        transition: 'transform 0.4s ease',
      }}
    >
      <svg viewBox="0 0 200 100" width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <polygon points="10,90 190,90 10,55" fill="#D8CBB0" stroke="#9AA0A6" strokeWidth="2" strokeLinejoin="round" />
        <line x1="10" y1="55" x2="10" y2="90" stroke="#9AA0A6" strokeWidth="2" />
        <rect x="4" y="88" width="192" height="6" rx="2" fill="#B7AC94" stroke="#9AA0A6" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function BlockSVG({ width = 34 }) {
  return (
    <svg viewBox="0 0 40 30" width={width} height={width * 0.75} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="4" y="6" width="28" height="20" rx="3" fill="#C68642" stroke="#9AA0A6" strokeWidth="2" />
      <circle cx="34" cy="14" r="4" fill="none" stroke="#6B6B6B" strokeWidth="2.5" />
    </svg>
  );
}

export function NewtonMeterSVG({ reading = 0, width = 44 }) {
  return (
    <svg viewBox="0 0 44 110" width={width} height={width * 2.5} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="22" cy="10" r="6" fill="none" stroke="#9AA0A6" strokeWidth="2.5" />
      <rect x="6" y="16" width="32" height="70" rx="8" fill="#F2EFE8" stroke="#9AA0A6" strokeWidth="2" />
      <circle cx="22" cy="42" r="15" fill="#fff" stroke="#9AA0A6" strokeWidth="1.5" />
      <text x="22" y="40" fontSize="10" textAnchor="middle" fill="var(--color-dark)" fontFamily="var(--font-body)" fontWeight="600">
        {reading.toFixed(1)}
      </text>
      <text x="22" y="50" fontSize="6" textAnchor="middle" fill="#999" fontFamily="var(--font-body)">
        Newtons
      </text>
      <line x1="22" y1="86" x2="22" y2="98" stroke="#9AA0A6" strokeWidth="2" />
      <path d="M15,98 L29,98 L22,106 Z" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function ClampStandSVG({ width = 60, height = 160 }) {
  return (
    <svg viewBox="0 0 60 160" width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="6" y="146" width="48" height="10" rx="2" fill="#6B6B6B" stroke="#9AA0A6" strokeWidth="1" />
      <rect x="26" y="10" width="6" height="140" fill="#9AA0A6" />
      <rect x="18" y="6" width="22" height="10" rx="2" fill="#9AA0A6" />
    </svg>
  );
}

export function StringSVG({ width = 40 }) {
  return (
    <svg viewBox="0 0 40 40" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <path
        d="M6,10 Q20,2 34,10 Q20,18 6,26 Q20,34 34,26"
        fill="none"
        stroke="#C9A876"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
