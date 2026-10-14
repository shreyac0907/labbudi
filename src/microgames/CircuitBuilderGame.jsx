import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Battery from '../components/equipment/Battery';
import Bulb from '../components/equipment/Bulb';
import SwitchComponent from '../components/equipment/SwitchComponent';
import MeterBlock from '../components/equipment/MeterBlock';
import Motor from '../components/equipment/Motor';
import PipHand from '../components/PipHand';
import ZoneTimingBar from '../components/ZoneTimingBar';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { earnBadge } from '../engine/Badges';
import { useTranslation } from 'react-i18next';

const CHALLENGE_MS = 60000;

// What each part measures at size 1 (px), the way it sits in the circuit.
const NATIVE = { battery: { w: 26, h: 66 }, bulb: { w: 36, h: 56 }, switch: { w: 48, h: 36 }, ammeter: { w: 69, h: 55 }, voltmeter: { w: 69, h: 55 }, motor: { w: 40, h: 50 } };
// the battery stands upright, so its connectors are at the top (+) and the bottom (-); every other part has them left and right
const UPRIGHT = (kind) => kind === 'battery';
const METER = 0.72; // the meters are wide, so they are drawn a little smaller than the rest (96 x 76 at size 1)
const BULGE = 28; // a connector's diameter
const GAP = 6; // between a part and its connector

function Part({ kind, size, closed, lit, reading, maxReading }) {
  const n = NATIVE[kind];
  const box = { width: n.w * size, height: n.h * size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  switch (kind) {
    case 'battery':
      return <div style={box}><Battery size={size} /></div>;
    case 'bulb':
      return <div style={box}><Bulb size={size} lit={lit} /></div>;
    case 'switch':
      return <div style={box}><SwitchComponent size={size} closed={closed} /></div>;
    case 'ammeter':
      return <div style={box}><MeterBlock size={size * METER} unit="A" reading={reading} maxReading={maxReading} /></div>;
    case 'voltmeter':
      return <div style={box}><MeterBlock size={size * METER} unit="V" reading={reading} maxReading={maxReading} /></div>;
    case 'motor':
      return <div style={box}><Motor size={size} spinning={lit} /></div>;
    default:
      return null;
  }
}

const INK = '#2D3339';

// Electrons: little blue circles with e- inside, drifting round the loop (SVG animation along a path)
function Electrons({ path, length, r, fs, count, speed }) {
  const dur = Math.max(5, length / speed);
  return Array.from({ length: count }, (_, i) => (
    <g key={i}>
      <circle r={r} fill="#2F6FDE" stroke="#fff" strokeWidth={r * 0.14} />
      <text y={fs * 0.34} textAnchor="middle" fontSize={fs} fontWeight={800} fill="#fff" fontFamily="var(--font-heading)">
        e<tspan dy={-fs * 0.28} fontSize={fs * 0.7}>−</tspan>
      </text>
      <animateMotion dur={`${dur}s`} begin={`${-(dur * i) / count}s`} repeatCount="indefinite" path={path} rotate="0" />
    </g>
  ));
}
const polyPath = (pts) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
const polyLength = (pts) => pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// The standard circuit symbols, each drawn with its two terminals 8 units either side of its centre (vertically for
// orient 'v'). The battery's longer plate is its + end.
function SchematicSymbol({ sym, live, switchClosed }) {
  const { type, x, y, orient = 'h' } = sym;
  const rot = type === 'battery' ? (orient === 'v' ? -90 : 0) : orient === 'v' ? 90 : 0;
  const line = { stroke: INK, strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' };
  const letter = (ch) => (
    <text transform={`rotate(${-rot})`} y={2.3} fontSize={6.4} fontWeight={800} textAnchor="middle" fill={INK} fontFamily="var(--font-heading)">
      {ch}
    </text>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {type === 'battery' && (
        <>
          <line x1={-8} y1={0} x2={-1.6} y2={0} {...line} />
          <line x1={-1.6} y1={-3.6} x2={-1.6} y2={3.6} {...line} strokeWidth={2.6} />
          <line x1={2} y1={-6.4} x2={2} y2={6.4} {...line} strokeWidth={1} />
          <line x1={2} y1={0} x2={8} y2={0} {...line} />
        </>
      )}
      {type === 'bulb' && (
        <>
          <line x1={-8} y1={0} x2={-5.6} y2={0} {...line} />
          <line x1={5.6} y1={0} x2={8} y2={0} {...line} />
          {live && <circle r={9} fill="#FFE066" opacity={0.45} />}
          <circle r={5.6} fill={live ? '#FFE066' : '#fff'} {...line} />
          <path d="M-3.9,-3.9 L3.9,3.9 M3.9,-3.9 L-3.9,3.9" {...line} strokeWidth={1} />
        </>
      )}
      {type === 'switch' && (
        <>
          <circle cx={-8} cy={0} r={1.3} fill={INK} />
          <circle cx={8} cy={0} r={1.3} fill={INK} />
          <motion.line x1={-8} y1={0} x2={8} y2={0} {...line} strokeWidth={1.4} animate={{ rotate: switchClosed ? 0 : -24 }} transition={{ duration: 0.8 }} style={{ transformOrigin: '-8px 0px' }} />
        </>
      )}
      {(type === 'ammeter' || type === 'voltmeter' || type === 'motor') && (
        <>
          <line x1={-8} y1={0} x2={-5.6} y2={0} {...line} />
          <line x1={5.6} y1={0} x2={8} y2={0} {...line} />
          <circle r={5.6} fill="#fff" {...line} />
          {letter(type === 'ammeter' ? 'A' : type === 'voltmeter' ? 'V' : 'M')}
        </>
      )}
    </g>
  );
}

// Circular 60s countdown ring — sits in the exact spot ScoreCounter
// normally occupies (MicrogameRenderer hides ScoreCounter for the
// duration via step.parameters.challengeMode), per Prompt 3's "replacing
// the score counter temporarily."
function ChallengeCountdown({ msLeft }) {
  const R = 22;
  const CIRC = 2 * Math.PI * R;
  const frac = Math.max(0, Math.min(1, msLeft / CHALLENGE_MS));
  const seconds = Math.ceil(msLeft / 1000);
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 220, pointerEvents: 'none' }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={R} fill="#2D2D2D" />
        <circle cx="26" cy="26" r={R} fill="none" stroke="#3A3A3A" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          stroke={seconds <= 10 ? '#FF5555' : '#FFD700'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - frac)}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="30" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="700" fontSize="14" fill="#fff">
          {seconds}
        </text>
      </svg>
    </div>
  );
}

// Connector — a chrome circle with a darker centre dot: press it and drag a wire to the next one.
// `state`: idle | valid | selected | wired | target.
function Bulge({ state, onPointerDown }) {
  const fill = state === 'wired' ? '#2E7D32' : state === 'selected' ? '#FFD166' : state === 'target' ? '#9BE7A8' : '#C0C0C0';
  return (
    <motion.div
      onPointerDown={onPointerDown}
      animate={state === 'valid' || state === 'target' ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.7, repeat: state === 'valid' || state === 'target' ? Infinity : 0 }}
      style={{
        width: BULGE,
        height: BULGE,
        borderRadius: '50%',
        background: fill,
        border: `3px solid ${state === 'valid' || state === 'target' ? '#E8A020' : '#666'}`,
        cursor: state === 'wired' ? 'default' : 'grab',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        flex: 'none',
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#555' }} />
    </motion.div>
  );
}

// Split-screen circuit workspace: LEFT is the real illustrated components
// (tray → build area, tap connector bulges to wire), RIGHT is a read-only
// schematic that lights up segment-by-segment as the matching real wire is
// made. One config drives all 3 circuits in this practical — place, wire,
// (close the switch if there is one), watch it go live, read any meters.
export default function CircuitBuilderGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { components, wires, schematic, meterRead, timeLimit = 40, challengeMode = false, hints = [], bonusPoints = 500 } = parameters;
  const { actions } = useGameState();
  const { practicalId } = useParams();

  const [placed, setPlaced] = useState({});
  const [madeWires, setMadeWires] = useState([]); // indices into `wires`
  const [drag, setDrag] = useState(null); // a part being carried: { id, x, y } in workspace pixels
  const [wireDrag, setWireDrag] = useState(null); // a wire being pulled from a connector: { from, x, y }
  const [ws, setWs] = useState({ w: 700, h: 560 });
  const [switchClosed, setSwitchClosed] = useState(false);
  const [switchZoomed, setSwitchZoomed] = useState(false);
  const [showContactBar, setShowContactBar] = useState(false);
  const [contactSpark, setContactSpark] = useState(false);
  const [live, setLive] = useState(false);
  const [cleanBuild, setCleanBuild] = useState(false);
  const [meterZoomed, setMeterZoomed] = useState(false);
  const [meterPicked, setMeterPicked] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [msLeft, setMsLeft] = useState(CHALLENGE_MS);
  const [timedOut, setTimedOut] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [circuitMaster, setCircuitMaster] = useState(false);

  const sceneRef = useRef(null);
  const wsRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const mistakesRef = useRef(0);
  const challengeStartRef = useRef(Date.now());

  const hasSwitch = components.some((c) => c.kind === 'switch');
  const allPlaced = components.every((c) => placed[c.id]);
  const allWired = madeWires.length === wires.length;

  // Bonus challenge's own 60s countdown — resets the build on timeout
  // (soft failure, never blocks progress) rather than forcing completion,
  // since this whole step is optional to begin with.
  useEffect(() => {
    if (!challengeMode || live || timedOut) return undefined;
    let raf;
    function tick() {
      const left = Math.max(0, CHALLENGE_MS - (Date.now() - challengeStartRef.current));
      setMsLeft(left);
      if (left <= 0) {
        setTimedOut(true);
        onFeedback?.(t('game.circuit_timeout'), 'wrong');
        setTimeout(() => {
          setPlaced({});
          setMadeWires([]);
          setDrag(null);
          setWireDrag(null);
          setTimedOut(false);
          challengeStartRef.current = Date.now();
          setMsLeft(CHALLENGE_MS);
        }, 2200);
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [challengeMode, live, timedOut, onFeedback]);

  function useHint() {
    if (!hints.length || live) return;
    const text = hints[Math.min(hintsUsed, hints.length - 1)];
    setHintText(text);
    setHintsUsed((n) => n + 1);
    actions.addScore(-50);
    setTimeout(() => setHintText(null), 4000);
  }

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;

    if (challengeMode) {
      setCircuitMaster(true);
      actions.addScore(bonusPoints);
      earnBadge(practicalId, 'circuit_master');
      onFeedback?.(t('game.circuit_master_msg'));
      // Fixed, neutral score — this bonus round never touches the real
      // checkpoint medal, only the live score + badge.
      setTimeout(() => onComplete({ accuracy: 1, timing: 1, completion: 1, mistakes: 0, score: 100 }), 3200);
      return;
    }

    onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round((1 - mistakesRef.current * 0.05) * 90 + timing * 10) });
  }, [onComplete, timeLimit, challengeMode, bonusPoints, actions, practicalId, onFeedback]);

  // the size of the workspace, so the parts can be as big as it allows
  useLayoutEffect(() => {
    const el = wsRef.current;
    if (!el) return undefined;
    const measure = () => setWs({ w: el.clientWidth || 700, h: el.clientHeight || 560 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const trayH = Math.max(130, Math.round(ws.h * 0.26));
  const bw = ws.w;
  const bh = ws.h - trayH;
  const K = fitScale(components, bw, bh);
  const centreOf = (c) => ({ x: (c.slot.x / 100) * bw, y: (c.slot.y / 100) * bh });
  const termPoint = (key) => {
    const [id, side] = key.split('.');
    const c = components.find((x) => x.id === id);
    if (!c) return null;
    const m = centreOf(c);
    const n = NATIVE[c.kind];
    if (UPRIGHT(c.kind)) {
      const off = (n.h * K) / 2 + GAP + BULGE / 2;
      return { x: m.x, y: m.y + (side === 'R' ? -off : off) }; // R is the + end, at the top
    }
    const off = (n.w * K) / 2 + GAP + BULGE / 2;
    return { x: m.x + (side === 'L' ? -off : off), y: m.y };
  };
  const rel = (e) => {
    const r = wsRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const unmadeFor = (key) => wires.some(([a, b], i) => !madeWires.includes(i) && (a === key || b === key));

  function terminalKey(compId, side) {
    return `${compId}.${side}`;
  }

  // PLACING — carry a part from the tray to its dashed spot
  function startPartDrag(e, c) {
    if (placed[c.id] || live) return;
    e.preventDefault();
    setDrag({ id: c.id, ...rel(e) });
    const move = (ev) => setDrag((d) => d && { ...d, ...rel(ev) });
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setDrag(null);
      dropPart(c, rel(ev));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function dropPart(c, pt) {
    const reach = Math.max(110, NATIVE[c.kind].w * K * 0.8);
    const dist = (o) => Math.hypot(pt.x - centreOf(o).x, pt.y - centreOf(o).y);
    if (dist(c) <= reach) {
      setPlaced((p) => ({ ...p, [c.id]: true }));
      if (components.filter((o) => !placed[o.id]).length === 1) onFeedback?.(t('game.circuit_all_placed'));
      return;
    }
    const other = components.find((o) => o.id !== c.id && !placed[o.id] && dist(o) <= reach);
    onFeedback?.(other ? t('game.circuit_wrong_spot', { label: other.label }) : t('game.circuit_drop_hint'), other ? 'wrong' : undefined);
  }

  // WIRING — pull a wire from one connector and let go on the one it joins
  function startWire(e, key) {
    if (live || !allPlaced || !unmadeFor(key)) return;
    e.preventDefault();
    e.stopPropagation();
    setWireDrag({ from: key, ...rel(e) });
    const move = (ev) => setWireDrag((d) => d && { ...d, ...rel(ev) });
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setWireDrag(null);
      const pt = rel(ev);
      let best = null;
      let bestD = 52;
      components.forEach((c) => {
        ['L', 'R'].forEach((side) => {
          const k = terminalKey(c.id, side);
          if (k === key) return;
          const tp = termPoint(k);
          const d = Math.hypot(pt.x - tp.x, pt.y - tp.y);
          if (d < bestD) {
            best = k;
            bestD = d;
          }
        });
      });
      if (best) connect(key, best);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function connect(from, to) {
    const idx = wires.findIndex(([a, b], i) => !madeWires.includes(i) && ((a === from && b === to) || (a === to && b === from)));
    if (idx >= 0) {
      const next = [...madeWires, idx];
      setMadeWires(next);
      if (next.length === wires.length) {
        onFeedback?.(hasSwitch ? t('game.circuit_wired_switch') : t('game.circuit_wired_live'));
        if (!hasSwitch) triggerLive();
      }
    } else {
      mistakesRef.current += 1;
      setWrongPick(to);
      onFeedback?.(t('game.circuit_no_connect'), 'wrong');
      setTimeout(() => setWrongPick(null), 350);
    }
  }

  const triggerLive = useCallback(() => {
    setLive(true);
    onFeedback?.(t('game.circuit_on'));

    // Clean Circuit surprise bonus — zero wrong terminal taps anywhere in
    // the build. Skipped in challenge mode: that has its own, bigger
    // "CIRCUIT MASTER" reward in finish(), and stacking both would be
    // double-dipping on the same "zero mistakes" fact.
    if (mistakesRef.current === 0 && !challengeMode) {
      setCleanBuild(true);
      actions.addScore(300);
      setTimeout(() => onFeedback?.(t('game.circuit_clean')), 1800);
      setTimeout(() => setCleanBuild(false), 3000);
    }

    if (challengeMode) {
      setTimeout(finish, 3500);
    } else if (meterRead) {
      setTimeout(() => setMeterZoomed(true), 4200);
    } else {
      setTimeout(finish, 4000);
    }
  }, [finish, meterRead, onFeedback, actions, challengeMode]);

  function flipSwitch() {
    if (!switchClosed) {
      setSwitchClosed(true);
      // let the lever finish swinging down before the timing bar starts
      setTimeout(() => setShowContactBar(true), 1400);
    }
  }

  const handleContactResult = useCallback(
    (zone) => {
      setShowContactBar(false);
      setContactSpark(zone === 'red');
      actions.addScore(zone === 'blue' ? 100 : zone === 'yellow' ? 60 : 0);
      if (zone === 'red') onFeedback?.(t('game.firm_contact_warn'), 'wrong');
      setTimeout(() => {
        setSwitchZoomed(false);
        triggerLive();
      }, zone === 'red' ? 1800 : 1500);
    },
    [onFeedback, triggerLive, actions],
  );

  function handleMeterPick(opt) {
    if (Math.abs(opt - meterRead.correctReading) < 0.05) {
      setMeterPicked(opt);
      onFeedback?.(meterRead.successMsg);
      setTimeout(() => setMeterZoomed(false), 2200);
      setTimeout(finish, 3000);
    } else {
      mistakesRef.current += 1;
      setWrongPick(opt);
      onFeedback?.(t('game.read_needle'));
      setTimeout(() => setWrongPick(null), 400);
    }
  }

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
      <BonusBanner active={cleanBuild} text={t('ui.clean_build')} points={300} color="#4FBFA8" />
      <BonusBanner active={circuitMaster} text={t('game.circuit_master_banner')} points={bonusPoints} color="#FFD700" />

      {challengeMode && !live && <ChallengeCountdown msLeft={msLeft} />}

      {challengeMode && !live && hints.length > 0 && (
        <div style={{ position: 'fixed', top: 82, right: 20, zIndex: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <motion.button
            onClick={useHint}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: '#FFD700',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
            }}
          >
            ?
          </motion.button>
          <AnimatePresence>
            {hintText && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  maxWidth: 220,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#fff',
                  border: '2px solid #FFD700',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--color-dark)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {hintText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {timedOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 45,
              textAlign: 'center',
              padding: 24,
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--color-dark)' }}>
              {t('game.circuit_times_up')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT — real components: drag them onto their spots, then drag wires between the connectors */}
      <div ref={wsRef} style={{ width: '72%', height: '100%', position: 'relative', borderRight: '2px solid #DDD8D0', overflow: 'hidden', touchAction: 'none' }}>
        <div style={{ position: 'absolute', top: 8, left: 14, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, color: 'var(--color-dark)', zIndex: 4 }}>{t('game.real_circuit')}</div>
        {wires.some((w) => w[2] === 'parallel') && (
          <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 4, display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.85)', border: '2px solid #DDD8D0', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--color-dark)' }}>
            {[['#E53935', 'game.circuit_main_wire'], ['#43A047', 'game.circuit_parallel_wire']].map(([c, k]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 26, height: 6, borderRadius: 3, background: c, display: 'inline-block' }} />
                {t(k)}
              </div>
            ))}
          </div>
        )}

        {/* the dashed spots the parts go to */}
        {components.map((c) => {
          if (placed[c.id]) return null;
          const m = centreOf(c);
          const n = NATIVE[c.kind];
          const carried = drag?.id === c.id;
          return (
            <motion.div
              key={`slot-${c.id}`}
              animate={{ opacity: carried ? 1 : [0.55, 1, 0.55] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ position: 'absolute', left: m.x, top: m.y, x: '-50%', y: '-50%', width: n.w * K + (UPRIGHT(c.kind) ? 0 : 2 * (GAP + BULGE)) + 16, height: n.h * K + (UPRIGHT(c.kind) ? 2 * (GAP + BULGE) : 0) + 36, border: `3px dashed ${carried ? '#1E9E5A' : '#E8A020'}`, borderRadius: 18, background: carried ? 'rgba(30,158,90,0.12)' : 'rgba(232,160,32,0.08)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none' }}
            >
              <span style={{ marginBottom: 4, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: '#9A6200' }}>{c.label}</span>
            </motion.div>
          );
        })}

        {/* the wires */}
        <svg width={bw} height={bh} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}>
          {madeWires.map((i) => {
            const [a, b] = wires[i];
            const pa = termPoint(a);
            const pb = termPoint(b);
            if (!pa || !pb) return null;
            const d = wirePath(pa, pb);
            return (
              <g key={i}>
                {/* a thin red insulated lead like the ones in the lab: a soft shadow, the red cable, a bright line along it, and a brass plug at each end */}
                <path d={d} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={9} strokeLinecap="round" transform="translate(0 5)" />
                <motion.path d={d} fill="none" stroke={wires[i][2] === 'parallel' ? '#1B5E20' : '#B71C1C'} strokeWidth={7} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
                <motion.path d={d} fill="none" stroke={wires[i][2] === 'parallel' ? '#43A047' : '#E53935'} strokeWidth={4.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
                <motion.path d={d} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} strokeLinecap="round" transform="translate(-1 -1.5)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
                {[pa, pb].map((pt, k) => (
                  <g key={k}>
                    <circle cx={pt.x} cy={pt.y} r={9} fill="#C9A23B" stroke="#7A5C10" strokeWidth={2} />
                    <circle cx={pt.x} cy={pt.y} r={3.5} fill="#7A5C10" />
                  </g>
                ))}
              </g>
            );
          })}
          {wireDrag && termPoint(wireDrag.from) && (
            <path d={wirePath(termPoint(wireDrag.from), { x: wireDrag.x, y: wireDrag.y })} fill="none" stroke="#E8A020" strokeWidth={9} strokeLinecap="round" strokeDasharray="1 14" />
          )}
        </svg>

        {/* the electrons travel over the top of everything, parts included */}
        <svg width={bw} height={bh} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 3 }}>
          {live &&
            flowPaths(components, wires, madeWires, termPoint).map((f, k) => (
              <Electrons key={k} path={f.path} length={f.len} r={13} fs={15} count={Math.max(5, Math.round(f.len / 80))} speed={75} />
            ))}
        </svg>

        {/* the placed parts, each between its two connectors */}
        {components.map((c) => {
          const m = centreOf(c);
          const stateOf = (side) => {
            const key = terminalKey(c.id, side);
            if (wireDrag?.from === key) return 'selected';
            if (wireDrag && wires.some(([a, b], i) => !madeWires.includes(i) && ((a === wireDrag.from && b === key) || (b === wireDrag.from && a === key)))) return 'target';
            if (unmadeFor(key)) return allPlaced && !live ? 'valid' : 'idle';
            return madeWires.some((i) => wires[i].includes(key)) ? 'wired' : 'idle';
          };
          return (
            <div
              key={c.id}
              style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%, -50%)', opacity: placed[c.id] ? 1 : 0, pointerEvents: placed[c.id] ? 'auto' : 'none', transition: 'opacity 0.3s', display: 'flex', flexDirection: UPRIGHT(c.kind) ? 'column-reverse' : 'row', alignItems: 'center', gap: GAP, zIndex: 2, cursor: c.kind === 'switch' && allWired && !live ? 'pointer' : 'default' }}
              onClick={c.kind === 'switch' && allWired && !live ? () => setSwitchZoomed(true) : undefined}
            >
              <Bulge state={stateOf('L')} onPointerDown={(e) => startWire(e, terminalKey(c.id, 'L'))} />
              <div style={{ position: 'relative' }}>
                <Part kind={c.kind} size={K} closed={switchClosed} lit={live} reading={live ? c.reading ?? 0 : 0} maxReading={c.maxReading} />
                {c.kind === 'switch' && allWired && !live && (
                  <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ position: 'absolute', inset: -10, border: '4px solid #E8A020', borderRadius: 16, pointerEvents: 'none' }} />
                )}
                <div style={{ position: 'absolute', ...(UPRIGHT(c.kind) ? { left: '100%', top: '50%', transform: 'translate(10px, -50%)' } : c.labelPos === 'above' ? { left: '50%', bottom: '100%', transform: 'translateX(-50%)', marginBottom: 2 } : { left: '50%', top: '100%', transform: 'translateX(-50%)', marginTop: 4 }), whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--color-dark)', textShadow: '0 0 4px #fff, 0 0 4px #fff' }}>{c.label}</div>
              </div>
              <Bulge state={stateOf('R')} onPointerDown={(e) => startWire(e, terminalKey(c.id, 'R'))} />
            </div>
          );
        })}

        {/* the tray: parts still to place, at a good size to grab */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: trayH, background: 'rgba(255,255,255,0.65)', borderTop: '3px solid #DDD8D0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 16px', zIndex: 3 }}>
          {components.every((c) => placed[c.id]) ? null : (
            components
              .filter((c) => !placed[c.id])
              .map((c) => {
                const tk = Math.min(K * 0.9, (trayH - 40) / Math.max(...components.map((o) => NATIVE[o.kind].h)), (ws.w - 32 - 28 * components.length) / components.reduce((sum, o) => sum + NATIVE[o.kind].w, 0));
                return (
                  <div key={c.id} onPointerDown={(e) => startPartDrag(e, c)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'grab', touchAction: 'none', opacity: drag?.id === c.id ? 0.35 : 1 }}>
                    <Part kind={c.kind} size={tk} />
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--color-dark)' }}>{c.label}</div>
                  </div>
                );
              })
          )}
        </div>

        {/* the part being carried */}
        {drag && (
          <div style={{ position: 'absolute', left: drag.x, top: drag.y, transform: 'translate(-50%, -50%) scale(1.06)', pointerEvents: 'none', zIndex: 30, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.3))' }}>
            <Part kind={components.find((c) => c.id === drag.id).kind} size={K} />
          </div>
        )}
      </div>

      {/* RIGHT — schematic diagram, read-only */}
      <div style={{ width: '28%', height: '100%', position: 'relative', background: 'repeating-linear-gradient(#FAFAF8 0 4px, #F0F0F0 4px 5px), repeating-linear-gradient(90deg, #FAFAF8 0 4px, #F0F0F0 4px 5px)' }}>
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, color: 'var(--color-dark)' }}>
          {t('game.circuit_diagram')}
        </div>
        <svg width="100%" height="100%" viewBox="0 0 110 100" style={{ position: 'absolute', inset: 0 }}>
          {/* the wires: faint until the real wire is made, then drawn in */}
          {schematic.segments.map((seg, i) => (
            <g key={i}>
              <path d={seg} fill="none" stroke="#C9C2B5" strokeWidth={0.9} strokeDasharray="2 2.4" strokeLinecap="round" />
              {madeWires.includes(i) && <motion.path d={seg} fill="none" stroke={wires[i]?.[2] === 'parallel' ? '#2E7D32' : INK} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />}
            </g>
          ))}
          {(schematic.dots ?? []).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.8} fill={INK} />
          ))}
          {schematic.symbols.map((sym, i) => (
            <SchematicSymbol key={i} sym={sym} live={live} switchClosed={switchClosed} />
          ))}
          {live &&
            (schematic.flows ?? [schematic.flow]).filter(Boolean).map((pts, k) => {
              const rev = [...pts].reverse();
              return <Electrons key={k} path={polyPath(rev)} length={polyLength(rev)} r={3} fs={3.6} count={6} speed={16} />;
            })}
        </svg>
      </div>

      {/* switch zoom overlay */}
      <AnimatePresence>
        {switchZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
          >
            <div style={{ background: '#fff', borderRadius: 20, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)' }}>
                {showContactBar ? t('game.tap_firm_contact') : t('game.tap_switch_lever')}
              </div>
              <div style={{ position: 'relative' }} onClick={!switchClosed ? flipSwitch : undefined}>
                <SwitchComponent size={4.8} closed={switchClosed} />
                {contactSpark && (
                  <motion.div
                    initial={{ opacity: 1, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', inset: -10, pointerEvents: 'none', fontSize: 34, textAlign: 'center' }}
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="#FFD700" stroke="#E8A020" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
                  </motion.div>
                )}
              </div>
              {showContactBar && (
                <div style={{ width: 320 }}>
                  <ZoneTimingBar onResult={handleContactResult} speedMs={3200} retryOnMiss={false} />
                </div>
              )}
              {!switchClosed && !showContactBar && (
                <button onClick={() => setSwitchZoomed(false)} style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--color-border)', background: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>
                  ← Back
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* meter zoom-read overlay */}
      <AnimatePresence>
        {meterRead && live && meterZoomed && !meterPicked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', zIndex: 50 }}>
            <div style={{ width: '55%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MeterBlock size={3.6} unit={meterRead.unit} reading={meterRead.correctReading} maxReading={meterRead.maxReading} zoomed />
            </div>
            <div style={{ width: '45%', borderLeft: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '0 24px' }}>
              {meterRead.options.map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => handleMeterPick(opt)}
                  animate={wrongPick === opt ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  style={{ height: 52, borderRadius: 14, border: '2px solid var(--color-phys)', background: '#fff', fontFamily: 'var(--font-heading)', fontSize: 20, cursor: 'pointer' }}
                >
                  {opt}
                  <span style={{ fontSize: 14, marginLeft: 4 }}>{meterRead.unit}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PipHand containerRef={sceneRef} state="pointing" active={!live} />
    </div>
  );
}

// How big the parts can be (a multiple of their size at 1) so that no two touch, up to a good large size. A part's footprint
// includes its two connectors: they go left and right, or top and bottom for the upright battery.
function fitScale(components, bw, bh) {
  const KMAX = 2.8;
  const EXT = 2 * (GAP + BULGE);
  const ext = (c) => (UPRIGHT(c.kind) ? [0, EXT] : [EXT, 0]);
  let k = KMAX;
  components.forEach((a, i) =>
    components.slice(i + 1).forEach((b) => {
      const na = NATIVE[a.kind];
      const nb = NATIVE[b.kind];
      const ea = ext(a);
      const eb = ext(b);
      const dx = (Math.abs(a.slot.x - b.slot.x) / 100) * bw;
      const dy = (Math.abs(a.slot.y - b.slot.y) / 100) * bh;
      const kx = (dx - 24 - (ea[0] + eb[0]) / 2) / ((na.w + nb.w) / 2);
      const ky = (dy - 50 - (ea[1] + eb[1]) / 2) / ((na.h + nb.h) / 2);
      k = Math.min(k, Math.max(kx, ky));
    }),
  );
  // and each part must fit inside the board, with room below for its name
  components.forEach((c) => {
    const n = NATIVE[c.kind];
    const e = ext(c);
    const left = Math.min(c.slot.x, 100 - c.slot.x) / 100;
    k = Math.min(k, (2 * left * bw - e[0] - 16 - (UPRIGHT(c.kind) ? 0 : 0)) / n.w);
    k = Math.min(k, (2 * ((c.slot.y / 100) * bh) - e[1] - 16) / n.h, (2 * (((100 - c.slot.y) / 100) * bh - 30) - e[1]) / n.h);
  });
  return Math.max(1.4, k);
}

// a cable between two connectors. One that has to run past other parts on the same level drops down and goes under them;
// any other hangs a little between its two ends.
function wireSegment(a, b) {
  const dx = Math.abs(b.x - a.x);
  if (Math.abs(b.y - a.y) < 60 && dx > 150) {
    const h = Math.max(60, Math.min(140, dx * 0.2));
    return `C${a.x},${a.y + h} ${b.x},${b.y + h} ${b.x},${b.y}`;
  }
  const sag = Math.min(46, Math.hypot(b.x - a.x, b.y - a.y) * 0.14);
  return `Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + sag} ${b.x},${b.y}`;
}
const wirePath = (a, b) => `M${a.x},${a.y} ${wireSegment(a, b)}`;


// Where the electrons go: from the battery's - end, along the real wires and through the parts, to its + end. Found by walking
// the circuit as it is actually wired, so it does not matter which order the wires were made in. Every route that gets round
// is followed (a parallel circuit has two), and the voltmeter, which hardly lets any current through, is left out.
function flowPaths(components, wires, madeWires, termPoint) {
  const battery = components.find((c) => c.kind === 'battery');
  if (!battery) return [];
  const adj = {};
  const link = (a, b, type) => {
    (adj[a] ??= []).push({ to: b, type });
    (adj[b] ??= []).push({ to: a, type });
  };
  madeWires.forEach((i) => link(wires[i][0], wires[i][1], 'wire'));
  components.forEach((c) => {
    if (c.kind !== 'battery' && c.kind !== 'voltmeter') link(`${c.id}.L`, `${c.id}.R`, 'part');
  });
  const start = `${battery.id}.L`;
  const goal = `${battery.id}.R`;
  const routes = [];
  const walk = (node, seen, steps) => {
    if (node === goal) {
      routes.push(steps);
      return;
    }
    (adj[node] ?? []).forEach((e) => {
      if (!seen.has(e.to)) walk(e.to, new Set(seen).add(e.to), [...steps, { from: node, to: e.to, type: e.type }]);
    });
  };
  walk(start, new Set([start]), []);
  return routes.map((steps) => {
    let len = 0;
    const segs = steps.map((st) => {
      const pa = termPoint(st.from);
      const pb = termPoint(st.to);
      len += 1.15 * Math.hypot(pb.x - pa.x, pb.y - pa.y);
      return st.type === 'wire' ? wireSegment(pa, pb) : `L${pb.x},${pb.y}`;
    });
    const p0 = termPoint(start);
    return { path: `M${p0.x},${p0.y} ${segs.join(' ')}`, len };
  });
}
