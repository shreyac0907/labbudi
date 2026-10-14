import { motion } from 'framer-motion';

// Wrap any post-it/notecard with this so it drops onto the board on mount.
// Pass `delay` (e.g. index * 0.08) to stagger a cluster of cards.
export function PinDrop({ children, delay = 0, rotate = 0, style }) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0, rotate: rotate >= 0 ? rotate + 5 : rotate - 5 }}
      animate={{ y: 0, opacity: 1, rotate }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
