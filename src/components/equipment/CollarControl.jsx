import { useCallback } from 'react';

// The one way every Bunsen burner step opens and closes the air hole: slide the collar (drag it right, or up, to
// open; left, or down, to close), scroll over the scene, or just tap it. `value` is 0 (closed) to 1 (open).
export function useCollarDrag(value, onChange, pxFull = 150) {
  return useCallback(
    (e) => {
      e.preventDefault();
      const x0 = e.clientX;
      const y0 = e.clientY;
      const v0 = value;
      let moved = 0;
      const move = (ev) => {
        const dx = ev.clientX - x0;
        const dy = ev.clientY - y0;
        moved = Math.max(moved, Math.hypot(dx, dy));
        onChange(v0 + (dx - dy) / pxFull);
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        if (moved < 6) onChange(v0 + 0.34); // a tap nudges it open
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [value, onChange, pxFull],
  );
}

// A glowing frame round the collar with arrows either side, pointing the way to slide it. Drawn in pixels
// around (0,0), the collar's centre; `u` is the size of one burner unit on screen.
export function CollarCue({ u, active = true }) {
  const w = 36 * u;
  const h = 28 * u;
  const arrow = (dir) => (
    <g transform={`translate(${dir * (w / 2 + 16 * u)} 0)`}>
      <path d={`M${-dir * 8 * u},${-12 * u} L${dir * 8 * u},0 L${-dir * 8 * u},${12 * u} Z`} fill="#E8A020" stroke="#B87A10" strokeWidth="2" strokeLinejoin="round">
        {active && <animateTransform attributeName="transform" type="translate" values={`0 0; ${dir * 8} 0; 0 0`} dur="1s" repeatCount="indefinite" />}
      </path>
    </g>
  );
  return (
    <svg width="1" height="1" style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8 * u} fill="rgba(255,214,0,0.18)" stroke="#E8A020" strokeWidth="3.5" strokeDasharray="8 6">
        {active && <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />}
      </rect>
      {arrow(-1)}
      {arrow(1)}
    </svg>
  );
}

// The collar itself is the control: a frame with arrows over the brass collar on the burner, with a label below.
export function CollarHandle({ cx, cy, u, value, onChange, label }) {
  const down = useCollarDrag(value, onChange);
  return (
    <div style={{ position: 'absolute', left: cx, top: cy, zIndex: 10, touchAction: 'none' }}>
      <CollarCue u={u} />
      <div onPointerDown={down} style={{ position: 'absolute', left: -62 * u, top: -20 * u, width: 124 * u, height: 40 * u, cursor: 'grab', pointerEvents: 'auto' }} />
      <div style={{ position: 'absolute', left: '50%', top: 28 * u, transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 12, background: '#fff', border: '2px solid #E8A020', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, color: '#7A4A00', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{label}</div>
    </div>
  );
}
