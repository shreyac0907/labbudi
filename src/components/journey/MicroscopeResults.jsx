import GraphLabelBoard from './GraphLabelBoard';
import { CellViewSVG } from './MicroscopeEquipment';

const BULLETS = [
  'Onion cells appeared rectangular, in a regular grid pattern',
  'Cell wall clearly visible around each cell',
  'A large central vacuole fills most of each cell',
  'A dark oval nucleus was stained by the iodine',
  'No chloroplasts seen — onion cells do not photosynthesise',
];

const STRUCTURE_OPTIONS = ['Cell wall', 'Cell membrane', 'Nucleus', 'Vacuole'];

const ARROWS = [
  {
    id: 'title',
    top: 4,
    left: 4,
    correct: 'title',
    options: ['title', 'x-axis', 'y-axis', 'key'],
    explanation: "Right — that's the title, naming what the diagram shows.",
    hint: 'What names this whole diagram?',
  },
  {
    id: 'wall',
    top: 40,
    left: 4,
    correct: 'Cell wall',
    options: STRUCTURE_OPTIONS,
    explanation: 'Exactly — the rigid outer layer is the cell wall.',
    hint: 'This is the outermost, rigid layer…',
  },
  {
    id: 'membrane',
    top: 55,
    left: 92,
    correct: 'Cell membrane',
    options: STRUCTURE_OPTIONS,
    explanation: 'Right — just inside the wall sits the cell membrane.',
    hint: 'This layer sits just inside the wall…',
  },
  {
    id: 'nucleus',
    top: 20,
    left: 46,
    correct: 'Nucleus',
    options: STRUCTURE_OPTIONS,
    explanation: 'Correct — the dark stained oval is the nucleus.',
    hint: 'This is the dark, stained spot…',
  },
  {
    id: 'vacuole',
    top: 75,
    left: 46,
    correct: 'Vacuole',
    options: STRUCTURE_OPTIONS,
    explanation: 'Yes — that large pale space is the vacuole.',
    hint: 'This takes up most of the cell…',
  },
  {
    id: 'pattern',
    top: 4,
    left: 90,
    correct: 'Cells repeat in a regular, brick-like pattern',
    options: [
      'Cells repeat in a regular, brick-like pattern',
      'Cells are randomly scattered',
      'No pattern is visible',
      'An anomalous result',
    ],
    explanation: 'Right — the cell wall gives every cell the same fixed, regular shape.',
    hint: 'Look at how the cells are arranged next to each other…',
  },
];

function LabelledCellDiagram() {
  return (
    <div style={{ background: '#111', borderRadius: '50%', width: 300, height: 190, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <CellViewSVG width={260} />
    </div>
  );
}

export default function MicroscopeResults({ onFeedback, onAllPlaced }) {
  return (
    <GraphLabelBoard subject="bio" bullets={BULLETS} arrows={ARROWS} onFeedback={onFeedback} onComplete={onAllPlaced}>
      <LabelledCellDiagram />
    </GraphLabelBoard>
  );
}
