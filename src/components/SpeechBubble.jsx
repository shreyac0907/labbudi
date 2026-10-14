import { motion, AnimatePresence } from 'framer-motion';

export default function SpeechBubble({ text, visible, maxWidth = 200, style = {}, pointerStyle = {} }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            scale: { type: 'spring', stiffness: 400, damping: 22, duration: 0.2 },
            opacity: { duration: visible ? 0.2 : 0.15 },
          }}
          style={{
            transformOrigin: 'bottom center',
            position: 'absolute',
            background: '#fff',
            borderRadius: 16,
            border: '2px solid var(--color-border)',
            padding: '10px 14px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            maxWidth,
            textAlign: 'center',
            color: 'var(--color-dark)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            ...style,
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fff',
              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.06))',
              ...pointerStyle,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
