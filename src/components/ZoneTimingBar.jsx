import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Zone boundaries as % from the left: red | yellow | blue | yellow | red.
const ZONES = { redL: 25, yellowL: 40, blueL: 40, blueR: 60, yellowR: 60, redR: 75 };
function zoneFor(pct) {
  if (pct < ZONES.redL || pct > ZONES.redR) return 'red';
  if (pct < ZONES.yellowL || pct > ZONES.yellowR) return 'yellow';
  return 'blue';
}
const FACE = {
  red: (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FF5A4F" stroke="#7A6A3A" strokeWidth="1.2" /><path d="M6.5 7.6 10.5 9M17.5 7.6 13.5 9" stroke="#3A2A00" strokeWidth="1.5" strokeLinecap="round" /><circle cx="8.6" cy="10.4" r="1.2" fill="#3A2A00" /><circle cx="15.4" cy="10.4" r="1.2" fill="#3A2A00" /><path d="M8 16.5c1.4-1.8 6.6-1.8 8 0" fill="none" stroke="#3A2A00" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  yellow: (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FFE600" stroke="#7A6A3A" strokeWidth="1.2" /><circle cx="8.6" cy="10.4" r="1.2" fill="#3A2A00" /><circle cx="15.4" cy="10.4" r="1.2" fill="#3A2A00" /><path d="M8 14.5c1.4 1.8 6.6 1.8 8 0" fill="none" stroke="#3A2A00" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  blue: (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#3DB8FF" stroke="#7A6A3A" strokeWidth="1.2" /><circle cx="8.6" cy="10.4" r="1.2" fill="#3A2A00" /><circle cx="15.4" cy="10.4" r="1.2" fill="#3A2A00" /><path d="M7.5 13.5h9c0 3-2 4.6-4.5 4.6S7.5 16.5 7.5 13.5z" fill="none" stroke="#3A2A00" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
};
const RESULT_TEXT = { blue: 'ui.perfect', yellow: 'ui.good', red: 'ui.miss' };
const RESULT_COLOR = { blue: '#FFD700', yellow: '#fff', red: '#FF5555' };

// Cooking-Mama-style timing bar: a sliding indicator crosses a red/yellow/
// blue/yellow/red bar; tap while it's in a zone to score PERFECT/GOOD/MISS.
// Reusable across every precision-timing beat in the app — the caller
// supplies `onResult(zone)` and decides what happens next; a MISS auto-
// resumes sliding after a beat (soft failure, no hard stop) unless
// `retryOnMiss` is false.
export default function ZoneTimingBar({ onResult, speedMs = 1500, retryOnMiss = true, label }) {
  const { t } = useTranslation();
  const [pos, setPos] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [result, setResult] = useState(null);
  const [shake, setShake] = useState(false);

  const posRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const start = useCallback(() => {
    startRef.current = Date.now();
    function tick() {
      const t = (Date.now() - startRef.current) % speedMs;
      const p = 50 - 50 * Math.cos((2 * Math.PI * t) / speedMs);
      posRef.current = p;
      setPos(p);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [speedMs]);

  useEffect(() => {
    start();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start]);

  function handleTap() {
    if (frozen) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFrozen(true);
    const zone = zoneFor(posRef.current);
    setResult(zone);
    if (zone === 'red') setShake(true);
    onResult?.(zone);

    if (zone === 'red' && retryOnMiss) {
      setTimeout(() => {
        setResult(null);
        setShake(false);
        setFrozen(false);
        start();
      }, 900);
    }
  }

  const face = FACE[frozen ? result ?? zoneFor(pos) : zoneFor(pos)];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', textAlign: 'center', marginBottom: 6 }}>{label}</div>
      )}

      {/* full-bar flashes on outcome */}
      <AnimatePresence>
        {result === 'blue' && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,200,80,0.3)', pointerEvents: 'none', zIndex: 250 }}
          />
        )}
        {result === 'yellow' && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,200,80,0.16)', pointerEvents: 'none', zIndex: 250 }}
          />
        )}
        {result === 'red' && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(220,0,0,0.25)', pointerEvents: 'none', zIndex: 250 }}
          />
        )}
      </AnimatePresence>

      {/* face + result text above the bar */}
      <div style={{ height: 30, position: 'relative' }}>
        <motion.div
          key={frozen ? `f-${result}` : 'f-live'}
          animate={{ left: `${pos}%` }}
          transition={{ duration: 0 }}
          style={{ position: 'absolute', top: 0, transform: 'translateX(-50%)', fontSize: 24, lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(255,214,0,0.9))' }}
        >
          {face}
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: '50%',
                top: -8,
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: result === 'blue' ? 28 : result === 'yellow' ? 24 : 20,
                color: RESULT_COLOR[result],
                textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
                zIndex: 5,
              }}
            >
              {t(RESULT_TEXT[result])}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        onClick={handleTap}
        animate={
          shake
            ? { x: [-8, 8, -6, 6, 0], scale: 1 }
            : result === 'blue'
              ? { scale: [1, 1.06, 1], x: 0 }
              : { x: 0, scale: 1 }
        }
        transition={{ duration: shake ? 0.3 : 0.2, type: shake ? 'tween' : 'spring' }}
        style={{
          position: 'relative',
          height: 44,
          borderRadius: 22,
          background: '#2D2D2D',
          border: '3px solid #1A1A1A',
          boxShadow: '0 0 0 4px #44CC44, 0 0 12px #44CC4488',
          overflow: 'hidden',
          cursor: frozen ? 'default' : 'pointer',
          display: 'flex',
        }}
      >
        <div style={{ width: `${ZONES.redL}%`, background: 'linear-gradient(180deg,#DD3333,#CC2222)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: '#fff' }}>{t('game.zone_miss')}</span>
        </div>
        <div style={{ width: `${ZONES.yellowL - ZONES.redL}%`, background: 'linear-gradient(180deg,#FFCC00,#DDAA00)', borderLeft: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 9, color: '#fff' }}>{t('game.zone_good')}</span>
        </div>
        <div style={{ width: `${ZONES.blueR - ZONES.blueL}%`, background: 'linear-gradient(180deg,#4466FF,#2244CC)', borderLeft: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 9, color: '#fff' }}>{t('game.zone_perfect')}</span>
        </div>
        <div style={{ width: `${ZONES.redR - ZONES.yellowR}%`, background: 'linear-gradient(180deg,#FFCC00,#DDAA00)', borderLeft: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 9, color: '#fff' }}>{t('game.zone_good')}</span>
        </div>
        <div style={{ width: `${100 - ZONES.redR}%`, background: 'linear-gradient(180deg,#DD3333,#CC2222)', borderLeft: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10, color: '#fff' }}>{t('game.zone_miss')}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: -2,
            left: `${pos}%`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '14px solid #FFEE00',
            filter: 'drop-shadow(0 0 4px #FFEE00) drop-shadow(0 0 1px #000)',
          }}
        />
      </motion.div>
    </div>
  );
}
