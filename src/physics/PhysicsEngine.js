import Matter from 'matter-js';

// A single, module-level Matter.js engine shared by every microgame that
// wants real physics — it's created once at module load and persists for
// the life of the tab (React StrictMode's double-invoke aside, the module
// itself only ever runs once). We never use Matter's own renderer; the
// engine only does the maths, and React/SVG draws whatever it says.
const MAX_BODIES = 60; // hard cap — see _enforcePool

// < 4 logical cores is treated as "low-end" throughout the physics layer
// (steam/fragment/splash particle counts halve accordingly in each
// consumer). Guarded for SSR/older browsers where the property is absent.
export const isLowEndDevice =
  typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0
    ? navigator.hardwareConcurrency < 4
    : false;

class PhysicsEngineSingleton {
  constructor() {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.2 }, // slightly stronger than Matter's default 1.0 — objects read as more substantial
      enableSleeping: true, // settled bodies (a landed drop, a rested crystal fragment) stop costing CPU
    });
    this.runner = Matter.Runner.create();
    this.running = false;
    this.bodies = new Map(); // id -> body, Map preserves insertion order for pool eviction
  }

  start() {
    if (this.running) return;
    this.running = true;
    Matter.Runner.run(this.runner, this.engine);
  }

  // Never called automatically between microgame steps — bodies are owned
  // and cleaned up individually by whichever usePhysicsBody() unmounts,
  // so the shared world just naturally empties out rather than needing a
  // hard reset that would also wipe any body a sibling step still owns.
  stop() {
    if (!this.running) return;
    Matter.Runner.stop(this.runner);
    this.running = false;
  }

  addBody(id, body, { pooled = false } = {}) {
    Matter.World.add(this.engine.world, body);
    this.bodies.set(id, body);
    if (pooled) this._enforcePool();
    this.start();
    return body;
  }

  removeBody(id) {
    const body = this.bodies.get(id);
    if (!body) return;
    Matter.World.remove(this.engine.world, body);
    this.bodies.delete(id);
  }

  // Oldest-first eviction once the shared world exceeds MAX_BODIES —
  // relevant to pooled particle systems (steam, fragments, splashes),
  // never to the small fixed set of "real equipment" bodies (ramp, block).
  _enforcePool() {
    while (this.bodies.size > MAX_BODIES) {
      const oldestId = this.bodies.keys().next().value;
      this.removeBody(oldestId);
    }
  }

  applyForce(id, position, force) {
    const body = this.bodies.get(id);
    if (body) Matter.Body.applyForce(body, position, force);
  }

  getPosition(id) {
    const body = this.bodies.get(id);
    return body ? { x: body.position.x, y: body.position.y, angle: body.angle } : null;
  }

  // Returns an unsubscribe function, matching every other event-listener
  // convention already used across the codebase (InputManager etc.).
  onCollision(callback) {
    Matter.Events.on(this.engine, 'collisionStart', callback);
    return () => Matter.Events.off(this.engine, 'collisionStart', callback);
  }

  reset() {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    this.bodies.clear();
  }
}

const PhysicsEngine = new PhysicsEngineSingleton();

export default PhysicsEngine;
export { Matter };
