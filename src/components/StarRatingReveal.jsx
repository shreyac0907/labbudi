import { motion } from 'framer-motion';

const MEDAL_FILLED = { gold: 3, silver: 2, bronze: 1, none: 0 };

function Star({ filled, size, rotateFrom, delay, big }) {
  const scale = big ? 1.2 : 1;
  return (
    <motion.div
      initial={{ y: 200, rotate: rotateFrom, opacity: 0 }}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 18, delay }}
      style={{ position: 'relative' }}
    >
      <motion.span
        initial={{ filter: 'brightness(1)' }}
        animate={{ filter: filled ? ['brightness(1)', 'brightness(1.8)', 'brightness(1)'] : 'grayscale(1)' }}
        transition={{ duration: 0.35, delay: delay + 0.25 }}
        style={{ display: 'block', fontSize: size * scale * 0.9, lineHeight: 1, opacity: filled ? 1 : 0.35 }}
        aria-hidden="true"
      >
        ⭐
      </motion.span>
    </motion.div>
  );
}

// 3-star drop-in, Cooking-Mama-style — used on checkpoint completion.
export default function StarRatingReveal({ medal = 'gold', size = 64 }) {
  const filled = MEDAL_FILLED[medal] ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <Star filled={filled >= 1} size={size} rotateFrom={-20} delay={0} />
        <Star filled={filled >= 2} size={size} rotateFrom={0} delay={0.25} big />
        <Star filled={filled >= 3} size={size} rotateFrom={20} delay={0.5} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: '#2D2D2D' }}
      >
        {filled}/3
      </motion.div>
    </div>
  );
}
