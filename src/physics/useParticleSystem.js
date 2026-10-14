import { useState, useRef, useCallback, useEffect } from 'react';
import PhysicsEngine, { Matter } from './PhysicsEngine';

let particleIdCounter = 0;

// A pool of short-lived Matter.js bodies (steam, splash droplets, crystal
// fragments) whose live x/y/angle sync into React state for rendering —
// unlike usePhysicsBody (one stable body per call), this manages an
// array that grows and shrinks over a component's lifetime. Every body
// added is `pooled: true`, so PhysicsEngine's own 60-body cap evicts the
// oldest automatically if a caller forgets to despawn.
export default function useParticleSystem() {
  const [particles, setParticles] = useState([]); // [{id, x, y, angle, birth, ...meta}]
  const bodiesRef = useRef(new Map()); // id -> body

  useEffect(() => {
    let rafId;
    let frame = 0;
    function loop() {
      frame += 1;
      if (frame % 2 === 0 && bodiesRef.current.size > 0) {
        setParticles((prev) =>
          prev.map((p) => {
            const b = bodiesRef.current.get(p.id);
            return b ? { ...p, x: b.position.x, y: b.position.y, angle: b.angle } : p;
          }),
        );
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const spawn = useCallback((createBody, meta = {}) => {
    const id = `particle-${particleIdCounter++}`;
    const body = createBody(Matter);
    bodiesRef.current.set(id, body);
    PhysicsEngine.addBody(id, body, { pooled: true });
    setParticles((prev) => [...prev, { id, x: body.position.x, y: body.position.y, angle: body.angle, birth: Date.now(), ...meta }]);
    return id;
  }, []);

  const despawn = useCallback((id) => {
    if (!bodiesRef.current.has(id)) return;
    bodiesRef.current.delete(id);
    PhysicsEngine.removeBody(id);
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const despawnAll = useCallback(() => {
    for (const id of bodiesRef.current.keys()) PhysicsEngine.removeBody(id);
    bodiesRef.current.clear();
    setParticles([]);
  }, []);

  useEffect(() => despawnAll, [despawnAll]);

  return { particles, spawn, despawn, despawnAll };
}
