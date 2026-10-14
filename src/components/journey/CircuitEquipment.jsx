// Inline SVG equipment for Y7 Practical 5 (Building Simple Circuits).

export function BatterySVG({ width = 50 }) {
  return (
    <svg viewBox="0 0 50 26" width={width} height={width * 0.52} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="4" width="38" height="18" rx="3" fill="#E8E8E8" stroke="#6B6B6B" strokeWidth="2" />
      <rect x="40" y="9" width="6" height="8" rx="1.5" fill="#6B6B6B" />
      <rect x="6" y="8" width="10" height="10" fill="#4A4A4A" />
      <text x="26" y="17" fontSize="9" textAnchor="middle" fill="#6B6B6B" fontFamily="var(--font-body)">+ −</text>
    </svg>
  );
}

export function BulbSVG({ lit = false, width = 34 }) {
  return (
    <svg viewBox="0 0 34 46" width={width} height={width * 1.35} style={{ display: 'block', overflow: 'visible' }}>
      {lit && <circle cx="17" cy="16" r="17" fill="rgba(255,200,0,0.55)" />}
      <circle cx="17" cy="16" r="13" fill={lit ? '#FFE066' : '#F2EFE8'} stroke="#9AA0A6" strokeWidth="2" />
      <path d="M11,12 L23,20 M23,12 L11,20" stroke={lit ? '#E8940C' : '#C7CBD1'} strokeWidth="1.5" />
      <rect x="11" y="29" width="12" height="10" fill="#9AA0A6" />
      <rect x="9" y="39" width="16" height="4" rx="1" fill="#6B6B6B" />
    </svg>
  );
}

export function SwitchSVG({ closed = false, width = 46 }) {
  return (
    <svg viewBox="0 0 46 20" width={width} height={width * 0.43} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="6" cy="14" r="4" fill="#6B6B6B" />
      <circle cx="40" cy="14" r="4" fill="#6B6B6B" />
      <line x1="6" y1="14" x2={closed ? 40 : 30} y2={closed ? 14 : 2} stroke="#4A4A4A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AmmeterSVG({ reading = null, width = 44 }) {
  return (
    <svg viewBox="0 0 44 44" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="22" cy="22" r="20" fill="#fff" stroke="#9AA0A6" strokeWidth="2" />
      <text x="22" y="20" fontSize="11" textAnchor="middle" fill="var(--color-dark)" fontFamily="var(--font-body)" fontWeight="700">
        A
      </text>
      <text x="22" y="32" fontSize="8" textAnchor="middle" fill="var(--color-mid)" fontFamily="var(--font-body)">
        {reading != null ? `${reading.toFixed(1)}A` : '—'}
      </text>
    </svg>
  );
}

export function VoltmeterSVG({ reading = null, width = 44 }) {
  return (
    <svg viewBox="0 0 44 44" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="22" cy="22" r="20" fill="#fff" stroke="#9AA0A6" strokeWidth="2" />
      <text x="22" y="20" fontSize="11" textAnchor="middle" fill="var(--color-dark)" fontFamily="var(--font-body)" fontWeight="700">
        V
      </text>
      <text x="22" y="32" fontSize="8" textAnchor="middle" fill="var(--color-mid)" fontFamily="var(--font-body)">
        {reading != null ? `${reading.toFixed(1)}V` : '—'}
      </text>
    </svg>
  );
}

export function MotorSVG({ spinning = false, width = 40 }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={width}
      height={width}
      style={{ display: 'block', overflow: 'visible', animation: spinning ? 'spin 0.8s linear infinite' : 'none' }}
    >
      <circle cx="20" cy="20" r="16" fill="#E8E8E8" stroke="#6B6B6B" strokeWidth="2" />
      <line x1="20" y1="6" x2="20" y2="34" stroke="#6B6B6B" strokeWidth="2" />
      <line x1="6" y1="20" x2="34" y2="20" stroke="#6B6B6B" strokeWidth="2" />
      <circle cx="20" cy="20" r="4" fill="#4A4A4A" />
    </svg>
  );
}

export function FanSVG({ spinning = false, width = 40 }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={width}
      height={width}
      style={{ display: 'block', overflow: 'visible', animation: spinning ? 'spin 0.4s linear infinite' : 'none' }}
    >
      {[0, 90, 180, 270].map((angle) => (
        <ellipse key={angle} cx="20" cy="10" rx="5" ry="9" fill="#B7C4CE" stroke="#6B6B6B" strokeWidth="1" transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="4" fill="#4A4A4A" />
    </svg>
  );
}

export function WiresSVG({ width = 34 }) {
  return (
    <svg viewBox="0 0 34 34" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M4,4 Q34,4 34,17 Q34,30 4,30" fill="none" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" />
      <path d="M8,8 Q28,8 28,17 Q28,26 8,26" fill="none" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CircuitMatSVG({ width = 100 }) {
  return (
    <svg viewBox="0 0 100 60" width={width} height={width * 0.6} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="96" height="56" rx="4" fill="#F2EFE8" stroke="#9AA0A6" strokeWidth="1.5" />
    </svg>
  );
}
