import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// One flat white-and-grey microscope, drawn as a single object: a base, a curved arm and a head that share one body (one
// outline, one flat fill), with the parts fixed on it: the illuminator and its switch, the stage with its clips and
// stage knobs, the diaphragm, the nosepiece with its three objective lenses, the eyepiece, and the coarse and fine
// focus knobs. Everything is in a 300 x 476 box; the foot's bottom edge is at y = 424 and the stage's top surface at
// y = 326 (microscopeSetup relies on that). `MicroscopeArt` can also be made interactive and labelled (the "Find the
// cells" step uses it that way); the default export is the plain object, for the bench.
const BODY = '#F1F3F5'; // flat white-grey casting
const BODY_SHADE = '#DDE1E5';
const METAL = '#C5CAD0';
const METAL_DARK = '#9AA1A9';
const EDGE = '#9AA3AD'; // a soft grey line, like the Bunsen burner and tripod: no harsh outlines
const OBJ = [
  { angle: 0, colour: '#D32F2F', len: 44, label: '×4' },
  { angle: 120, colour: '#F2C230', len: 62, label: '×10' },
  { angle: 240, colour: '#2A5AD0', len: 80, label: '×40' },
];
const TURRET = { x: 150, y: 200 };
const ARM = 'M228,394 C292,372 290,246 212,176';

const labelsFor = (t) => [
  // [text, anchor x, anchor y, label y, side]
  [t('game.mic_eyepiece'), 178, 62, 52, 'L'],
  [t('game.mic_nosepiece'), 118, 202, 196, 'L'],
  [t('game.mic_objective'), 138, 252, 248, 'L'],
  [t('game.mic_clips'), 108, 312, 300, 'L'],
  [t('game.mic_stage'), 76, 334, 342, 'L'],
  [t('game.mic_stage_knobs'), 84, 372, 388, 'L'],
  [t('game.mic_switch'), 52, 408, 438, 'L'],
  [t('game.mic_arm'), 252, 190, 120, 'R'],
  [t('game.mic_coarse'), 292, 286, 280, 'R'],
  [t('game.mic_fine'), 284, 336, 340, 'R'],
  [t('game.mic_base'), 270, 408, 438, 'R'],
];

export function MicroscopeArt({
  size = 1,
  width,
  isHeld = false,
  shadow = true,
  slide = false,
  smear = false,
  labels = false,
  tight = false, // the zoomable drawing without the room for labels: just the microscope, so it can be shown bigger
  wide = false, // use the wide drawing area even without labels (the labelled one and the zoomable one share their coordinates)
  fit = false, // fill the height of the parent instead of using a fixed width
  lightOn = false,
  noseAngle = -90, // the turret's rotation, in degrees; the lens nearest 270 is the one in the light path
  coarseAngle = 0,
  fineAngle = 0,
  xAngle = 0,
  yAngle = 0,
  stageDy = 0, // how far the stage has been raised (negative) or lowered, from focusing
  slideDx = 0,
  highlight = null, // 'light' | 'nose' | 'coarse' | 'fine' | 'stagexy': which control to point out
  enabled = {}, // which controls can be used right now
  targetLens = null, // the objective the student should pick next (it is circled)
  onLight,
  onLensTap,
  onCoarseDown,
  onFineDown,
  onXDown,
  onYDown,
  style,
}) {
  const { t } = useTranslation();
  const isWide = labels || wide;
  const vb = isWide ? '-140 6 590 440' : tight ? '10 6 290 440' : '0 0 300 476';
  const w = width ?? 92 * size * (isWide ? 1.97 : 1);
  const cursor = (on, kind = 'pointer') => (on ? kind : 'default');

  // which objective is in the light path, and where each one sits as the turret turns
  const lenses = OBJ.map((o, i) => {
    const abs = (((o.angle + noseAngle) % 360) + 360) % 360;
    const rad = (abs * Math.PI) / 180;
    const delta = Math.min(Math.abs(abs - 270), 360 - Math.abs(abs - 270));
    return { ...o, i, x: TURRET.x + Math.cos(rad) * 38, depth: Math.sin(rad), delta };
  });
  const active = lenses.reduce((a, b) => (b.delta < a.delta ? b : a));
  const stageTop = 326 + stageDy;

  const knob = (cx, cy, r, angle, ridges = 8) => (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={METAL} stroke={EDGE} strokeWidth="1.4" />
      <g transform={`rotate(${angle})`}>
        {Array.from({ length: ridges }, (_, k) => (
          <rect key={k} x={-1.8} y={-r + 0.5} width={3.6} height={r * 0.3} rx={1.2} fill={METAL_DARK} transform={`rotate(${(k * 360) / ridges})`} />
        ))}
        <circle r={r * 0.45} fill={BODY} stroke={EDGE} strokeWidth="1.2" />
        <rect x={-1.8} y={-r * 0.42} width={3.6} height={r * 0.42} rx={1.4} fill="#D95A4F" />
      </g>
    </g>
  );

  const ring = (cx, cy, r, key) =>
    highlight === key && (
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,220,80,0.22)" stroke="#E8A020" strokeWidth="4" strokeDasharray="9 6" style={{ pointerEvents: 'none' }}>
        <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
    );

  // two curved arrows going round a knob: "turn me"
  const turnArrows = (cx, cy, r, key) =>
    highlight === key && (
      <g transform={`translate(${cx} ${cy})`} style={{ pointerEvents: 'none' }}>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite" />
          {[0, 180].map((a) => {
            const th = ((a + 120) * Math.PI) / 180;
            const [x1, y1] = [Math.cos(((a + 10) * Math.PI) / 180) * r, Math.sin(((a + 10) * Math.PI) / 180) * r];
            const [x2, y2] = [Math.cos(th) * r, Math.sin(th) * r];
            const tip = [x2 - Math.sin(th) * 11, y2 + Math.cos(th) * 11];
            const b1 = [x2 + Math.cos(th) * 7, y2 + Math.sin(th) * 7];
            const b2 = [x2 - Math.cos(th) * 7, y2 - Math.sin(th) * 7];
            return (
              <g key={a} stroke="#E8A020" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" />
                <polygon points={`${tip[0]},${tip[1]} ${b1[0]},${b1[1]} ${b2[0]},${b2[1]}`} fill="#E8A020" />
              </g>
            );
          })}
        </g>
      </g>
    );

  return (
    <svg
      width={fit ? undefined : w}
      height={fit ? '100%' : isWide ? (w * 440) / 590 : (w * 476) / 300}
      viewBox={vb}
      style={{ display: 'block', overflow: 'visible', ...(fit ? { width: 'auto', maxWidth: '100%' } : {}), transform: isHeld ? 'translateY(-4px)' : undefined, ...style }}
    >
      {shadow && <ellipse cx="150" cy="434" rx="130" ry="8" fill="rgba(0,0,0,0.12)" />}

      {/* the body: base, arm and head drawn as one flat shape, an outline underneath and a flat fill on top */}
      <g stroke={EDGE} strokeWidth="3" strokeLinejoin="round" fill={EDGE}>
        <rect x="24" y="392" width="252" height="32" rx="14" />
        <path d={ARM} fill="none" strokeWidth="49" strokeLinecap="round" />
        <rect x="118" y="128" width="122" height="64" rx="18" />
        <rect x="186" y="332" width="68" height="36" rx="10" />
      </g>
      <g fill={BODY}>
        <rect x="24" y="392" width="252" height="32" rx="14" />
        <path d={ARM} fill="none" stroke={BODY} strokeWidth="46" strokeLinecap="round" />
        <rect x="118" y="128" width="122" height="64" rx="18" />
        <rect x="186" y="332" width="68" height="36" rx="10" />
      </g>
      {/* one flat shade along the underside of the base and the arm */}
      <rect x="30" y="412" width="240" height="8" rx="4" fill={BODY_SHADE} />

      {/* the eyepiece tube, leaning back from the head */}
      <g transform="rotate(-18 193 134)">
        <rect x="177" y="52" width="32" height="84" rx="7" fill={BODY} stroke={EDGE} strokeWidth="1.8" />
        <rect x="173" y="40" width="40" height="18" rx="6" fill={METAL} stroke={EDGE} strokeWidth="1.6" />
        <ellipse cx="193" cy="40" rx="16" ry="5.5" fill="#3A3F45" stroke={EDGE} strokeWidth="1.4" />
      </g>

      {/* the lamp in the base, and its switch */}
      <ellipse cx="150" cy="381" rx="26" ry="7" fill={lightOn ? '#FFF0A0' : METAL_DARK} stroke={EDGE} strokeWidth="1.8" />
      <g onClick={onLight} style={{ cursor: cursor(enabled.light) }}>
        <rect x="34" y="398" width="34" height="22" rx="6" fill={METAL} stroke={EDGE} strokeWidth="1.6" />
        <motion.rect x="42" y="402" width="18" height="14" rx="4" fill={lightOn ? '#3FB968' : '#D95A4F'} stroke={EDGE} strokeWidth="1.2" animate={{ rotate: lightOn ? -14 : 12 }} style={{ transformOrigin: '51px 409px' }} />
        <rect x="26" y="392" width="52" height="34" fill="transparent" />
      </g>
      {ring(52, 409, 30, 'light')}

      {/* the light beam up to the stage when the lamp is on */}
      {lightOn && (
        <polygon points={`132,380 168,380 164,${stageTop + 14} 136,${stageTop + 14}`} fill="rgba(255,240,170,0.35)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
        </polygon>
      )}

      {/* the stage: it rises and falls with the focus knobs */}
      <g transform={`translate(0 ${stageDy})`}>
        <rect x="150" y="338" width="46" height="22" rx="6" fill={BODY} stroke={EDGE} strokeWidth="1.6" />
        <rect x="68" y="326" width="164" height="16" rx="5" fill={METAL} stroke={EDGE} strokeWidth="1.6" />
        <ellipse cx="150" cy="327" rx="19" ry="4.4" fill="#3A3F45" />
        {lightOn && <ellipse cx="150" cy="327" rx="14" ry="3" fill="#FFF0A0" />}
        {/* clips holding the slide */}
        <path d="M104,327 q-2,-14 16,-12" fill="none" stroke={METAL_DARK} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M196,327 q2,-14 -16,-12" fill="none" stroke={METAL_DARK} strokeWidth="4.5" strokeLinecap="round" />
        {slide && (
          <g transform={`translate(${slideDx} 0)`}>
            <rect x="110" y="316" width="80" height="11" rx="2" fill="#EAF4FB" stroke="#7F98A8" strokeWidth="1.4" />
            {smear && <ellipse cx="150" cy="320" rx="17" ry="3" fill="#6F9BD8" opacity="0.9" />}
          </g>
        )}
        {/* stage knobs (X and Y), under the stage on the left */}
        <g onPointerDown={onXDown} style={{ cursor: cursor(enabled.stagexy, 'grab') }}>
          {knob(96, 366, 12, xAngle, 8)}
          <circle cx="96" cy="366" r="20" fill="transparent" />
        </g>
        <g onPointerDown={onYDown} style={{ cursor: cursor(enabled.stagexy, 'grab') }}>
          {knob(124, 372, 9, yAngle, 6)}
          <circle cx="124" cy="372" r="16" fill="transparent" />
        </g>
        {ring(110, 368, 34, 'stagexy')}
        {turnArrows(96, 366, 19, 'stagexy')}
        {turnArrows(124, 372, 14, 'stagexy')}
      </g>

      {/* the nosepiece with its three objective lenses; the one in the light path hangs lowest */}
      <g>
        <ellipse cx={TURRET.x} cy={TURRET.y} rx="46" ry="13" fill={METAL} stroke={EDGE} strokeWidth="1.8" />
        {[...lenses]
          .sort((a, b) => a.depth - b.depth)
          .map((l) => {
            const isActive = l.i === active.i;
            const len = isActive ? l.len : l.len * 0.6;
            const wd = isActive ? 17 : 13;
            return (
              <g key={l.i} opacity={isActive ? 1 : 0.8} onClick={() => enabled.nose && onLensTap?.(l.i)} style={{ cursor: cursor(enabled.nose) }}>
                {targetLens === l.i && (
                  <rect x={l.x - 20} y={TURRET.y - 4} width="40" height={l.len + 24} rx="10" fill="rgba(255,220,80,0.25)" stroke="#E8A020" strokeWidth="3.5" strokeDasharray="8 5">
                    <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                )}
                <rect x={l.x - wd / 2} y={TURRET.y + 2} width={wd} height={len} rx="3.5" fill={BODY} stroke={EDGE} strokeWidth="1.4" />
                <rect x={l.x - wd / 2} y={TURRET.y + 8} width={wd} height="7" fill={l.colour} stroke={EDGE} strokeWidth="0.8" />
                <rect x={l.x - wd / 2 + 2} y={TURRET.y + len - 6} width={wd - 4} height="6" rx="2" fill="#3A3F45" />
                <text x={l.x} y={TURRET.y + len + 16} textAnchor="middle" fontSize="13" fontWeight="800" fill="#2D2D2D" stroke="#fff" strokeWidth="4" paintOrder="stroke" fontFamily="var(--font-heading)" style={{ pointerEvents: 'none' }}>
                  {l.label}
                </text>
                <rect x={l.x - 20} y={TURRET.y - 4} width="40" height={l.len + 24} fill="transparent" />
              </g>
            );
          })}
      </g>

      {/* the focus knobs on the arm: a big coarse one and a small fine one */}
      <g onPointerDown={onCoarseDown} style={{ cursor: cursor(enabled.coarse, 'grab') }}>
        {knob(268, 288, 24, coarseAngle, 10)}
        <circle cx="268" cy="288" r="32" fill="transparent" />
      </g>
      {ring(268, 288, 38, 'coarse')}
      {turnArrows(268, 288, 40, 'coarse')}
      <g onPointerDown={onFineDown} style={{ cursor: cursor(enabled.fine, 'grab') }}>
        {knob(272, 338, 13, fineAngle, 8)}
        <circle cx="272" cy="338" r="22" fill="transparent" />
      </g>
      {ring(272, 338, 26, 'fine')}
      {turnArrows(272, 338, 27, 'fine')}

      {/* labels: a line from each part to its name */}
      {labels &&
        labelsFor(t).map(([text, ax, ay, ly, side]) => {
          const lx = side === 'L' ? -14 : 316;
          return (
            <g key={text} style={{ pointerEvents: 'none' }}>
              <polyline points={`${lx},${ly - 5} ${side === 'L' ? lx + 12 : lx - 12},${ly - 5} ${ax},${ay}`} fill="none" stroke="#3A3A3A" strokeWidth="1.8" />
              <circle cx={ax} cy={ay} r="3.6" fill="#E8A020" stroke="#3A3A3A" strokeWidth="1.2" />
              <text x={lx} y={ly} textAnchor={side === 'L' ? 'end' : 'start'} fontSize="17" fontWeight="700" fill="#2D2D2D" stroke="#fff" strokeWidth="5" paintOrder="stroke" fontFamily="var(--font-body)">
                {text}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

// the plain microscope for the bench: 92 x 146 units at size 1, with a slide on the stage once it is prepared
export default function Microscope({ size = 1, isHeld = false, stagePrepared = false, shadow = true }) {
  return <MicroscopeArt size={size} isHeld={isHeld} shadow={shadow} slide={stagePrepared} smear={stagePrepared} />;
}

// the bench microscope with the names of its parts. Its drawing is wider than the plain one (room for the labels), so it is
// nudged to keep the microscope itself exactly where the plain one stands (the slide is placed relative to that spot).
export function LabelledMicroscope({ size = 1, isHeld = false, shadow = false }) {
  const u = (92 * size * 1.97) / 590; // pixels per drawing unit
  return (
    <div style={{ transform: `translate(${5 * u}px, ${-12 * u}px)` }}>
      <MicroscopeArt size={size} isHeld={isHeld} shadow={shadow} labels />
    </div>
  );
}
