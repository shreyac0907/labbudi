import { motion, useReducedMotion } from 'framer-motion';

// Camera-zoom transition between Corkboard-family routes (Home / YearSelect /
// CorkboardPage / JourneyScreen). The exiting page scales up toward the
// clicked card (as if the camera is pushing in through it); the entering
// page settles from the same zoomed-in point back to scale 1. Reversible via
// `direction` so back-navigation zooms back out instead of back in.
const ZOOM_SPRING = { type: 'spring', stiffness: 80, damping: 20 };

export default function CorkZoomTransition({ children, direction = 'forward', origin = '50% 50%' }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div
        className="curl-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    );
  }

  const enterScale = direction === 'forward' ? 0.4 : 2.5;
  const exitScale = direction === 'forward' ? 2.5 : 0.4;

  return (
    <motion.div
      className="curl-page"
      style={{ transformOrigin: origin }}
      initial={{ scale: enterScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: ZOOM_SPRING }}
      exit={{ scale: exitScale, opacity: 0, transition: ZOOM_SPRING }}
    >
      {children}
    </motion.div>
  );
}
