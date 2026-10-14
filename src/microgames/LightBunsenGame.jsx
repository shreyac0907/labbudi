import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import BunsenBurner from '../components/equipment/BunsenBurner';
import Tripod from '../components/equipment/Tripod';
import Gauze from '../components/equipment/Gauze';
import EvaporatingDish from '../components/equipment/EvaporatingDish';
import HeatMat from '../components/equipment/HeatMat';
import { CollarHandle } from '../components/equipment/CollarControl';
import RigStage from '../components/equipment/RigStage';
import { stackPoint, stackGeometry, STACK_SIZE, STACK_Z } from '../components/equipment/bunsenSetup';
import { WarmZone } from './shared/LabGraphics';
import PipHand from '../components/PipHand';
import ZoneTimingBar from '../components/ZoneTimingBar';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const BURN_MS = 8000; // long enough to open the gas (a tap, then three circles) and reach the barrel
// A touch quicker than the P2 meter-zeroing bar, but slow enough to time.
const STRIKE_BAR_MS = 2000;
// Gas-on tap sequence — 3 circles flash in order, all 3 within this budget
// for a clean light. One miss still lights (minor penalty); two or more
// means the gas isn't fully open and the sequence must be repeated.
const TAP_SEQ_MS = 2000;
// A collar opened this quickly after the safety flame catches reads as one
// smooth motion — the "Blue Flame" surprise bonus (Prompt 3).
const SMOOTH_COLLAR_MS = 7000;

// One continuous scene, four physical-metaphor beats in sequence — no
// blank screens between them (Section 2.2): strike a match (fast swipe
// across the strike strip), turn the gas tap, touch the lit match to the
// barrel, then open the collar for the roaring flame. A match that burns
// out along the way (too slow to strike, too slow to get the gas on and
// the barrel lit) is a soft failure — box re-opens, try again, no penalty.
export default function LightBunsenGame({ step, onComplete, onFeedback, onHint }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { timeLimit = 30 } = parameters;
  const { actions } = useGameState();

  const [phase, setPhase] = useState('matchbox'); // matchbox | strike | lit | gas_on | done
  const [burnFrac, setBurnFrac] = useState(1); // 1 = fresh match, 0 = burned out
  const [flameState, setFlameState] = useState('off');
  const [flameWeak, setFlameWeak] = useState(false); // orange-zone strike — half-height flame
  const [gasOn, setGasOn] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [strikeResult, setStrikeResult] = useState(null); // null | 'blue' | 'yellow' | 'red' (ZoneTimingBar's own zone names)
  const [scorched, setScorched] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [tapSeq, setTapSeq] = useState(null); // { doneCount, misses, startTime } | null while the gas-tap sequence runs
  const [tapSeqFailed, setTapSeqFailed] = useState(false);
  const [blueFlameBonus, setBlueFlameBonus] = useState(false);
  const [collarAmt, setCollarAmt] = useState(0); // 0 = collar closed (yellow flame), 1 = fully open (blue flame)
  const [bursts, setBursts] = useState([]); // sparks thrown off as the match head scrapes the strip

  const sceneRef = useRef(null);
  const [sceneSize, setSceneSize] = useState({ w: 1000, h: 560 });
  const sceneH = sceneSize.h;
  const matchRef = useRef(null);
  const flameRef = useRef(null);
  const strikeTlRef = useRef(null);
  const flickerRef = useRef(null);
  const burnStartRef = useRef(0);
  const burnRafRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const gasOnStartRef = useRef(0); // Date.now() when the safety flame first catches — for the Blue Flame smoothness bonus
  const doneRef = useRef(false);

  const stopBurnTimer = useCallback(() => {
    if (burnRafRef.current) cancelAnimationFrame(burnRafRef.current);
    burnRafRef.current = null;
  }, []);

  const matchGoesOut = useCallback(() => {
    stopBurnTimer();
    setPhase('matchbox');
    setBurnFrac(1);
    setGasOn(false);
    setFlameWeak(false);
    onFeedback?.(t('game.match_out'), 'wrong');
  }, [onFeedback, stopBurnTimer]);

  const startBurnTimer = useCallback(() => {
    burnStartRef.current = Date.now();
    function tick() {
      const t = (Date.now() - burnStartRef.current) / BURN_MS;
      if (t >= 1) {
        matchGoesOut();
        return;
      }
      setBurnFrac(1 - t);
      burnRafRef.current = requestAnimationFrame(tick);
    }
    burnRafRef.current = requestAnimationFrame(tick);
  }, [matchGoesOut]);

  useEffect(() => () => stopBurnTimer(), [stopBurnTimer]);

  function openBox() {
    if (phase !== 'matchbox') return;
    setPhase('strike');
    setStrikeResult(null);
    setScorched(false);
    setShowBar(true);
  }

  // the match head, scraped along the striker strip (box units, in the matchbox's own 70 x 40 space)
  const STRIP = { from: 14, to: 58, y: 27 };

  function burst(x) {
    const id = `${Date.now()}-${x}`;
    setBursts((b) => [...b, { id, x }]);
    setTimeout(() => setBursts((b) => b.filter((k) => k.id !== id)), 400);
  }

  // The match is dragged across the strip: a short scrape that fails on a miss, a full one that lights it
  const strikeMatch = useCallback(
    (zone, after) => {
      const m = matchRef.current;
      const f = flameRef.current;
      if (!m || !f) {
        after?.();
        return;
      }
      strikeTlRef.current?.kill();
      const tl = gsap.timeline({ onComplete: after });
      strikeTlRef.current = tl;
      if (zone === 'red') {
        tl.to(m, { x: STRIP.from + 16, duration: 0.3, ease: 'power1.in' }).to(m, { x: STRIP.from, duration: 0.35, ease: 'power2.out' }, '+=0.3');
      } else {
        tl.call(burst, [24], 0.08)
          .call(burst, [38], 0.17)
          .call(burst, [52], 0.26)
          .to(m, { x: STRIP.to, duration: 0.34, ease: 'power2.in' }, 0)
          .to(f, { scale: zone === 'blue' ? 1 : 0.6, duration: 0.5, ease: 'back.out(3)' }, 0.3)
          .to({}, { duration: 0.35 });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // the match waits, head on the left end of the strip, with no flame
  useEffect(() => {
    if (phase !== 'strike' || !matchRef.current || !flameRef.current) return;
    flickerRef.current?.kill();
    gsap.set(matchRef.current, { x: STRIP.from, y: STRIP.y });
    gsap.set(flameRef.current, { scale: 0, transformOrigin: '50% 100%' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // once lit, the flame flickers while the match burns
  useEffect(() => {
    if (phase !== 'lit' || !flameRef.current) return undefined;
    const base = flameWeak ? 0.6 : 1;
    const tween = gsap.to(flameRef.current, { scaleY: base * 1.12, scaleX: base * 0.94, duration: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 100%' });
    flickerRef.current = tween;
    return () => tween.kill();
  }, [phase, flameWeak]);

  useEffect(() => () => strikeTlRef.current?.kill(), []);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const measure = () => setSceneSize({ w: el.clientWidth || 1000, h: el.clientHeight || 560 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleStrikeResult = useCallback(
    (zone) => {
      setStrikeResult(zone);
      actions.addScore(zone === 'blue' ? 100 : zone === 'yellow' ? 60 : 0);

      if (zone === 'red') {
        setScorched(true);
        setMistakes((m) => m + 1);
        strikeMatch('red');
        setTimeout(() => {
          setStrikeResult(null);
          setScorched(false);
        }, 900);
        return;
      }

      setFlameWeak(zone === 'yellow');
      strikeMatch(zone, () => {
        setShowBar(false);
        setPhase('lit');
        startBurnTimer();
        onFeedback?.(zone === 'blue' ? t('game.strike_perfect') : t('game.strike_good'));
      });
    },
    [onFeedback, startBurnTimer, actions, strikeMatch],
  );

  // Gas-on used to be a single tap on the lever; it's now a 3-circle tap
  // sequence (Prompt 3) — the same "turn gas on THEN light" real-world
  // sequence, taught through rhythm-game repetition instead of an
  // instruction line. Starting it just arms the circles; resolving it
  // (see tapCircle) is what actually flips gasOn.
  function startTapSequence() {
    if (phase !== 'lit' || gasOn || tapSeq) return;
    setTapSeqFailed(false);
    setTapSeq({ doneCount: 0, misses: 0, startTime: Date.now() });
  }

  function resolveTapSequence(misses) {
    if (misses >= 2) {
      setTapSeq(null);
      setTapSeqFailed(true);
      onFeedback?.(t('game.gas_not_open'), 'wrong');
      return;
    }
    setTapSeq(null);
    setGasOn(true);
    if (misses === 1) setMistakes((m) => m + 1);
    onFeedback?.(t('game.gas_on'));
  }

  function tapCircle(i) {
    setTapSeq((s) => {
      if (!s) return s;
      if (i !== s.doneCount) return { ...s, misses: s.misses + 1 };
      const late = Date.now() - s.startTime > TAP_SEQ_MS;
      const doneCount = s.doneCount + 1;
      const misses = s.misses + (late ? 1 : 0);
      if (doneCount === 3) {
        setTimeout(() => resolveTapSequence(misses), 0);
        return { doneCount, misses, startTime: s.startTime };
      }
      return { doneCount, misses, startTime: s.startTime };
    });
  }

  function touchToBarrel() {
    if (phase !== 'lit' || !gasOn) return;
    stopBurnTimer();
    setFlameState('safety');
    setPhase('gas_on');
    gasOnStartRef.current = Date.now();
    onFeedback?.(t('game.flame_yellow'));
  }

  function openCollar() {
    if (phase !== 'gas_on') return;
    setFlameState('roaring');
    setPhase('done');
    onFeedback?.(t('game.flame_blue'));

    // Blue Flame surprise bonus — the collar opened in one smooth motion
    // (quickly after the safety flame caught, no dithering).
    if (Date.now() - gasOnStartRef.current <= SMOOTH_COLLAR_MS) {
      setBlueFlameBonus(true);
      actions.addScore(150);
      setTimeout(() => onFeedback?.(t('game.beautiful_combustion')), 300);
      setTimeout(() => setBlueFlameBonus(false), 1400);
    }

    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    setTimeout(() => onComplete({ accuracy: 1, timing, completion: 1, mistakes, score: Math.round(90 + timing * 10) }), 1200);
  }

  // the collar dial / wheel / drag all end up here: the flame follows the collar live, and fully open lights the blue flame
  function setCollar(v) {
    if (phase !== 'gas_on') return;
    const next = Math.max(0, Math.min(1, v));
    setCollarAmt(next);
    if (next >= 0.92) openCollar();
  }

  const boxOpen = phase !== 'matchbox';
  const matchVisible = phase === 'strike' || (phase === 'lit' && !gasOn);
  const holdingMatch = phase === 'lit' && gasOn; // the lit match is now in the student's hand, to be taken to the barrel
  const canLightBarrel = phase === 'lit' && gasOn;

  // what to do next goes up in the instruction bar (not as small text on the scene)
  useEffect(() => {
    onHint?.(
      phase === 'matchbox'
        ? t('game.tap_matchbox')
        : phase === 'strike'
          ? t('game.strike_match')
          : phase === 'lit'
            ? !gasOn
              ? tapSeq
                ? t('game.tap_circles')
                : t('game.turn_gas')
              : t('game.touch_barrel')
            : phase === 'gas_on'
              ? t('game.open_collar_blue')
              : null,
    );
  }, [phase, gasOn, tapSeq, onHint, t]);

  return (
    <div ref={sceneRef} onWheel={(e) => phase === 'gas_on' && setCollar(collarAmt - e.deltaY / 300)} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <BonusBanner active={blueFlameBonus} text={t('ui.perfect_flame')} points={150} color="#4FC3F7" />

      {/* the same stack the setup steps built (bunsenSetup), with the burner as the centrepiece */}
      <RigStage>
        {({ w, h }) => {
          const { sc } = stackGeometry(w, h);
          const burner = stackPoint('burner', w, h);
          const at = (kind) => {
            const p = stackPoint(kind, w, h);
            return { position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', zIndex: STACK_Z[kind] };
          };
          const jetY = burner.y - 67 * sc; // the top of the barrel
          const collarY = burner.y + 38 * sc;
          const inlet = { x: burner.x - 18 * sc, y: burner.y + 52 * sc }; // the red gas nozzle on the burner's base
          const tap = { x: burner.x - 100 * sc, y: burner.y + 46 * sc }; // the gas tap on the bench, left of the tripod's foot
          const tapSize = 44 * sc;
          const gasActive = phase === 'lit' && !gasOn && !tapSeq;
          return (
            <>
              <div style={at('mat')}>
                <HeatMat size={STACK_SIZE.mat * sc} shadow={false} />
              </div>
              <div style={at('tripod')}>
                <Tripod size={STACK_SIZE.tripod * sc} shadow={false} />
              </div>

              {/* the rubber tube from the gas tap to the burner's nozzle */}
              <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: STACK_Z.burner + 0.5 }}>
                <path d={`M${tap.x + tapSize * 0.5},${tap.y + tapSize * 0.12} C${tap.x + 50 * sc},${tap.y + 30 * sc} ${inlet.x - 30 * sc},${inlet.y + 18 * sc} ${inlet.x},${inlet.y}`} fill="none" stroke="#B02A2A" strokeWidth={Math.max(4, 3.2 * sc)} strokeLinecap="round" />
                <path d={`M${tap.x + tapSize * 0.5},${tap.y + tapSize * 0.12} C${tap.x + 50 * sc},${tap.y + 30 * sc} ${inlet.x - 30 * sc},${inlet.y + 18 * sc} ${inlet.x},${inlet.y}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(1.5, 1.1 * sc)} strokeLinecap="round" />
              </svg>

              <div style={at('burner')}>
                <motion.div animate={blueFlameBonus ? { filter: ['hue-rotate(0deg) saturate(1)', 'hue-rotate(25deg) saturate(1.8)', 'hue-rotate(0deg) saturate(1)'] } : {}} transition={{ duration: 1.2 }}>
                  <BunsenBurner size={STACK_SIZE.burner * sc} state={flameState} collarOpenAmount={phase === 'gas_on' || phase === 'done' ? (phase === 'done' ? 1 : collarAmt) : null} shadow={false} />
                </motion.div>
              </div>
              <div style={at('gauze')}>
                <Gauze size={STACK_SIZE.gauze * sc} shadow={false} />
              </div>
              <div style={at('dish')}>
                <EvaporatingDish size={STACK_SIZE.dish * sc} contentState="solution" shadow={false} />
              </div>

              {/* gas tap: a big red valve on the bench; pressing it arms the 3-circle tap sequence */}
              <div
                onPointerDown={gasActive ? startTapSequence : undefined}
                style={{ position: 'absolute', left: tap.x, top: tap.y, transform: 'translate(-50%, -50%)', zIndex: 8, pointerEvents: 'auto', cursor: gasActive ? 'pointer' : 'default' }}
              >
                <WarmZone width={tapSize * 1.9} height={tapSize * 1.9} visible={gasActive} bright />
                <motion.svg
                  width={tapSize}
                  height={tapSize}
                  viewBox="0 0 60 60"
                  style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -tapSize / 2, marginTop: -tapSize / 2, overflow: 'visible' }}
                  animate={gasActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.8, repeat: gasActive ? Infinity : 0 }}
                >
                  {/* the valve body, with the nozzle the tube runs from */}
                  <rect x="30" y="38" width="30" height="14" rx="5" fill="#8A8F96" stroke="#4A4F55" strokeWidth="2.5" />
                  <rect x="12" y="34" width="22" height="22" rx="6" fill="#9AA0A8" stroke="#4A4F55" strokeWidth="2.5" />
                  {/* the red handle turns a quarter when the gas is on */}
                  <motion.g animate={{ rotate: gasOn ? 90 : 0 }} transition={{ duration: 0.3 }} style={{ transformOrigin: '23px 45px' }}>
                    <rect x="19" y="4" width="8" height="32" rx="4" fill="#D32F2F" stroke="#8B0000" strokeWidth="2.5" />
                    <circle cx="23" cy="45" r="9" fill="#E53935" stroke="#8B0000" strokeWidth="2.5" />
                  </motion.g>
                </motion.svg>
                <div style={{ position: 'absolute', left: '50%', top: tapSize * 1.0, transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: 10, background: '#fff', border: `2px solid ${gasActive ? '#E8A020' : '#C9BF9A'}`, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, color: '#7A4A00', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                  {gasActive ? t('game.press_gas_tap') : t('game.gas_tap')}
                </div>
                {tapSeqFailed && !tapSeq && !gasOn && (
                  <div style={{ position: 'absolute', top: tapSize * 1.0 + 40, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: '#D32F2F', whiteSpace: 'nowrap' }}>{t('game.tap_retry')}</div>
                )}
              </div>

              {/* 3-circle tap sequence: tap each circle as it lights up, all 3 within TAP_SEQ_MS for a clean light */}
              <AnimatePresence>
                {tapSeq && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'absolute', left: tap.x, top: tap.y - tapSize * 1.25, transform: 'translate(-50%, -100%)', display: 'flex', gap: 14, zIndex: 20, pointerEvents: 'auto' }}
                  >
                    {[0, 1, 2].map((i) => {
                      const circleState = i < tapSeq.doneCount ? 'done' : i === tapSeq.doneCount ? 'active' : 'idle';
                      return (
                        <motion.div
                          key={i}
                          onClick={() => tapCircle(i)}
                          animate={circleState === 'active' ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                          transition={{ duration: 0.45, repeat: circleState === 'active' ? Infinity : 0 }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: circleState === 'done' ? 'var(--color-mint)' : circleState === 'active' ? '#FFD34D' : '#eee',
                            border: `2px solid ${circleState === 'active' ? '#E8A020' : circleState === 'done' ? 'var(--color-mint)' : '#ccc'}`,
                            cursor: 'pointer',
                            boxShadow: circleState === 'active' ? '0 0 14px rgba(232,160,32,0.6)' : 'none',
                          }}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* gas shimmer, a visible "waiting" action instead of a blank timer */}
              <AnimatePresence>
                {gasOn && phase === 'lit' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ position: 'absolute', left: burner.x, top: jetY - 30 * sc, width: 24 * sc, height: 60 * sc, transform: 'translate(-50%, -50%)', background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)', filter: 'blur(3px)', pointerEvents: 'none', zIndex: 6 }}
                  />
                )}
              </AnimatePresence>

              {/* light-the-barrel target, only live once gas is on */}
              {canLightBarrel && (
                <>
                  <div onClick={touchToBarrel} style={{ position: 'absolute', left: burner.x, top: jetY - 8 * sc, transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 9, pointerEvents: 'auto' }}>
                    <WarmZone width={30 * sc} height={30 * sc} bright visible />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: burner.x + 30 * sc,
                      top: jetY - 8 * sc,
                      transform: 'translateY(-50%)',
                      zIndex: 9,
                      padding: '6px 14px',
                      borderRadius: 12,
                      background: '#fff',
                      border: '2px solid #E8A020',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: 17,
                      color: '#7A4A00',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}
                  >
                    {t('game.light_here')}
                  </div>
                </>
              )}

              {/* the collar, live once the safety flame is burning: slide it to open the air hole */}
              {phase === 'gas_on' && (
                <CollarHandle cx={burner.x} cy={collarY} u={sc} value={collarAmt} onChange={setCollar} label={t('game.turn_collar')} />
              )}
            </>
          );
        }}
      </RigStage>

      {/* once the gas is on, the lit match is picked up: drag it to the top of the barrel */}
      {holdingMatch && (() => {
        const { sc } = stackGeometry(sceneSize.w, sceneSize.h);
        const burner = stackPoint('burner', sceneSize.w, sceneSize.h);
        const jetY = burner.y - 67 * sc;
        return (
          <HeldMatch
            rest={{ x: sceneSize.w * 0.08 + 81, y: sceneSize.h * 0.92 - 22 }}
            target={{ x: burner.x, y: jetY + 6 }}
            snap={Math.max(60, 34 * sc)}
            burnFrac={burnFrac}
            weak={flameWeak}
            onLit={touchToBarrel}
          />
        );
      })()}

      {/* the rest of the scene steps back while the match is struck */}
      <motion.div animate={{ opacity: phase === 'strike' ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0, background: 'rgba(255,248,232,0.82)', pointerEvents: 'none', zIndex: 10 }} />

      {/* matchbox + match: zooms in to fill the screen for the strike timing-game, then settles back down once it is lit */}
      <motion.div
        initial={false}
        animate={
          phase === 'strike'
            ? { left: '50%', top: sceneH * 0.5 - 20, bottom: 'auto', scale: Math.max(2.8, Math.min(5, (sceneH / 560) * 5)), x: '-50%' }
            : { left: '8%', top: sceneH * 0.92 - 52, bottom: 'auto', scale: 1.4, x: '0%' }
        }
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        style={{ position: 'absolute', zIndex: 11 }}
      >
        <div onClick={openBox} style={{ position: 'relative', cursor: phase === 'matchbox' ? 'pointer' : 'default' }}>
          <svg width="70" height="40" viewBox="0 0 70 40" style={{ overflow: 'visible' }}>
            <rect x="0" y="10" width="70" height="30" rx="3" fill="#C8935A" stroke="#8A6238" strokeWidth="1.5" />
            {/* the striker strip: a rough dark band along the box */}
            <rect x="6" y="23" width="58" height="9" rx="1.5" fill="#4E3320" />
            {Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx={9 + (i % 15) * 3.7} cy={25.5 + Math.floor(i / 15) * 4} r="0.6" fill="#7A5638" />
            ))}
            <motion.rect x="4" width="62" height="26" rx="2" fill="#8B3A3A" animate={{ y: boxOpen ? -18 : 12 }} transition={{ duration: 0.3 }} style={{ opacity: 0.9 }} />

            {/* the match: its head sits on the strip and is dragged along it; the stick trails behind it */}
            {matchVisible && (
              <g ref={matchRef} style={{ pointerEvents: 'none' }}>
                <line x1="0" y1="0" x2="-27" y2="-34" stroke="#B88A3E" strokeWidth="3.8" strokeLinecap="round" />
                <line x1="-0.5" y1="-0.8" x2="-26" y2="-33" stroke="#E6C27A" strokeWidth="1.3" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="4.8" ry="4.2" fill={scorched ? '#2B2018' : '#B3362E'} stroke="#6E1F1A" strokeWidth="0.8" />
                <g opacity={phase === 'lit' ? burnFrac : 1}>
                  <g ref={flameRef}>
                    <path d="M0,-3 C-8,-11 -7.5,-21 0,-34 C7.5,-21 8,-11 0,-3 Z" fill="#F2A227" />
                    <path d="M0,-3.5 C-3.8,-8.5 -3.5,-14 0,-21 C3.5,-14 3.8,-8.5 0,-3.5 Z" fill="#FFE27A" />
                  </g>
                </g>
              </g>
            )}

            {/* sparks thrown off as the head scrapes the strip */}
            {bursts.map((b) => (
              <SparkBurst key={b.id} x={b.x} y={STRIP.y} />
            ))}
          </svg>
        </div>
      </motion.div>

      {/* strike timing bar: Cooking-Mama-style zone bar, shared component */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'absolute', left: '6%', right: '6%', bottom: '6%', zIndex: 12 }}
          >
            <ZoneTimingBar onResult={handleStrikeResult} speedMs={STRIKE_BAR_MS} label={t('game.strike_bar_label')} />
          </motion.div>
        )}
      </AnimatePresence>

      <PipHand containerRef={sceneRef} state="pointing" active={phase !== 'done'} />
    </div>
  );
}

// a handful of sparks flying off the strip, done with GSAP
function SparkBurst({ x, y }) {
  const ref = useRef(null);
  useEffect(() => {
    const dots = ref.current.querySelectorAll('circle');
    const tween = gsap.fromTo(
      dots,
      { x: 0, y: 0, opacity: 1 },
      { x: (i) => 8 + Math.random() * 12 + i * 0.7, y: (i) => -(5 + Math.random() * 15) + (i % 2) * 7, opacity: 0, duration: 0.32, ease: 'power2.out' },
    );
    return () => tween.kill();
  }, []);
  return (
    <g ref={ref} transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} r="0.9" fill={i % 2 ? '#FFD34D' : '#FF9A3D'} />
      ))}
    </g>
  );
}

// The lit match, now big enough to carry: its head is the point that has to reach the barrel. Drag it there
// (let go near the top of the barrel to light the burner); let go anywhere else and it slides back to the box.
function HeldMatch({ rest, target, snap, burnFrac, weak, onLit }) {
  const ref = useRef(null);
  const flameRef = useRef(null);
  const grab = useRef(null);
  const U = 3.2; // match units to pixels

  useEffect(() => {
    gsap.set(ref.current, { x: rest.x, y: rest.y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tween = gsap.to(flameRef.current, { scaleY: 1.12, scaleX: 0.94, duration: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 100%' });
    return () => tween.kill();
  }, []);

  function down(e) {
    e.preventDefault();
    const box = ref.current.parentElement.getBoundingClientRect();
    grab.current = {
      box,
      dx: gsap.getProperty(ref.current, 'x') - (e.clientX - box.left),
      dy: gsap.getProperty(ref.current, 'y') - (e.clientY - box.top),
    };
    const move = (ev) => gsap.set(ref.current, { x: ev.clientX - box.left + grab.current.dx, y: ev.clientY - box.top + grab.current.dy });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const x = gsap.getProperty(ref.current, 'x');
      const y = gsap.getProperty(ref.current, 'y');
      if (Math.hypot(x - target.x, y - target.y) <= snap) {
        gsap.to(ref.current, { x: target.x, y: target.y, duration: 0.15, onComplete: onLit });
      } else {
        gsap.to(ref.current, { x: rest.x, y: rest.y, duration: 0.45, ease: 'power2.out' });
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, zIndex: 13, touchAction: 'none' }}>
      <svg width="1" height="1" style={{ overflow: 'visible', display: 'block' }}>
        <g transform={`scale(${U})`}>
          <line x1="0" y1="0" x2="-27" y2="-34" stroke="#B88A3E" strokeWidth="3.8" strokeLinecap="round" />
          <line x1="-0.5" y1="-0.8" x2="-26" y2="-33" stroke="#E6C27A" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="0" cy="0" rx="4.8" ry="4.2" fill="#B3362E" stroke="#6E1F1A" strokeWidth="0.8" />
          <g opacity={burnFrac} transform={`translate(0 -3) scale(${weak ? 0.7 : 1}) translate(0 3)`}>
            <g ref={flameRef}>
              <path d="M0,-3 C-8,-11 -7.5,-21 0,-34 C7.5,-21 8,-11 0,-3 Z" fill="#F2A227" />
              <path d="M0,-3.5 C-3.8,-8.5 -3.5,-14 0,-21 C3.5,-14 3.8,-8.5 0,-3.5 Z" fill="#FFE27A" />
            </g>
          </g>
        </g>
        {/* a generous grab area around the head and along the stick */}
        <line x1="0" y1="0" x2={-27 * U} y2={-34 * U} stroke="transparent" strokeWidth="64" strokeLinecap="round" style={{ cursor: 'grab', pointerEvents: 'stroke' }} onPointerDown={down} />
        <circle cx="0" cy="0" r="46" fill="transparent" style={{ cursor: 'grab' }} onPointerDown={down} />
      </svg>
    </div>
  );
}
