import { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';
import { ASSETS } from '../config/assets';

function Chip({ id, label, colour, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        opacity: disabled ? 0 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        zIndex: isDragging ? 50 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 10,
        background: '#fff',
        border: '2px solid var(--color-border)',
        cursor: disabled ? 'default' : 'grab',
      }}
    >
      {colour && (
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            background: colour === 'transparent' ? '#eee' : colour,
            border: '1px solid rgba(0,0,0,0.15)',
          }}
        />
      )}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{label}</span>
    </div>
  );
}

function Cell({ row, filled, shake, active }) {
  const { t } = useTranslation();
  // Every row is a real droppable regardless of `active` — dnd-kit's
  // `disabled` option caused collisions to stop registering entirely in
  // this version, so instead we just rely on handleDragEnd's own
  // over.id === chip.row check: inactive rows have no matching chip, so
  // dropping on one is a no-op miss, same as any other wrong target. Only
  // the visual treatment (dimmed, "—" placeholder) differs.
  const { setNodeRef, isOver } = useDroppable({ id: row });
  return (
    <motion.div
      ref={setNodeRef}
      animate={{ x: shake ? [0, -6, 6, -4, 4, 0] : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: 50,
        border: active ? `2px dashed ${isOver ? 'var(--color-chem)' : 'var(--color-border)'}` : 'none',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: filled ? (filled.colour === 'transparent' ? '#f5f5f5' : filled.colour || 'var(--color-mint)') : active ? '#fafafa' : '#f4f4f2',
      }}
    >
      {!active ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#ccc' }}>—</span>
      ) : filled ? (
        <>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
            {filled.label}
          </span>
          <span style={{ color: '#fff' }}>✓</span>
        </>
      ) : (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#bbb' }}>{t('game.drop_here')}</span>
      )}
    </motion.div>
  );
}

// pH 0-14 colours of Universal Indicator (the stops of the chart's gradient bar)
const UI_STOPS = [
  [0, '#C62828'], [2, '#E53935'], [3, '#F4511E'], [4, '#FB8C00'], [5, '#FDB52B'], [6, '#FDD835'],
  [7, '#43A047'], [8, '#00897B'], [9, '#1E88E5'], [10, '#3949AB'], [11, '#5E35B1'], [13, '#6A1B9A'], [14, '#4A148C'],
];
const colourAt = (ph) => {
  for (let i = UI_STOPS.length - 1; i >= 0; i -= 1) if (ph >= UI_STOPS[i][0]) return UI_STOPS[i][1];
  return UI_STOPS[0][1];
};

// A drawn Universal Indicator colour chart: test tubes for pH 1, 3, 5, 7, 9, 11 and 13 over a
// continuous 0-14 colour bar, with the strong / weak acid and alkali bands underneath.
// If an image is set as ASSETS.ui.universalIndicatorChart it is used instead.
function UniversalChart() {
  const { t } = useTranslation();
  const X0 = 14;
  const W = 332;
  const x = (ph) => X0 + (ph / 14) * W;
  const bands = [
    [0, 2.5, t('game.chart_strong_acid')],
    [2.5, 6.5, t('game.chart_weak_acid')],
    [6.5, 7.5, t('science.neutral')],
    [7.5, 11, t('game.chart_weak_alkali')],
    [11, 14, t('game.chart_strong_alkali')],
  ];
  return (
    <svg viewBox="0 0 360 188" width="100%" role="img" aria-label={t('game.chart_ui')} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ui-bar" x1="0" x2="1" y1="0" y2="0">
          {UI_STOPS.map(([ph, c]) => (
            <stop key={ph} offset={`${(ph / 14) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>

      {/* test tubes */}
      {[1, 3, 5, 7, 9, 11, 13].map((ph) => (
        <g key={ph} transform={`translate(${x(ph) - 9}, 6)`}>
          <rect x="0" y="0" width="18" height="62" rx="9" fill="#fff" stroke="#CFC8B8" strokeWidth="1.5" />
          <path d="M1.5 24 H16.5 V53 A7.5 7.5 0 0 1 9 62 H9 A7.5 7.5 0 0 1 1.5 53 Z" fill={colourAt(ph)} />
          <rect x="1" y="22" width="16" height="4" rx="2" fill="#fff" opacity="0.35" />
          <rect x="4" y="8" width="3" height="40" rx="1.5" fill="#fff" opacity="0.55" />
        </g>
      ))}

      {/* colour bar */}
      <rect x={X0} y="82" width={W} height="26" rx="7" fill="url(#ui-bar)" />
      <rect x={X0} y="82" width={W} height="26" rx="7" fill="none" stroke="rgba(0,0,0,0.12)" />

      {/* pH ticks */}
      {Array.from({ length: 15 }, (_, ph) => (
        <g key={ph}>
          <line x1={x(ph)} x2={x(ph)} y1="108" y2="114" stroke="#8A8478" strokeWidth="1.2" />
          <text x={x(ph)} y="126" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fontWeight={ph === 7 ? 700 : 500} fill="#4A453C">
            {ph}
          </text>
        </g>
      ))}
      <text x={X0 + W / 2} y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="1" fill="#8A8478">
        pH
      </text>

      {/* bands */}
      {bands.map(([a, b, label]) => (
        <g key={label}>
          <path d={`M${x(a) + 2} 150 v4 H${x(b) - 2} v-4`} fill="none" stroke="#B9B2A2" strokeWidth="1.2" />
          <text x={(x(a) + x(b)) / 2} y="168" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="600" fill="#4A453C">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// The always-visible colour-reference card that sits alongside the results
// table during every recording step — reference only, the student still
// has to pick the colour themselves.
function ReferenceChart({ kind }) {
  const { t } = useTranslation();
  if (kind === 'litmus') {
    return (
      <ChartCard title={t('game.chart_litmus')}>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          <Swatch colour="#E53935" label={t('science.acid')} />
          <Swatch colour="#1565C0" label={t('science.alkali')} />
          <Swatch colour="#7B1FA2" label={t('science.neutral')} />
        </div>
        <Note>{t('game.note_litmus')}</Note>
      </ChartCard>
    );
  }
  if (kind === 'phenolphthalein') {
    return (
      <ChartCard title={t('game.chart_phph')}>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          <Swatch colour="#F5F5F0" border label={t('game.sw_acid_neutral')} />
          <Swatch colour="#FCE4EC" label={t('game.sw_alkali_weak')} />
          <Swatch colour="#E91E63" label={t('game.sw_alkali_strong')} />
        </div>
        <Note>{t('game.note_phph')}</Note>
      </ChartCard>
    );
  }
  return (
    <ChartCard title={t('game.chart_ui')}>
      {ASSETS.ui.universalIndicatorChart ? (
        <img src={ASSETS.ui.universalIndicatorChart} alt={t('game.chart_ui')} draggable={false} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
      ) : (
        <UniversalChart />
      )}
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#FBF6EA', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, boxShadow: '0 3px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--color-dark)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Swatch({ colour, label, border }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: colour, border: border ? '1px solid var(--color-border)' : 'none' }} />
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-mid)', textAlign: 'center', width: 70 }}>{label}</div>
    </div>
  );
}

function Note({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#555555', fontStyle: 'italic', marginTop: 12 }}>{children}</div>
  );
}

// Section 2.5 / 6 — the results notecard slides up from the bottom of the
// bench like a clipboard being set down, the just-measured reading
// auto-fills with a count-up (it was already established by the zoom-read
// step — this is a confirmation beat, not a second memory test), and the
// student taps Confirm. No drag-matching here; that's for the P1-style
// steps where matching IS the skill being tested.
function AutoConfirmRecord({ step, onComplete }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { table, activeRow, value, unit = 'N', timeLimit = 0 } = parameters;

  const [shown, setShown] = useState(0);
  const [countDone, setCountDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [slideDown, setSlideDown] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const start = Date.now();
    const DURATION = 600;
    let raf;
    function tick() {
      const t = Math.min(1, (Date.now() - start) / DURATION);
      setShown(value * t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCountDone(true);
    }
    const t0 = setTimeout(() => (raf = requestAnimationFrame(tick)), 400); // let the slide-up settle first
    return () => {
      clearTimeout(t0);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      setSlideDown(true);
      const elapsed = (Date.now() - startRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      setTimeout(() => onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: 100 }), 400);
    }, 500);
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: slideDown ? '100%' : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: 320,
          background: '#FBF6EA',
          border: '1px solid var(--color-border)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: '0 -6px 20px rgba(0,0,0,0.12)',
          padding: '22px 24px 26px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--color-dark)', marginBottom: 14, textAlign: 'center' }}>
          Results
        </div>
        {table.rows.map((row) => {
          const active = row === activeRow;
          return (
            <div
              key={row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: 8,
                background: active ? 'rgba(91,111,224,0.08)' : 'transparent',
                marginBottom: 4,
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: active ? 'var(--color-dark)' : '#aaa', fontWeight: active ? 600 : 400 }}>{tv(row)}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: active ? 16 : 13, color: active ? 'var(--color-phys)' : '#ccc' }}>
                {active ? `${shown.toFixed(1)} ${unit}` : ''}
              </span>
            </div>
          );
        })}

        <motion.button
          onClick={handleConfirm}
          disabled={!countDone || confirmed}
          whileTap={{ scale: 0.96 }}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '12px 0',
            borderRadius: 999,
            border: 'none',
            background: countDone ? 'var(--color-mint)' : 'var(--color-border)',
            color: countDone ? '#fff' : '#999',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 15,
            cursor: countDone && !confirmed ? 'pointer' : 'default',
          }}
        >
          {confirmed ? t('game.confirmed_check') : t('ui.confirm_button')}
        </motion.button>
      </motion.div>
    </div>
  );
}

// colour_picker mode (now a typed table). The results table is a real bordered table:
// the student TYPES the colour they saw into each row's cell. Typing the right colour
// accepts the cell on the spot (no Enter needed); a wrong word is checked on Enter or
// when leaving the cell, shakes, and gets a gentle hint (soft failure, never a hard
// reset). This is the mechanic for P1's three results tables, where matching the
// colour you actually saw IS the skill being tested.

// "Red (pH 2)" -> "red"; "红色（pH 2）" -> "红色"
const colourWord = (label) => String(label ?? '').split(/[(（]/)[0];
const normalise = (text) => String(text ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
// English words that are also fine for each answer colour (alongside the localised label)
const ALSO_ACCEPT = {
  '#C62828': ['red'],
  '#E53935': ['red'],
  '#EF6C00': ['orange'],
  '#2E7D32': ['green'],
  '#00695C': ['bluegreen', 'turquoise', 'teal', 'greenblue', 'bluishgreen'],
  '#4A148C': ['purple', 'violet'],
  '#1565C0': ['blue'],
  '#7B1FA2': ['purple', 'violet'],
  '#F9A825': ['yellow'],
  '#FCE4EC': ['faintpink', 'palepink', 'lightpink', 'pink'],
  '#E91E63': ['brightpink', 'deeppink', 'pink'],
  transparent: ['colourless', 'colorless', 'clear', 'transparent', 'nocolour', 'nocolor'],
};

function acceptedAnswers(answer) {
  const list = [normalise(colourWord(answer.label)), normalise(answer.label)];
  (ALSO_ACCEPT[answer.colour] ?? []).forEach((w) => list.push(w));
  return list.filter(Boolean);
}

function ColourPickerRecord({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { table, answers, referenceChart, timeLimit = 0, allowMemoryMode = false } = parameters;
  const { actions } = useGameState();

  const [filled, setFilled] = useState({});
  const [typed, setTyped] = useState({});
  const [shakeRow, setShakeRow] = useState(null);
  const [stamped, setStamped] = useState(false);
  const [memoryMode, setMemoryMode] = useState(false);
  const [memoryBonus, setMemoryBonus] = useState(false);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const mistakesRef = useRef(0);
  const filledRef = useRef({});

  function accept(row) {
    const answer = answers[row];
    const next = { ...filledRef.current, [row]: { colour: answer.colour, label: answer.label } };
    filledRef.current = next;
    setFilled(next);
    onFeedback?.(t('game.rec_match'));
    if (memoryMode) {
      actions.addScore(200);
      setMemoryBonus(true);
      setTimeout(() => setMemoryBonus(false), 900);
    }
    if (Object.keys(next).length === table.rows.length && !doneRef.current) {
      doneRef.current = true;
      setStamped(true);
      const elapsed = (Date.now() - startRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      setTimeout(() => onComplete({ accuracy: mistakesRef.current ? Math.max(0, 1 - mistakesRef.current * 0.1) : 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.max(0, 100 - mistakesRef.current * 10) }), 900);
    }
  }

  // typing the right colour accepts it straight away
  function onType(row, value) {
    setTyped((prev) => ({ ...prev, [row]: value }));
    if (filledRef.current[row]) return;
    if (acceptedAnswers(answers[row]).includes(normalise(value))) accept(row);
  }

  // Enter / leaving the cell with something wrong in it
  function checkWrong(row) {
    if (filledRef.current[row]) return;
    const value = typed[row];
    if (!normalise(value)) return;
    mistakesRef.current += 1;
    setShakeRow(row);
    setTimeout(() => setShakeRow(null), 350);
    onFeedback?.(t('game.rec_type_wrong'), 'wrong');
  }

  const started = Object.keys(filled).length > 0;
  const showChart = referenceChart && !memoryMode;
  const grid = '#CFC8B8';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 24, boxSizing: 'border-box', gap: 24, position: 'relative' }}>
      <BonusBanner active={memoryBonus} text={t('game.memory_bonus_banner')} points={200} color="#4FBFA8" />
      <div style={{ flex: showChart ? '0 0 55%' : '1 1 auto', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <motion.div
          animate={stamped ? { rotate: [-3, 1, 0], scale: [0.96, 1.03, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{ border: `2px solid ${grid}`, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 3px 10px rgba(0,0,0,0.06)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `minmax(120px, 0.8fr) repeat(${table.columns.length}, minmax(160px, 1.4fr))` }}>
            <div style={{ background: '#F4EFE3', borderBottom: `2px solid ${grid}` }} />
            {table.columns.map((col) => (
              <div key={col} style={{ background: '#F4EFE3', borderBottom: `2px solid ${grid}`, borderLeft: `2px solid ${grid}`, padding: '12px 10px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textAlign: 'center', color: 'var(--color-dark)' }}>
                {col}
              </div>
            ))}
            {table.rows.map((row, i) => {
              const cell = filled[row];
              const last = i === table.rows.length - 1;
              const line = last ? 'none' : `2px solid ${grid}`;
              return (
                <Fragment key={row}>
                  <div style={{ padding: '0 14px', minHeight: 56, display: 'flex', alignItems: 'center', borderBottom: line, background: '#FBF8F0', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--color-dark)' }}>
                    {tv(row)}
                  </div>
                  <motion.div
                    animate={{ x: shakeRow === row ? [0, -6, 6, -4, 4, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ borderLeft: `2px solid ${grid}`, borderBottom: line, display: 'flex', alignItems: 'stretch', background: cell ? (cell.colour === 'transparent' ? '#F5F5F5' : cell.colour) : '#fff' }}
                  >
                    {cell ? (
                      <div style={{ flex: 1, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: cell.colour === 'transparent' || cell.colour === '#FCE4EC' ? '#444' : '#fff', textShadow: cell.colour === 'transparent' || cell.colour === '#FCE4EC' ? 'none' : '0 1px 2px rgba(0,0,0,0.35)' }}>
                        <span>{cell.label}</span>
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          ✓
                        </motion.span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={typed[row] ?? ''}
                        placeholder={t('game.type_colour')}
                        aria-label={`${tv(row)}: ${t('game.type_colour')}`}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => onType(row, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkWrong(row)}
                        onBlur={() => checkWrong(row)}
                        style={{ flex: 1, minWidth: 0, minHeight: 56, border: 'none', outline: 'none', background: 'transparent', padding: '0 14px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-dark)' }}
                      />
                    )}
                  </motion.div>
                </Fragment>
              );
            })}
          </div>
        </motion.div>

        {allowMemoryMode && !started && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setMemoryMode(true);
              onFeedback?.(t('game.memory_try'));
            }}
            disabled={memoryMode}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 18px',
              borderRadius: 999,
              border: `2px solid ${memoryMode ? 'var(--color-mint)' : 'var(--color-border)'}`,
              background: memoryMode ? 'rgba(79,191,168,0.12)' : '#fff',
              color: memoryMode ? 'var(--color-mint)' : 'var(--color-dark)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
              cursor: memoryMode ? 'default' : 'pointer',
            }}
          >
            {memoryMode ? t('game.memory_active') : t('game.memory_cta')}
          </motion.button>
        )}
      </div>

      {showChart && (
        <div style={{ flex: '0 0 45%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
          <ReferenceChart kind={referenceChart} />
        </div>
      )}
    </div>
  );
}

// drag_to_table mode. Two shapes of step show up here:
//  - y7p1 style: every row is fillable in one pass (answers has one entry
//    per row, all rows active).
//  - y7p2 style: `activeRow` names the single row this step is
//    responsible for (the table is being built up one row per step across
//    several separate steps) — every other row renders as inert context.
function DragToTableRecord({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { table, answers, activeRow, timeLimit = 0, referenceChart } = parameters;
  const activeRows = activeRow ? [activeRow] : table.rows;

  const [chips] = useState(() =>
    activeRows
      .map((row) => ({ id: `chip_${row}`, row, ...answers[row] }))
      .sort(() => Math.random() - 0.5),
  );
  const [placed, setPlaced] = useState({});
  const [shakeRow, setShakeRow] = useState(null);
  const mistakesRef = useRef(0);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over) return;
      const chip = chips.find((c) => c.id === active.id);
      if (!chip) return;

      if (over.id === chip.row) {
        setPlaced((prev) => {
          const next = { ...prev, [chip.row]: { colour: chip.colour, label: chip.label } };
          if (Object.keys(next).length === activeRows.length && !doneRef.current) {
            doneRef.current = true;
            const elapsed = (Date.now() - startRef.current) / 1000;
            const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
            setTimeout(() => {
              onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: 100 });
            }, 500);
          }
          return next;
        });
      } else {
        mistakesRef.current += 1;
        setShakeRow(over.id);
        setTimeout(() => setShakeRow(null), 350);
        onFeedback?.(t('game.rec_wrong_place'), 'wrong');
      }
    },
    [chips, activeRows.length, timeLimit, onComplete, onFeedback],
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ width: '100%', height: '100%', display: 'flex', padding: 24, boxSizing: 'border-box', gap: 24 }}>
        <div style={{ flex: referenceChart ? '0 0 55%' : '1 1 auto', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `160px repeat(${table.columns.length}, minmax(140px, 1fr))`,
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div />
            {table.columns.map((col) => (
              <div key={col} style={{ fontFamily: 'var(--font-heading)', fontSize: 12, textAlign: 'center', color: 'var(--color-mid)' }}>
                {col}
              </div>
            ))}
            {table.rows.map((row) => {
              const isActive = activeRows.includes(row);
              return (
                <Fragment key={row}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: isActive ? 'var(--color-dark)' : '#bbb' }}>{tv(row)}</div>
                  <Cell row={row} filled={placed[row]} shake={shakeRow === row} active={isActive} />
                </Fragment>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 'auto' }}>
            {chips.map((chip) => (
              <Chip key={chip.id} id={chip.id} label={chip.label} colour={chip.colour} disabled={!!placed[chip.row]} />
            ))}
          </div>
        </div>

        {referenceChart && (
          <div style={{ flex: '0 0 45%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
            <ReferenceChart kind={referenceChart} />
          </div>
        )}
      </div>
    </DndContext>
  );
}

export default function RecordGame(props) {
  const mode = props.step?.parameters?.mode;
  if (mode === 'auto_confirm') return <AutoConfirmRecord {...props} />;
  if (mode === 'colour_picker') return <ColourPickerRecord {...props} />;
  return <DragToTableRecord {...props} />;
}
