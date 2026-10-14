import { AmbientShadow, CHROME } from './materials';

const W = 64;

// A wire gauze mat — a metal square frame with a woven mesh pattern and a
// white ceramic centre patch, sitting on the tripod's ring to spread the
// flame's heat evenly under the evaporating dish.
export default function Gauze({ size = 1, isHeld = false, contactShadow = false, shadow = true }) {
  const cell = 5.5;
  const lines = [];
  for (let x = 4; x < W - 4; x += cell) lines.push(x);

  return (
    <svg
      width={W * size}
      height={(W * 0.34 + 10) * size}
      viewBox={`0 0 ${W} ${W * 0.34 + 10}`}
      style={{ display: 'block', overflow: 'visible', filter: shadow ? `drop-shadow(0 ${isHeld ? 8 : 3}px 5px rgba(0,0,0,0.22))` : undefined }}
    >
      {shadow && (
        <g transform={`translate(0 ${W * 0.34 + 8})`}>
          <AmbientShadow width={W} isHeld={isHeld} offsetX={2} contactShadow={contactShadow} />
        </g>
      )}

      <ellipse cx={W / 2} cy={W * 0.17} rx={W / 2 - 3} ry={W * 0.17 - 2} fill="#F9A825" stroke={CHROME.shadow} strokeWidth="1.4" />
      <ellipse cx={W / 2} cy={W * 0.17 - 1} rx={W / 2 - 8} ry={W * 0.17 - 6} fill="#EDEDED" />

      {/* woven mesh */}
      <g clipPath="url(#gauze-clip)" opacity={0.5}>
        {lines.map((x) => (
          <line key={`v-${x}`} x1={x} y1={4} x2={x} y2={W * 0.34 - 4} stroke={CHROME.shadow} strokeWidth="0.7" />
        ))}
        {lines.map((y) => (
          <line key={`h-${y}`} x1={4} y1={y * 0.34} x2={W - 4} y2={y * 0.34} stroke={CHROME.shadow} strokeWidth="0.7" />
        ))}
      </g>
      <defs>
        <clipPath id="gauze-clip">
          <ellipse cx={W / 2} cy={W * 0.17} rx={W / 2 - 3} ry={W * 0.17 - 2} />
        </clipPath>
      </defs>

      {/* white ceramic centre patch — where the heat is spread */}
      <ellipse cx={W / 2} cy={W * 0.17} rx={W * 0.24} ry={W * 0.09} fill="#F7F5F0" stroke="#DAD5C8" strokeWidth="1" />
    </svg>
  );
}
