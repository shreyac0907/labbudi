// Where the P2 rig (ramp, block, Newton meter) sits on the bench, in one place, so the setup steps
// (place the ramp, place the block, attach the meter) put each piece exactly where the angle and pull
// steps later draw it. The rig is drawn straight onto the step's whole canvas: the hinge is at the
// bottom left of the ramp, one rig unit is `sc` screen pixels, and `sc` depends only on the canvas and
// on the angle the checkpoint measures (a steep ramp needs more height, so it is drawn a little smaller).
// Everything here is that geometry worked out in canvas pixels for any canvas size.
export const PLANK_L = 240;
export const PLANK_TK = 20;
export const RIG_SIZE = 1.05; // the size the block is drawn at inside RampRig
export const METER_SIZE = 0.62; // the Newton meter's size inside RampRig (it is held beside the ramp, not as long as it)
export const BLOCK_T = 0.06; // how far along the plank the block starts (0 = at the hinge end)
export const STRING_L = 165; // hook-to-hook length of the string, in rig units
export const SLACK = 0.86; // while nobody is pulling, the hooks are this fraction of STRING_L apart and the string sags

const MARGIN_X = 0.03; // fraction of the canvas left free on each side
const FLOOR = 0.82; // the hinge sits this far down the canvas (the pull bar and the bench's front edge are below it)
const TOP_ROOM = 0.02; // fraction of the canvas kept free above the highest point of the rig
const REACH_L = 30; // rig units to the left of the hinge that must stay on screen
const REACH_R = 570; // ...and to the right (the meter, with the block pulled to the top)
const REACH_UP = 70; // rig units above the plank at 0° (the meter body)
const REACH_ALONG = 550; // how far along the ramp the meter's far end gets when the block is at the top

// the block's bottom-centre contact point is (26,56) in its 68x56 box; its hook is (42,-3), its centre (34,28)
const BLOCK_CONTACT = { x: 26, y: 56 };
const BLOCK_HOOK = { x: 42, y: -3 };
const BLOCK_CENTRE = { x: 34, y: 28 };
// the meter is drawn rotated -90: local (x,y) -> (y,-x). Its hook is (45,12) in its 90x300 box, its centre (45,150)
const METER_HOOK = { x: 45, y: 12 };

// x of the block's contact point along the plank (rig units from the hinge) for a given blockT (0-1)
export const blockX = (blockT) => 40 + blockT * (PLANK_L - 90);

// positions of the block's hook and the meter (anchor = where the rotated meter's box origin sits), in rig units
// relative to the hinge, for the ramp laid flat. `blockT` 0-1; `taut` 0 (slack) to 1 (pulled tight).
export function rigLayout(blockT = BLOCK_T, taut = 0) {
  const bx = blockX(blockT);
  const blockTranslate = { x: bx - BLOCK_CONTACT.x * RIG_SIZE, y: -PLANK_TK - BLOCK_CONTACT.y * RIG_SIZE };
  const blockHook = { x: blockTranslate.x + BLOCK_HOOK.x * RIG_SIZE, y: blockTranslate.y + BLOCK_HOOK.y * RIG_SIZE };
  // the meter is held so its hook is level with the block's hook: the string runs parallel to the ramp
  const hookDist = STRING_L * (SLACK + (1 - SLACK) * taut);
  const meterHook = { x: blockHook.x + hookDist, y: blockHook.y };
  const meterAnchor = { x: meterHook.x - METER_HOOK.y * METER_SIZE, y: meterHook.y + METER_HOOK.x * METER_SIZE };
  return { blockTranslate, blockHook, meterHook, meterAnchor };
}

// how big a piece's dashed drop target is, in rig units
export const RIG_FOOTPRINT = {
  ramp: { w: PLANK_L + 24, h: PLANK_TK + 24 },
  block: { w: 68 * RIG_SIZE + 10, h: 56 * RIG_SIZE + 10 },
  meter: { w: 300 * METER_SIZE + 10, h: 90 * METER_SIZE + 10 },
};

// the angle (degrees) the rig is drawn for sets its scale
export function rigGeometry(w, h, angleDeg = 0) {
  const s = Math.sin((Math.max(0, Math.min(90, angleDeg)) * Math.PI) / 180);
  const up = REACH_UP + REACH_ALONG * s;
  const sc = Math.min(((1 - 2 * MARGIN_X) * w) / (REACH_L + REACH_R), ((FLOOR - TOP_ROOM) * h) / (up + 10));
  const hingeX = MARGIN_X * w + ((1 - 2 * MARGIN_X) * w - (REACH_L + REACH_R) * sc) / 2 + REACH_L * sc;
  const hingeY = FLOOR * h - 8 * sc;
  return { sc, hingeX, hingeY };
}

// an SVG viewBox, in rig units, that makes a w x h canvas show the rig exactly as rigGeometry places it
export function rigViewBox(w, h, angleDeg = 0) {
  const { sc, hingeX, hingeY } = rigGeometry(w, h, angleDeg);
  return `${-hingeX / sc} ${-hingeY / sc} ${w / sc} ${h / sc}`;
}

// centre of each piece ('ramp' | 'block' | 'meter') laid flat, in canvas pixels, and the scale one rig unit has on screen
export function rigPoint(kind, w, h, angleDeg = 0) {
  const { sc, hingeX, hingeY } = rigGeometry(w, h, angleDeg);
  const lay = rigLayout();
  const o = {
    ramp: { x: PLANK_L / 2, y: -PLANK_TK / 2 },
    block: { x: lay.blockTranslate.x + BLOCK_CENTRE.x * RIG_SIZE, y: lay.blockTranslate.y + BLOCK_CENTRE.y * RIG_SIZE },
    // rotated -90, the meter's 90x300 box centre lands (150, -45) * size from its anchor
    meter: { x: lay.meterAnchor.x + 150 * METER_SIZE, y: lay.meterAnchor.y - 45 * METER_SIZE },
  }[kind];
  return { x: hingeX + o.x * sc, y: hingeY + o.y * sc, sc };
}
