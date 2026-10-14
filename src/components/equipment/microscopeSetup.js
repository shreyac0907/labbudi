// Where the P4 microscope work sits on the bench, in one place, so the setup steps (slide on the bench, microscope,
// slide on the stage) put each piece exactly where it belongs and big enough to see. Same idea as bunsenSetup:
// `sc` is the screen pixels per microscope unit and every piece is drawn at MICRO_SIZE[kind] * sc.
export const MICRO_SIZE = { microscope: 1, slide: 0.72, slide_bench: 1.25 };
export const MICRO_Z = { microscope: 1, slide: 2, slide_bench: 1 };
// how big a piece's dashed drop target is, in microscope units (w, h)
export const MICRO_FOOT = { microscope: [110, 154], slide: [50, 28], slide_bench: [82, 40] };

const FOOT = 0.9; // the microscope's foot sits this far down the canvas (the bench's front edge is below it)
const UNITS = 146; // the microscope's height, in its own units

export function microGeometry(w, h) {
  const sc = Math.min((0.9 * h) / UNITS, 0.36 * w * (1 / 92));
  return { sc, x0: w / 2, yBase: FOOT * h };
}

// centre of each piece, in canvas pixels, and the microscope-unit scale
export function microPoint(kind, w, h) {
  const { sc, x0, yBase } = microGeometry(w, h);
  const s = MICRO_SIZE.slide * sc; // a slide lying on the stage: 60 x 20 units at size s, in a 60 x 30 box
  const y = {
    microscope: yBase - 57 * sc, // the foot is at y = 130 of its 146-high box
    slide: yBase - 30 * sc - 5 * s, // the stage top is at y = 100; the slide's bottom edge rests on it
    slide_bench: h * 0.62,
  }[kind];
  return { x: x0, y, sc };
}
