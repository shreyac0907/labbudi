import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePointerDrag } from '../engine/InputManager';
import { GlossyDropper, LiftShadow } from './shared/LabGraphics';
import RampPlank from '../components/equipment/RampPlank';
import { rigPoint, RIG_SIZE, METER_SIZE, RIG_FOOTPRINT } from '../components/equipment/rampSetup';
import { STACK_SIZE } from '../components/equipment/bunsenSetup';
import { MICRO_SIZE } from '../components/equipment/microscopeSetup';
import { layoutOf } from '../components/equipment/stackLayouts';
import ClampStand from '../components/equipment/ClampStand';
import NewtonMeter from '../components/equipment/NewtonMeter';
import Block from '../components/equipment/Block';
import Tripod from '../components/equipment/Tripod';
import Gauze from '../components/equipment/Gauze';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import BunsenBurner from '../components/equipment/BunsenBurner';
import Slide from '../components/equipment/Slide';
import Microscope, { LabelledMicroscope } from '../components/equipment/Microscope';
import Battery from '../components/equipment/Battery';
import Bulb from '../components/equipment/Bulb';
import SwitchComponent from '../components/equipment/SwitchComponent';
import HeatMat from '../components/equipment/HeatMat';
import PipHand from '../components/PipHand';

// objectId → renderer, so DragGame can carry any piece of 3D equipment, not
// just a dropper. Unrecognised ids fall back to the dropper shape.
// Fix 6 — sizes match DeskScene's EQUIPMENT map 1:1 so nothing jumps in
// size the moment it snaps from "being dragged" to "placed".
const EQUIPMENT = {
  // the P2 rig pieces are drawn at the rig's own scale (sc: screen pixels per rig unit), so they match the rig they join
  ramp_3d: ({ sc }) => <RampPlank scale={sc} />,
  clamp_stand_3d: ({ lifted }) => <ClampStand size={0.8} isHeld={lifted} />,
  newton_meter_3d: ({ lifted, sc }) => (
    <div style={{ transform: 'rotate(-90deg)' }}>
      <NewtonMeter size={METER_SIZE * sc} reading={0} isHeld={lifted} shadow={false} />
    </div>
  ),
  block_3d: ({ lifted, sc }) => <Block size={RIG_SIZE * sc} isHeld={lifted} shadow={false} />,
  // the P3 pieces are drawn at the stack's scale when they are being set up on it (stack = true)
  tripod_3d: ({ lifted, sc, stack }) => <Tripod size={stack ? STACK_SIZE.tripod * sc : 1.3} isHeld={lifted} shadow={!stack} />,
  gauze_3d: ({ lifted, sc, stack }) => <Gauze size={stack ? STACK_SIZE.gauze * sc : 1.2} isHeld={lifted} shadow={!stack} />,
  evaporating_dish_3d: ({ lifted, sc, stack }) => <EvaporatingDish size={stack ? STACK_SIZE.dish * sc : 1.3} contentState="solution" isHeld={lifted} shadow={!stack} />,
  bunsen_burner_3d: ({ lifted, sc, stack }) => <BunsenBurner size={stack ? STACK_SIZE.burner * sc : 1.3} state="off" isHeld={lifted} shadow={!stack} />,
  slide_3d: ({ lifted, sc, stack }) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} isHeld={lifted} shadow={!stack} />,
  slide_3d_sample: ({ lifted, sc, stack }) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} hasSample isHeld={lifted} shadow={!stack} />,
  slide_3d_prepared: ({ lifted, sc, stack }) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} hasSample hasCoverslip isHeld={lifted} shadow={!stack} />,
  // the P4 pieces, when set up on the bench layout (stack = the piece's name), are drawn at that layout's scale
  // once it is down on the bench the parts get their names
  microscope_3d: ({ lifted, sc, stack, snapped }) =>
    stack && snapped ? <LabelledMicroscope size={MICRO_SIZE.microscope * sc} /> : <Microscope size={stack ? MICRO_SIZE.microscope * sc : 0.85} isHeld={lifted} shadow={!stack} />,
  battery_3d: ({ lifted }) => <Battery size={1.05} isHeld={lifted} />,
  bulb_3d: ({ lifted }) => <Bulb size={1.05} isHeld={lifted} />,
  switch_3d: ({ lifted }) => <SwitchComponent size={1.05} isHeld={lifted} />,
  ammeter_3d: ({ lifted }) => <NewtonMeter size={0.7} reading={0} unit="A" isHeld={lifted} />,
  heat_mat_3d: ({ lifted, sc, stack }) => <HeatMat size={stack ? STACK_SIZE.mat * sc : 1.3} isHeld={lifted} shadow={!stack} />,
};

function renderEquipment(objectId, color, lifted, sc = 1, stack = false, snapped = false) {
  const Renderer = EQUIPMENT[objectId];
  if (Renderer) return Renderer({ color, lifted, sc, stack, snapped });
  return <GlossyDropper width={44} fillColor={color} fillLevel={0.85} lifted={lifted} />;
}

// Drag the object from its start zone into the target zone. Zones use x/y
// as % of the scene and w/h as px (matching the framework doc's data).
export default function DragGame({ step, onComplete, onFeedback, transparentBg = false }) {
  const { parameters } = step;
  const { fromZone, toZone, snapDistance: dataSnapDistance = 60, objectColor, objectId, rig, stack, layout } = parameters;
  // No timers: a drag never counts down, auto-fails, or waits on a 3-2-1; the instruction is in the bar above.
  const timeLimit = 0;
  // Fix 4 — every drag target is forgiving on touch devices: 80px minimum,
  // regardless of what any individual step's data specifies.
  const snapDistance = Math.max(80, dataSnapDistance);

  const [scale, setScale] = useState(1); // screen pixels per rig unit, for the P2 pieces
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [missPulse, setMissPulse] = useState(false);
  const [misses, setMisses] = useState(0);

  const [target, setTarget] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);
  const startPxRef = useRef({ x: 0, y: 0 });
  const targetPxRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(0);
  const doneRef = useRef(false);

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    startPxRef.current = { x: (fromZone.x / 100) * rect.width, y: (fromZone.y / 100) * rect.height };
    if (rig || stack) {
      // a piece of the P2 rig or the P3 stack: its target is exactly where that layout draws the piece
      const p = rig ? rigPoint(rig, rect.width, rect.height) : layoutOf(layout).point(stack, rect.width, rect.height);
      targetPxRef.current = { x: p.x, y: p.y };
      setScale(p.sc);
    } else {
      targetPxRef.current = { x: (toZone.x / 100) * rect.width, y: (toZone.y / 100) * rect.height };
    }
    setTarget({ ...targetPxRef.current });
    setPos((p) => (p.x === 0 && p.y === 0 ? startPxRef.current : p));
  }, [fromZone, toZone, rig, stack, layout]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const finalize = useCallback(
    (accuracy) => {
      if (doneRef.current) return;
      doneRef.current = true;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      const score = Math.round((accuracy * 0.7 + timing * 0.3) * 100);
      onComplete({ accuracy, timing, completion: accuracy > 0 ? 1 : 0, mistakes: misses, score });
    },
    [onComplete, timeLimit, misses],
  );

  const relPos = useCallback((point) => {
    // A trailing pointer event can arrive after the scene unmounts (the
    // component swaps out as soon as a drag snaps successfully) — guard
    // the same way `measure` already does rather than let it throw.
    if (!sceneRef.current) return point;
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }, []);

  const { onPointerDown } = usePointerDrag({
    onStart: () => setDragging(true),
    onMove: (point) => {
      if (snapped) return;
      setPos(relPos(point));
    },
    onEnd: (point) => {
      setDragging(false);
      if (snapped) return;
      const p = relPos(point);
      const dx = p.x - targetPxRef.current.x;
      const dy = p.y - targetPxRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= snapDistance) {
        setSnapped(true);
        setPos(targetPxRef.current);
        const accuracy = Math.max(0.7, 1 - dist / snapDistance);
        setTimeout(() => finalize(accuracy), 700);
      } else {
        setMisses((m) => m + 1);
        setMissPulse(true);
        setTimeout(() => setMissPulse(false), 300);
        setPos(startPxRef.current);
        onFeedback?.(step.feedback?.failure, 'wrong');
      }
    },
  });

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%', background: transparentBg ? 'transparent' : '#fff' }}>
      {/* Target zone */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: rig || stack ? target.x : `${toZone.x}%`,
          top: rig || stack ? target.y : `${toZone.y}%`,
          width: rig ? RIG_FOOTPRINT[rig].w * scale : stack ? layoutOf(layout).foot[stack][0] * scale : toZone.w,
          height: rig ? RIG_FOOTPRINT[rig].h * scale : stack ? layoutOf(layout).foot[stack][1] * scale : toZone.h,
          // framer-motion builds its own transform (for the scale animation), which would drop a CSS
          // translate(-50%, -50%) and leave the zone half a size off its target; x/y keep the centring
          x: '-50%',
          y: '-50%',
          border: '3px dashed var(--color-chem)',
          borderRadius: 16,
          opacity: snapped ? 0 : dragging ? 1 : rig || stack ? 0.9 : 0.5,
          background: dragging || rig || stack ? 'rgba(232,160,32,0.12)' : 'transparent',
        }}
      />

      {/* Draggable object */}
      <motion.div
        animate={{
          left: pos.x,
          top: pos.y,
          scale: snapped ? [1, 1.2, 1] : dragging ? 1.18 : missPulse ? [1, 0.85, 1] : 1,
        }}
        transition={{ type: snapped || dragging ? 'spring' : 'tween', stiffness: 380, damping: 26, duration: dragging ? undefined : 0.05 }}
        style={{ position: 'absolute', x: '-50%', y: '-50%', touchAction: 'none', zIndex: 10 }}
      >
        <div style={{ position: 'relative' }}>
          {/* Equipment pieces draw their own ambient shadow (materials.jsx);
              only the dropper fallback needs one added here. */}
          {!EQUIPMENT[objectId] && (
            <svg width="70" height="24" viewBox="0 0 70 24" style={{ position: 'absolute', top: 108, left: -13, pointerEvents: 'none' }}>
              <LiftShadow lifted={dragging} width={70} />
            </svg>
          )}
          <div
            onPointerDown={!snapped ? onPointerDown : undefined}
            style={{ cursor: 'grab', padding: 10, margin: -10 }}
          >
            {renderEquipment(objectId, objectColor, dragging, scale, stack || false, snapped)}
          </div>
        </div>
      </motion.div>

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'open'} active={!snapped} />
    </div>
  );
}
