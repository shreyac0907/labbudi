import { motion } from 'framer-motion';

// Cooking-Mama-style instruction banner: a rounded bar sized to its text that drops
// in from above with a spring bounce every time the instruction changes. It wraps
// onto a second line rather than growing under the Back / score corners.
const GRADIENTS = {
  chemistry: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
  physics: 'linear-gradient(90deg, #5B6FE0 0%, #4FBFA8 100%)',
  biology: 'linear-gradient(90deg, #4FBFA8 0%, #7AB648 100%)',
};

export default function RibbonBanner({ subject = 'chemistry', main, sub, hint, stepKey }) {
  const gradient = GRADIENTS[subject] ?? GRADIENTS.chemistry;

  return (
    <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 210, pointerEvents: 'none' }}>
      <motion.div
        key={stepKey}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          position: 'relative',
          background: gradient,
          borderRadius: 28,
          // as wide as the instruction needs, never under the Back / score corners
          width: 'fit-content',
          maxWidth: 'calc(100% - 440px)',
          padding: '14px 40px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* white sticker outline */}
        <div style={{ position: 'absolute', inset: 3, borderRadius: 25, border: '3px solid rgba(255,255,255,0.8)', pointerEvents: 'none' }} />

        <motion.div
          key={`${stepKey}-text`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 0.05 }}
          style={{ textAlign: 'center', boxSizing: 'border-box' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: sub ? 22 : 20,
              lineHeight: 1.3,
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {main}
          </div>
          {sub && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: 1.35,
                color: 'rgba(255,255,255,0.85)',
                marginTop: 2,
                textShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}
            >
              {sub}
            </div>
          )}
          {hint && (
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: '#fff', marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.45)', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
              {hint}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
