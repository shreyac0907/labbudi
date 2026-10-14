import { useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import CorkFrame from './corkboard/CorkFrame';
import { WashiTape } from './corkboard/WashiTape';
import { StarSticker, Starburst } from './corkboard/Stickers';

const CORK_BG = {
  backgroundImage: 'url(/assets/textures/cork_texture.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#C8935A',
};

// The board sits inset from the page edges so the page's own white
// background shows as a margin around it, like a corkboard mounted on a wall.
const BOARD_INSET = 56;

// Small deterministic PRNG (mulberry32) so ambient decoration is randomised
// once per mount but stable across re-renders — no layout jitter on state
// changes elsewhere on the page.
function seededRandom(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const WASHI_VARIANTS = ['red_gingham', 'blue_dots', 'green_grid', 'pink_stars', 'yellow_plain', 'stripe'];
const EDGE_ZONES = [
  { top: [2, 12], left: [2, 20] },
  { top: [2, 12], left: [78, 96] },
  { top: [85, 95], left: [2, 20] },
  { top: [85, 95], left: [78, 96] },
  { top: [40, 60], left: [1, 6] },
  { top: [40, 60], left: [94, 99] },
];

function useAmbientLayout(seed) {
  return useMemo(() => {
    const rand = seededRandom(seed);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const between = ([min, max]) => min + rand() * (max - min);

    const washiCount = 3 + Math.floor(rand() * 3); // 3-5
    const washis = Array.from({ length: washiCount }, (_, i) => {
      const zone = EDGE_ZONES[i % EDGE_ZONES.length];
      return {
        key: `washi-${i}`,
        variant: pick(WASHI_VARIANTS),
        top: between(zone.top),
        left: between(zone.left),
        rotate: between([-15, 15]),
      };
    });

    const starCount = 4 + Math.floor(rand() * 3); // 4-6
    const stars = Array.from({ length: starCount }, (_, i) => ({
      key: `star-${i}`,
      color: rand() > 0.5 ? 'teal' : 'pink',
      top: between([3, 95]),
      left: rand() > 0.5 ? between([1, 8]) : between([90, 98]),
      size: 22 + rand() * 14,
    }));

    const burstCount = 1 + Math.floor(rand() * 2); // 1-2
    const bursts = Array.from({ length: burstCount }, (_, i) => ({
      key: `burst-${i}`,
      top: i === 0 ? between([2, 8]) : between([88, 95]),
      left: i === 0 ? between([88, 95]) : between([2, 8]),
      size: 40 + rand() * 20,
    }));

    return { washis, stars, bursts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
}

export default function CorkBoard({ children, ambientDeco = true, seed = 1 }) {
  const boardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const parallaxX = useTransform(mx, [-1, 1], [8, -8]);
  const parallaxY = useTransform(my, [-1, 1], [8, -8]);

  const { washis, stars, bursts } = useAmbientLayout(seed);

  function handleMouseMove(e) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mx.set((e.clientX / w) * 2 - 1);
    my.set((e.clientY / h) * 2 - 1);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fff' }}>
      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        style={{
          position: 'absolute',
          inset: BOARD_INSET,
          overflow: 'hidden',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: -12,
            zIndex: 0,
            x: parallaxX,
            y: parallaxY,
            ...CORK_BG,
          }}
        />

        <CorkFrame />

        {ambientDeco && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            {washis.map((w) => (
              <div key={w.key} style={{ position: 'absolute', top: `${w.top}%`, left: `${w.left}%` }}>
                <WashiTape variant={w.variant} rotate={w.rotate} width={150} />
              </div>
            ))}
            {stars.map((s) => (
              <div key={s.key} style={{ position: 'absolute', top: `${s.top}%`, left: `${s.left}%`, opacity: 0.85 }}>
                <StarSticker color={s.color} size={s.size} />
              </div>
            ))}
            {bursts.map((b) => (
              <div key={b.key} style={{ position: 'absolute', top: `${b.top}%`, left: `${b.left}%`, opacity: 0.5 }}>
                <Starburst width={b.size} color="#DBA870" wobble={false} />
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>{children}</div>
      </div>
    </div>
  );
}
