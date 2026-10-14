// Shared colour math and layer primitives for the 3D-style equipment
// system. Every equipment component in this directory builds its surfaces
// out of the same five layers so the whole set reads as one consistent
// physical world:
//
//   1. Base shape      — the object's silhouette in its base colour
//   2. Shadow face      — left/bottom edges, ~20% darker (light from top-right)
//   3. Highlight face   — top/right edges, ~25% lighter
//   4. Specular highlight — a small bright dot at the "shiniest" point
//   5. Ambient shadow   — a soft dark ellipse cast on the surface below
//
// Material-specific treatments (glass, chrome, rubber, ceramic, wood) each
// layer these differently — see the exported helpers below — but every
// equipment piece is built from this same vocabulary.

export function mixHex(hex, amt) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (num & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

export function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Layer 2/3 helpers — darker/lighter shades of a base colour for the
// shadow and highlight faces.
export function shadowShade(hex) {
  return mixHex(hex, -Math.round(255 * 0.2));
}
export function highlightShade(hex) {
  return mixHex(hex, Math.round(255 * 0.25));
}

// Chrome/metal palette is fixed regardless of the object's own colour —
// it's a material, not a tint.
export const CHROME = {
  base: '#7A7A7A',
  shadow: '#3A3A3A',
  highlight: '#C8C8C8',
};

// Layer 5 — the cast shadow on the surface beneath an object: an ellipse
// offset down-and-right of the object (light source is top-right, so the
// shadow falls away from it), softly blurred, at a flat rgba(0,0,0,0.18).
// Grows, softens, and drifts further when the object is lifted, per the
// interaction depth cues: this is what makes something read as "picked
// up" vs "resting."
//
// Pass contactShadow when this object rests directly on TOP of another
// object rather than the bench (gauze on a tripod ring, a dish on gauze)
// — that shadow is smaller, tighter, and softer than one cast across an
// open gap onto the bench itself.
export function AmbientShadow({ width = 60, isHeld = false, offsetX = 6, offsetY = 8, contactShadow = false }) {
  const rx = contactShadow ? width * 0.34 : isHeld ? width * 0.5 : width * 0.42;
  const ry = contactShadow ? width * 0.08 : isHeld ? width * 0.15 : width * 0.12;
  const blur = contactShadow ? 2 : isHeld ? 6 : 4;
  const opacity = contactShadow ? 0.14 : 0.18;
  return (
    <ellipse
      cx={width / 2 + (isHeld ? offsetX * 1.8 : offsetX)}
      cy={isHeld ? offsetY * 1.5 : offsetY}
      rx={rx}
      ry={ry}
      fill={`rgba(0,0,0,${opacity})`}
      style={{ transition: 'all 0.2s ease-out', filter: `blur(${blur}px)` }}
    />
  );
}

// Layer 4 — a small bright specular dot, typically top-right of a curved
// surface. Metal and glossy plastics get one; rubber and ceramic don't
// (they're matte).
export function Specular({ cx, cy, r = 3.5, opacity = 0.65 }) {
  return <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="#fff" opacity={opacity} />;
}

// The interior highlight strip used on every glass surface: a vertical
// sheen, tilted ~10° off vertical, fading from a soft white gleam at the
// top to nothing at the bottom. The light source is top-right, so every
// caller draws this strip in the right third of the glass shape it's
// filling (not the left) — this gradient just supplies the fade.
export function glassSheenGradient(id) {
  return (
    <linearGradient id={id} x1="20%" y1="0%" x2="27%" y2="100%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
      <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
    </linearGradient>
  );
}

export function woodGrainPaths(x, y, w, curve = 6) {
  // 3 gently curved grain lines across a wood surface, low-opacity.
  return [0.25, 0.5, 0.75].map((f) => {
    const gy = y + w * f;
    return `M${x},${gy} Q${x + (w * 0.5)},${gy - curve} ${x + w},${gy}`;
  });
}
