import { useTranslation } from 'react-i18next';

// The P2 results graph: force (N) against angle (°), drawn already plotted. Shared by the "name the parts of
// a graph" step and the "line of best fit" step. Coordinates are in a fixed 640 x 420 box that the caller
// scales; `children` is drawn on top (badges, the best-fit line).
export const GRAPH = { w: 640, h: 420, left: 100, right: 600, top: 30, bottom: 330, xMax: 70, yMax: 5 };
export const gx = (angle) => GRAPH.left + (angle / GRAPH.xMax) * (GRAPH.right - GRAPH.left);
export const gy = (force) => GRAPH.bottom - (force / GRAPH.yMax) * (GRAPH.bottom - GRAPH.top);

const INK = '#2F3A45';

export default function ForceGraph({ points, hit = [], children }) {
  const { t } = useTranslation();
  const xs = Array.from({ length: GRAPH.xMax / 10 + 1 }, (_, i) => i * 10);
  const ys = Array.from({ length: GRAPH.yMax + 1 }, (_, i) => i);
  return (
    <svg viewBox={`0 0 ${GRAPH.w} ${GRAPH.h}`} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <rect x={GRAPH.left - 70} y={GRAPH.top - 24} width={GRAPH.right - GRAPH.left + 110} height={GRAPH.bottom - GRAPH.top + 112} rx={16} fill="rgba(255,255,255,0.92)" stroke="#D9CFAE" strokeWidth={2} />
      {/* grid */}
      {xs.map((a) => (
        <line key={`vx${a}`} x1={gx(a)} x2={gx(a)} y1={GRAPH.top} y2={GRAPH.bottom} stroke="#E2E6EA" strokeWidth={1.5} />
      ))}
      {ys.map((f) => (
        <line key={`hy${f}`} x1={GRAPH.left} x2={GRAPH.right} y1={gy(f)} y2={gy(f)} stroke="#E2E6EA" strokeWidth={1.5} />
      ))}
      {/* the two axes */}
      <line x1={GRAPH.left} x2={GRAPH.left} y1={GRAPH.top - 6} y2={GRAPH.bottom} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={GRAPH.left} x2={GRAPH.right + 6} y1={GRAPH.bottom} y2={GRAPH.bottom} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      {/* the scale: a number at each step along each axis */}
      {xs.map((a) => (
        <text key={`tx${a}`} x={gx(a)} y={GRAPH.bottom + 26} textAnchor="middle" fontSize={17} fontWeight={700} fill={INK} fontFamily="var(--font-body)">
          {a}
        </text>
      ))}
      {ys.map((f) => (
        <text key={`ty${f}`} x={GRAPH.left - 14} y={gy(f) + 6} textAnchor="end" fontSize={17} fontWeight={700} fill={INK} fontFamily="var(--font-body)">
          {f}
        </text>
      ))}
      {/* the units, in the axis titles */}
      <text x={(GRAPH.left + GRAPH.right) / 2} y={GRAPH.bottom + 66} textAnchor="middle" fontSize={20} fontWeight={700} fill={INK} fontFamily="var(--font-body)">
        {t('game.axis_angle')}
      </text>
      <text transform={`translate(${GRAPH.left - 62} ${(GRAPH.top + GRAPH.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize={20} fontWeight={700} fill={INK} fontFamily="var(--font-body)">
        {t('game.axis_force')}
      </text>
      {/* the plots: one cross per result */}
      {points.map((p, i) => {
        const on = hit.includes(i);
        const c = on ? '#1E9E5A' : '#D6452B';
        return (
          <g key={i} stroke={c} strokeWidth={4.5} strokeLinecap="round">
            {on && <circle cx={gx(p.x)} cy={gy(p.y)} r={17} fill="rgba(30,158,90,0.18)" stroke="none" />}
            <line x1={gx(p.x) - 8} y1={gy(p.y) - 8} x2={gx(p.x) + 8} y2={gy(p.y) + 8} />
            <line x1={gx(p.x) - 8} y1={gy(p.y) + 8} x2={gx(p.x) + 8} y2={gy(p.y) - 8} />
          </g>
        );
      })}
      {children}
    </svg>
  );
}
