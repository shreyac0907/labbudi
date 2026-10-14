import GraphLabelBoard from './GraphLabelBoard';
import { SOLUTIONS, RESULTS, UNIVERSAL_PH } from '../../data/wetLabResults';

const PH_MAX = 14;
const CHART_H = 180;
const CHART_W = 380;

const BULLETS = [
  'Lemon juice turned RED with Universal Indicator — pH 2 (strongly acidic)',
  'Vinegar turned ORANGE with Universal Indicator — pH 4 (weakly acidic)',
  'Water turned GREEN with Universal Indicator — pH 7 (neutral)',
  'Bicarbonate turned BLUE-GREEN with Universal Indicator — pH 8 (weakly alkaline)',
  'Bleach turned PURPLE with Universal Indicator — pH 13 (strongly alkaline)',
];

const ARROWS = [
  {
    id: 'xaxis',
    top: 66,
    left: 6,
    correct: 'x-axis (independent variable)',
    options: ['x-axis (independent variable)', 'y-axis (dependent variable)', 'title', 'key'],
    explanation: 'Exactly — the solutions we chose to test sit along the x-axis.',
    hint: 'Look at where the arrow is pointing…',
  },
  {
    id: 'yaxis',
    top: 16,
    left: 4,
    correct: 'y-axis (dependent variable)',
    options: ['x-axis (independent variable)', 'y-axis (dependent variable)', 'title', 'key'],
    explanation: 'Right — pH is what we measured, so it goes on the y-axis.',
    hint: 'This one runs up the side of the graph…',
  },
  {
    id: 'units',
    top: 10,
    left: 88,
    correct: 'pH scale',
    options: ['Units of force (Newtons)', 'Units of angle (degrees)', 'pH scale', 'Temperature (°C)'],
    explanation: 'Correct — always check what scale the numbers on an axis represent.',
    hint: 'What are we actually measuring here?',
  },
  {
    id: 'scale',
    top: 40,
    left: 90,
    correct: 'Scale (intervals of 2)',
    options: ['Scale (intervals of 2)', 'Origin (0,0)', 'Data point', 'Line of best fit'],
    explanation: 'Yes — evenly spaced numbers like this are the scale of the axis.',
    hint: 'Look at the numbered gaps on the axis…',
  },
  {
    id: 'datapoint',
    top: 55,
    left: 47,
    correct: 'A data point',
    options: ['A data point', 'The line of best fit', 'The y-intercept', 'An anomaly'],
    explanation: 'That bar shows one measured result — one data point.',
    hint: 'That single bar represents one result…',
  },
  {
    id: 'trend',
    top: 78,
    left: 50,
    correct: 'Positive correlation (as x increases, y increases)',
    options: [
      'Positive correlation (as x increases, y increases)',
      'Negative correlation',
      'No correlation',
      'Anomalous result',
    ],
    explanation: 'Right — the bars get taller left to right, so pH rises with each solution.',
    hint: 'Look at the overall shape, left to right…',
  },
];

function PhBarChart() {
  return (
    <svg width="100%" viewBox={`0 0 ${CHART_W} ${CHART_H + 50}`} style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="40" y1={20 + f * CHART_H} x2={CHART_W - 10} y2={20 + f * CHART_H} stroke="#C9E0F0" strokeWidth="1" />
      ))}
      <line x1="40" y1="20" x2="40" y2={20 + CHART_H} stroke="#5B4636" strokeWidth="1.5" />
      <line x1="40" y1={20 + CHART_H} x2={CHART_W - 10} y2={20 + CHART_H} stroke="#5B4636" strokeWidth="1.5" />
      {[14, 10.5, 7, 3.5, 0].map((v, i) => (
        <text key={v} x="34" y={20 + i * (CHART_H / 4) + 4} fontSize="9" textAnchor="end" fill="#8a7a63" fontFamily="var(--font-body)">
          {v}
        </text>
      ))}
      {SOLUTIONS.map((sol, i) => {
        const ph = UNIVERSAL_PH[sol.id];
        const barH = (ph / PH_MAX) * CHART_H;
        const barW = 46;
        const x = 55 + i * ((CHART_W - 70) / SOLUTIONS.length);
        const y = 20 + CHART_H - barH;
        return (
          <g key={sol.id}>
            <rect x={x} y={y} width={barW} height={barH} fill={RESULTS.universal[sol.id].color} stroke="#5B4636" strokeWidth="1" rx="2" />
            <text x={x + barW / 2} y={20 + CHART_H + 16} fontSize="8.5" textAnchor="middle" fill="#5B4636" fontFamily="var(--font-body)">
              {sol.name.split(' ')[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ResultsGraph({ onFeedback, onAllPlaced }) {
  return (
    <GraphLabelBoard subject="chem" bullets={BULLETS} arrows={ARROWS} onFeedback={onFeedback} onComplete={onAllPlaced}>
      <PhBarChart />
    </GraphLabelBoard>
  );
}
