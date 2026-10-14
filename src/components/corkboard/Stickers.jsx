import { motion } from 'framer-motion';

function starPath(cx, cy, rOuter, rInner, points = 5) {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

export function StarSticker({ size = 40, style }) {
  // the star emoji; the old teal/pink colour variants no longer apply
  return (
    <span style={{ display: 'block', width: size, height: size, fontSize: size * 0.85, lineHeight: `${size}px`, textAlign: 'center', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.2))', ...style }} aria-hidden="true">
      ⭐
    </span>
  );
}

const BADGE_META = {
  bio: { bg: '#B3FFD4', text: 'BIOLOGY' },
  chem: { bg: '#FFD166', text: 'CHEMISTRY' },
  phys: { bg: '#B3D4FF', text: 'PHYSICS' },
};

function BadgeIcon({ subject }) {
  if (subject === 'bio') {
    return <path d="M60,16 C48,16 40,26 40,36 C40,26 60,22 60,36 C60,22 80,26 80,36 C80,26 72,16 60,16 Z" fill="#3E8E5C" transform="translate(0,-2) scale(0.5) translate(60,20)" />;
  }
  if (subject === 'chem') {
    return (
      <g transform="translate(52,14) scale(0.8)">
        <path d="M6,0 L14,0 L14,10 L20,26 Q22,30 16,30 L4,30 Q-2,30 0,26 L6,10 Z" fill="#B8621E" opacity="0.9" />
        <rect x="4" y="4" width="12" height="4" fill="#8B6914" />
      </g>
    );
  }
  return (
    <g transform="translate(52,12) scale(0.8)">
      <path d="M14,0 L2,18 L10,18 L6,32 L22,12 L13,12 Z" fill="#2255AA" />
    </g>
  );
}

export function SubjectBadge({ subject = 'bio', width = 92, style }) {
  const meta = BADGE_META[subject] ?? BADGE_META.bio;
  return (
    <svg viewBox="0 0 120 70" width={width} height={(width * 70) / 120} style={{ display: 'block', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.2))', ...style }}>
      <ellipse cx="60" cy="35" rx="57" ry="32" fill={meta.bg} stroke="#fff" strokeWidth="2.5" />
      <ellipse cx="60" cy="35" rx="49" ry="25" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeDasharray="3 3" />
      <BadgeIcon subject={subject} />
      <text x="60" y="55" fontSize="9" fontWeight="700" textAnchor="middle" fill="var(--color-dark)" fontFamily="var(--font-body)" letterSpacing="0.5">
        {meta.text}
      </text>
    </svg>
  );
}

export function Starburst({ width = 140, color = '#C8614A', children, style, wobble = true }) {
  return (
    <motion.div
      animate={wobble ? { rotate: [-2, 2, -2] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'relative', width, height: width, ...style }}
    >
      <svg viewBox="0 0 140 140" width="100%" height="100%" style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(2px 3px 6px rgba(0,0,0,0.28))' }}>
        <path d={starPath(70, 70, 70, 46, 8)} fill={color} />
      </svg>
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </motion.div>
  );
}

export function StampBadge({ kind = 'done', size = 80, style }) {
  const isDone = kind === 'done';
  const color = isDone ? '#2E7D32' : '#C08A1E';
  const text = isDone ? 'DONE!' : 'CHECKPOINT';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" />
      <text
        x="50"
        y={isDone ? 57 : 55}
        fontSize={isDone ? 15 : 9}
        fontWeight="800"
        textAnchor="middle"
        fill={color}
        fontFamily="var(--font-heading)"
        transform="rotate(-8 50 50)"
      >
        {text}
      </text>
      {[0, 72, 144, 216, 288].map((a) => (
        <text
          key={a}
          x={50 + 34 * Math.cos((a * Math.PI) / 180 - Math.PI / 2)}
          y={50 + 34 * Math.sin((a * Math.PI) / 180 - Math.PI / 2) + 3}
          fontSize="8"
          textAnchor="middle"
          fill={color}
        >
          ⭐
        </text>
      ))}
    </svg>
  );
}
