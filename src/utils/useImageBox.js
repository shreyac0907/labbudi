import { useLayoutEffect, useState } from 'react';

// Where a full-viewport background image (object-fit: cover | contain) really
// paints on screen, so overlays can be positioned in the artwork's own pixel
// coordinates instead of viewport percentages. A plain "left: 30%" is 30% of
// the *viewport*, which only lines up with the painted artwork at exactly the
// image's own aspect ratio and drifts on every other screen shape.
//
//   const box = useImageBox({ w: 1366, h: 768 });   // cover (default)
//   // box.scale  — screen px per artwork px
//   // box.x(px)  — artwork x -> screen x;  box.y(px) — artwork y -> screen y
export function useImageBox(natural, mode = 'cover') {
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    function update() {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const pick = mode === 'cover' ? Math.max : Math.min;
      const scale = pick(cw / natural.w, ch / natural.h);
      const left = (cw - natural.w * scale) / 2;
      const top = (ch - natural.h * scale) / 2;
      setBox({ scale, left, top, x: (px) => left + px * scale, y: (px) => top + px * scale });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [natural.w, natural.h, mode]);

  return box;
}
