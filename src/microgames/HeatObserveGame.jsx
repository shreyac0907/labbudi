import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BunsenBurner from '../components/equipment/BunsenBurner';
import Tripod from '../components/equipment/Tripod';
import Gauze from '../components/equipment/Gauze';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import HeatMat from '../components/equipment/HeatMat';
import RigStage from '../components/equipment/RigStage';
import { stackPoint, stackGeometry, STACK_SIZE, STACK_Z } from '../components/equipment/bunsenSetup';
import PhysicsEngine, { Matter, isLowEndDevice } from '../physics/PhysicsEngine';
import useParticleSystem from '../physics/useParticleSystem';
import { CollarHandle } from '../components/equipment/CollarControl';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { earnBadge } from '../engine/Badges';
import { useTranslation } from 'react-i18next';

const CHIPS = [
  { id: 'colour', label: 'game.chip_colour' },
  { id: 'steam', label: 'game.chip_steam' },
  { id: 'crystals', label: 'game.chip_crystals' },
];

const STEAM_UPFORCE = 0.00028; // custom per-particle "anti-gravity", never touches the shared engine's own gravity
const STEAM_SPAWN_MS = 200;
const STEAM_FADE_PX = 100; // matches spec: fades out once it's risen this far
const STEAM_MAX = isLowEndDevice ? 15 : 35;
const FRAGMENT_COUNT = isLowEndDevice ? 6 : 12;

// Valve + temperature-gauge control (Prompt 3) — spinning the valve sets
// the flame height (0-90°), the gauge needle "chases" a target temperature
// derived from that height rather than snapping to it (so overshoot and
// correction are a real skill, not just "turn to the right spot once").
const CONTROL_MS = 8000; // same total active-heating duration as before
const GREEN_MIN = 55;
const GREEN_MAX = 75;
const CHASE_RATE = 0.06; // fraction of the temp/target gap closed per 100ms tick
const GREEN_ZONE_FRACTION_FOR_BADGE = 0.8;

// No blank timer screen — pressing the clock plays an 8-second animated
// heating sequence with continuous visible action (shimmer, colour fade,
// steam), not a countdown on an empty scene. The dish can be zoomed at
// any point to see the current state up close.
export default function HeatObserveGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { timeLimit = 20 } = parameters;
  const { actions } = useGameState();
  const { practicalId } = useParams();

  const [heated, setHeated] = useState(false);
  const [running, setRunning] = useState(false);
  const [clockSpins, setClockSpins] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [confirmed, setConfirmed] = useState([]);
  const [valveAngle, setValveAngle] = useState(45); // the collar's opening, 0-90 (it is the heat control)
  const [masterChemist, setMasterChemist] = useState(false);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const steamIdsRef = useRef(new Set());
  const spawnTimerRef = useRef(null);
  const steam = useParticleSystem();
  const fragments = useParticleSystem();

  const tempRef = useRef(20);
  const controlStartRef = useRef(0);
  const greenMsRef = useRef(0);
  const scoredGreenSecondsRef = useRef(0);

  const runSequence = useCallback(() => {
    if (running || heated) return;
    setRunning(true);
    setClockSpins((s) => s + 1);
    controlStartRef.current = Date.now();
    greenMsRef.current = 0;
    scoredGreenSecondsRef.current = 0;
    onFeedback?.(t('game.heat_start_msg'));
    setTimeout(() => onFeedback?.(t('game.heat_blue_gone')), 4000);
  }, [running, heated, onFeedback]);

  // valveAngle mirrored into a ref so the tick effect below can read the
  // live angle without depending on it — if it were a dependency, the
  // interval would tear down and restart on every single degree of drag,
  // starving it of ticks during continuous spinning (it would only ever
  // fire once the student let go).
  const valveAngleRef = useRef(0);
  useEffect(() => {
    valveAngleRef.current = valveAngle;
  }, [valveAngle]);

  // The control loop — ticks every 100ms while `running`: chases `temp`
  // toward a target derived from the valve angle (never snaps, so holding
  // a steady angle still takes a moment to settle — real thermal lag),
  // tracks how much of the run was spent in the green zone for the +10/s
  // score and the "Master Chemist" badge, then auto-finishes at CONTROL_MS.
  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      const target = (valveAngleRef.current / 90) * 100;
      const next = tempRef.current + (target - tempRef.current) * CHASE_RATE;
      tempRef.current = next;

      const elapsed = Date.now() - controlStartRef.current;
      const inGreen = next >= GREEN_MIN && next <= GREEN_MAX;
      if (inGreen) greenMsRef.current += 100;
      const greenSeconds = Math.floor(greenMsRef.current / 1000);
      if (greenSeconds > scoredGreenSecondsRef.current) {
        actions.addScore((greenSeconds - scoredGreenSecondsRef.current) * 10);
        scoredGreenSecondsRef.current = greenSeconds;
      }

      if (elapsed >= CONTROL_MS) {
        clearInterval(interval);
        setRunning(false);
        setHeated(true);
        const greenFraction = greenMsRef.current / elapsed;
        if (greenFraction >= GREEN_ZONE_FRACTION_FOR_BADGE) {
          setMasterChemist(true);
          earnBadge(practicalId, 'master_chemist');
          setTimeout(() => onFeedback?.(t('game.master_chemist_msg')), 400);
          setTimeout(() => setMasterChemist(false), 1800);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [running, actions, onFeedback, practicalId]);

  // The brass collar on the burner is the heat control, the same one as in the lighting and flame steps: sliding it
  // open lets more air in (a hotter, bluer flame), closed makes it cooler and yellower. Only live while heating.
  const setCollarAmount = useCallback(
    (v) => {
      if (!running) return;
      setValveAngle(Math.max(0, Math.min(1, v)) * 90);
    },
    [running],
  );

  // Steam particles — real Matter.js bodies given a custom per-particle
  // upward force each tick (never the shared engine's own gravity, which
  // stays pointed down for P2's ramp). Spawn every 200ms while heating,
  // despawn once they've risen STEAM_FADE_PX past their own start height.
  useEffect(() => {
    if (!running) {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return undefined;
    }
    spawnTimerRef.current = setInterval(() => {
      if (steamIdsRef.current.size >= STEAM_MAX) return;
      const radius = 4 + Math.random() * 4;
      const id = steam.spawn(
        (M) =>
          M.Bodies.circle(0, 0, radius, {
            frictionAir: 0.04,
            collisionFilter: { category: 0x0002, mask: 0x0002 }, // steam only collides with itself, never equipment
            label: 'steam',
          }),
        { startY: 0, radius },
      );
      const body = PhysicsEngine.bodies.get(id);
      if (body) Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -0.5 });
      steamIdsRef.current.add(id);
    }, STEAM_SPAWN_MS);
    return () => clearInterval(spawnTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // The custom upward drift + prune-when-faded loop, ticking with the
  // shared physics engine itself rather than React's render cycle.
  useEffect(() => {
    function onBeforeUpdate() {
      for (const id of steamIdsRef.current) {
        const body = PhysicsEngine.bodies.get(id);
        if (body) Matter.Body.applyForce(body, body.position, { x: 0, y: -STEAM_UPFORCE });
      }
    }
    Matter.Events.on(PhysicsEngine.engine, 'beforeUpdate', onBeforeUpdate);
    return () => Matter.Events.off(PhysicsEngine.engine, 'beforeUpdate', onBeforeUpdate);
  }, []);

  useEffect(() => {
    for (const p of steam.particles) {
      const risen = p.startY - p.y;
      if (risen > STEAM_FADE_PX) {
        steamIdsRef.current.delete(p.id);
        steam.despawn(p.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steam.particles]);

  // Crystal fragments — once the colour change completes, 10-15 small
  // irregular polygons "crumble" out of the dish and settle under normal
  // gravity, purely decorative (visual echo of the powder forming).
  const firedFragmentsRef = useRef(false);
  useEffect(() => {
    if (!heated || firedFragmentsRef.current) return;
    firedFragmentsRef.current = true;
    for (let i = 0; i < FRAGMENT_COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 6 + Math.random() * 10;
      const vertCount = 3 + Math.floor(Math.random() * 3);
      const verts = Array.from({ length: vertCount }, (_, v) => {
        const a = (v / vertCount) * Math.PI * 2;
        const r = 2 + Math.random() * 2.5;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
      fragments.spawn(
        (M) =>
          M.Bodies.fromVertices(Math.cos(angle) * spread, Math.sin(angle) * spread - 6, [verts], {
            friction: 0.5,
            frictionAir: 0.03,
            restitution: 0.15,
            density: 0.002,
            label: 'fragment',
          }),
        {},
      );
    }
    setTimeout(() => fragments.despawnAll(), 2200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heated]);

  // an observation can be ticked once it can actually be seen: steam while heating, the colour and the crystals once it is done
  const canTick = (id) => (id === 'steam' ? running || heated : heated);

  function toggleChip(id) {
    if (!canTick(id)) return;
    setConfirmed((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length === CHIPS.length && !doneRef.current) {
        doneRef.current = true;
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
        setTimeout(() => onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) }), 500);
      }
      return next;
    });
  }

  return (
    <div onWheel={(e) => running && setCollarAmount(valveAngle / 90 - e.deltaY / 300)} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <BonusBanner active={masterChemist} text={t('game.master_chemist_banner')} color="#FFD700" />

      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* the full apparatus stays at normal scale, always — the dish zoom
            below is an overlay on top of it, never a side-panel shrink */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* the same stack the setup steps built (bunsenSetup), so what the student placed is what gets heated */}
          <RigStage>
            {({ w, h }) => {
              const burner = stackPoint('burner', w, h);
              const tripod = stackPoint('tripod', w, h);
              const gauze = stackPoint('gauze', w, h);
              const dish = stackPoint('dish', w, h);
              const mat = stackPoint('mat', w, h);
              const { sc, ring, yMat } = stackGeometry(w, h);
              const at = (p, kind) => ({ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', zIndex: STACK_Z[kind] });
              // zooming in is a real camera move on the apparatus: the dish grows and slides to the middle of the scene
              const Z = Math.min(3.2, Math.max(2, (h * 0.5) / (36 * STACK_SIZE.dish * sc * 0.9)));
              return (
                <motion.div
                  animate={zoomed ? { scale: Z, x: w / 2 - dish.x, y: h * 0.52 - dish.y } : { scale: 1, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  style={{ position: 'absolute', inset: 0, transformOrigin: `${dish.x}px ${dish.y}px` }}
                >
                  <div style={at(mat, 'mat')}>
                    <HeatMat size={STACK_SIZE.mat * sc} shadow={false} />
                  </div>
                  <div style={at(tripod, 'tripod')}>
                    <Tripod size={STACK_SIZE.tripod * sc} shadow={false} />
                  </div>
                  <div style={at(burner, 'burner')}>
                    <BunsenBurner size={STACK_SIZE.burner * sc} collarOpenAmount={heated ? 0 : valveAngle / 90} shadow={false} />
                  </div>
                  {running && (
                    <CollarHandle cx={burner.x} cy={burner.y + 38 * sc} u={sc} value={valveAngle / 90} onChange={setCollarAmount} label={t('game.collar_heat')} />
                  )}
                  <div style={at(gauze, 'gauze')}>
                    <Gauze size={STACK_SIZE.gauze * sc} shadow={false} />
                  </div>
                  <div onClick={() => setZoomed((z) => !z)} style={{ ...at(dish, 'dish'), cursor: 'pointer', pointerEvents: 'auto' }}>
                    <EvaporatingDish size={STACK_SIZE.dish * sc} contentState={heated ? 'powder' : 'solution'} shadow={false} />
                  </div>

                  <AnimatePresence>
                    {running && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ position: 'absolute', left: burner.x, top: (yMat - 122 * sc + ring) / 2, width: 40, height: 60, transform: 'translate(-50%, -50%)', background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)', filter: 'blur(3px)', pointerEvents: 'none', zIndex: 6 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* real Matter.js steam + crystal fragments: a zero-size anchor at the dish, so each particle's physics
                      x/y (world-origin-relative, since bodies spawn at local (0,0)) applies directly as a CSS transform */}
                  <div style={{ position: 'absolute', left: dish.x, top: dish.y, width: 0, height: 0, pointerEvents: 'none', zIndex: 7 }}>
              {steam.particles.map((p) => {
                    const risen = p.startY - p.y;
                    const opacity = Math.max(0, 1 - risen / STEAM_FADE_PX) * 0.85;
                    return (
                      <div
                        key={p.id}
                        style={{
                          position: 'absolute',
                          left: 0,
                          bottom: 0,
                          width: p.radius * 2,
                          height: p.radius * 2,
                          marginLeft: -p.radius,
                          marginBottom: -p.radius,
                          borderRadius: '50%',
                          background: '#fff',
                          opacity,
                          filter: 'blur(1px)',
                          transform: `translate(${p.x}px, ${p.y}px)`,
                        }}
                      />
                    );
                  })}
                  {fragments.particles.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: 7,
                        height: 7,
                        marginLeft: -3.5,
                        marginBottom: -3.5,
                        background: '#fff',
                        borderRadius: 2,
                        opacity: 0.9,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                        transform: `translate(${p.x}px, ${p.y}px) rotate(${p.angle}rad)`,
                      }}
                    />
                  ))}
                      </div>
                </motion.div>
              );
            }}
          </RigStage>

          {!running && !heated && (
            <div
              onClick={runSequence}
              style={{
                position: 'absolute',
                bottom: 24,
                right: '8%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                zIndex: 8,
              }}
            >
              <motion.div
                key={clockSpins}
                animate={{ rotate: [0, 0] }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '2px solid #E8A020',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              >
                <motion.svg width="36" height="36" viewBox="0 0 36 36" animate={{ rotate: 720 }} transition={{ duration: 0.8 }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-dark)" strokeWidth="2" />
                  <line x1="18" y1="18" x2="18" y2="9" stroke="var(--color-dark)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="18" x2="24" y2="18" stroke="var(--color-dark)" strokeWidth="2" strokeLinecap="round" />
                </motion.svg>
              </motion.div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-mid)' }}>{t('game.watch_closely')}</div>
            </div>
          )}
        </div>

      </div>

      {/* when zoomed in on the dish, say what it is going from and to */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', left: '50%', top: '7%', x: '-50%', display: 'flex', alignItems: 'center', gap: 16, zIndex: 60, pointerEvents: 'none' }}
          >
            {[
              { key: 'solution', label: t('game.heat_blue_solution'), on: !heated, colour: '#1565C0' },
              { key: 'powder', label: t('game.heat_white_powder'), on: heated, colour: '#8A8478' },
            ].map((chip, i) => (
              <div key={chip.key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {i === 1 && (
                  <svg width="48" height="24" viewBox="0 0 48 24" aria-hidden="true">
                    <path d="M2,12 H40 M30,3 L42,12 L30,21" fill="none" stroke="#2D2D2D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    background: chip.on ? '#fff' : 'rgba(255,255,255,0.55)',
                    border: `3px solid ${chip.on ? chip.colour : 'rgba(0,0,0,0.15)'}`,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 26,
                    color: chip.on ? chip.colour : '#8A8478',
                    boxShadow: chip.on ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chip.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
            style={{ position: 'fixed', left: 24, bottom: 24, padding: '10px 18px', borderRadius: 999, border: '2px solid var(--color-chem)', background: '#fff', color: 'var(--color-chem)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', zIndex: 70 }}
          >
            ← Zoom out
          </motion.button>
        )}
      </AnimatePresence>

      {/* the observations, as a checklist at the side: tick each one as you see it */}
      {!zoomed && (
        <div style={{ position: 'absolute', right: '3%', top: '24%', width: 300, background: 'rgba(255,255,255,0.94)', border: '3px solid #D9CFAE', borderRadius: 18, padding: '16px 18px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', zIndex: 8 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--color-dark)', marginBottom: 10 }}>{t('game.heat_checklist_title')}</div>
          {CHIPS.map((chip) => {
            const done = confirmed.includes(chip.id);
            const ready = canTick(chip.id);
            return (
              <div
                key={chip.id}
                onClick={() => toggleChip(chip.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', cursor: ready && !done ? 'pointer' : 'default', opacity: ready || done ? 1 : 0.45 }}
              >
                <div
                  style={{
                    flex: '0 0 34px',
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `3px solid ${done ? '#1E9E5A' : ready ? '#E8A020' : '#B8B2A0'}`,
                    background: done ? '#DDF3E6' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: ready && !done ? '0 0 0 4px rgba(232,160,32,0.25)' : 'none',
                  }}
                >
                  {done && (
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 12.5 L10 18 L20 6" fill="none" stroke="#1E9E5A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 20, color: done ? '#1E9E5A' : 'var(--color-dark)' }}>{t(chip.label)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
