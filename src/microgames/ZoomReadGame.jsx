import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NewtonMeter from '../components/equipment/NewtonMeter';
import { useTranslation } from 'react-i18next';

function formatValue(opt) {
  return typeof opt === 'number' ? opt : parseFloat(opt);
}
function optionValue(opt) {
  return typeof opt === 'number' ? opt : parseFloat(opt);
}

// Tap the instrument to zoom in on its scale, then pick the correct
// reading from four always-visible chips. Split 55/45 the moment it zooms
// so nothing ever sits over the meter: the meter pans and grows to fill
// the left panel, the right panel is a plain white column of answer
// chips. The needle always shows the true reading once zoomed — the
// "game" is reading it correctly, not guessing at the physics.
//
// P2 fuses READ and RECORD into one continuous beat (Cooking Mama
// principle — no blank hand-off screens): once the correct chip is
// picked, a results notecard slides up from the bottom showing the
// live results table with the just-read value counting up into the
// active row, and the step only completes once the student taps Confirm.
export default function ZoomReadGame({ step, onComplete, onFeedback, subjectColor = 'var(--color-phys)' }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { correctReading, readingUnit = 'N', options = [], timeLimit = 15, angleLabel, allRows, priorValues = {} } = parameters;

  const [zoomed, setZoomed] = useState(false);
  const [picked, setPicked] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [recording, setRecording] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round((1 - mistakesRef.current * 0.12) * 88 + timing * 12) });
  }

  function handlePick(opt) {
    if (doneRef.current) return;
    const val = optionValue(opt);
    if (Math.abs(val - correctReading) < 0.05) {
      setPicked(opt);
      setTimeout(() => setZoomed(false), 900);
      setTimeout(() => {
        setRecording(true);
        // count up 0 -> correctReading over ~600ms
        const steps = 16;
        for (let i = 0; i <= steps; i += 1) {
          setTimeout(() => setDisplayValue((correctReading * i) / steps), (i * 600) / steps);
        }
      }, 1300);
    } else {
      mistakesRef.current += 1;
      setWrongPick(opt);
      onFeedback?.(t('game.read_needle'));
      setTimeout(() => setWrongPick(null), 400);
    }
  }

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(finish, 700);
  }

  const rows = allRows ?? (angleLabel ? [angleLabel] : []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <div
          style={{
            width: zoomed ? '55%' : '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            transition: 'width 0.4s ease',
          }}
        >
          <motion.div
            layout
            onClick={() => !zoomed && !recording && setZoomed(true)}
            transition={{ type: 'spring', stiffness: 220, damping: 24, duration: 0.5 }}
            style={{ cursor: zoomed || recording ? 'default' : 'pointer' }}
          >
            <NewtonMeter size={zoomed ? 1.6 : 1.1} reading={zoomed ? correctReading : 0} zoomed={zoomed} unit={readingUnit} maxReading={parameters.maxReading ?? 5} />
          </motion.div>
          {!zoomed && !recording && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#999' }}>{t('game.tap_meter_zoom')}</div>}
        </div>

        <AnimatePresence>
          {zoomed && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.3 }}
              style={{
                width: '45%',
                height: '100%',
                background: '#fff',
                borderLeft: '2px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'center',
                gap: 12,
                padding: '0 22px',
                boxSizing: 'border-box',
              }}
            >
              {!picked &&
                options.map((opt) => (
                  <motion.button
                    key={String(opt)}
                    onClick={() => handlePick(opt)}
                    animate={wrongPick === opt ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: 56,
                      width: '100%',
                      borderRadius: 14,
                      border: `2px solid ${subjectColor}`,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-dark)' }}>{formatValue(opt)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-mid)' }}>{readingUnit}</span>
                  </motion.button>
                ))}

              {picked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    height: 56,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: 6,
                    borderRadius: 14,
                    background: hexToTint(subjectColor),
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color: 'var(--color-mint)' }}>{formatValue(picked)}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-mint)' }}>{readingUnit}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {zoomed && !picked && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
            style={{
              position: 'fixed',
              left: 24,
              bottom: 24,
              padding: '10px 18px',
              borderRadius: 999,
              border: `2px solid ${subjectColor}`,
              background: '#fff',
              color: subjectColor,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              zIndex: 70,
            }}
          >
            ← Back to bench
          </motion.button>
        )}
      </AnimatePresence>

      {/* results notecard — slides up once the reading is confirmed correct.
          Fuses READ + RECORD into one continuous beat, no hand-off screen. */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              background: '#fff',
              borderTop: '2px solid var(--color-border)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
              padding: '18px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              zIndex: 80,
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-dark)' }}>{t('game.force_vs_angle')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {rows.map((row) => {
                const isActive = row === angleLabel;
                const value = isActive ? displayValue : priorValues[row];
                return (
                  <div
                    key={row}
                    style={{
                      minWidth: 64,
                      padding: '10px 8px',
                      borderRadius: 10,
                      textAlign: 'center',
                      background: isActive ? hexToTint(subjectColor) : '#F7F4EF',
                      border: isActive ? `2px solid ${subjectColor}` : '2px solid transparent',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)' }}>{row}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, color: isActive ? subjectColor : 'var(--color-dark)' }}>
                      {value != null ? `${value.toFixed(1)}N` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              disabled={confirmed}
              onClick={handleConfirm}
              style={{
                marginTop: 4,
                padding: '10px 32px',
                borderRadius: 999,
                border: 'none',
                background: confirmed ? 'var(--color-mint)' : subjectColor,
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: 14,
                cursor: confirmed ? 'default' : 'pointer',
              }}
            >
              {confirmed ? t('game.recorded_check') : t('ui.confirm_button')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function hexToTint(color) {
  return typeof color === 'string' && color.startsWith('#') ? `${color}18` : 'rgba(91,111,224,0.1)';
}
