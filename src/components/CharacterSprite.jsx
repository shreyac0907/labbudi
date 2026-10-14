import { ASSETS } from '../config/assets';

// A character that can swap between its idle pose and its wiggle ("YAY!") pose
// without the body jumping. The wiggle PNGs are drawn on different canvases, so each
// one is registered onto its idle sprite by an offset (dx, dy, in the idle sprite's
// own pixels, same scale) found by template matching.
const SPRITES = {
  lili: { idle: [840, 585], wiggle: [832, 559], dx: -18, dy: 0 },
  madu: { idle: [682, 723], wiggle: [759, 712], dx: -42, dy: 0 },
  lumi: { idle: [740, 449], wiggle: [829, 491], dx: -24, dy: -24 },
  pip: { idle: [695, 535], wiggle: [686, 476], dx: 30, dy: 36 },
};

export default function CharacterSprite({ name, height = 120, wiggle = false, pose = 'idle', style, alt = '' }) {
  const sp = SPRITES[name];
  const art = ASSETS.characters[name];
  if (!sp || !art) return null;
  // a fixed pose (e.g. 'speaking' for the guide) is drawn as-is, at its own proportions
  if (pose !== 'idle' && art[pose]) {
    // capped by the width of its container as well, so it can never spill past it
    return <img src={art[pose]} alt={alt} draggable={false} style={{ display: 'block', width: 'auto', height: 'auto', maxHeight: height, maxWidth: '100%', pointerEvents: 'none', ...style }} />;
  }
  const [iw, ih] = sp.idle;
  const [ww, wh] = sp.wiggle;
  return (
    <div style={{ position: 'relative', width: (height * iw) / ih, height, pointerEvents: 'none', ...style }}>
      <img src={art.idle} alt={alt} draggable={false} style={{ display: 'block', width: '100%', height: '100%', opacity: wiggle ? 0 : 1 }} />
      <img
        src={art.wiggle}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: `${(sp.dx / iw) * 100}%`,
          top: `${(sp.dy / ih) * 100}%`,
          width: `${(ww / iw) * 100}%`,
          height: `${(wh / ih) * 100}%`,
          opacity: wiggle ? 1 : 0,
        }}
      />
    </div>
  );
}
