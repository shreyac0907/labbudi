// Inline SVG equipment for Y7 Practical 4 (Using a Microscope — Observing Onion Cells).

export function MicroscopeSVG({ width = 70 }) {
  return (
    <svg viewBox="0 0 70 100" width={width} height={width * 1.43} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="10" y="86" width="50" height="8" rx="2" fill="#6B6B6B" />
      <rect x="30" y="40" width="8" height="46" fill="#8A8A8A" />
      <ellipse cx="34" cy="60" rx="16" ry="4" fill="#B0B0B0" stroke="#6B6B6B" strokeWidth="1.5" />
      <path d="M34,40 C34,20 50,14 50,14" fill="none" stroke="#8A8A8A" strokeWidth="7" strokeLinecap="round" />
      <rect x="46" y="6" width="10" height="14" rx="2" fill="#9AA0A6" stroke="#6B6B6B" strokeWidth="1.5" />
      <circle cx="34" cy="66" r="3" fill="#6B6B6B" />
    </svg>
  );
}

export function GlassSlideSVG({ width = 60 }) {
  return (
    <svg viewBox="0 0 60 24" width={width} height={width * 0.4} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="56" height="20" rx="2" fill="rgba(200,220,235,0.35)" stroke="#9AA0A6" strokeWidth="1.5" />
    </svg>
  );
}

export function CoverslipSVG({ width = 26 }) {
  return (
    <svg viewBox="0 0 26 26" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="2" y="2" width="22" height="22" fill="rgba(200,220,235,0.5)" stroke="#9AA0A6" strokeWidth="1.5" />
    </svg>
  );
}

export function IodineBottleSVG({ width = 34 }) {
  return (
    <svg viewBox="0 0 34 50" width={width} height={width * 1.47} style={{ display: 'block', overflow: 'visible' }}>
      <rect x="12" y="0" width="10" height="10" rx="2" fill="#6B4A2E" />
      <rect x="8" y="8" width="18" height="12" rx="3" fill="#8A5A34" stroke="#5C3A1E" strokeWidth="1.5" />
      <path d="M4,20 Q4,18 8,18 L26,18 Q30,18 30,20 L30,44 Q30,48 26,48 L8,48 Q4,48 4,44 Z" fill="#7A4E28" stroke="#5C3A1E" strokeWidth="1.5" />
    </svg>
  );
}

export function OnionLayerSVG({ width = 50 }) {
  return (
    <svg viewBox="0 0 50 40" width={width} height={width * 0.8} style={{ display: 'block', overflow: 'visible' }}>
      <path
        d="M4,20 Q25,2 46,20 Q25,38 4,20 Z"
        fill="rgba(230,225,200,0.5)"
        stroke="#C9A876"
        strokeWidth="1.5"
      />
      <path d="M12,20 Q25,10 38,20 Q25,30 12,20" fill="none" stroke="#C9A876" strokeWidth="1" opacity={0.6} />
    </svg>
  );
}

export function ForcepsSVG({ width = 40 }) {
  return (
    <svg viewBox="0 0 40 60" width={width} height={width * 1.5} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M12,2 L8,50 L18,58" fill="none" stroke="#9AA0A6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28,2 L32,50 L22,58" fill="none" stroke="#9AA0A6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function DropperSVG({ width = 30 }) {
  return (
    <svg viewBox="0 0 24 60" width={width} height={width * 2} style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx="12" cy="8" rx="8" ry="8" fill="rgba(255,255,255,0.4)" stroke="#6B6B6B" strokeWidth="1.5" />
      <rect x="9" y="14" width="6" height="38" fill="rgba(255,255,255,0.5)" stroke="#6B6B6B" strokeWidth="1.5" />
      <path d="M12,52 L16,58 L8,58 Z" fill="#6B6B6B" />
    </svg>
  );
}

// The prepared/focused view of onion cells, with labelled hotspots for
// cell wall / membrane / nucleus / vacuole.
export function CellViewSVG({ width = 260 }) {
  return (
    <svg viewBox="0 0 260 160" width={width} height={width * (160 / 260)} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 84}, 0)`}>
          <rect x="4" y="4" width="80" height="152" rx="4" fill="#FFF9E6" stroke="#C9A876" strokeWidth="3" />
          <rect x="12" y="12" width="64" height="136" rx="3" fill="none" stroke="#E0C98A" strokeWidth="1.5" />
          <ellipse cx="44" cy="80" rx="26" ry="56" fill="#FFF3D6" opacity={0.8} />
          <circle cx="44" cy="50" r="12" fill="#D9A441" opacity={0.85} />
        </g>
      ))}
    </svg>
  );
}
