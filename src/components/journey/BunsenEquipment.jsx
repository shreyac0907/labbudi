// Inline SVG equipment for Y7 Practical 3 (Heating Substances Using a Bunsen Burner).

export function BunsenBurnerSVG({ width = 50 }) {
  return (
    <svg viewBox="0 0 50 90" width={width} height={width * 1.8} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="18" y="60" width="14" height="26" fill="#8A8A8A" stroke="#6B6B6B" strokeWidth="1.5" />
      <ellipse cx="25" cy="86" rx="18" ry="5" fill="#6B6B6B" />
      <rect x="20" y="20" width="10" height="42" rx="2" fill="#B0B0B0" stroke="#6B6B6B" strokeWidth="1.5" />
      <rect x="17" y="46" width="16" height="8" rx="2" fill="#9AA0A6" stroke="#6B6B6B" strokeWidth="1" />
    </svg>
  );
}

export function FlameSVG({ kind = 'safety', width = 26 }) {
  const safety = kind === 'safety';
  return (
    <svg
      viewBox="0 0 26 50"
      width={safety ? width : width * 0.8}
      height={safety ? width * 1.6 : width * 2.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={
          safety
            ? 'M13,2 C20,16 22,24 13,40 C4,24 6,16 13,2 Z'
            : 'M13,0 C17,14 18,26 13,48 C8,26 9,14 13,0 Z'
        }
        fill={safety ? '#FFC24B' : '#4FA8E0'}
        opacity={0.92}
      />
      <path
        d={safety ? 'M13,10 C17,20 18,26 13,36 C8,26 9,20 13,10 Z' : 'M13,8 C15,20 16,28 13,42 C10,28 11,20 13,8 Z'}
        fill={safety ? '#FF8F3D' : '#1E6FB8'}
        opacity={0.85}
      />
    </svg>
  );
}

export function TripodSVG({ width = 70 }) {
  return (
    <svg viewBox="0 0 70 50" width={width} height={width * 0.7} style={{ display: 'block', overflow: 'visible' }}>
      <line x1="35" y1="5" x2="8" y2="48" stroke="#6B6B6B" strokeWidth="3" />
      <line x1="35" y1="5" x2="62" y2="48" stroke="#6B6B6B" strokeWidth="3" />
      <line x1="35" y1="5" x2="35" y2="48" stroke="#6B6B6B" strokeWidth="3" />
      <ellipse cx="35" cy="8" rx="30" ry="5" fill="none" stroke="#6B6B6B" strokeWidth="3" />
    </svg>
  );
}

export function GauzeMatSVG({ width = 56 }) {
  return (
    <svg viewBox="0 0 56 20" width={width} height={width * 0.36} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="52" height="16" rx="2" fill="#E8E8E8" stroke="#9AA0A6" strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={6 + i * 6} y1="2" x2={6 + i * 6} y2="18" stroke="#C4C4C4" strokeWidth="0.8" />
      ))}
      <circle cx="28" cy="10" r="5" fill="#D9D2C0" stroke="#9AA0A6" strokeWidth="1" />
    </svg>
  );
}

export function EvaporatingDishSVG({ crystalColor = '#1565C0', width = 48 }) {
  return (
    <svg viewBox="0 0 48 26" width={width} height={width * 0.55} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M2,8 Q24,2 46,8 L40,22 Q24,26 8,22 Z" fill="#F2EFE8" stroke="#9AA0A6" strokeWidth="1.5" />
      <ellipse cx="24" cy="14" rx="12" ry="5" fill={crystalColor} opacity={0.9} />
    </svg>
  );
}

export function HeatProofMatSVG({ width = 90 }) {
  return (
    <svg viewBox="0 0 90 30" width={width} height={width * 0.33} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="86" height="26" rx="4" fill="#4A4A4A" stroke="#333" strokeWidth="1.5" />
    </svg>
  );
}

export function SafetyGogglesSVG({ width = 44 }) {
  return (
    <svg viewBox="0 0 44 24" width={width} height={width * 0.55} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="12" cy="12" r="10" fill="rgba(140,200,230,0.5)" stroke="#6B6B6B" strokeWidth="2" />
      <circle cx="32" cy="12" r="10" fill="rgba(140,200,230,0.5)" stroke="#6B6B6B" strokeWidth="2" />
      <line x1="22" y1="12" x2="22" y2="12" stroke="#6B6B6B" strokeWidth="2" />
      <path d="M2,12 Q-2,12 0,6" fill="none" stroke="#6B6B6B" strokeWidth="2" />
      <path d="M42,12 Q46,12 44,6" fill="none" stroke="#6B6B6B" strokeWidth="2" />
    </svg>
  );
}

export function SpatulaSVG({ width = 40 }) {
  return (
    <svg viewBox="0 0 40 14" width={width} height={width * 0.35} style={{ display: 'block', overflow: 'visible' }}>
      <line x1="2" y1="7" x2="28" y2="7" stroke="#9AA0A6" strokeWidth="2.5" />
      <ellipse cx="34" cy="7" rx="6" ry="4" fill="#C7CBD1" stroke="#9AA0A6" strokeWidth="1.5" />
    </svg>
  );
}

export function WaterDropperSVG({ width = 34 }) {
  return (
    <svg viewBox="0 0 24 60" width={width} height={width * 1.76} style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx="12" cy="8" rx="8" ry="8" fill="rgba(140,200,230,0.5)" stroke="#6B6B6B" strokeWidth="1.5" />
      <rect x="9" y="14" width="6" height="38" fill="rgba(255,255,255,0.5)" stroke="#6B6B6B" strokeWidth="1.5" />
      <path d="M12,52 L16,58 L8,58 Z" fill="#6B6B6B" />
    </svg>
  );
}

export function SteamParticles({ count = 4 }) {
  return (
    <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i - count / 2) * 8,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            animation: `steamRise 1.6s ease-out ${i * 0.35}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
