import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunsenBurner from '../components/equipment/BunsenBurner';
import Tripod from '../components/equipment/Tripod';
import Gauze from '../components/equipment/Gauze';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import HeatMat from '../components/equipment/HeatMat';
import RigStage from '../components/equipment/RigStage';
import { useCollarDrag, CollarCue } from '../components/equipment/CollarControl';
import { stackPoint, stackGeometry, STACK_SIZE, STACK_Z } from '../components/equipment/bunsenSetup';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';

const SIZE = 1.5; // the zoomed view's burner

// One large, centred Bunsen burner. Madu points out the collar, the
// student zooms in on it, and scrolling/dragging there continuously
// rotates the collar open — the yellow safety flame cross-fading to the
// blue roaring flame live, in the SAME zoomed view, not a before/after
// cut. Completes once the student has seen both directions at least once.
export default function FlameEducationGame({ step, onComplete, onFeedback, onHint, guideView }) {
  const { t } = useTranslation();
  const { timeLimit = 30 } = step.parameters ?? {};

  const [zoomed, setZoomed] = useState(false);
  const [openAmt, setOpenAmt] = useState(0);

  useEffect(() => {
    onHint?.(zoomed ? null : t('game.flame_tap_collar'));
  }, [zoomed, onHint, t]);

  // the guide starts with the closed collar (the yellow safety flame)
  useEffect(() => {
    onFeedback?.(t('game.flame_closed_msg'), undefined, { collar: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when the student goes back (or forward) through the guide's bubbles, the collar goes back to where it was for that bubble
  useEffect(() => {
    if (guideView?.meta?.collar != null) setOpenAmt(guideView.meta.collar);
  }, [guideView]);

  const sceneRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const hasClosedRef = useRef(true); // starts closed (yellow), so "closed" is already satisfied
  const lastNarratedRef = useRef('closed'); // 'open' | 'closed' | null: the guide opens with the closed (yellow) bubble below

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    // hold on the blue flame for a while (the guide explains it) before the checkpoint ends
    setTimeout(() => onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10), skipPause: true }), 5500);
  }, [onComplete, timeLimit]);

  const maybeFinish = useCallback(() => {
    if (hasOpenedRef.current && hasClosedRef.current && !doneRef.current) {
      onFeedback?.(t('game.flame_done_msg'), undefined, { collar: 1 });
      finish();
    }
  }, [finish, onFeedback]);

  const applyOpen = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(1, next));
      setOpenAmt(clamped);
      if (clamped > 0.85 && !hasOpenedRef.current) {
        hasOpenedRef.current = true;
      }
      if (clamped < 0.15 && !hasClosedRef.current) {
        hasClosedRef.current = true;
      }
      const zone = clamped > 0.5 ? 'open' : 'closed';
      if (zone !== lastNarratedRef.current) {
        lastNarratedRef.current = zone;
        // each bubble carries the collar position it was about, so going back to it puts the collar there again
        onFeedback?.(zone === 'open' ? t('game.flame_open_msg') : t('game.flame_closed_msg'), undefined, { collar: zone === 'open' ? 1 : 0 });
      }
      if (clamped > 0.85 || clamped < 0.15) maybeFinish();
    },
    [maybeFinish, onFeedback],
  );

  // the same collar control as every other burner step: slide it (drag right or up), scroll, or tap
  const collarDown = useCollarDrag(openAmt, applyOpen);

  function handleWheel(e) {
    e.preventDefault();
    applyOpen(openAmt - e.deltaY / 300);
  }

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!zoomed && (
        <>
          {/* the same stack the setup steps built (bunsenSetup); tapping the burner zooms in on its collar */}
          <RigStage>
            {({ w, h }) => {
              const { sc } = stackGeometry(w, h);
              const burner = stackPoint('burner', w, h);
              const at = (kind) => {
                const p = stackPoint(kind, w, h);
                return { position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', zIndex: STACK_Z[kind] };
              };
              // the collar is at y = 134.5 of the burner's 190-unit box, whose centre is the burner's point
              const collarY = burner.y + 39.5 * sc;
              return (
                <>
                  <div style={at('mat')}>
                    <HeatMat size={STACK_SIZE.mat * sc} shadow={false} />
                  </div>
                  <div style={at('tripod')}>
                    <Tripod size={STACK_SIZE.tripod * sc} shadow={false} />
                  </div>
                  <div style={{ ...at('burner'), cursor: 'pointer', pointerEvents: 'auto' }} onClick={() => setZoomed(true)}>
                    <BunsenBurner size={STACK_SIZE.burner * sc} collarOpenAmount={openAmt} shadow={false} />
                  </div>
                  <div style={at('gauze')}>
                    <Gauze size={STACK_SIZE.gauze * sc} shadow={false} />
                  </div>
                  <div style={at('dish')}>
                    <EvaporatingDish size={STACK_SIZE.dish * sc} contentState="solution" shadow={false} />
                  </div>

                  {/* Madu's pointer annotation: an arrow from outside the tripod's legs to the collar */}
                  <motion.div
                    animate={{ x: [0, -8, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    onClick={() => setZoomed(true)}
                    style={{ position: 'absolute', left: burner.x + 16 * sc, top: collarY, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', pointerEvents: 'auto', zIndex: 8 }}
                  >
                    <svg width="130" height="28" viewBox="0 0 130 28" style={{ overflow: 'visible' }}>
                      <path d="M128,14 L6,14 M6,14 L19,3 M6,14 L19,25" fill="none" stroke="#E8A020" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 700, color: '#B87A10', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}>{t('game.the_collar')}</div>
                  </motion.div>
                </>
              );
            }}
          </RigStage>

          <PipHand containerRef={sceneRef} state="pointing" active />
        </>
      )}

      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <div
              onPointerDown={collarDown}
              onWheel={handleWheel}
              style={{ width: '55%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'grab', touchAction: 'none' }}
            >
              {/* scaled about the middle of the barrel so the flame, the collar and the base are all in view */}
              <motion.div animate={{ scale: 1.5 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} style={{ transformOrigin: '50% 44%' }}>
                <div style={{ position: 'relative' }}>
                  <BunsenBurner size={SIZE} collarOpenAmount={openAmt} />
                  {/* a frame and arrows over the brass collar: slide it to open the air hole */}
                  <div style={{ position: 'absolute', left: 22 * SIZE, top: 133 * SIZE, pointerEvents: 'none' }}>
                    <CollarCue u={SIZE} />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '45%', height: '100%', background: '#fff', borderLeft: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: '0 24px', boxSizing: 'border-box' }}
            >
              <InfoCard tone={openAmt > 0.5 ? 'blue' : 'yellow'} title={openAmt > 0.5 ? t('game.flame_roaring_title') : t('game.flame_safety_title')} bullets={
                openAmt > 0.5
                  ? [t('game.flame_air_open'), t('game.flame_use_general'), t('game.flame_use_dryness'), t('game.flame_use_max')]
                  : [t('game.flame_air_closed'), t('game.flame_use_lighting'), t('game.flame_use_waiting'), t('game.flame_use_moving')]
              } />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomed && (
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
              border: '2px solid var(--color-chem)',
              background: '#fff',
              color: 'var(--color-chem)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              zIndex: 70,
            }}
          >
            ← Zoom out
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ tone, title, bullets }) {
  const bg = tone === 'yellow' ? '#FBF6EA' : '#EAF2FB';
  const border = tone === 'yellow' ? '#E0D4B8' : '#B9D0EA';
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: '24px 28px', boxShadow: '0 3px 8px rgba(0,0,0,0.06)' }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--color-dark)', marginBottom: 14 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 26, fontFamily: 'var(--font-body)', fontSize: 21, color: 'var(--color-dark)', lineHeight: 1.65 }}>
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </motion.div>
  );
}
