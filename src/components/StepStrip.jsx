import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';


// Bottom step strip: every step in the current checkpoint is a flower (the painted
// flower heads from the home illustration), connected by a dashed stem that fills in
// as steps are completed. Done flowers are full colour with a tick, the active one is
// larger and sways, and upcoming ones are faded grey buds.
const FLOWERS = ['sun_l', 'pink_l', 'orange', 'pink_r', 'sun_r'].map((n) => `/assets/ui/home/${n}.png`);

export default function StepStrip({ subject = 'chemistry', subjectColor = '#5B6FE0', subSteps = [], onSelect }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        zIndex: 210,
        overflow: 'hidden',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}
    >
      <AnimatePresence initial={false}>
        {subSteps.map((sub, i) => (
          <StepCard key={sub.id} sub={sub} index={i} isLast={i === subSteps.length - 1} subjectColor={subjectColor} onSelect={onSelect} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function StepCard({ sub, index, isLast, subjectColor, onSelect }) {
  const { t } = useTranslation();
  const clickable = !!onSelect && sub.status !== 'active' && sub.reachable;
  const active = sub.status === 'active';
  const completed = sub.status === 'completed';
  const size = active ? 66 : 54;
  const flower = FLOWERS[index % FLOWERS.length];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 24, delay: index * 0.06 }}
        style={{ position: 'relative' }}
      >
        <motion.div
          role={clickable ? 'button' : undefined}
          aria-label={clickable ? t('game.go_to_step', { n: index + 1 }) : undefined}
          tabIndex={clickable ? 0 : undefined}
          onClick={clickable ? () => onSelect(index) : undefined}
          onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect(index) : undefined}
          whileHover={clickable ? { scale: 1.18, rotate: 8 } : undefined}
          animate={active ? { y: [0, -4, 0], rotate: [-8, 8, -8], scale: 1 } : { y: 0, rotate: 0, scale: 1 }}
          transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
          style={{
            width: size,
            height: size,
            position: 'relative',
            cursor: clickable ? 'pointer' : 'default',
            filter: completed || active ? 'drop-shadow(0 3px 4px rgba(0,0,0,0.2))' : 'grayscale(1)',
            opacity: sub.status === 'upcoming' ? 0.45 : 1,
          }}
        >
          <img src={flower} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />

          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 400, duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#3CB043',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              ✓
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {!isLast && (
        <div style={{ position: 'relative', width: 26, height: 2, margin: '0 2px' }}>
          <div style={{ position: 'absolute', inset: 0, borderTop: '2px dashed #DDD8D0' }} />
          <motion.div
            initial={false}
            animate={{ scaleX: completed ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', inset: 0, background: subjectColor, height: 2, transformOrigin: 'left center' }}
          />
        </div>
      )}
    </div>
  );
}
