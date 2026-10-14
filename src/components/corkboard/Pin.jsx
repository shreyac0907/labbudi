const PIN_COLORS = {
  red: '#CC2222',
  pink: '#FF8FAB',
  blue: '#5B6FE0',
  yellow: '#FFD166',
  green: '#4FBFA8',
};

export function Pin({ color = 'red', size = 22, style }) {
  const fill = PIN_COLORS[color] ?? PIN_COLORS.red;
  return (
    <svg
      viewBox="0 0 22 30"
      width={size}
      height={(size * 30) / 22}
      style={{ display: 'block', filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))', ...style }}
    >
      <line x1="11" y1="16" x2="11" y2="28" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="10" r="9" fill={fill} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <circle cx="7.5" cy="6.5" r="2.2" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}
