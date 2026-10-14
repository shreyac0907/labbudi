import { useEffect, useRef } from 'react';
import AssetImage from './AssetImage';

export default function CharacterFloat({ src, size = 140, speed = 1.8, children }) {
  const elRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    pos.current = {
      x: Math.random() * Math.max(vw - size, 0),
      y: Math.random() * Math.max(vh - size, 0),
    };
    const angle = Math.random() * Math.PI * 2;
    vel.current = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };

    function bounce(axis) {
      vel.current[axis] *= -1;
      const currentAngle = Math.atan2(vel.current.y, vel.current.x);
      const offset = (Math.random() * 30 - 15) * (Math.PI / 180);
      const newAngle = currentAngle + offset;
      const mag = Math.hypot(vel.current.x, vel.current.y);
      vel.current.x = Math.cos(newAngle) * mag;
      vel.current.y = Math.sin(newAngle) * mag;
    }

    function tick() {
      const vw2 = window.innerWidth;
      const vh2 = window.innerHeight;
      let { x, y } = pos.current;
      x += vel.current.x;
      y += vel.current.y;

      if (x <= 0) {
        x = 0;
        bounce('x');
      } else if (x >= vw2 - size) {
        x = vw2 - size;
        bounce('x');
      }

      if (y <= 0) {
        y = 0;
        bounce('y');
      } else if (y >= vh2 - size) {
        y = vh2 - size;
        bounce('y');
      }

      pos.current = { x, y };
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, speed]);

  return (
    <div
      ref={elRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        zIndex: 10,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      {children ?? <AssetImage src={src} width={size} height={size} />}
    </div>
  );
}
