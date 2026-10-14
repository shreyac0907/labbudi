import { useRef, useEffect, useState } from 'react';
import PhysicsEngine, { Matter } from './PhysicsEngine';

let bodyIdCounter = 0;

// Creates one Matter.js body, syncs its live x/y/angle into React state
// for use in a CSS transform, and removes it from the shared world on
// unmount. Position updates are read every OTHER animation frame (Matter
// itself still steps every frame at full fidelity via PhysicsEngine's own
// Runner) — halves React re-renders, visually indistinguishable.
//
// `create(Matter)` returns the body itself (so callers can use any
// Matter.Bodies.* constructor/options freely). `deps` re-creates the body
// when they change (e.g. a ramp body whose angle prop changes identity is
// usually better handled via Matter.Body.setAngle on the SAME body — see
// the `body` ref returned below — but `deps` is there for cases that
// genuinely need a fresh body).
export default function usePhysicsBody({ create, pooled = false, active = true, deps = [] }) {
  const idRef = useRef(null);
  const bodyRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0, angle: 0 });

  useEffect(() => {
    if (!active) return undefined;
    const id = `body-${bodyIdCounter++}`;
    const body = create(Matter);
    idRef.current = id;
    bodyRef.current = body;
    PhysicsEngine.addBody(id, body, { pooled });
    setPosition({ x: body.position.x, y: body.position.y, angle: body.angle });

    let rafId;
    let frameCount = 0;
    function loop() {
      frameCount += 1;
      if (frameCount % 2 === 0 && bodyRef.current) {
        const b = bodyRef.current;
        setPosition({ x: b.position.x, y: b.position.y, angle: b.angle });
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      PhysicsEngine.removeBody(id);
      bodyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);

  return { position, body: bodyRef, id: idRef };
}
