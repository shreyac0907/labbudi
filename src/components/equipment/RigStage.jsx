import { useRef, useState, useLayoutEffect } from 'react';
import { rigGeometry, rigViewBox } from './rampSetup';

// Fills the step's canvas and tells its children where the P2 rig is: `viewBox` maps the canvas onto rig
// units with the ramp's hinge at (0,0), and `sc` is the screen pixels per rig unit. `angleDeg` is the
// angle the step measures, which sets the scale (the same value the setup steps use at 0°).
export default function RigStage({ angleDeg = 0, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = size.w > 0 && size.h > 0;
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {ready && children({ viewBox: rigViewBox(size.w, size.h, angleDeg), ...rigGeometry(size.w, size.h, angleDeg), w: size.w, h: size.h })}
    </div>
  );
}
