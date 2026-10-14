import { motion, useReducedMotion } from 'framer-motion';

// Lightweight screen-to-screen transition used *within* a single practical
// (JourneyScreen's internal screenIndex, not a route change) — the corkboard
// background stays fixed, only the content cluster slides and fades.
const PAN_TRANSITION = { duration: 0.3, ease: 'easeInOut' };

export default function PanTransition({ screenKey, direction = 'forward', children, style }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        key={screenKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  const offset = direction === 'back' ? -40 : 40;

  return (
    <motion.div
      key={screenKey}
      initial={{ x: offset, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -offset, opacity: 0 }}
      transition={PAN_TRANSITION}
      style={style}
    >
      {children}
    </motion.div>
  );
}
