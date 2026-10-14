import GraphLabelBoard from './GraphLabelBoard';
import { BatterySVG, BulbSVG, SwitchSVG, AmmeterSVG, VoltmeterSVG } from './CircuitEquipment';

const BULLETS = [
  'Circuit 1: battery, bulb, switch — bulb lit when switch closed',
  'Circuit 2: added an ammeter — read 0.3A',
  'Circuit 3: added a voltmeter — read 1.5V across the bulb',
  'Current was identical at every point in the series circuit',
  'Voltage was shared across the components',
];

const ARROWS = [
  {
    id: 'title',
    top: 4,
    left: 4,
    correct: 'title',
    options: ['title', 'x-axis', 'y-axis', 'key'],
    explanation: "Right — that's the title, naming what this summary shows.",
    hint: 'What names this whole diagram?',
  },
  {
    id: 'circuit1',
    top: 30,
    left: 2,
    correct: 'Complete circuit (bulb lit)',
    options: ['Complete circuit (bulb lit)', 'Open circuit', 'Short circuit', 'Parallel circuit'],
    explanation: 'Right — a closed loop with no gaps lets current flow and light the bulb.',
    hint: 'Is there a gap anywhere in this loop?',
  },
  {
    id: 'ammeter',
    top: 55,
    left: 92,
    correct: 'Current (0.3A)',
    options: ['Current (0.3A)', 'Voltage (1.5V)', 'Resistance (5Ω)', 'Power (W)'],
    explanation: 'Correct — the ammeter measures current, in amps.',
    hint: 'Which meter is connected in series with the loop?',
  },
  {
    id: 'voltmeter',
    top: 78,
    left: 92,
    correct: 'Voltage (1.5V)',
    options: ['Current (0.3A)', 'Voltage (1.5V)', 'Resistance (5Ω)', 'Power (W)'],
    explanation: 'Right — the voltmeter measures potential difference, in volts.',
    hint: 'Which meter is connected across the bulb, not in the main loop?',
  },
  {
    id: 'pattern',
    top: 4,
    left: 88,
    correct: 'Current is the same everywhere in a series circuit',
    options: [
      'Current is the same everywhere in a series circuit',
      'Current changes at every component',
      'Voltage is the same everywhere',
      'An anomalous result',
    ],
    explanation: 'Yes — 0.3A flows through the battery, the bulb, and the ammeter alike.',
    hint: 'Compare the ammeter reading in circuits 2 and 3…',
  },
  {
    id: 'battery',
    top: 30,
    left: 45,
    correct: 'Battery (energy source)',
    options: ['Battery (energy source)', 'Switch (breaks the circuit)', 'Bulb (uses energy)', 'Ammeter (measures current)'],
    explanation: 'Right — the battery is what pushes the current around the circuit.',
    hint: 'What supplies the energy to the whole circuit?',
  },
];

function CircuitRow({ number, showAmmeter, showVoltmeter }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, width: 56 }}>Circuit {number}</span>
      <BatterySVG width={30} />
      <SwitchSVG closed width={26} />
      <BulbSVG lit width={20} />
      {showAmmeter && <AmmeterSVG reading={0.3} width={26} />}
      {showVoltmeter && <VoltmeterSVG reading={1.5} width={26} />}
    </div>
  );
}

function CircuitSummary() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <CircuitRow number={1} showAmmeter={false} showVoltmeter={false} />
      <CircuitRow number={2} showAmmeter showVoltmeter={false} />
      <CircuitRow number={3} showAmmeter showVoltmeter />
    </div>
  );
}

export default function CircuitResults({ onFeedback, onAllPlaced }) {
  return (
    <GraphLabelBoard subject="phys" bullets={BULLETS} arrows={ARROWS} onFeedback={onFeedback} onComplete={onAllPlaced}>
      <CircuitSummary />
    </GraphLabelBoard>
  );
}
