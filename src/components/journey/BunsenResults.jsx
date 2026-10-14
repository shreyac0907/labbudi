import GraphLabelBoard from './GraphLabelBoard';
import { EvaporatingDishSVG } from './BunsenEquipment';

const BULLETS = [
  'Before heating: crystals were BLUE',
  'Heated with a roaring blue Bunsen flame',
  'After heating: crystals turned WHITE',
  'Steam was produced during heating',
  'Adding water turned the white crystals BLUE again',
];

const ARROWS = [
  {
    id: 'title',
    top: 4,
    left: 4,
    correct: 'title',
    options: ['title', 'x-axis', 'y-axis', 'key'],
    explanation: "Right — that's the title, telling us what the whole diagram shows.",
    hint: 'What sits at the very top, naming the chart?',
  },
  {
    id: 'before',
    top: 40,
    left: 2,
    correct: 'Starting material (before)',
    options: ['Starting material (before)', 'Final result (after)', 'Line of best fit', 'An anomaly'],
    explanation: 'Exactly — that column shows the crystals before any heating.',
    hint: 'Which side comes first in the process?',
  },
  {
    id: 'after',
    top: 40,
    left: 90,
    correct: 'Final result (after)',
    options: ['Starting material (before)', 'Final result (after)', 'Line of best fit', 'An anomaly'],
    explanation: 'Right — that column shows the crystals once heating finished.',
    hint: 'Which side comes at the end of the process?',
  },
  {
    id: 'label',
    top: 42,
    left: 46,
    correct: 'Effect of heating',
    options: ['Effect of heating', 'Effect of cooling', 'The x-axis', 'The scale'],
    explanation: 'Correct — the arrow labels exactly what caused the change.',
    hint: 'What process turned "before" into "after"?',
  },
  {
    id: 'pattern',
    top: 70,
    left: 45,
    correct: 'The change is reversible (physical change)',
    options: [
      'The change is reversible (physical change)',
      'The change is irreversible (chemical change)',
      'No change occurred',
      'An anomalous result',
    ],
    explanation: 'Yes — adding water brought the blue colour straight back.',
    hint: 'Think about what happened when water was added back…',
  },
  {
    id: 'key',
    top: 10,
    left: 90,
    correct: 'Blue = hydrated crystals',
    options: ['Blue = hydrated crystals', 'Blue = hot', 'White = cold', 'White = hydrated crystals'],
    explanation: 'Right — blue means water molecules are still bonded in the crystal.',
    hint: 'What does that colour actually tell you about the crystal?',
  },
];

function BeforeAfterChart() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <EvaporatingDishSVG crystalColor="#1565C0" width={80} />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginTop: 6 }}>Before</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-mid)' }}>Blue crystals</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <svg width="50" height="20" viewBox="0 0 50 20">
          <line x1="2" y1="10" x2="42" y2="10" stroke="#C0503D" strokeWidth="2.5" />
          <path d="M34,4 L44,10 L34,16" fill="none" stroke="#C0503D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <EvaporatingDishSVG crystalColor="#E8E8E8" width={80} />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginTop: 6 }}>After</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-mid)' }}>White crystals</div>
      </div>
    </div>
  );
}

export default function BunsenResults({ onFeedback, onAllPlaced }) {
  return (
    <GraphLabelBoard subject="chem" bullets={BULLETS} arrows={ARROWS} onFeedback={onFeedback} onComplete={onAllPlaced}>
      <BeforeAfterChart />
    </GraphLabelBoard>
  );
}
