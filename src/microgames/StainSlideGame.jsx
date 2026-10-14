import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePressHold, usePointerDrag } from '../engine/InputManager';
import { GlossyBottle, GlossyDropper, WarmZone } from './shared/LabGraphics';
import Slide from '../components/equipment/Slide';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';

const STAIN = '#7B1FA2'; // methylene blue / crystal violet stain bottle
const S = 1.25; // how much bigger the pipette is drawn than its natural size (hit areas scale with it)
const TIP = 162; // from the dropper's anchor down to its tip, unscaled px

// One drop of stain onto the cell smear — same draw/carry/squeeze physical
// metaphor as everywhere else, but only one drop: too many floods the
// slide (soft failure — dropper just resets, no penalty).
export default function StainSlideGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { timeLimit = 20 } = step.parameters ?? {};

  const [loaded, setLoaded] = useState(false);
  const [fillLevel, setFillLevel] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [dropperPos, setDropperPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [squeezeProgress, setSqueezeProgress] = useState(0);
  const [stained, setStained] = useState(false);
  const [flooded, setFlooded] = useState(false);

  const sceneRef = useRef(null);
  const dockRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const slideRef = useRef(null);
  const bottleRef = useRef(null);
  const grabRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const [tipTarget, setTipTarget] = useState({ x: 0, y: 0 }); // where the pipette's tip has to be: just above the slide
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    // the pipette starts standing in the stain bottle, its tip at the bottle's neck
    let dock = { x: rect.width * 0.18, y: rect.height * 0.3 };
    if (bottleRef.current) {
      const br = bottleRef.current.getBoundingClientRect();
      dock = { x: br.left + br.width / 2 - rect.left, y: br.top - rect.top + 24 - TIP * S };
    }
    dockRef.current = dock;
    if (!movedRef.current) setDropperPos(dock);
    if (slideRef.current) {
      const sr = slideRef.current.getBoundingClientRect();
      const tipX = sr.left + sr.width / 2 - rect.left;
      const tipY = sr.top - rect.top - 36;
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

  const isNear = useCallback((pos) => Math.hypot(pos.x - targetRef.current.x, pos.y - targetRef.current.y) < 80, []);

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
      onFeedback?.(t('game.stain_loaded'));
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
    if (!isNear(dropperPos)) {
      onFeedback?.(t('game.aim_slide'), 'wrong');
      return;
    }
    if (stained) {
      setFlooded(true);
      setTimeout(() => setFlooded(false), 900);
      onFeedback?.(t('game.one_drop_enough'), 'wrong');
      return;
    }
    setStained(true);
    setLoaded(false);
    onFeedback?.(t('game.stain_visible'));
    setTimeout(finish, 1400);
  }, [isNear, dropperPos, stained, onFeedback, finish]);

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
      <div ref={slideRef} style={{ position: 'absolute', left: '50%', top: '56%', transform: 'translate(-50%,-50%) scale(4.6)' }}>
        <Slide size={1} hasSample hasStain={stained} shadow={false} />
      </div>

      {!stained && (
        <div style={{ position: 'absolute', left: tipTarget.x, top: tipTarget.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <WarmZone width={150} height={70} borderRadius={35} visible={dragging || loaded} bright={dragging && isNear(dropperPos)} />
        </div>
      )}

      {flooded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          style={{ position: 'absolute', left: '50%', top: '56%', transform: 'translate(-50%,-50%)', width: 320, height: 110, background: 'rgba(220,20,20,0.15)', borderRadius: 12, pointerEvents: 'none' }}
        />
      )}

      <div style={{ position: 'absolute', left: '12%', bottom: '7%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div ref={bottleRef} onPointerDown={!loaded && !stained ? onBottleDown : undefined} style={{ position: 'relative', cursor: !loaded && !stained ? 'pointer' : 'default', touchAction: 'none' }}>
          <GlossyBottle width={110} liquidColor={STAIN} squeezing={drawing} />
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)' }}>{t('game.cell_stain')}</div>
      </div>

      <motion.div
        animate={{ left: dropperPos.x, top: dropperPos.y, scale: dragging ? 1.15 : 1 }}
        transition={{ type: dragging ? false : 'spring', stiffness: 380, damping: 28 }}
        style={{ position: 'absolute', transform: 'translate(-50%, -20%)', touchAction: 'none', zIndex: 10 }}
      >
        <div style={{ position: 'relative', transform: `scale(${S})`, transformOrigin: '50% 20%' }}>
          <GlossyDropper width={58} fillColor={STAIN} fillLevel={stained ? 0 : fillLevel} compressed={compressed} lifted={dragging} />
          <div onPointerDown={loaded ? onBulbDown : undefined} style={{ position: 'absolute', top: -20, left: -17, width: 92, height: 82, cursor: loaded ? 'pointer' : 'default' }} />
          <div onPointerDown={loaded ? onDropperDown : undefined} style={{ position: 'absolute', top: 61, left: 0, width: 58, height: 142, cursor: loaded ? 'grab' : 'default' }} />
          {compressed && (
            <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: -14, left: -14, pointerEvents: 'none' }}>
              <circle cx="34" cy="34" r="26" fill="none" stroke="#E8A020" strokeWidth="8" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - squeezeProgress)} strokeLinecap="round" transform="rotate(-90 34 34)" />
            </svg>
          )}
        </div>
      </motion.div>

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : compressed ? 'squeeze' : 'open'} active={!stained} />
    </div>
  );
}
