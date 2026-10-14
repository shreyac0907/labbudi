import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePointerDrag } from '../engine/InputManager';
import AssetImage from '../components/AssetImage';
import CottonSwab from '../components/equipment/CottonSwab';
import Slide from '../components/equipment/Slide';
import { ASSETS } from '../config/assets';
import PipHand from '../components/PipHand';
import { useTranslation } from 'react-i18next';

const ZONE_RADIUS = 60; // Fix 9 — large, forgiving acceptance zone
const REQUIRED_DEGREES = 540; // 1.5 loops, forgiving per the fix spec

// Fix 9 — mode: 'cheek_swab' is the real P4 prep-stage mechanic: drag the
// swab up to Pip's cheek, then move it in a small circle to collect
// cells. Any other `mode` value falls back to the original dev scaffold
// (nothing else uses draw_swab yet).
export default function DrawSwabGame({ step, onComplete, onFeedback, onHint }) {
  const mode = step?.parameters?.mode;
  if (mode === 'cheek_swab') return <CheekSwab step={step} onComplete={onComplete} onFeedback={onFeedback} onHint={onHint} />;
  if (mode === 'surface_smear') return <SmearSwab step={step} onComplete={onComplete} onFeedback={onFeedback} onHint={onHint} />;
  return <GenericSwabStub onComplete={onComplete} />;
}

const SMEAR_MIN_PASSES = 2;

// Smear the (already-collected) swab across the slide in a back-and-forth
// motion, then drop it in the disinfectant beaker — the two real lab
// actions between "collect the sample" and "stain it."
function SmearSwab({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('smear'); // smear | dispose | done
  const smearHint = phase === 'smear' ? t('game.swab_smear_hint') : phase === 'dispose' ? t('game.swab_dispose_hint') : null;
  useEffect(() => {
    onHint?.(smearHint);
  }, [smearHint, onHint]);
  const [passes, setPasses] = useState(0);
  const [swabPos, setSwabPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [disposed, setDisposed] = useState(false);
  const [burst, setBurst] = useState(false);

  const sceneRef = useRef(null);
  const slideRef = useRef(null);
  const beakerRef = useRef(null);
  const dockRef = useRef({ x: 0, y: 0 });
  const lastDirRef = useRef(0);
  const lastXRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const measure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const dock = { x: rect.width * 0.44, y: rect.height * 0.8 };
    dockRef.current = dock;
    setSwabPos((p) => (p.x === 0 && p.y === 0 ? dock : p));
  }, []);

  useEffect(() => {
    const t = setTimeout(measure, 60);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const relPos = useCallback((point) => {
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timeLimit = step?.parameters?.timeLimit ?? 20;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, step]);

  const { onPointerDown: onSmearDown } = usePointerDrag({
    onStart: () => setDragging(true),
    onMove: (point) => {
      const p = relPos(point);
      setSwabPos(p);
      if (phase !== 'smear') return;
      if (lastXRef.current != null) {
        const dx = p.x - lastXRef.current;
        if (Math.abs(dx) > 3) {
          const dir = dx > 0 ? 1 : -1;
          if (lastDirRef.current !== 0 && dir !== lastDirRef.current) {
            setPasses((prev) => {
              const next = prev + 1;
              if (next >= SMEAR_MIN_PASSES) {
                setPhase('dispose');
                onFeedback?.(t('game.swab_dispose_msg'));
              }
              return next;
            });
          }
          lastDirRef.current = dir;
        }
      }
      lastXRef.current = p.x;
    },
    onEnd: (point) => {
      setDragging(false);
      if (phase !== 'dispose') return;
      const p = relPos(point);
      const beaker = beakerRef.current?.getBoundingClientRect();
      const scene = sceneRef.current?.getBoundingClientRect();
      if (beaker && scene) {
        const bx = beaker.left + beaker.width / 2 - scene.left;
        const by = beaker.top + beaker.height / 2 - scene.top;
        const dist = Math.hypot(p.x - bx, p.y - by);
        if (dist < 120) {
          setDisposed(true);
          setBurst(true);
          setTimeout(() => setBurst(false), 500);
          onFeedback?.(t('game.swab_hygiene'), 'wrong');
          setTimeout(finish, 900);
          return;
        }
      }
      setSwabPos(dockRef.current);
    },
  });

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={slideRef} style={{ position: 'absolute', left: '44%', top: '44%', transform: 'translate(-50%,-50%) scale(5.2)' }}>
        <Slide size={1} hasSample={passes > 0} shadow={false} />
      </div>

      {!disposed && (
        <div ref={beakerRef} style={{ position: 'absolute', left: '86%', top: '44%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg width="150" height="182" viewBox="0 0 46 56">
            <path d="M10,4 L36,4 L34,50 Q34,54 30,54 L16,54 Q12,54 12,50 Z" fill="rgba(180,120,220,0.25)" stroke="#8B3AA0" strokeWidth="1.5" />
            <path d="M13,30 L33,30 L31,50 Q31,52 29,52 L17,52 Q15,52 15,50 Z" fill="#8B3AA0" opacity={0.7} />
          </svg>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 22, color: 'var(--color-dark)' }}>{t('game.disinfectant')}</div>
          <AnimatePresence>
            {burst && (
              <motion.div
                initial={{ opacity: 1, scale: 0.4 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'absolute', top: 20, width: 40, height: 40, borderRadius: '50%', border: '2px solid #C9A6E0', pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {!disposed && (
        <motion.div
          // lying on its side, tip to the left (rotate, and the centring, go through framer so the scale animation keeps them)
          animate={{ left: swabPos.x, top: swabPos.y, scale: dragging ? 1.1 : 1, rotate: -90 }}
          transition={{ type: dragging ? false : 'spring', stiffness: 380, damping: 28 }}
          style={{ position: 'absolute', x: '-50%', y: '-50%', touchAction: 'none', cursor: 'grab', zIndex: 10, padding: 24 }}
          onPointerDown={onSmearDown}
        >
          <CottonSwab size={1.7} collected />
        </motion.div>
      )}

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'open'} active={!disposed} />
    </div>
  );
}

function GenericSwabStub({ onComplete }) {
  const { t } = useTranslation();
  const sceneRef = useRef(null);
  const [swiping, setSwiping] = useState(false);
  const lastRef = useRef(null);

  function handlePointerDown(e) {
    lastRef.current = { x: e.clientX, t: Date.now() };
  }
  function handlePointerMove(e) {
    if (!lastRef.current) return;
    const dt = Date.now() - lastRef.current.t;
    const dx = Math.abs(e.clientX - lastRef.current.x);
    if (dt > 0 && dx / dt > 0.6) setSwiping(true);
    lastRef.current = { x: e.clientX, t: Date.now() };
  }
  function handlePointerUp() {
    lastRef.current = null;
    setTimeout(() => setSwiping(false), 150);
  }

  return (
    <div
      ref={sceneRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: '#999' }}>
        <div>{t('game.not_built', { name: 'DrawSwabGame' })}</div>
        <button onClick={() => onComplete({ accuracy: 1, timing: 1, completion: 1, mistakes: 0, score: 100 })} style={{ marginTop: 12 }}>
          {t('game.skip_dev')}
        </button>
      </div>
      <PipHand containerRef={sceneRef} state="swipe" swiping={swiping} />
    </div>
  );
}

// Collect cheek cells: a big Pip, a big cotton swab, and three clear beats. 1) Pick up the swab (it waits in a
// glowing holder). 2) Carry it to the glowing target on Pip's cheek. 3) Rub it round the dashed circle: the circle
// fills up as you go, the swab turns pink as it picks up cells, and Pip giggles. The instruction bar says which beat you
// are on.
const CHEEK = { x: 0.605, y: 0.48 }; // where Pip's cheek is, as a fraction of his picture (about the same in every pose)
const PIP_ASPECT = 750 / 610; // every pose is drawn into a box of this shape
const SWAB_SIZE = 1.7;
const RING_R = 64; // the circle to rub round, in px

function CheekSwab({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const [swabPos, setSwabPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [inZone, setInZone] = useState(false);
  const [progressDeg, setProgressDeg] = useState(0);
  const [collected, setCollected] = useState(false);
  const [pipState, setPipState] = useState('speaking'); // speaking | celebrate (it only celebrates at the end)
  const [layout, setLayout] = useState({ pipW: 600, pipX: 0, pipY: 0, cheek: { x: 0, y: 0 }, dock: { x: 0, y: 0 } });

  const sceneRef = useRef(null);
  const dockPxRef = useRef({ x: 0, y: 0 });
  const cheekPxRef = useRef({ x: 0, y: 0 });
  const grabRef = useRef({ x: 0, y: 0 });
  const lastAngleRef = useRef(null);
  const inZoneRef = useRef(false);
  const doneRef = useRef(false);
  const movedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const mistakesRef = useRef(0);

  const measure = useCallback(() => {
    const node = sceneRef.current;
    if (!node) return;
    const w = node.clientWidth;
    const h = node.clientHeight;
    if (!w || !h) return;
    const pipW = Math.min(w * 0.6, h * 0.95 * PIP_ASPECT, 720);
    const pipH = pipW / PIP_ASPECT;
    const pipX = w * 0.36 - pipW / 2;
    const pipY = h * 0.5 - pipH / 2;
    const cheek = { x: pipX + CHEEK.x * pipW, y: pipY + CHEEK.y * pipH };
    const dock = { x: w * 0.86, y: h * 0.2 };
    cheekPxRef.current = cheek;
    dockPxRef.current = dock;
    setLayout({ pipW, pipX, pipY, cheek, dock });
    setSwabPos((p) => (!movedRef.current ? dock : p));
  }, []);

  useEffect(() => {
    measure();
    const first = setTimeout(measure, 60);
    const el = sceneRef.current;
    const ro = el ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      clearTimeout(first);
      ro?.disconnect();
    };
  }, [measure]);

  // what to do next goes up in the instruction bar
  useEffect(() => {
    onHint?.(collected ? null : inZone ? t('game.swab_rub') : t('game.swab_to_cheek'));
  }, [collected, inZone, onHint, t]);

  const relPos = useCallback((point) => {
    const rect = sceneRef.current.getBoundingClientRect();
    return { x: point.x - rect.left, y: point.y - rect.top };
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timeLimit = step?.parameters?.timeLimit ?? 0;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    setCollected(true);
    setPipState('celebrate');
    onFeedback?.(t('game.swab_got_some'));
    setTimeout(() => onFeedback?.(t('game.swab_biology')), 400);
    setTimeout(() => onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(90 + timing * 10) }), 1200);
  }, [onComplete, step, onFeedback, t]);

  const { onPointerDown } = usePointerDrag({
    // the swab is carried by the spot you grabbed it at, its tip stays where the tip is
    onStart: (point) => {
      movedRef.current = true;
      const p = relPos(point);
      grabRef.current = { x: swabPos.x - p.x, y: swabPos.y - p.y };
      setDragging(true);
    },
    onMove: (point) => {
      const p0 = relPos(point);
      const p = { x: p0.x + grabRef.current.x, y: p0.y + grabRef.current.y };
      setSwabPos(p);

      const dx = p.x - cheekPxRef.current.x;
      const dy = p.y - cheekPxRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nowInZone = dist < ZONE_RADIUS * 1.5;

      if (nowInZone && !inZoneRef.current) {
        inZoneRef.current = true;
        setInZone(true);
        // Pip keeps his speaking pose while he is being swabbed (no react pose)
        lastAngleRef.current = null;
        onFeedback?.(t('game.swab_small_circles'));
      } else if (!nowInZone && inZoneRef.current) {
        inZoneRef.current = false;
        setInZone(false);
        setPipState('speaking');
        lastAngleRef.current = null;
      }

      if (nowInZone && !doneRef.current && dist > 14) {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (lastAngleRef.current != null) {
          let delta = angle - lastAngleRef.current;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          setProgressDeg((prev) => {
            const next = Math.min(REQUIRED_DEGREES, prev + Math.abs(delta));
            if (next >= REQUIRED_DEGREES) finish();
            return next;
          });
        }
        lastAngleRef.current = angle;
      }
    },
    onEnd: () => {
      setDragging(false);
      if (!inZoneRef.current && !doneRef.current) {
        mistakesRef.current += 1;
        // let go away from the cheek: the swab goes back to its holder
        movedRef.current = false;
        setSwabPos(dockPxRef.current);
      }
    },
  });

  const frac = progressDeg / REQUIRED_DEGREES;
  const C = 2 * Math.PI * RING_R;
  const { cheek, pipW, pipX, pipY } = layout;

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Pip, big: the focal point of this step */}
      <motion.div animate={{ y: pipState === 'speaking' ? [0, -4, 0] : [0, -8, 0] }} transition={{ duration: pipState === 'speaking' ? 2.6 : 0.5, repeat: Infinity }} style={{ position: 'absolute', left: pipX, top: pipY, width: pipW, height: pipW / PIP_ASPECT }}>
        <AssetImage src={ASSETS.characters.pip?.[pipState]} alt="Pip" width={pipW} height={pipW / PIP_ASPECT} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
      </motion.div>

      {/* the target on Pip's cheek, and the circle to rub round once the swab is there */}
      {!collected && (
        <svg width={RING_R * 2 + 80} height={RING_R * 2 + 80} viewBox={`${-RING_R - 40} ${-RING_R - 40} ${RING_R * 2 + 80} ${RING_R * 2 + 80}`} style={{ position: 'absolute', left: cheek.x - RING_R - 40, top: cheek.y - RING_R - 40, pointerEvents: 'none', overflow: 'visible' }}>
          {!inZone && (
            <circle r={RING_R * 0.7} fill="rgba(255,214,0,0.3)" stroke="#E8A020" strokeWidth="5">
              <animate attributeName="r" values={`${RING_R * 0.6};${RING_R * 0.85};${RING_R * 0.6}`} dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
          {inZone && (
            <>
              <circle r={RING_R} fill="rgba(255,214,0,0.12)" stroke="rgba(232,160,32,0.55)" strokeWidth="5" strokeDasharray="10 8" />
              <circle r={RING_R} fill="none" stroke="#1E9E5A" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90)" />
              {/* a dot circling the ring shows which way and how fast to go */}
              {frac < 0.08 && (
                <circle r="9" fill="#E8A020">
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.6s" repeatCount="indefinite" additive="sum" />
                  <animate attributeName="cx" values={`${RING_R};${RING_R}`} dur="1s" repeatCount="indefinite" />
                </circle>
              )}
            </>
          )}
        </svg>
      )}

      {/* where the swab waits: pick it up from here */}
      {!movedRef.current && !dragging && !collected && (
        <div style={{ position: 'absolute', left: layout.dock.x, top: layout.dock.y + 322, transform: 'translate(-50%, 0)', padding: '6px 16px', borderRadius: 12, background: '#fff', border: '2px solid #E8A020', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: '#7A4A00', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {t('game.cotton_swab')}
        </div>
      )}

      {/* the cotton swab, big; its tip (the pink-able end) is the point that has to reach the cheek */}
      <motion.div
        animate={{ left: swabPos.x, top: swabPos.y, scale: dragging ? 1.06 : 1, rotate: inZone ? -10 : dragging ? -25 : 0 }}
        transition={{ type: dragging ? false : 'spring', stiffness: 380, damping: 28 }}
        style={{ position: 'absolute', x: '-50%', y: '-6%', transformOrigin: '50% 6%', touchAction: 'none', zIndex: 10, cursor: collected ? 'default' : 'grab', padding: '0 34px' }}
        onPointerDown={!collected ? onPointerDown : undefined}
      >
        <CottonSwab size={SWAB_SIZE} collected={collected || frac > 0.35} />
      </motion.div>

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'open'} active={!collected} />
    </div>
  );
}
