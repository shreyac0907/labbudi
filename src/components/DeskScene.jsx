import { useRef, useState, useLayoutEffect } from 'react';
import RampPlank from './equipment/RampPlank';
import { rigPoint, RIG_SIZE, METER_SIZE } from './equipment/rampSetup';
import { STACK_SIZE } from './equipment/bunsenSetup';
import { MICRO_SIZE } from './equipment/microscopeSetup';
import { layoutOf } from './equipment/stackLayouts';
import ClampStand from './equipment/ClampStand';
import NewtonMeter from './equipment/NewtonMeter';
import Block from './equipment/Block';
import Tripod from './equipment/Tripod';
import Gauze from './equipment/Gauze';
import EvaporatingDish from './equipment/EvaporatingDish';
import BunsenBurner from './equipment/BunsenBurner';
import Slide from './equipment/Slide';
import Microscope, { LabelledMicroscope } from './equipment/Microscope';
import Battery from './equipment/Battery';
import Bulb from './equipment/Bulb';
import SwitchComponent from './equipment/SwitchComponent';
import HeatMat from './equipment/HeatMat';
import { useTranslation } from 'react-i18next';

const SHELF_WIDTH = 140;

// Fix 6 — every size here bumped up from the original pass; equipment
// should be comfortably interactive, not squinted at. Microscope gets the
// biggest jump since P4 wants it to dominate the canvas once active.
const EQUIPMENT = {
  ramp_3d: (lifted, sc = 1) => <RampPlank scale={sc} />,
  clamp_stand_3d: (lifted) => <ClampStand size={0.8} isHeld={lifted} />,
  // laid along the ramp like the one in the rig (rotated -90, hook towards the ramp)
  newton_meter_3d: (lifted, sc = 1) => (
    <div style={{ transform: 'rotate(-90deg)' }}>
      <NewtonMeter size={METER_SIZE * sc} reading={0} isHeld={lifted} shadow={false} />
    </div>
  ),
  block_3d: (lifted, sc = 1) => <Block size={RIG_SIZE * sc} isHeld={lifted} shadow={false} />,
  // the P3 pieces, when set up on the stack (sc given), are drawn at the stack's own scale; otherwise at their usual size
  tripod_3d: (lifted, sc) => <Tripod size={sc ? STACK_SIZE.tripod * sc : 1.3} isHeld={lifted} shadow={!sc} />,
  gauze_3d: (lifted, sc) => <Gauze size={sc ? STACK_SIZE.gauze * sc : 1.2} isHeld={lifted} contactShadow shadow={!sc} />,
  evaporating_dish_3d: (lifted, sc) => <EvaporatingDish size={sc ? STACK_SIZE.dish * sc : 1.3} contentState="solution" isHeld={lifted} contactShadow shadow={!sc} />,
  bunsen_burner_3d: (lifted, sc) => <BunsenBurner size={sc ? STACK_SIZE.burner * sc : 1.3} state="off" isHeld={lifted} shadow={!sc} />,
  slide_3d: (lifted, sc, stack) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} isHeld={lifted} shadow={!sc} />,
  slide_3d_sample: (lifted, sc, stack) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} hasSample isHeld={lifted} shadow={!sc} />,
  slide_3d_prepared: (lifted, sc, stack) => <Slide size={stack ? MICRO_SIZE[stack] * sc : 1.3} hasSample hasCoverslip isHeld={lifted} shadow={!sc} />,
  microscope_3d: (lifted, sc) => (sc ? <LabelledMicroscope size={MICRO_SIZE.microscope * sc} isHeld={lifted} /> : <Microscope size={0.85} isHeld={lifted} />),
  battery_3d: (lifted) => <Battery size={1.05} isHeld={lifted} />,
  bulb_3d: (lifted) => <Bulb size={1.05} isHeld={lifted} />,
  switch_3d: (lifted) => <SwitchComponent size={1.05} isHeld={lifted} />,
  ammeter_3d: (lifted) => <NewtonMeter size={0.7} reading={0} unit="A" isHeld={lifted} />,
  heat_mat_3d: (lifted, sc) => <HeatMat size={sc ? STACK_SIZE.mat * sc : 1.3} isHeld={lifted} shadow={!sc} />,
};

// what the left shelf shows for pieces that are too big at bench size
const SHELF = {
  ramp_3d: () => <RampPlank scale={0.45} />,
  newton_meter_3d: (lifted) => <NewtonMeter size={0.4} reading={0} isHeld={lifted} />,
  block_3d: (lifted) => <Block size={0.8} isHeld={lifted} />,
};

const LABELS = {
  heat_mat_3d: 'equip.heat_mat',
  ramp_3d: 'equip.ramp',
  clamp_stand_3d: 'equip.clamp_stand',
  newton_meter_3d: 'equip.newton_meter',
  block_3d: 'equip.block',
  tripod_3d: 'equip.tripod',
  gauze_3d: 'equip.gauze',
  evaporating_dish_3d: 'equip.evaporating_dish',
  bunsen_burner_3d: 'equip.bunsen_burner',
  slide_3d: 'equip.slide',
  slide_3d_sample: 'equip.slide',
  slide_3d_prepared: 'equip.slide',
  microscope_3d: 'equip.microscope',
  battery_3d: 'equip.battery',
  bulb_3d: 'equip.bulb',
  switch_3d: 'equip.switch',
  ammeter_3d: 'equip.ammeter',
};

// Persistent bench background for a checkpoint's drag sub-steps. Renders
// items already placed by earlier sub-steps in THIS checkpoint (inert, 90%
// opacity, at their toZone position) so the bench visibly fills up instead
// of resetting to blank between drag sub-steps — plus a left shelf preview
// of what's still coming. Shares the exact 0-100% coordinate space DragGame
// itself uses for fromZone/toZone, so placed items line up with where the
// active DragGame's target zone will be. DragGame renders on top with a
// transparent background so this shows through underneath it.
export default function DeskScene({ placedItems = [], upcomingIds = [] }) {
  const { t } = useTranslation();
  const rootRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // the scene's pixel size, so pieces that belong to the P2 rig can be put exactly where the rig draws them
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The bench itself is BenchBackground (the same one every practical uses), drawn behind this, so this
  // layer is transparent: only the equipment placed so far, the string and the shelf of what is still to come.
  return (
    // zIndex 0 makes this its own stacking context, so the z-indexes inside stay inside and the microgame (drawn after it) is always on top
    <div ref={rootRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {size.w > 0 &&
        placedItems.map((item) => {
          const Renderer = EQUIPMENT[item.objectId];
          if (!Renderer) return null;
          const L = layoutOf(item.layout);
          const p = item.rig ? rigPoint(item.rig, size.w, size.h) : item.stack ? L.point(item.stack, size.w, size.h) : null;
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: p ? p.x : `${item.x}%`,
                top: p ? p.y : `${item.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.95,
                pointerEvents: 'none',
                zIndex: item.stack ? L.z[item.stack] : item.rig === 'ramp' ? 1 : 2,
              }}
            >
              {Renderer(false, p ? p.sc : item.rig ? 1 : undefined, item.stack)}
            </div>
          );
        })}

      {upcomingIds.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: SHELF_WIDTH,
            background: 'rgba(255,255,255,0.55)',
            borderRight: '2px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            paddingTop: 24,
            zIndex: 4,
          }}
        >
          {upcomingIds.map((id) => {
            const Renderer = SHELF[id] ?? EQUIPMENT[id];
            if (!Renderer) return null;
            return (
              <div key={id} style={{ opacity: 0.7, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {Renderer(false)}
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)' }}>{t(LABELS[id])}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
