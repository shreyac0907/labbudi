import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import CellView, { CELLS } from './shared/CellView';
import PipHand from '../components/PipHand';
import { MicroscopeArt } from '../components/equipment/Microscope';
import { useTranslation } from 'react-i18next';

// Nosepiece lenses, base angle (deg) and colour band, in a fixed 120°
// spread. Whichever lens sits nearest 270° (straight down, in the light
// path) is the ACTIVE objective — exactly how a real turret works.
const LENSES = [
  { angle: 0, colour: '#D32F2F', label: '×4' },
  { angle: 120, colour: '#F2C230', label: '×10' },
  { angle: 240, colour: '#2A5AD0', label: '×40' },
];
const ZOOM_BY_LENS = [1, 2.4, 5.5];
const START_BLUR_BY_LENS = [12, 6, 8];
const TARGET_CELL = 2;
const SHARP = 1.2; // blur (px) at or below which the cells count as in focus

const VB = { x: 10, y: 6, w: 290, h: 440 };
// the whole microscope, filling the window
const OVERVIEW = { at: [150, 232], zoom: 1.08 };
// where the camera looks in each phase: { at: [x, y] in the drawing, zoom }. No entry means the whole microscope.
const CAMERA = {
  light: { at: [60, 405], zoom: 2.6 },
  nose4: { at: [150, 232], zoom: 2.5 },
  nose10: { at: [150, 232], zoom: 2.5 },
  nose40: { at: [150, 232], zoom: 2.5 },
  coarse: { at: [266, 314], zoom: 2.3 },
  fine: { at: [266, 314], zoom: 2.3 },
  fine10: { at: [266, 314], zoom: 2.3 },
  fine40: { at: [266, 314], zoom: 2.3 },
  stagexy: { at: [124, 352], zoom: 2.4 },
};

function activeLensIndex(noseAngle) {
  let best = 0;
  let bestDelta = Infinity;
  LENSES.forEach((l, i) => {
    const abs = (l.angle + noseAngle) % 360;
    const delta = Math.min(Math.abs(abs - 270), 360 - Math.abs(abs - 270));
    if (delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  });
  return { index: best, delta: bestDelta };
}

const PHASES = ['light', 'nose4', 'coarse', 'fine', 'nose10', 'fine10', 'nose40', 'fine40', 'stagexy', 'photo', 'done'];

const INSTRUCTIONS = {
  light: 'game.ms_light',
  nose4: 'game.ms_nose4',
  coarse: 'game.ms_coarse',
  fine: 'game.ms_fine',
  nose10: 'game.ms_nose10',
  fine10: 'game.ms_fine10',
  nose40: 'game.ms_nose40',
  fine40: 'game.ms_fine40',
  stagexy: 'game.ms_stagexy',
  photo: 'game.ms_photo',
  done: '',
};

// The microscope IS the workspace for this whole checkpoint — one
// persistent scene, each real part (light switch, rotating nosepiece,
// coarse/fine focus, stage X/Y knobs) its own physical-metaphor
// interaction in sequence, the eyepiece view updating live throughout.
export default function MicroscopeStageGame({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const { timeLimit = 0 } = step.parameters ?? {};

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [lightOn, setLightOn] = useState(false);
  const [noseAngle, setNoseAngle] = useState(-90); // starts with ×4 (angle 0 lens) near 270°... offset below
  // how far the focus is from sharp (signed: past the sharp point it goes blurry again); the blur is how far, either way
  const [focus, setFocusState] = useState(0);
  const blur = Math.min(16, Math.abs(focus));
  const [zoomOut, setZoomOut] = useState(false); // the student tapped to see the whole microscope
  const [pan, setPan] = useState({ x: 40, y: 40 }); // starts off-centre so stage knobs have real work to do
  const [dragging, setDragging] = useState(false);
  const [photo, setPhoto] = useState(null); // the picture just taken: { clear }
  const [flash, setFlash] = useState(false);
  const [camBox, setCamBox] = useState({ w: 700, h: 560 });
  const camRef = useRef(null);

  const sceneRef = useRef(null);
  const focusRef = useRef(0);
  const turningLensRef = useRef(false);
  const tapRef = useRef(null);
  const blurRef = useRef(0);
  const panRef = useRef(pan);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const setFocus = (v) => {
    focusRef.current = v;
    blurRef.current = Math.min(16, Math.abs(v));
    setFocusState(v);
  };

  const phase = PHASES[phaseIdx];
  const stageLive = phase === 'stagexy' || phase === 'photo'; // the stage knobs and the fine focus stay live for the final adjustments

  // the size of the camera window, so a part of the drawing can be put in the middle of it
  useEffect(() => {
    const el = camRef.current;
    if (!el) return undefined;
    const measure = () => setCamBox({ w: el.clientWidth || 700, h: el.clientHeight || 560 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // what to do next goes up in the instruction bar
  useEffect(() => {
    onHint?.(INSTRUCTIONS[phase] ? t(INSTRUCTIONS[phase]) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const { index: activeLens } = activeLensIndex(noseAngle);
  const zoom = ZOOM_BY_LENS[activeLens];
  const noseAngleRef = useRef(-90);

  // a new step starts from the zoom that suits it
  useEffect(() => {
    setZoomOut(false);
  }, [phase]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  const advance = useCallback(
    (msg) => {
      setPhaseIdx((i) => {
        const next = Math.min(PHASES.length - 1, i + 1);
        if (PHASES[next] === 'done') setTimeout(finish, 800);
        return next;
      });
      if (msg) onFeedback?.(msg);
    },
    [finish, onFeedback],
  );

  function toggleLight() {
    if (phase !== 'light') return;
    setLightOn(true);
    // the first view is out of focus: nothing is sharp until the student focuses it
    setFocus(10);
    advance(t('game.ms_light_on'));
  }

  // NOSEPIECE — tap the lens you want and the turret swings it into the light path.
  const targetLensForPhase = { nose4: 0, nose10: 1, nose40: 2 }[phase];
  function tapLens(i) {
    if (targetLensForPhase == null || turningLensRef.current) return;
    const from = noseAngleRef.current;
    const goal = 270 - LENSES[i].angle;
    const d = ((((goal - from) % 360) + 540) % 360) - 180;
    const finish = () => {
      turningLensRef.current = false;
      if (i === targetLensForPhase) {
        setFocus(START_BLUR_BY_LENS[i]);
        advance(t('game.ms_in_place', { label: LENSES[i].label }));
      } else {
        onFeedback?.(t('game.ms_wrong_lens', { label: LENSES[i].label, want: LENSES[targetLensForPhase].label }), 'wrong');
      }
    };
    if (Math.abs(d) < 1) {
      finish();
      return;
    }
    turningLensRef.current = true;
    const proxy = { a: from };
    gsap.to(proxy, {
      a: from + d,
      duration: 0.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        noseAngleRef.current = proxy.a;
        setNoseAngle(proxy.a);
      },
      onComplete: finish,
    });
  }

  // TURNING A KNOB — hold it and go round in a circle. Clockwise tightens the focus / moves the slide on; the knob on the
  // microscope turns with the finger.
  function turnKnob(onDelta, onEnd) {
    return (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const angleOf = (ev) => (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
      let last = angleOf(e);
      setDragging(true);
      const move = (ev) => {
        const a = angleOf(ev);
        let d = a - last;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        last = a;
        onDelta(d);
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        setDragging(false);
        onEnd?.();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
  }

  // FOCUS KNOBS — the coarse knob changes the focus in big steps, the fine knob in small ones. Go past the sharp point
  // and the picture gets blurry again, like the real thing.
  const COARSE_RATE = 0.04;
  const FINE_RATE = 0.025;
  const focusTurn = (rate, onDone) =>
    turnKnob(
      (d) => setFocus(Math.max(-16, Math.min(16, focusRef.current - d * rate))),
      onDone,
    );
  const coarseTurn = focusTurn(COARSE_RATE, () => {
    if (phase !== 'coarse') return;
    if (Math.abs(focusRef.current) <= 7) {
      setFocus(4);
      advance(t('game.ms_coarse_done'));
    } else {
      onFeedback?.(t('game.ms_still_blurry'), 'wrong');
    }
  });
  const fineStep = (activePhaseName, nextMsg) =>
    focusTurn(FINE_RATE, () => {
      if (phase !== activePhaseName) return;
      if (Math.abs(focusRef.current) <= 1.5) {
        setFocus(0);
        advance(nextMsg);
      } else {
        onFeedback?.(t('game.ms_still_blurry'), 'wrong');
      }
    });
  const fineTurns = {
    fine: fineStep('fine', t('game.ms_fine_done')),
    fine10: fineStep('fine10', t('game.ms_fine10_done')),
    fine40: fineStep('fine40', t('game.ms_fine40_done')),
  };

  // STAGE X/Y — turn either knob to move the slide until the target cell is centred.
  const targetCell = CELLS[TARGET_CELL];
  // The step only finishes once the chosen cell is centred AND in focus: centring a blurry cell is not enough
  // (the fine focus stays live in this last phase so it can be sharpened).
  const checkCentred = useCallback(() => {
    if (phase !== 'stagexy') return;
    const dx = panRef.current.x - (targetCell.cx - 80);
    const dy = panRef.current.y - (targetCell.cy - 80);
    if (Math.hypot(dx, dy) >= 6) return;
    if (blurRef.current > SHARP) {
      onFeedback?.(t('game.ms_focus_first'), 'wrong');
      return;
    }
    advance(t('game.ms_centred'));
  }, [phase, targetCell, advance, onFeedback, t]);

  const fineFinalTurn = focusTurn(FINE_RATE, () => {
    if (stageLive) checkCentred();
  });

  const PAN_RATE = 0.3;
  const stageTurn = (axis) =>
    turnKnob(
      (d) => {
        if (!stageLive) return;
        setPan((p) => {
          const next = { ...p, [axis]: Math.max(-60, Math.min(60, p[axis] + d * PAN_RATE)) };
          panRef.current = next;
          return next;
        });
      },
      () => checkCentred(),
    );
  const xKnobTurn = stageTurn('x');
  const yKnobTurn = stageTurn('y');

  // Taking the photo of the final view. It only counts if it is a clear picture of a cell: the chosen cell centred and the
  // picture sharp. Otherwise Lili says so and the whole thing starts again from the beginning.
  const photoIsClear = () => {
    const dx = panRef.current.x - (targetCell.cx - 80);
    const dy = panRef.current.y - (targetCell.cy - 80);
    return Math.hypot(dx, dy) < 6 && blurRef.current <= SHARP;
  };

  function resetAll() {
    setPhase0();
    setPhoto(null);
  }
  function setPhase0() {
    setPhaseIdx(0);
    setLightOn(false);
    setNoseAngle(-90);
    noseAngleRef.current = -90;
    setFocus(0);
    const start = { x: 40, y: 40 };
    setPan(start);
    panRef.current = start;
    turningLensRef.current = false;
  }

  function takePhoto() {
    if (phase !== 'photo' || photo) return;
    const clear = photoIsClear();
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    setPhoto({ clear });
    if (clear) {
      setTimeout(() => advance(t('game.ms_photo_ok')), 2200);
    } else {
      onFeedback?.(t('game.ms_photo_retry'), 'wrong');
      setTimeout(resetAll, 3200);
    }
  }

  // where the camera is looking: zoomed in on the part being used, or on the whole microscope
  const centred = Math.hypot(pan.x - (targetCell.cx - 80), pan.y - (targetCell.cy - 80)) < 6;
  const cam = (!zoomOut && CAMERA[phase]) || OVERVIEW;
  const kScale = Math.min(camBox.w / VB.w, camBox.h / VB.h);
  const offY = (camBox.h - VB.h * kScale) / 2;
  const camAnim = { scale: cam.zoom, x: camBox.w / 2 - cam.zoom * ((cam.at[0] - VB.x) * kScale), y: camBox.h / 2 - cam.zoom * ((cam.at[1] - VB.y) * kScale + offY) };

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* eyepiece view — fixed circular window, top-right */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 180,
          height: 180,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#000',
          border: '8px solid #2A2A2A',
          boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        }}
      >
        {lightOn && (
          <div style={{ width: '100%', height: '100%', filter: `blur(${blur}px)` }}>
            <CellView highlightIndex={stageLive || phase === 'done' ? TARGET_CELL : -1} zoom={zoom} pan={pan} />
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', top: 210, right: 20, width: 196, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: 'var(--color-dark)' }}>{t('game.mic_view')}</div>
        {lightOn && (
          <div style={{ padding: '4px 16px', borderRadius: 999, background: blur <= SHARP ? '#DDF3E6' : '#FFF1D6', border: `2px solid ${blur <= SHARP ? '#1E9E5A' : '#E8A020'}`, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: blur <= SHARP ? '#1E9E5A' : '#9A6200' }}>
            {blur <= SHARP ? `✓ ${t('game.mic_in_focus')}` : t('game.mic_blurry')}
          </div>
        )}
        {lightOn && stageLive && (
          <div style={{ padding: '4px 14px', borderRadius: 999, background: centred ? '#DDF3E6' : '#FFF1D6', border: `2px solid ${centred ? '#1E9E5A' : '#E8A020'}`, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, color: centred ? '#1E9E5A' : '#9A6200', textAlign: 'center' }}>
            {centred ? `✓ ${t('game.mic_centred')}` : t('game.mic_not_centred')}
          </div>
        )}
      </div>

      {/* which colour band is which objective lens */}
      <div style={{ position: 'absolute', top: 338, right: 16, width: 232, background: 'rgba(255,255,255,0.94)', border: '3px solid #D9CFAE', borderRadius: 16, padding: '12px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)', marginBottom: 8 }}>{t('game.lens_chart')}</div>
        {LENSES.map((l, i) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 10, background: i === activeLens ? 'rgba(232,160,32,0.18)' : 'transparent' }}>
            <div style={{ flex: '0 0 26px', width: 26, height: 26, borderRadius: 7, background: l.colour, border: '2px solid rgba(0,0,0,0.25)' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)', minWidth: 42 }}>{l.label}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 16, color: 'var(--color-mid)' }}>{t(['game.lens_low', 'game.lens_med', 'game.lens_high'][i])}</div>
          </div>
        ))}
      </div>

      {/* the camera window: it zooms in on whichever part you are using, and back out to the whole microscope */}
      <div
        ref={camRef}
        onPointerDown={(e) => {
          tapRef.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          // a tap on the bare microscope or the bench zooms out (or back in); the working parts keep their own taps and turns
          const down = tapRef.current;
          if (photo || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
          const c = window.getComputedStyle(e.target).cursor;
          if (c !== 'auto' && c !== 'default') return;
          setZoomOut((z) => !z);
        }}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '70%', overflow: 'hidden', touchAction: 'none' }}
      >
        <motion.div animate={camAnim} transition={{ type: 'spring', stiffness: 110, damping: 20 }} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0' }}>
          <MicroscopeArt
            fit
            tight
            labels={false}
            slide
            smear
            lightOn={lightOn}
            noseAngle={noseAngle}
            coarseAngle={-focus / COARSE_RATE}
            fineAngle={-focus / FINE_RATE}
            xAngle={pan.x / PAN_RATE}
            yAngle={pan.y / PAN_RATE}
            stageDy={blur * 0.9 - 4}
            slideDx={pan.x * 0.35}
            highlight={phase === 'light' ? 'light' : targetLensForPhase != null ? 'nose' : phase === 'coarse' ? 'coarse' : phase.startsWith('fine') ? 'fine' : phase === 'stagexy' ? (blur > SHARP ? 'fine' : 'stagexy') : null}
            enabled={{ light: phase === 'light', nose: targetLensForPhase != null, coarse: phase === 'coarse', fine: phase.startsWith('fine') || stageLive, stagexy: stageLive }}
            targetLens={targetLensForPhase ?? null}
            onLight={toggleLight}
            onLensTap={tapLens}
            onCoarseDown={coarseTurn}
            onFineDown={(e) => {
              if (phase === 'fine' || phase === 'fine10' || phase === 'fine40') fineTurns[phase](e);
              else if (stageLive) fineFinalTurn(e);
            }}
            onXDown={xKnobTurn}
            onYDown={yKnobTurn}
          />
        </motion.div>

        {/* a magnifier to show that the picture can be zoomed: tap anywhere on the microscope to zoom out or in */}
        {CAMERA[phase] && (
          <div style={{ position: 'absolute', left: 14, top: 14, width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: '3px solid #D9CFAE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, pointerEvents: 'none' }}>
            {zoomOut ? '🔍' : '🔎'}
          </div>
        )}

        {/* the last beat: take a photo of the view down the eyepiece */}
        {phase === 'photo' && !photo && (
          <button
            type="button"
            onClick={takePhoto}
            style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', padding: '14px 34px', borderRadius: 999, border: '4px solid #fff', background: 'linear-gradient(135deg, #FFC233, #FB8500)', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: '#fff', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ fontSize: 30, lineHeight: 1 }}>📷</span>
            {t('game.ms_photo_btn')}
          </button>
        )}
      </div>

      {/* the camera flash, and then the photo itself */}
      <AnimatePresence>
        {flash && <motion.div initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.26 }} style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 80, pointerEvents: 'none' }} />}
      </AnimatePresence>
      <AnimatePresence>
        {photo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', left: '36%', top: '50%', x: '-50%', y: '-50%', zIndex: 70, background: '#fff', padding: '16px 16px 10px', borderRadius: 6, boxShadow: '0 14px 34px rgba(0,0,0,0.38)', textAlign: 'center' }}
          >
            <div style={{ width: 300, height: 300, borderRadius: '50%', overflow: 'hidden', background: '#000', border: '8px solid #2A2A2A' }}>
              <div style={{ width: '100%', height: '100%', filter: `blur(${blur}px)` }}>
                <CellView highlightIndex={TARGET_CELL} zoom={zoom} pan={pan} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: photo.clear ? '#1E9E5A' : '#C0392B' }}>
              {photo.clear ? `✓ ${t('game.ms_photo_clear')}` : `✗ ${t('game.ms_photo_unclear')}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'pointing'} active={phase !== 'done'} />
    </div>
  );
}
