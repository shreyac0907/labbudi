import { useState, useCallback, useRef } from 'react';
import { Protractor } from './shared/LabGraphics';
import Ramp from '../components/equipment/Ramp';
import { useTranslation } from 'react-i18next';

// Read (or set) an angle on a protractor. In confirm-only mode the student
// just checks the reading and taps Confirm; in interactive mode they drag
// the protractor's arm, and the ramp tilts in real time (CSS 3D) to match.
export default function ProtractorGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { targetAngle, currentAngle = 0, interactive = false, tolerance = 2, timeLimit = 12 } = parameters;

  const [angle, setAngle] = useState(currentAngle);
  const [confirmed, setConfirmed] = useState(false);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const withinTarget = Math.abs(angle - targetAngle) <= tolerance;

  const handleAngleChange = useCallback(
    (deg) => {
      if (withinTarget === false && Math.abs(deg - targetAngle) <= tolerance) {
        setAngle(targetAngle); // gentle snap once inside the tolerance band
      } else {
        setAngle(deg);
      }
    },
    [targetAngle, tolerance, withinTarget],
  );

  function handleConfirm() {
    if (doneRef.current) return;
    if (!withinTarget) {
      mistakesRef.current += 1;
      onFeedback?.(t('game.protractor_notquite', { angle: targetAngle }), 'wrong');
      return;
    }
    doneRef.current = true;
    setConfirmed(true);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = Math.max(0.6, 1 - Math.abs(angle - targetAngle) / 90);
    setTimeout(() => {
      onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 0.85 * 100 + timing * 15) });
    }, 650);
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Ramp size={1.3} angleDeg={angle} />
      <Protractor
        width={260}
        angle={angle}
        targetAngle={targetAngle}
        tolerance={tolerance}
        interactive={interactive && !confirmed}
        onAngleChange={handleAngleChange}
      />
      <button
        onClick={handleConfirm}
        disabled={confirmed}
        style={{
          padding: '12px 30px',
          borderRadius: 999,
          border: 'none',
          background: withinTarget ? 'var(--color-mint)' : 'var(--color-border)',
          color: withinTarget ? '#fff' : '#888',
          fontFamily: 'var(--font-heading)',
          fontSize: 15,
          cursor: confirmed ? 'default' : 'pointer',
        }}
      >
        {confirmed ? t('game.confirmed_check') : withinTarget ? t('game.confirm_angle_check') : t('game.confirm_angle')}
      </button>
    </div>
  );
}
