import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePressHold, usePointerDrag } from '../engine/InputManager';
import { GlossyBottle, GlossyDropper, WarmZone } from './shared/LabGraphics';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';

const WATER = '#CFE8FF';
const REQUIRED_DROPS = 3;
const S = 1.25; // how much bigger the pipette is drawn than its natural size (the whole thing scales, hit areas included)
const TIP = 162; // from the dropper's anchor point (its top centre, shifted up a fifth) down to the tip, unscaled px

// The reverse-reaction beat: add water back to the white anhydrous
// crystals and watch them turn blue again — same draw-then-squeeze
// physical metaphor as P1's pipette, condensed into one self-contained
// step since there's only one tube (the dish) here.
export default function ReverseReactionGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { timeLimit = 20 } = step.parameters ?? {};

  const [loaded, setLoaded] = useState(false);
  const [fillLevel, setFillLevel] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [dropperPos, setDropperPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [squeezeProgress, setSqueezeProgress] = useState(0);
  const [dropCount, setDropCount] = useState(0);
  const [drops, setDrops] = useState([]);
  const [turnedBlue, setTurnedBlue] = useState(false);

  const sceneRef = useRef(null);
  const dockRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const dishRef = useRef(null);
  const grabRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false); // set once the pipette has been picked up, so a re-measure no longer resets it
  const bottleRef = useRef(null);
  const [tipTarget, setTipTarget] = useState({ x: 0, y: 0 }); // where the pipette's tip has to be: just above the dish
  const dropKeyRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    // the pipette starts standing in the water bottle, its tip at the bottle's neck
    let dock = { x: rect.width * 0.18, y: rect.height * 0.3 };
    if (bottleRef.current) {
      const br = bottleRef.current.getBoundingClientRect();
      dock = { x: br.left + br.width / 2 - rect.left, y: br.top - rect.top + 24 - TIP * S };
    }
    dockRef.current = dock;
    setDropperPos((p) => (p.x === 0 && p.y === 0 ? dock : p));
    if (!movedRef.current) setDropperPos(dock);
    if (dishRef.current) {
      const dr = dishRef.current.getBoundingClientRect();
      const tipX = dr.left + dr.width / 2 - rect.left;
      const tipY = dr.top - rect.top - 36;
      setTipTarget({ x: tipX, y: tipY });
      targetRef.current = { x: tipX, y: tipY - TIP * S }; // the dropper's anchor, so that its tip is at the target
    }
  }, []);

  // measure again whenever the scene changes size (the guide column can appear after the first frame)
  useEffect(() => {
    const first = setTimeout(measure, 60);
    const el = sceneRef.current;
    const ro = el ? new ResizeObserver(() => measure()) : null;
    ro?.observe(el);
    return () => {
      clearTimeout(first);
      ro?.disconnect();
    };
  }, [measure]);

  const relPos = useCallback((point) => {
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }, []);

  const isNear = useCallback((pos) => {
    const dx = pos.x - targetRef.current.x;
    const dy = pos.y - targetRef.current.y;
    return Math.sqrt(dx * dx + dy * dy) < 80;
  }, []);

  const { onPointerDown: onBottleDown } = usePressHold({
    durationMs: 400,
    onProgress: (p) => {
      setDrawing(true);
      setFillLevel(p);
    },
    onComplete: () => {
      setDrawing(false);
      setLoaded(true);
      setFillLevel(1);
      onFeedback?.(t('game.water_loaded'));
    },
    onRelease: () => {
      setDrawing(false);
      setFillLevel(0);
    },
  });

  const { onPointerDown: onDropperDown } = usePointerDrag({
    // the pipette is carried by the spot you grabbed it at, so it does not jump to the pointer
    onStart: (point) => {
      movedRef.current = true;
      const p = relPos(point);
      grabRef.current = { x: dropperPos.x - p.x, y: dropperPos.y - p.y };
      setDragging(true);
    },
    onMove: (point) => {
      const p = relPos(point);
      setDropperPos({ x: p.x + grabRef.current.x, y: p.y + grabRef.current.y });
    },
    onEnd: () => setDragging(false),
  });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  const handleSqueezeComplete = useCallback(() => {
    setCompressed(false);
    setSqueezeProgress(0);
    const key = dropKeyRef.current++;
    setDrops((prev) => [...prev, key]);
    setTimeout(() => setDrops((prev) => prev.filter((k) => k !== key)), 450);
    if (!isNear(dropperPos)) {
      onFeedback?.(t('game.aim_dish'), 'wrong');
      return;
    }
    setDropCount((prev) => {
      const next = prev + 1;
      if (next >= REQUIRED_DROPS) {
        setTurnedBlue(true);
        onFeedback?.(t('game.blue_again'));
        setTimeout(finish, 1800);
      }
      return next;
    });
  }, [isNear, dropperPos, onFeedback, finish]);

  const { onPointerDown: onBulbDown } = usePressHold({
    durationMs: 300,
    onProgress: (p) => {
      setCompressed(true);
      setSqueezeProgress(p);
    },
    onComplete: handleSqueezeComplete,
    onRelease: () => {
      setCompressed(false);
      setSqueezeProgress(0);
    },
  });

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translateX(-50%)' }} ref={dishRef}>
        <EvaporatingDish size={5} contentState={turnedBlue ? 'solution' : 'powder'} shadow={false} />
      </div>

      {!turnedBlue && (
        <div style={{ position: 'absolute', left: tipTarget.x, top: tipTarget.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <WarmZone width={150} height={70} borderRadius={35} visible={dragging || loaded} bright={dragging && isNear(dropperPos)} />
        </div>
      )}

      <div style={{ position: 'absolute', left: '12%', bottom: '7%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div ref={bottleRef} onPointerDown={!loaded ? onBottleDown : undefined} style={{ position: 'relative', cursor: !loaded ? 'pointer' : 'default', touchAction: 'none' }}>
          <GlossyBottle width={110} liquidColor={WATER} squeezing={drawing} />
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)' }}>{tv('Water')}</div>
      </div>

      <motion.div
        animate={{ left: dropperPos.x, top: dropperPos.y, scale: dragging ? 1.15 : 1 }}
        transition={{ type: dragging ? false : 'spring', stiffness: 380, damping: 28 }}
        style={{ position: 'absolute', transform: 'translate(-50%, -20%)', touchAction: 'none', zIndex: 10 }}
      >
        <div style={{ position: 'relative', transform: `scale(${S})`, transformOrigin: '50% 20%' }}>
          <GlossyDropper width={58} fillColor={WATER} fillLevel={fillLevel} compressed={compressed} lifted={dragging} />
          <div onPointerDown={loaded ? onBulbDown : undefined} style={{ position: 'absolute', top: -20, left: -17, width: 92, height: 82, cursor: loaded ? 'pointer' : 'default' }} />
          <div onPointerDown={loaded ? onDropperDown : undefined} style={{ position: 'absolute', top: 61, left: 0, width: 58, height: 142, cursor: loaded ? 'grab' : 'default' }} />
          {drops.map((k) => (
            <motion.div
              key={k}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 60, opacity: [1, 1, 0] }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', top: 130, left: '50%', width: 10, height: 10, borderRadius: '50%', background: WATER, transform: 'translateX(-50%)' }}
            />
          ))}
          {compressed && (
            <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: -14, left: -14, pointerEvents: 'none' }}>
              <circle cx="34" cy="34" r="26" fill="none" stroke="#E8A020" strokeWidth="8" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - squeezeProgress)} strokeLinecap="round" transform="rotate(-90 34 34)" />
            </svg>
          )}
        </div>
      </motion.div>

      {!turnedBlue && (
        <div style={{ position: 'absolute', left: '50%', top: 'calc(50% + 200px)', transform: 'translateX(-50%)', fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 700, color: '#B87A10' }}>
          {dropCount} / {REQUIRED_DROPS}
        </div>
      )}

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : compressed ? 'squeeze' : 'open'} active={!turnedBlue} />
    </div>
  );
}
