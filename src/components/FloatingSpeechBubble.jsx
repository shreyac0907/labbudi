import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating character speech bubble shown directly in the practical canvas
// (no character image, no fixed side panel). Auto-dismisses 3.5s after each
// new message. Defaults to the top-right corner; flips to top-left when
// `side` is 'left' so it never sits on top of the current step's primary
// interactive object.
export default function FloatingSpeechBubble({ message, side = 'right' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  const isRight = side !== 'left';

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key={message}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scale: { type: 'spring', stiffness: 400, damping: 26 },
            opacity: { duration: 0.15, ease: 'easeIn' },
          }}
          style={{
            position: 'fixed',
            top: 80,
            right: isRight ? 24 : 'auto',
            left: isRight ? 'auto' : 60,
            maxWidth: 260,
            zIndex: 50,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '14px 18px',
            transformOrigin: isRight ? 'bottom right' : 'bottom left',
          }}
        >
          <div style={{ fontFamily: 'Inter, var(--font-body)', fontWeight: 400, fontSize: 15, color: '#2D2D2D', lineHeight: 1.4 }}>
            {message}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: -8,
              right: isRight ? 20 : 'auto',
              left: isRight ? 'auto' : 20,
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fff',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
