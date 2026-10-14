// Post-it notes and paper notecards for the corkboard theme.
// Built as parameterized inline SVG components (matching this codebase's
// established equipment-SVG pattern) rather than static files, so colour,
// size and rotation are all just props.

const POSTIT_COLORS = {
  yellow: '#FFEAA0',
  pink: '#FFB3C6',
  blue: '#B3D4FF',
  green: '#B3FFD4',
  peach: '#FFCBA4',
  purple: '#D4B3FF',
};

export function PostIt({ color = 'yellow', width = 200, rotate = 0, children, style }) {
  const fill = POSTIT_COLORS[color] ?? POSTIT_COLORS.yellow;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: width,
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(2px 3px 6px rgba(0,0,0,0.2))',
        ...style,
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
        <rect x="2" y="2" width="196" height="196" rx="3" fill={fill} />
        <rect x="2" y="2" width="196" height="20" fill="rgba(0,0,0,0.06)" />
        <line x1="18" y1="55" x2="172" y2="47" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <line x1="14" y1="115" x2="182" y2="108" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <line x1="22" y1="158" x2="160" y2="153" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        <path d="M170,200 L200,200 L200,168 Q184,184 170,200 Z" fill="rgba(0,0,0,0.1)" />
      </svg>
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
      )}
    </div>
  );
}

function LinedCardSVG({ width, height }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <rect x="1" y="1" width={width - 2} height={height - 2} rx="4" fill="#FFF8E7" stroke="#E4D3AC" strokeWidth="1.5" />
      <line x1="34" y1="0" x2="34" y2={height} stroke="#E08080" strokeWidth="1.5" opacity="0.55" />
      {Array.from({ length: Math.floor((height - 30) / 24) }, (_, i) => (
        <line key={i} x1="44" y1={30 + i * 24} x2={width - 12} y2={30 + i * 24} stroke="#AECBE0" strokeWidth="1" opacity="0.6" />
      ))}
      {[height * 0.22, height * 0.5, height * 0.78].map((y, i) => (
        <circle key={i} cx="15" cy={y} r="4.5" fill="#F7F4EF" stroke="#C9BFA8" strokeWidth="1" />
      ))}
    </svg>
  );
}

export function NoteCard({ width = 280, height = 180, rotate = 0, children, style }) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.18))',
        ...style,
      }}
    >
      <LinedCardSVG width={width} height={height} />
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
      )}
    </div>
  );
}

function ClipSVG({ width = 54 }) {
  return (
    <svg viewBox="0 0 54 40" width={width} height={(width * 40) / 54} style={{ display: 'block' }}>
      <path d="M27,2 C15,2 15,16 15,16 L15,34 C15,34 15,2 27,2 C39,2 39,34 39,34 L39,16 C39,16 39,2 27,2 Z" fill="none" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
      <rect x="10" y="14" width="34" height="7" rx="2" fill="#E8C158" stroke="#B8901E" strokeWidth="1" />
      <rect x="10" y="24" width="34" height="7" rx="2" fill="#D4AF37" stroke="#B8901E" strokeWidth="1" />
    </svg>
  );
}

export function NoteCardWithClip({ width = 280, height = 180, rotate = 0, children, style }) {
  return (
    <div style={{ position: 'relative', width, height: height + 22, transform: `rotate(${rotate}deg)`, ...style }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2, filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.25))' }}>
        <ClipSVG />
      </div>
      <div style={{ position: 'absolute', top: 18, left: 0, width, height, filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.18))' }}>
        <LinedCardSVG width={width} height={height} />
        {children && (
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
        )}
      </div>
    </div>
  );
}
