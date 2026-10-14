// Where the P3 apparatus sits on the bench, in one place, so the setup steps (mat, burner, tripod, gauze,
// dish) put each piece exactly where it belongs relative to the others: the burner on the mat, the tripod
// straddling it, the gauze on the tripod's ring, the dish on the gauze. Everything is the stack's own
// geometry worked out in canvas pixels for any canvas size. `sc` is the screen pixels per burner unit; each
// piece is drawn at STACK_SIZE[kind] * sc.
export const STACK_SIZE = { mat: 1.25, burner: 1, tripod: 1.41, gauze: 2, dish: 1.3 };
export const STACK_Z = { mat: 1, tripod: 2, burner: 3, gauze: 4, dish: 5 }; // the tripod's rear leg goes behind the burner
// how big a piece's dashed drop target is, in burner units (w, h)
export const STACK_FOOT = { mat: [195, 62], burner: [78, 196], tripod: [150, 190], gauze: [136, 62], dish: [96, 56] };

const FLOOR = 0.8; // the mat's surface sits this far down the canvas (the bench's front edge is below it)
const STACK_UNITS = 205; // how tall the whole stack is, in burner units

export function stackGeometry(w, h) {
  const sc = Math.min((0.72 * h) / STACK_UNITS, 0.2 * w);
  const x0 = w / 2;
  const yMat = FLOOR * h; // the middle of the mat's top surface
  const kt = STACK_SIZE.tripod * sc;
  const ring = yMat - 114 * kt; // the tripod's ring (feet are at yMat)
  return { sc, x0, yMat, ring };
}

// centre of each piece, in canvas pixels, and the burner-unit scale
export function stackPoint(kind, w, h) {
  const { sc, x0, yMat, ring } = stackGeometry(w, h);
  const sm = STACK_SIZE.mat * sc;
  const kt = STACK_SIZE.tripod * sc;
  const gs = STACK_SIZE.gauze * sc;
  const ds = STACK_SIZE.dish * sc;
  const y = {
    mat: yMat + 5 * sm, // the mat's box is 140 x 40 and its top surface is the ellipse at y = 15
    burner: yMat - 55 * sc, // the burner's base is at y = 150 of its 190-high box
    tripod: yMat - 60 * kt, // the feet are at y = 128 of its 136-high box
    gauze: ring + 5 * gs, // the gauze's ellipse is at y = 10.9 of its 31.8-high box
    dish: ring + 2 * sc - 0.7 * ds, // the dish's rim bottoms out at y = 18.7 of its 36-high box
  }[kind];
  return { x: x0, y, sc };
}
