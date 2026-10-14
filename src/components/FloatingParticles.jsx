import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Ambient dust-mote / pollen / firefly layer reused across Home, Year
// Select, and the Overworld map — ornamental only (pointer-events: none),
// sits above a background image without ever touching it. Each particle's
// random start position, size, colour, duration and shape are chosen once
// per mount (useMemo) so they don't jump around on re-render.
function FourPetalFlower({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ display: 'block' }}>
      {[0, 90, 180, 270].map((angle) => (
        <ellipse key={angle} cx="0" cy="-5" rx="2.6" ry="4.6" fill={color} transform={`rotate(${angle})`} />
      ))}
      <circle cx="0" cy="0" r="2" fill={color} opacity={0.8} />
    </svg>
  );
}

export default function FloatingParticles({
  count = 8,
  sizeMin = 6,
  sizeMax = 14,
  colors = ['#FFD166', '#FF8FAB', '#4FBFA8', '#7AB648'],
  opacityMin = 0.4,
  opacityMax = 0.7,
  durationMin = 8,
  durationMax = 14,
  staggerDelay = 1.5,
  yRangeVh = [20, 80],
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = sizeMin + Math.random() * (sizeMax - sizeMin);
        const peakOpacity = opacityMin + Math.random() * (opacityMax - opacityMin);
        const scaleFactor = peakOpacity / 0.7;
        return {
          id: i,
          size,
          color: colors[i % colors.length],
          isFlower: i % 2 === 1,
          startX: Math.random() * 100, // vw
          startY: yRangeVh[0] + Math.random() * (yRangeVh[1] - yRangeVh[0]), // vh
          duration: durationMin + Math.random() * (durationMax - durationMin),
          delay: i * staggerDelay,
          opacitySteps: [0, 0.6 * scaleFactor, 0.4 * scaleFactor, 0.7 * scaleFactor, 0],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.startX}vw`, y: `${p.startY}vh`, opacity: 0 }}
          animate={{
            x: [`${p.startX}vw`, `${p.startX + 20}vw`, `${p.startX - 10}vw`, `${p.startX + 30}vw`, `${p.startX}vw`],
            y: [`${p.startY}vh`, `${p.startY - 8}vh`, `${p.startY - 2}vh`, `${p.startY - 11}vh`, `${p.startY}vh`],
            opacity: p.opacitySteps,
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {p.isFlower ? (
            <FourPetalFlower size={p.size} color={p.color} />
          ) : (
            <div style={{ width: p.size, height: p.size, borderRadius: '50%', background: p.color }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
