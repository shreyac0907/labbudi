import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RampRig from '../components/equipment/RampRig';
import RigStage from '../components/equipment/RigStage';
import { BLOCK_T } from '../components/equipment/rampSetup';
import PipHand, { PipHandCelebrate } from '../components/PipHand';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';

const PULL_SPEED = 0.3; // ramp-lengths per second while the handle is held: about 3 seconds from the bottom to the top
const SLIDE = 2.8; // how quickly the block slides back down the slope when let go (per second squared, at full tilt)
const FRICTION = 0.3; // the block stays put on a gentle slope: it only slides back where tan(angle) > this
const COMPLETE_T = 0.94; // "reached the top" threshold on blockT

// P2's pull mechanic: press and hold the pull bar (👉) and the Newton meter is drawn to the right, the string goes
// taut and the block walks up the ramp at a steady pace. Let go and, on a steep ramp, the weight of the block
// takes it back down (on a gentle one friction holds it). The Newton meter's reading and the "steady pull" speed
// readout both follow the same blockT.
export default function HoldGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { timeLimit = 0, expectedForce = 2, angleDeg = 0 } = parameters;

  const [pulling, setPulling] = useState(false);
  const [celebrate, setCelebrate] = useState(null);
  const [speedLabel, setSpeedLabel] = useState(null);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const sceneRef = useRef(null);
  const btnRef = useRef(null);
  const pullingRef = useRef(false);
  const lastTickRef = useRef(null); // { t, blockT } — for the "steady pull" speed readout

  // tell the student, in the guide's speech bubble, which way to pull
  useEffect(() => {
    onFeedback?.(t('game.pull_right_hint'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const angleRad = (angleDeg * Math.PI) / 180;

  // how far up the ramp the block is (0 = hinge end, 1 = top), moved every frame by the pull or by gravity
  const [blockT, setBlockT] = useState(BLOCK_T);
  useEffect(() => {
    const st = { t: BLOCK_T, v: 0 };
    const slide = SLIDE * (Math.sin(angleRad) - FRICTION * Math.cos(angleRad));
    function tick(_, deltaMs) {
      if (doneRef.current) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      if (pullingRef.current) {
        st.v += (PULL_SPEED - st.v) * Math.min(1, dt * 5); // eases up to a steady walk
      } else if (slide > 0) {
        st.v -= slide * dt;
      } else {
        st.v *= Math.max(0, 1 - dt * 8); // friction brings it to rest
      }
      const next = Math.max(BLOCK_T, Math.min(1, st.t + st.v * dt));
      if (next === BLOCK_T && st.v < 0) st.v = 0;
      if (next !== st.t) {
        st.t = next;
        setBlockT(next);
      }
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [angleRad]);

  const reading = blockT * expectedForce;

  const finish = useCallback(
    (p) => {
      if (doneRef.current) return;
      doneRef.current = true;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
      onComplete({ accuracy: p, timing, completion: p, mistakes: mistakesRef.current, score: Math.round(p * 88 + timing * 12) });
    },
    [timeLimit, onComplete],
  );

  useEffect(() => {
    if (doneRef.current) return;
    const now = Date.now();
    if (pulling && lastTickRef.current) {
      const dt = (now - lastTickRef.current.t) / 1000;
      const dT = blockT - lastTickRef.current.blockT;
      if (dt > 0.05) {
        const rate = dT / dt;
        setSpeedLabel(rate > 0.55 ? 'Fast' : rate < 0.15 ? 'Slow' : 'Steady');
        lastTickRef.current = { t: now, blockT };
      }
    } else if (pulling) {
      lastTickRef.current = { t: now, blockT };
    } else {
      lastTickRef.current = null;
      setSpeedLabel(null);
    }

    if (pulling && blockT >= COMPLETE_T) {
      setPulling(false);
      pullingRef.current = false;
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) {
        setCelebrate({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setTimeout(() => setCelebrate(null), 500);
      }
      setTimeout(() => finish(1), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockT, pulling]);

  function handlePointerDown() {
    if (doneRef.current) return;
    setPulling(true);
    pullingRef.current = true;
    const up = () => {
      if (doneRef.current) return;
      setPulling(false);
      pullingRef.current = false;
      if (blockT < COMPLETE_T) {
        mistakesRef.current += 1;
        onFeedback?.(t('game.hold_to_top'), 'wrong');
      }
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointerup', up);
  }

  const HANDLE_W = 168;

  return (
    <div ref={sceneRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <RigStage angleDeg={angleDeg}>
        {({ viewBox }) => <RampRig viewBox={viewBox} angleDeg={angleDeg} blockT={blockT} taut={pulling} reading={reading} isPulling={pulling} size={1.05} />}
      </RigStage>

      {/* the pull bar: press and hold the 👉 handle and it slides to the right as the block climbs, the string pulled taut */}
      <div style={{ position: 'absolute', bottom: '3.5%', left: '50%', transform: 'translateX(-50%)', width: 'min(600px, 70%)' }}>
        <div
          ref={btnRef}
          onPointerDown={handlePointerDown}
          style={{
            position: 'relative',
            height: 66,
            borderRadius: 33,
            background: 'linear-gradient(180deg,#F4EEDD,#DCD0B2)',
            border: '2px solid #8A6E3A',
            overflow: 'hidden',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `calc(${HANDLE_W / 2}px + ${blockT} * (100% - ${HANDLE_W}px))`, background: 'rgba(79,191,168,0.35)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 22, gap: 16, fontSize: 26, opacity: 0.45 }}>
            <span>👉</span>
            <span>👉</span>
            <span>👉</span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: `calc(${blockT} * (100% - ${HANDLE_W}px) + 4px)`,
              width: HANDLE_W - 8,
              borderRadius: 29,
              background: pulling ? 'linear-gradient(180deg,#8FE0C8,#4FBFA8)' : 'linear-gradient(180deg,#FFFFFF,#CFCFCF)',
              border: '2px solid #7A7A7A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 20,
              color: '#2A2A2A',
            }}
          >
            <span style={{ fontSize: 30, lineHeight: 1 }}>👉</span>
            <span>{t('game.pull_btn')}</span>
          </div>
        </div>

        <AnimatePresence>
          {speedLabel && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                marginLeft: 12,
                marginTop: -15,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.88)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 12,
                color: speedLabel === 'Steady' ? 'var(--color-mint)' : '#B87A10',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {speedLabel === 'Steady' && (
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-mint)', display: 'inline-block' }}
                />
              )}
              {t('game.speed_label', { speed: t({ Fast: 'game.speed_fast', Slow: 'game.speed_slow', Steady: 'game.speed_steady' }[speedLabel] ?? 'game.speed_steady') })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PipHand containerRef={sceneRef} state={pulling ? 'grip' : 'open'} active={!celebrate} holdingLarge={pulling} />
      {celebrate && <PipHandCelebrate x={celebrate.x} y={celebrate.y} />}
    </div>
  );
}
