import { useState, useEffect, useRef, Fragment } from 'react';
import { motion } from 'framer-motion';
import CharacterShowcase from '../CharacterShowcase';
import { RampSVG, BlockSVG, NewtonMeterSVG } from './RampEquipment';
import { WashiTape } from '../corkboard/WashiTape';
import { Starburst } from '../corkboard/Stickers';
import {
  ANGLES,
  FORCE_AT_ANGLE,
  TOTAL_READINGS,
  rampResultsKey,
  rampProgressKey,
  rampCompleteKey,
} from '../../data/rampResults';

const PULL_MS = 2000;

// Local (unrotated) offsets, all measured from the ramp's pivot in the same
// CSS pixels as the stage. The ramp rises toward the pivot (its peak sits
// almost directly above it), so "up the slope" means smaller dx.
const PIVOT_STAGE_POS = { x: 51, y: 249 };
const BLOCK_REST_OFFSET = { dx: 109, dy: -17 }; // resting spot, partway down the slope
const BLOCK_PULLED_OFFSET = { dx: 46, dy: -28 }; // pulled up toward the top
const METER_OFFSET = { dx: 14, dy: -44 }; // newton meter mounted at the top of the slope

function rotatePoint(dx, dy, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: dx * Math.cos(rad) - dy * Math.sin(rad),
    y: dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

// A discrete angle selector — like propping the ramp up on a fixed support
// for this trial, not a dial you spin. The ramp only ever holds one of the
// five angles the practical actually asks for; picking a new one re-settles
// it there in a single motion instead of tracking a live drag.
function AngleSelector({ angle, readings, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {ANGLES.map((a) => {
        const active = a === angle;
        const done = readings[a] != null;
        return (
          <button
            key={a}
            onClick={() => onSelect(a)}
            style={{
              position: 'relative',
              width: 52,
              height: 44,
              borderRadius: 10,
              border: `2px solid ${active ? 'var(--color-phys)' : 'var(--color-border)'}`,
              background: active ? 'var(--color-phys)' : '#fff',
              color: active ? '#fff' : 'var(--color-dark)',
              fontFamily: 'var(--font-heading)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {a}°
            {done && (
              <div style={{ position: 'absolute', top: -8, right: -8, transform: 'rotate(10deg)' }}>
                <WashiTape variant="blue_dots" width={26} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function RampLab({ year, practicalId, wetLabDialogue, onContinue }) {
  const [angle, setAngle] = useState(0);
  const [burst, setBurst] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [readings, setReadings] = useState({});
  const [trigger, setTrigger] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  const triggerIdRef = useRef(0);
  const welcomedRef = useRef(false);
  const pullTimerRef = useRef(null);

  const alreadyRecorded = readings[angle] != null;
  const displayedForce = pulling || pulled ? FORCE_AT_ANGLE[angle] ?? 0 : 0;
  const recordedCount = Object.keys(readings).length;

  function fireCharacterTrigger(character, text, variant) {
    triggerIdRef.current += 1;
    setTrigger({ type: 'scripted', index: triggerIdRef.current, character, text, variant });
  }

  useEffect(() => {
    if (!welcomedRef.current) {
      welcomedRef.current = true;
      fireCharacterTrigger('lumi', 'Prop the ramp to an angle, then hold the newton meter and pull the block up the slope.');
    }
    const stored = localStorage.getItem(rampResultsKey(year, practicalId));
    if (stored) {
      try {
        setReadings(JSON.parse(stored));
      } catch {
        // ignore malformed stored data
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveCheckpoint(readingsSnapshot, count) {
    localStorage.setItem(rampResultsKey(year, practicalId), JSON.stringify(readingsSnapshot));
    localStorage.setItem(rampProgressKey(year, practicalId), String(count));
  }

  function handleResetPractical() {
    const confirmed = window.confirm(
      'Reset the Wet Lab? All your readings for this practical will be cleared, as if you never started.'
    );
    if (!confirmed) return;

    localStorage.removeItem(rampResultsKey(year, practicalId));
    localStorage.removeItem(rampProgressKey(year, practicalId));
    localStorage.removeItem(rampCompleteKey(year, practicalId));

    setReadings({});
    setAngle(0);
    setPulling(false);
    setPulled(false);
    setZoomed(false);
    setShowContinue(false);
    fireCharacterTrigger('pip', "All clear! The Wet Lab's reset — let's start fresh.");
  }

  function handleSelectAngle(a) {
    setAngle(a);
    setPulling(false);
    setPulled(false);
    setZoomed(false);
    if (readings[a] == null) {
      setBurst(true);
      setTimeout(() => setBurst(false), 400);
    }
  }

  function startPull() {
    if (alreadyRecorded || pulled) return;
    setPulling(true);
    pullTimerRef.current = setTimeout(() => {
      setPulling(false);
      setPulled(true);
      fireCharacterTrigger('madu', 'Got it! The needle has settled — zoom in and record the reading.');
    }, PULL_MS);
  }

  function endPull() {
    if (pulled) return;
    clearTimeout(pullTimerRef.current);
    if (pulling) {
      setPulling(false);
      fireCharacterTrigger('pip', 'Keep holding until the block reaches the top!');
    }
  }

  function handleRecord() {
    setReadings((prev) => {
      const next = { ...prev, [angle]: FORCE_AT_ANGLE[angle] };
      const count = Object.keys(next).length;
      saveCheckpoint(next, count);
      fireCharacterTrigger('madu', 'Recorded! One more data point on the way to a pattern!');

      if (count === TOTAL_READINGS) {
        localStorage.setItem(rampCompleteKey(year, practicalId), 'true');
        setTimeout(() => {
          fireCharacterTrigger('pip', "All five readings recorded — you've mapped exactly how force changes with angle. Let's see the pattern.", 'celebrate');
          setShowContinue(true);
        }, 1200);
      }
      return next;
    });
    setZoomed(false);
    setPulled(false);
  }

  const blockLocal = pulling || pulled ? BLOCK_PULLED_OFFSET : BLOCK_REST_OFFSET;
  const blockOffset = rotatePoint(blockLocal.dx, blockLocal.dy, -angle);
  const blockPos = { x: PIVOT_STAGE_POS.x + blockOffset.x, y: PIVOT_STAGE_POS.y + blockOffset.y };

  const meterOffset = rotatePoint(METER_OFFSET.dx, METER_OFFSET.dy, -angle);
  const meterPos = { x: PIVOT_STAGE_POS.x + meterOffset.x, y: PIVOT_STAGE_POS.y + meterOffset.y };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'transparent' }} />

      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '150px 24px 40px 24px',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <h1 className="heading" style={{ fontSize: 22, margin: 0, marginBottom: 6 }}>
          The Wet Lab
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--color-mid)', marginBottom: 16 }}>
          {alreadyRecorded
            ? 'Already recorded — prop the ramp to a new angle.'
            : !pulled
            ? 'Hold the newton meter and pull the block up the slope!'
            : 'Zoom in on the meter and record your reading.'}
        </p>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ position: 'relative', width: 420, height: 320, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16 }}>
              <svg width={420} height={320} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <line x1={meterPos.x} y1={meterPos.y} x2={blockPos.x} y2={blockPos.y} stroke="#C9A876" strokeWidth="2" />
              </svg>

              <div style={{ position: 'absolute', left: PIVOT_STAGE_POS.x - 11, top: PIVOT_STAGE_POS.y - 99 }}>
                <RampSVG angle={angle} width={220} />
              </div>

              <motion.div
                animate={{ left: blockPos.x - 17, top: blockPos.y - 12, rotate: -angle }}
                transition={pulling ? { duration: PULL_MS / 1000, ease: 'linear' } : { type: 'spring', stiffness: 260, damping: 18 }}
                style={{ position: 'absolute' }}
              >
                <BlockSVG width={34} />
              </motion.div>

              {/* Newton meter held in line with the slope — its own axis rotates
                  to match the ramp, so the pull is always parallel to the
                  incline, exactly as in the real practical. */}
              <motion.div
                animate={{ left: meterPos.x - 11, top: meterPos.y - 10, rotate: -angle, scale: zoomed ? 2.2 : 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                style={{ position: 'absolute', transformOrigin: 'top left', zIndex: zoomed ? 30 : 2 }}
              >
                <NewtonMeterSVG reading={displayedForce} width={40} />
              </motion.div>

              {burst && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: 'absolute', left: 0, bottom: 10, width: '100%', textAlign: 'center' }}
                >
                  <Starburst width={50} color="#FF8FAB" wobble={false} />
                </motion.div>
              )}

              <div style={{ position: 'absolute', left: 0, bottom: -6, width: '100%', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-dark)' }}>
                {angle}°
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <AngleSelector angle={angle} readings={readings} onSelect={handleSelectAngle} />

              {!alreadyRecorded && !pulled && (
                <button
                  onPointerDown={startPull}
                  onPointerUp={endPull}
                  onPointerLeave={endPull}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 999,
                    border: 'none',
                    background: pulling ? 'var(--color-phys)' : 'var(--color-start)',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    cursor: 'grab',
                    touchAction: 'none',
                  }}
                >
                  {pulling ? 'Pulling…' : 'Hold to pull ↑'}
                </button>
              )}

              {pulled && !alreadyRecorded && (
                <button
                  onClick={() => setZoomed((z) => !z)}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 999,
                    border: '2px solid var(--color-phys)',
                    background: '#fff',
                    color: 'var(--color-phys)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {zoomed ? 'Zoom out' : 'Zoom in on meter'}
                </button>
              )}

              {zoomed && (
                <button
                  onClick={handleRecord}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--color-mint)',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Record ✓
                </button>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                {recordedCount} / {TOTAL_READINGS} readings recorded
              </div>
              <button
                onClick={handleResetPractical}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid #E0A296',
                  background: '#fff',
                  color: '#C0503D',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Reset practical
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 80px', gap: 8, fontFamily: 'var(--font-body)', fontSize: 12 }}>
                <div style={{ color: 'var(--color-mid)', fontWeight: 600 }}>Angle (°)</div>
                <div style={{ color: 'var(--color-mid)', fontWeight: 600 }}>Force (N)</div>
                {ANGLES.map((a) => (
                  <Fragment key={a}>
                    <div style={{ padding: '6px 0', borderTop: '1px solid var(--color-border)' }}>{a}</div>
                    <div style={{ padding: '6px 0', borderTop: '1px solid var(--color-border)' }}>
                      {readings[a] != null ? readings[a].toFixed(1) : '—'}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showContinue && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={onContinue}
              style={{
                background: 'var(--color-start)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                padding: '12px 32px',
                borderRadius: 32,
                border: 'none',
              }}
            >
              Continue to Results →
            </button>
          </div>
        )}
      </div>

      <CharacterShowcase practicalDialogue={wetLabDialogue ?? {}} currentTrigger={trigger} inset={56} />
    </div>
  );
}
