import GraphLabelBoard from './GraphLabelBoard';
import { ANGLES, FORCE_AT_ANGLE, FORCE_MAX } from '../../data/rampResults';

const CHART_W = 380;
const CHART_H = 180;
const ANOMALY_ANGLE = 30;
const ANOMALY_FORCE = 3.3; // plotted point sits slightly above the true curve

const BULLETS = [
  'At 0°, the force needed was 0.0N (friction only)',
  'At 15°, the force needed was 1.3N',
  'At 30°, the force needed was 2.5N (one reading came out a little high)',
  'At 45°, the force needed was 3.5N',
  'At 60°, the force needed was 4.3N',
];

const ARROWS = [
  {
    id: 'xaxis',
    top: 62,
    left: 4,
    correct: 'x-axis (independent variable)',
    options: ['x-axis (independent variable)', 'y-axis (dependent variable)', 'title', 'key'],
    explanation: 'Exactly — the angle we chose to set sits along the x-axis.',
    hint: 'Look at where the arrow is pointing…',
  },
  {
    id: 'yaxis',
    top: 14,
    left: 3,
    correct: 'y-axis (dependent variable)',
    options: ['x-axis (independent variable)', 'y-axis (dependent variable)', 'title', 'key'],
    explanation: 'Right — force is what we measured, so it goes on the y-axis.',
    hint: 'This one runs up the side of the graph…',
  },
  {
    id: 'units',
    top: 8,
    left: 90,
    correct: 'Units of force (Newtons)',
    options: ['Units of force (Newtons)', 'Units of angle (degrees)', 'pH scale', 'Temperature (°C)'],
    explanation: 'Correct — always check what scale the numbers on an axis represent.',
    hint: 'What are we actually measuring here?',
  },
  {
    id: 'scale',
    top: 68,
    left: 92,
    correct: 'Scale (intervals of 15°)',
    options: ['Scale (intervals of 15°)', 'Origin (0,0)', 'Data point', 'Line of best fit'],
    explanation: 'Yes — evenly spaced numbers like this are the scale of the axis.',
    hint: 'Look at the numbered gaps on the axis…',
  },
  {
    id: 'datapoint',
    top: 30,
    left: 40,
    correct: 'A data point',
    options: ['A data point', 'The line of best fit', 'The y-intercept', 'An anomaly'],
    explanation: 'That X mark shows one measured result — one data point.',
    hint: 'That single X mark represents one reading…',
  },
  {
    id: 'bestfit',
    top: 45,
    left: 60,
    correct: 'Line of best fit',
    options: ['Line of best fit', 'A data point', 'The x-axis', 'The trend line is wrong here'],
    explanation: 'Right — the dashed line shows the overall trend through the points.',
    hint: 'This one is dashed, not solid…',
  },
  {
    id: 'trend',
    top: 80,
    left: 55,
    correct: 'Positive correlation (as x increases, y increases)',
    options: [
      'Positive correlation (as x increases, y increases)',
      'Negative correlation',
      'No correlation',
      'Anomalous result',
    ],
    explanation: 'Right — force rises steadily as the angle increases.',
    hint: 'Look at the overall shape, left to right…',
  },
  {
    id: 'anomaly',
    top: 22,
    left: 48,
    correct: 'Anomalous result',
    options: ['Anomalous result', 'The most accurate point', 'The line of best fit', 'An error in the axis'],
    explanation: 'Exactly — that one reading sits off the expected line.',
    hint: 'One of these points looks a little out of place…',
  },
];

function pointFor(angle, force) {
  const i = ANGLES.indexOf(angle);
  const x = 55 + i * ((CHART_W - 70) / (ANGLES.length - 1));
  const y = 20 + CHART_H - (force / FORCE_MAX) * CHART_H;
  return { x, y };
}

function XMark({ x, y }) {
  return (
    <g stroke="#2A4A6C" strokeWidth="2" strokeLinecap="round">
      <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} />
      <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} />
    </g>
  );
}

function ForceLineGraph() {
  const truePoints = ANGLES.map((a) => pointFor(a, FORCE_AT_ANGLE[a]));
  const measuredPoints = ANGLES.map((a) => (a === ANOMALY_ANGLE ? pointFor(a, ANOMALY_FORCE) : pointFor(a, FORCE_AT_ANGLE[a])));
  const bestFitD = truePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const measuredD = measuredPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 50}`} style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="40" y1={20 + f * CHART_H} x2={CHART_W - 10} y2={20 + f * CHART_H} stroke="#C9E0F0" strokeWidth="1" />
      ))}
      <line x1="40" y1="20" x2="40" y2={20 + CHART_H} stroke="#5B4636" strokeWidth="1.5" />
      <line x1="40" y1={20 + CHART_H} x2={CHART_W - 10} y2={20 + CHART_H} stroke="#5B4636" strokeWidth="1.5" />
      {[5, 3.75, 2.5, 1.25, 0].map((v, i) => (
        <text key={v} x="34" y={20 + i * (CHART_H / 4) + 4} fontSize="9" textAnchor="end" fill="#8a7a63" fontFamily="var(--font-body)">
          {v}
        </text>
      ))}
      <path d={bestFitD} fill="none" stroke="#8B6914" strokeWidth="1.5" strokeDasharray="6 4" />
      <path d={measuredD} fill="none" stroke="#2A4A6C" strokeWidth="1.5" opacity="0.6" />
      {measuredPoints.map((p, i) => (
        <XMark key={i} x={p.x} y={p.y} />
      ))}
      {ANGLES.map((a, i) => (
        <text
          key={a}
          x={55 + i * ((CHART_W - 70) / (ANGLES.length - 1))}
          y={20 + CHART_H + 16}
          fontSize="9"
          textAnchor="middle"
          fill="#5B4636"
          fontFamily="var(--font-body)"
        >
          {a}°
        </text>
      ))}
    </svg>
  );
}

export default function RampResults({ onFeedback, onAllPlaced }) {
  return (
    <GraphLabelBoard subject="phys" bullets={BULLETS} arrows={ARROWS} onFeedback={onFeedback} onComplete={onAllPlaced}>
      <ForceLineGraph />
    </GraphLabelBoard>
  );
}
