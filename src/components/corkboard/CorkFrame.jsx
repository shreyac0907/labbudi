// A wooden picture-frame border that sits around the edges of its nearest
// positioned ancestor (the board container), not the raw viewport — so a
// smaller/inset board still gets a frame that matches its own edges.
export default function CorkFrame({ thickness = 28 }) {
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="corkFrameGrain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9C7A24" />
          <stop offset="50%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#755408" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="url(#corkFrameGrain)" strokeWidth={thickness} />
      <rect
        x={thickness * 0.28}
        y={thickness * 0.28}
        width={`calc(100% - ${thickness * 0.56}px)`}
        height={`calc(100% - ${thickness * 0.56}px)`}
        fill="none"
        stroke="rgba(255,220,150,0.25)"
        strokeWidth="2"
      />
      <rect
        x={thickness * 0.85}
        y={thickness * 0.85}
        width={`calc(100% - ${thickness * 1.7}px)`}
        height={`calc(100% - ${thickness * 1.7}px)`}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="2"
        rx="6"
      />
    </svg>
  );
}
