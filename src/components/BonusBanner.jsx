import { motion, AnimatePresence } from 'framer-motion';

// One shared "surprise bonus" banner — a Cooking-Mama-style flash used by
// every random bonus moment (Lucky Drop, Perfect Angle, Blue Flame, Sharp
// Focus, Clean Circuit). Purely presentational: the caller decides *when*
// to show it and *what* score to add elsewhere (this component has no
// GameState access of its own, same reasoning as ZoneTimingBar).
export default function BonusBanner({ active, text, points, color = '#FFD700' }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: -10 }}
          animate={{ opacity: 1, scale: [0.6, 1.15, 1], y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            top: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              background: color,
              color: '#3A2A00',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 20,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 16px ${color}88`,
            }}
          >
            {text}
          </div>
          {points ? (
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: '#E8A020', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
              +{points}
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
