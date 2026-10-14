// A small deterministic "organic blob" path generator — used for animal
// cell membranes, which (unlike plant cells) are irregular, not neat
// rectangles. Same seed always produces the same blob, so cell shapes stay
// stable across re-renders.
function blobPath(cx, cy, r, seed) {
  const points = 8;
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 0.75 + 0.35 * Math.abs(Math.sin(seed * (i + 1) * 12.9898));
    const rad = r * wobble;
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < points; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % points];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    d += ` Q${x1},${y1} ${mx},${my}`;
  }
  return d + ' Z';
}

const CELLS = [
  { cx: 44, cy: 46, r: 30, seed: 1.1, nucX: 50, nucY: 42, nucR: 11 },
  { cx: 112, cy: 40, r: 26, seed: 2.3, nucX: 106, nucY: 44, nucR: 9 },
  { cx: 40, cy: 116, r: 28, seed: 3.7, nucX: 46, nucY: 120, nucR: 10 },
  { cx: 118, cy: 118, r: 24, seed: 4.2, nucX: 112, nucY: 112, nucR: 8 },
  { cx: 80, cy: 82, r: 22, seed: 5.6, nucX: 84, nucY: 78, nucR: 8 },
];

// Pip's cheek cells — stained animal cells: irregular membrane (no cell
// wall), pale-blue cytoplasm, a darker-blue nucleus. No vacuole, no
// chloroplasts. `highlightIndex` glows one cell (used by the stage
// X/Y-knob "centre a cell" step). `zoom` (1 = ×4 field of view) crops
// the same 160×160 layout tighter for ×10/×40 — real magnification
// doesn't redraw the cells, it just shows less of the same slide, closer
// up, which is exactly what a smaller viewBox around the same points
// gives for free. `pan` shifts the crop centre (the stage X/Y knobs).
export default function CellView({ highlightIndex = -1, zoom = 1, pan = { x: 0, y: 0 } }) {
  const span = 160 / zoom;
  const cx = 80 + pan.x;
  const cy = 80 + pan.y;
  const x0 = cx - span / 2;
  const y0 = cy - span / 2;
  return (
    <svg width="100%" height="100%" viewBox={`${x0} ${y0} ${span} ${span}`} style={{ display: 'block' }}>
      <rect x={x0 - 20} y={y0 - 20} width={span + 40} height={span + 40} fill="#EAF4FC" />
      {CELLS.map((c, i) => (
        <g key={i} opacity={highlightIndex === -1 || highlightIndex === i ? 1 : 0.35}>
          <path d={blobPath(c.cx, c.cy, c.r, c.seed)} fill="#BBDEFB" stroke="#5B8FC7" strokeWidth={1.4 / zoom} />
          <ellipse cx={c.nucX} cy={c.nucY} rx={c.nucR} ry={c.nucR * 0.85} fill="#1565C0" opacity={0.9} />
          {highlightIndex === i && (
            <path d={blobPath(c.cx, c.cy, c.r + 3, c.seed)} fill="none" stroke="#FFD166" strokeWidth={2 / zoom} strokeDasharray={`${4 / zoom} ${3 / zoom}`} />
          )}
        </g>
      ))}
    </svg>
  );
}

export { CELLS };
