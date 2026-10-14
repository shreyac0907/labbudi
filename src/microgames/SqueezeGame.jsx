import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePointerDrag, usePressHold } from '../engine/InputManager';
import { GlossyDropper, GlossyTestTube, LiftShadow, WarmZone, NEUTRAL_INDICATOR_COLOR, SOLUTION_TINT } from './shared/LabGraphics';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';

const LUCKY_DROP_CHANCE = 1 / 8;

const ALL_TUBE_X = [10, 26, 42, 58, 74]; // matches every squeeze step's targetZone.x in y7p1 data
const NEAR_THRESHOLD_PX = 80; // Fix 4 — minimum 80px snap radius, up from 75
const DROPPER_W = 58; // Fix 6 — active dropper minimum 50×180; 58 wide → ~186 tall

function FallingDrop({ dropKey, color, big = false }) {
  const size = big ? 30 : 10;
  return (
    <motion.div
      key={dropKey}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: big ? 64 : 60, opacity: [1, 1, 0], scale: [1, 1, 0.6] }}
      transition={{ duration: big ? 0.5 : 0.4, ease: 'easeIn' }}
      style={{
        position: 'absolute',
        top: 130,
        left: '50%',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color === 'transparent' ? '#CFE8FF' : color,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        boxShadow: big ? '0 2px 8px rgba(0,0,0,0.35)' : '0 1px 2px rgba(0,0,0,0.25)',
      }}
    />
  );
}

// 3 small chevrons animating downward toward the tube mouth — implies
// "the drop will fall here" once the dropper is in the above-tube zone.
function DownChevrons() {
  return (
    <div style={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      {[0, 1, 2].map((i) => (
        <motion.svg
          key={i}
          width="14"
          height="8"
          viewBox="0 0 14 8"
          style={{ display: 'block', margin: '2px 0' }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: [0, 1, 0], y: [-4, 6, 10] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        >
          <path d="M1,1 L7,7 L13,1" fill="none" stroke="#E8A020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      ))}
    </div>
  );
}

// STEPS A2+A3 / B / C's per-tube beat: the dropper arrives here already
// LOADED (drawn up in the previous, dedicated PipetteDrawGame step) — this
// microgame is purely CARRY (drag to the zone hovering above the tube
// mouth) then DISPENSE (hold to squeeze 3 drops), the two Section 2.1
// physical-metaphor actions that make up "using a pipette on a tube."
export default function SqueezeGame({ step, onComplete, onFeedback, transparentBg = false, previousTubes = [] }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const {
    tubeLabel,
    targetZone,
    holdDuration = 0.6,
    requiredDrops = 3,
    resultColour,
    indicatorLabel,
    noChangeNote,
    timeLimit = 10,
  } = parameters;

  // The dropper/tube always show the indicator's neutral colour; the
  // reaction colour only appears in the tube, and only once drops land.
  const neutralColor = NEUTRAL_INDICATOR_COLOR[indicatorLabel] ?? '#EEE3C6';
  const solutionTint = SOLUTION_TINT[tubeLabel] ?? '#FAFAFA';
  const { actions } = useGameState();

  const [phase, setPhase] = useState('INSTRUCTION');
  const [luckyBanner, setLuckyBanner] = useState(false);
  const [dropperPos, setDropperPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [squeezeProgress, setSqueezeProgress] = useState(0);
  const [dropCount, setDropCount] = useState(0);
  const [drops, setDrops] = useState([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [filled, setFilled] = useState(false);
  const [rippleAt, setRippleAt] = useState(0);
  const [nearZone, setNearZone] = useState(false);

  const sceneRef = useRef(null);
  const activeTubeRef = useRef(null);
  const dockRef = useRef({ x: 0, y: 0 });
  const targetPxRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(0);
  const dropKeyRef = useRef(0);
  const squeezeProgressRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase('ACTIVE'), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ACTIVE') return;
    startTimeRef.current = Date.now();
  }, [phase]);

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    // The dropper always rests in the upper-centre of the canvas — directly
    // above the tube row below — never at a bottom/side edge. Squeezing
    // is then a natural downward drag toward the tubes, not a reach.
    const dockX = rect.width * 0.5;
    const dockY = rect.height * 0.08;
    dockRef.current = { x: dockX, y: dockY };
    setDropperPos((p) => (p.x === 0 && p.y === 0 ? { x: dockX, y: dockY } : p));

    // Measure the active tube's REAL rendered position, then offset the
    // drop target 30px ABOVE its mouth — the pipette hovers over the tube,
    // it doesn't sit inside it (drops fall the rest of the way).
    if (activeTubeRef.current) {
      const tubeRect = activeTubeRef.current.getBoundingClientRect();
      targetPxRef.current = {
        x: tubeRect.left + tubeRect.width / 2 - rect.left,
        y: tubeRect.top - rect.top - 30,
      };
    } else {
      targetPxRef.current = { x: (targetZone.x / 100) * rect.width, y: rect.height * 0.4 };
    }
  }, [targetZone.x]);

  useEffect(() => {
    measure();
    const t = setTimeout(measure, 50); // re-measure once layout settles
    const t2 = setTimeout(measure, 700); // and again after the page-enter scale animation (0.35s) has finished
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const relPos = useCallback((point) => {
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }, []);

  const isNearTarget = useCallback((pos) => {
    const dx = pos.x - targetPxRef.current.x;
    const dy = pos.y - targetPxRef.current.y;
    return Math.sqrt(dx * dx + dy * dy) < NEAR_THRESHOLD_PX;
  }, []);

  // CARRY — drag the loaded dropper to the above-tube zone.
  const { onPointerDown: onDropperPointerDown } = usePointerDrag({
    onStart: () => setDragging(true),
    onMove: (point) => {
      const p = relPos(point);
      setDropperPos(p);
      setNearZone(isNearTarget(p));
    },
    onEnd: () => setDragging(false),
  });

  const finishStep = useCallback(
    (finalDropCount, mistakes) => {
      setPhase('EVALUATING');
      const accuracy = mistakes === 0 ? 1 : Math.max(0, 1 - mistakes * 0.15);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      const completion = finalDropCount / requiredDrops;
      const score = Math.max(0, 100 - mistakes * 10) * completion;
      onComplete({ accuracy, timing, completion, mistakes, score: Math.round(score) });
    },
    [onComplete, requiredDrops, timeLimit],
  );

  // DISPENSE — hold on the bulb to squeeze a drop out, draining the dropper.
  const handleHoldComplete = useCallback(() => {
    setCompressed(false);
    setSqueezeProgress(0);
    const key = dropKeyRef.current++;
    const near = isNearTarget(dropperPos);
    // Lucky Drop surprise bonus (Prompt 3) — only rollable on a drop that
    // actually lands, ~1-in-8.
    const big = near && Math.random() < LUCKY_DROP_CHANCE;
    setDrops((prev) => [...prev, { key, big }]);
    setTimeout(() => setDrops((prev) => prev.filter((d) => d.key !== key)), big ? 550 : 450);
    if (big) {
      setLuckyBanner(true);
      actions.addScore(150);
      onFeedback?.(t('game.big_drop_msg'));
      setRippleAt((r) => r + 2); // bigger, more dramatic ripple
      setTimeout(() => setLuckyBanner(false), 1300);
    }

    if (near) {
      setRippleAt((r) => r + 1);
      setDropCount((prev) => {
        const next = prev + 1;
        if (next >= requiredDrops) {
          setFilled(true);
          if (noChangeNote) {
            onFeedback?.(t('ui.no_colour_change'));
          }
          setTimeout(() => finishStep(next, wrongAttempts), 1600);
        }
        return next;
      });
    } else {
      setWrongAttempts((prev) => prev + 1);
      onFeedback?.(t('game.hold_over_tube', { tube: tv(tubeLabel) }), 'wrong');
    }
  }, [isNearTarget, dropperPos, requiredDrops, tubeLabel, onFeedback, finishStep, wrongAttempts, noChangeNote, actions]);

  // Section 2.5 soft failure — 0.3s minimum hold, and releasing early isn't
  // punished: it still registers as a faint partial drop plus a friendly
  // nudge, not a wrong attempt.
  const effectiveHoldDuration = Math.min(0.3, holdDuration);
  const { onPointerDown: onBulbPointerDown } = usePressHold({
    durationMs: effectiveHoldDuration * 1000,
    onProgress: (p) => {
      squeezeProgressRef.current = p;
      setCompressed(true);
      setSqueezeProgress(p);
    },
    onComplete: handleHoldComplete,
    onRelease: () => {
      if (squeezeProgressRef.current > 0.05) {
        setRippleAt((r) => r + 1);
        onFeedback?.(t('game.hold_longer_short'), 'wrong');
      }
      squeezeProgressRef.current = 0;
      setCompressed(false);
      setSqueezeProgress(0);
    },
  });

  // The solution already has its own faint tint at rest; drops landing
  // grow the level toward full and, on the first drop, swap the colour
  // target from the solution tint to the reaction colour (the transition
  // itself is animated inside GlossyTestTube).
  const fillFraction = Math.min(0.95, 0.35 + (dropCount / requiredDrops) * 0.6);
  const activeLiquidColor = dropCount === 0 ? solutionTint : resultColour;
  const dropperLifted = dragging || dropperPos.x !== dockRef.current.x;

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%', background: transparentBg ? 'transparent' : '#fff' }}>
      <BonusBanner active={luckyBanner} text={t('ui.lucky_drop')} points={150} color="#FFD700" />

      {/* 5-tube bench: only the active tube is fully wired; the rest are
          context. Lower half of the canvas — the dropper docks up top and
          drags DOWN to reach them, the natural pipetting motion. */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 6%' }}>
        {ALL_TUBE_X.map((x) => {
          const isActiveTube = x === targetZone.x;
          const done = isActiveTube ? null : previousTubes.find((p) => p.x === x);
          return (
            <div key={x} ref={isActiveTube ? activeTubeRef : undefined} style={{ position: 'relative', opacity: isActiveTube || done ? 1 : 0.25 }}>
              <GlossyTestTube
                width={60}
                fillFraction={isActiveTube ? fillFraction : done ? 0.95 : 0.3}
                liquidColor={isActiveTube ? activeLiquidColor : done ? done.colour : solutionTint}
                active={isActiveTube && phase === 'ACTIVE'}
                noChange={isActiveTube && noChangeNote && dropCount > 0}
                rippleAt={isActiveTube ? rippleAt : 0}
              />
              {/* the drop-target zone hovers ABOVE the tube mouth, not over
                  the tube itself — an oval, not a circle centred on the
                  glass, and it shows the "drops fall here" chevrons once
                  the dropper is close. */}
              {isActiveTube && !filled && (
                <div style={{ position: 'absolute', top: -34, left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <WarmZone width={70} height={40} borderRadius={20} visible={dragging} bright={dragging && nearZone} />
                  {dragging && nearZone && <DownChevrons />}
                </div>
              )}
              {done && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--color-dark)', whiteSpace: 'nowrap' }}>
                  {tv(done.label)}
                </div>
              )}
              {isActiveTube && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 6,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--color-dark)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {tv(tubeLabel)}
                  <AnimatePresence>
                    {filled && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#2E7D32' }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {isActiveTube && !filled && (
                <div
                  style={{
                    position: 'absolute',
                    top: -18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#E8A020',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dropCount} / {requiredDrops}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Draggable dropper — arrives already loaded (drawn up in the
          previous step). The bulb (top, for squeezing) and the body/tip
          (rest, for relocating) are SIBLING hit-zones, not nested — nesting
          would fire both gestures on every press since pointerdown bubbles
          from child to parent. */}
      <motion.div
        animate={{ left: dropperPos.x, top: dropperPos.y, scale: dragging ? 1.15 : 1 }}
        transition={{ type: dragging ? false : 'spring', stiffness: 380, damping: 28 }}
        style={{ position: 'absolute', transform: 'translate(-50%, -20%)', touchAction: 'none', zIndex: 10 }}
      >
        <div style={{ position: 'relative' }}>
          <svg width={DROPPER_W + 20} height="20" viewBox={`0 0 ${DROPPER_W + 20} 20`} style={{ position: 'absolute', top: DROPPER_W * 3.2, left: -8, pointerEvents: 'none' }}>
            <LiftShadow lifted={dropperLifted} width={DROPPER_W + 20} />
          </svg>
          <GlossyDropper width={DROPPER_W} fillColor={neutralColor} fillLevel={filled ? 0 : 0.55} compressed={compressed} lifted={dropperLifted} />
          {/* bulb hitbox — squeeze. Enlarged well past the visual bulb so
              an imprecise tap still registers as "grab the bulb". */}
          <div
            onPointerDown={!filled ? onBulbPointerDown : undefined}
            style={{ position: 'absolute', top: -20, left: -17, width: DROPPER_W * 1.6, height: DROPPER_W * 1.4, cursor: !filled ? 'pointer' : 'default' }}
          />
          {/* body/tip hitbox — relocate */}
          <div
            onPointerDown={!filled ? onDropperPointerDown : undefined}
            style={{ position: 'absolute', top: DROPPER_W * 1.05, left: 0, width: DROPPER_W, height: DROPPER_W * 2.45, cursor: !filled ? 'grab' : 'default' }}
          />
          {drops.map((d) => (
            <FallingDrop key={d.key} dropKey={d.key} color={neutralColor} big={d.big} />
          ))}
          {compressed && (
            <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: -14, left: -14, pointerEvents: 'none' }}>
              <circle cx="34" cy="34" r="26" fill="none" stroke="#E8A020" strokeWidth="8" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - squeezeProgress)} strokeLinecap="round" transform="rotate(-90 34 34)" />
            </svg>
          )}
        </div>
      </motion.div>
    </div>
  );
}
