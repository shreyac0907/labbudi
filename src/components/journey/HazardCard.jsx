import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HazardCard({ hazard, onRevealed }) {
  const [flipped, setFlipped] = useState(false);
  const hasReportedRef = useRef(false);

  function handleClick() {
    setFlipped((f) => !f);
    if (!hasReportedRef.current) {
      hasReportedRef.current = true;
      onRevealed?.(hazard.id);
    }
  }

  return (
    <div onClick={handleClick} style={{ perspective: 800, cursor: 'pointer', height: 160 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '2px dashed #DDD8D0',
              background: '#F7F4EF',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#999',
              padding: 2,
            }}
          >
            [ hazard_{hazard.id} ]
          </div>
          <div className="heading" style={{ fontSize: 15 }}>
            {hazard.name}
          </div>
          {hazard.subtitle && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>{hazard.subtitle}</div>
          )}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#bbb' }}>tap to reveal</div>
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--color-pink)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', margin: 0 }}>{hazard.rule}</p>
        </div>
      </motion.div>
    </div>
  );
}
