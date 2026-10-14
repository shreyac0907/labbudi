const LEN = 180;
const STICK_W = 4;

// A real cotton bud: a thin plastic stick with a cotton wool bud at each
// end — a larger one on the active end (the one that actually touches the
// cheek), a smaller one on the handle end. `collected` tints the active
// bud a barely-there salmon pink once cells have been picked up — the
// only visual confirmation, nothing gross.
export default function CottonSwab({ size = 1, collected = false, rotation = 0 }) {
  return (
    <svg
      width={28 * size}
      height={LEN * size}
      viewBox={`0 0 28 ${LEN}`}
      style={{ display: 'block', overflow: 'visible', transform: `rotate(${rotation}deg)`, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.18))' }}
    >
      {/* stick */}
      <rect x={14 - STICK_W / 2} y={18} width={STICK_W} height={LEN - 36} rx={STICK_W / 2} fill="#F0EDE8" stroke="#C8C2B8" strokeWidth="0.8" />

      {/* handle-end bud (smaller) */}
      <ellipse cx={14} cy={LEN - 7} rx={5} ry={7} fill="#FAFAFA" stroke="#E0DCD4" strokeWidth="0.8" />
      {[-2, 0, 2].map((dx) => (
        <path key={dx} d={`M${14 + dx},${LEN - 13} q${dx > 0 ? 1.5 : -1.5},7 0,14`} fill="none" stroke="#E4E0D8" strokeWidth="0.6" />
      ))}

      {/* active-end bud (larger) — the one that touches the cheek */}
      <ellipse cx={14} cy={9} rx={6} ry={9} fill={collected ? '#F8E8E0' : '#FAFAFA'} stroke="#E0DCD4" strokeWidth="0.8" />
      {[-3, -1, 1, 3].map((dx) => (
        <path key={dx} d={`M${14 + dx},${1.5} q${dx > 0 ? 2 : -2},9 0,18`} fill="none" stroke={collected ? '#EED4C8' : '#E4E0D8'} strokeWidth="0.7" />
      ))}
    </svg>
  );
}
