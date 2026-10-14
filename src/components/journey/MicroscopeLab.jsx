import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CharacterShowcase from '../CharacterShowcase';
import { Pin } from '../corkboard/Pin';
import {
  MicroscopeSVG,
  GlassSlideSVG,
  CoverslipSVG,
  IodineBottleSVG,
  OnionLayerSVG,
  ForcepsSVG,
  DropperSVG,
  CellViewSVG,
} from './MicroscopeEquipment';
import { screenFiveResultsKey, screenFiveProgressKey, screenFiveCompleteKey } from '../../data/practicalStorage';

const SQUEEZE_MS = 500;
const COVERSLIP_MIN = 30;
const COVERSLIP_MAX = 45;
const COVERSLIP_BUBBLE = 60;

const STRUCTURES = [
  { id: 'cell_wall', label: 'Cell wall', x: 92, y: 20, fact: 'The cell wall is made of cellulose — the same material in paper and cotton. It gives the cell a rigid, fixed shape.' },
  { id: 'cell_membrane', label: 'Cell membrane', x: 100, y: 20, fact: 'The cell membrane controls what enters and leaves the cell — it is selectively permeable.' },
  { id: 'nucleus', label: 'Nucleus', x: 128, y: 50, fact: 'The nucleus contains DNA — the instruction manual for the entire cell. Every cell in the onion has an identical copy.' },
  { id: 'vacuole', label: 'Vacuole', x: 128, y: 110, fact: "The large central vacuole takes up most of the cell's volume. It stores water and maintains the cell's shape by keeping it turgid." },
];

export default function MicroscopeLab({ year, practicalId, wetLabDialogue, onContinue }) {
  const [peeled, setPeeled] = useState(false);
  const [onSlide, setOnSlide] = useState(false);
  const [iodineAdded, setIodineAdded] = useState(false);
  const [coverslipOn, setCoverslipOn] = useState(false);
  const [onStage, setOnStage] = useState(false);
  const [objective, setObjective] = useState(null);
  const [coarseFocus, setCoarseFocus] = useState(0);
  const [fineFocus, setFineFocus] = useState(0);
  const [armedLabel, setArmedLabel] = useState(null);
  const [placedLabels, setPlacedLabels] = useState({});
  const [wrongHotspot, setWrongHotspot] = useState(null);
  const [squeezing, setSqueezing] = useState(false);
  const [coverslipAngle, setCoverslipAngle] = useState(0);
  const [showBubbleWarning, setShowBubbleWarning] = useState(false);
  const [trigger, setTrigger] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  const triggerIdRef = useRef(0);
  const welcomedRef = useRef(false);
  const squeezeTimerRef = useRef(null);

  function fireCharacterTrigger(character, text, variant) {
    triggerIdRef.current += 1;
    setTrigger({ type: 'scripted', index: triggerIdRef.current, character, text, variant });
  }

  useEffect(() => {
    if (!welcomedRef.current) {
      welcomedRef.current = true;
      fireCharacterTrigger('lili', "Microscopy is one of the most important skills in biology. Let's prepare a proper slide.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coarse focus only brings blur down to 3px — fine focus is required to
  // reach a sharp 0px image, matching the two-stage focusing process.
  const blur = objective ? Math.max(0, 10 - (coarseFocus / 100) * 7 - (fineFocus / 100) * 3) : 10;
  const cellsInFocus = blur <= 0.1;
  const labelledCount = Object.keys(placedLabels).length;

  function handlePeel() {
    setPeeled(true);
    fireCharacterTrigger('pip', 'Perfect — that thin inner layer is exactly what we need.');
    localStorage.setItem(screenFiveProgressKey(year, practicalId), '1');
  }
  function handlePlaceOnSlide() {
    setOnSlide(true);
    fireCharacterTrigger('lili', 'Flat and centred — good. No wrinkles.');
  }
  function startSqueeze() {
    if (iodineAdded) return;
    setSqueezing(true);
    squeezeTimerRef.current = setTimeout(() => {
      setIodineAdded(true);
      setSqueezing(false);
      fireCharacterTrigger('lili', 'One drop is enough! The iodine will stain the nuclei so we can see them.');
    }, SQUEEZE_MS);
  }
  function endSqueeze() {
    clearTimeout(squeezeTimerRef.current);
    if (squeezing && !iodineAdded) {
      setSqueezing(false);
      fireCharacterTrigger('pip', 'Hold it a bit longer!');
    }
  }

  function handleTiltPointerDown(e) {
    const startY = e.clientY;
    const startAngle = coverslipAngle;
    function onMove(ev) {
      const dy = ev.clientY - startY;
      const next = Math.max(0, Math.min(90, startAngle + dy * 0.6));
      setCoverslipAngle(next);
      setShowBubbleWarning(next > COVERSLIP_BUBBLE);
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function handleLowerCoverslip() {
    if (coverslipAngle < COVERSLIP_MIN || coverslipAngle > COVERSLIP_MAX) return;
    setCoverslipOn(true);
    fireCharacterTrigger('pip', 'Perfect angle — smooth lowering, no bubbles.');
  }
  function handleStage() {
    setOnStage(true);
    fireCharacterTrigger('pip', 'Slide prepared and mounted! Progress saved.');
    localStorage.setItem(screenFiveProgressKey(year, practicalId), '5');
  }
  function handleObjective(power) {
    if (power === objective) return;
    setObjective(power);
    if (power === 4) fireCharacterTrigger('pip', 'Low power selected — total magnification ×40.');
    else fireCharacterTrigger('madu', 'Higher magnification means more detail but a smaller field of view. There is always a trade-off!');
  }
  function handleNosepieceDrag(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    function onMove(ev) {
      const power = ev.clientX < cx ? 4 : 10;
      handleObjective(power);
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    onMove(e);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
  function handleCoarse(v) {
    const clamped = Math.max(0, Math.min(100, v));
    setCoarseFocus(clamped);
    if (clamped >= 60 && clamped < 100) fireCharacterTrigger('pip', 'Getting closer! Keep going...');
    if (clamped >= 100) fireCharacterTrigger('pip', 'Almost there — switch to the fine focus knob now.');
  }
  function handleCoarseWheel(e) {
    e.preventDefault();
    handleCoarse(coarseFocus + (e.deltaY > 0 ? 6 : -6));
  }
  function handleFine(v) {
    setFineFocus(v);
    if (v >= 100) {
      fireCharacterTrigger('lili', "THERE THEY ARE! Can you see the cell walls? The nuclei? This is a real plant cell — you're looking at life.");
    }
  }
  function handleArm(structId) {
    setArmedLabel(structId);
  }
  function handleHotspot(structId) {
    if (!armedLabel) return;
    if (armedLabel !== structId) {
      const armedStruct = STRUCTURES.find((s) => s.id === armedLabel);
      setWrongHotspot(structId);
      fireCharacterTrigger('lili', `Look again — that's not the ${armedStruct.label}. Try a different spot.`);
      setTimeout(() => setWrongHotspot(null), 350);
      return;
    }
    const struct = STRUCTURES.find((s) => s.id === structId);
    setPlacedLabels((prev) => {
      const next = { ...prev, [structId]: true };
      if (Object.keys(next).length === STRUCTURES.length) {
        localStorage.setItem(screenFiveResultsKey(year, practicalId), JSON.stringify(next));
        localStorage.setItem(screenFiveCompleteKey(year, practicalId), 'true');
        setShowContinue(true);
      }
      return next;
    });
    fireCharacterTrigger('lili', struct.fact);
    setArmedLabel(null);
  }

  function handleResetPractical() {
    const confirmed = window.confirm(
      'Reset the Wet Lab? Your slide and labelled structures for this practical will be cleared, as if you never started.'
    );
    if (!confirmed) return;

    localStorage.removeItem(screenFiveResultsKey(year, practicalId));
    localStorage.removeItem(screenFiveProgressKey(year, practicalId));
    localStorage.removeItem(screenFiveCompleteKey(year, practicalId));

    setPeeled(false);
    setOnSlide(false);
    setIodineAdded(false);
    setCoverslipOn(false);
    setOnStage(false);
    setObjective(null);
    setCoarseFocus(0);
    setFineFocus(0);
    setArmedLabel(null);
    setPlacedLabels({});
    setWrongHotspot(null);
    setSqueezing(false);
    setCoverslipAngle(0);
    setShowBubbleWarning(false);
    setShowContinue(false);
    fireCharacterTrigger('pip', "All clear! The Wet Lab's reset — let's start fresh.");
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
        }}
      />

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 className="heading" style={{ fontSize: 22, margin: 0 }}>
            The Wet Lab
          </h1>
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

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* PHASE A — slide prep */}
          {!onStage && (
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, width: 420 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', minHeight: 90 }}>
                {!peeled && <OnionLayerSVG width={70} />}
                <ForcepsSVG width={30} />
                {onSlide && (
                  <div style={{ position: 'relative' }}>
                    <GlassSlideSVG width={80} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: 40,
                          height: 24,
                          borderRadius: '50%',
                          background: iodineAdded ? 'rgba(122,78,40,0.35)' : 'rgba(230,225,200,0.5)',
                          border: '1px solid #C9A876',
                        }}
                      />
                      {coverslipOn && <div style={{ position: 'absolute', inset: 0 }}><CoverslipSVG width={44} /></div>}
                    </div>
                  </div>
                )}
                {iodineAdded && !coverslipOn && (
                  <motion.div animate={{ scaleY: squeezing ? 0.7 : 1 }} style={{ transformOrigin: 'top center' }}>
                    <IodineBottleSVG width={26} />
                  </motion.div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {!peeled && <button onClick={handlePeel} style={stepButtonStyle(true)}>1. Peel the onion layer</button>}
                {peeled && !onSlide && <button onClick={handlePlaceOnSlide} style={stepButtonStyle(true)}>2. Place on slide</button>}
                {onSlide && !iodineAdded && (
                  <button
                    onPointerDown={startSqueeze}
                    onPointerUp={endSqueeze}
                    onPointerLeave={endSqueeze}
                    style={stepButtonStyle(true)}
                  >
                    3. {squeezing ? 'Squeezing…' : 'Hold and squeeze the dropper'}
                  </button>
                )}
                {iodineAdded && !coverslipOn && (
                  <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', marginBottom: 6 }}>
                      4. Drag to tilt the coverslip to the right angle (30°–45°)
                    </div>
                    <div
                      onPointerDown={handleTiltPointerDown}
                      style={{
                        width: 120,
                        height: 60,
                        margin: '0 auto',
                        borderRadius: '60px 60px 0 0',
                        border: '2px dashed var(--color-border)',
                        borderBottom: 'none',
                        position: 'relative',
                        cursor: 'grab',
                        touchAction: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          bottom: 0,
                          width: 2,
                          height: 50,
                          background: coverslipAngle > COVERSLIP_BUBBLE ? '#C0503D' : coverslipAngle >= COVERSLIP_MIN && coverslipAngle <= COVERSLIP_MAX ? '#4FBFA8' : 'var(--color-dark)',
                          transformOrigin: 'bottom center',
                          transform: `translateX(-50%) rotate(${coverslipAngle}deg)`,
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', marginTop: 4 }}>
                      {Math.round(coverslipAngle)}°
                    </div>
                    {showBubbleWarning && (
                      <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 11, color: '#C0503D', marginTop: 4 }}>
                        Too steep! Air bubbles will form.
                      </div>
                    )}
                    <button
                      onClick={handleLowerCoverslip}
                      disabled={coverslipAngle < COVERSLIP_MIN || coverslipAngle > COVERSLIP_MAX}
                      style={{ ...stepButtonStyle(coverslipAngle >= COVERSLIP_MIN && coverslipAngle <= COVERSLIP_MAX), marginTop: 10, width: '100%' }}
                    >
                      Lower coverslip
                    </button>
                  </div>
                )}
                {coverslipOn && !onStage && <button onClick={handleStage} style={stepButtonStyle(true)}>5. Place slide on microscope stage</button>}
              </div>
            </div>
          )}

          {/* PHASE B — microscope viewing */}
          {onStage && (
            <>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <MicroscopeSVG width={60} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#999', marginTop: 10 }}>Drag the nosepiece to rotate a lens into place</div>
                <div
                  onPointerDown={handleNosepieceDrag}
                  style={{
                    width: 70,
                    height: 70,
                    margin: '6px auto 0',
                    borderRadius: '50%',
                    border: '3px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    touchAction: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    background: '#fff',
                  }}
                >
                  {objective ? `×${objective}` : '?'}
                </div>
                {objective && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', marginTop: 6 }}>
                    Total: ×10 × ×{objective} = ×{10 * objective}
                  </div>
                )}
                {objective && !cellsInFocus && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)' }}>Coarse focus — scroll to turn</div>
                    <div
                      onWheel={handleCoarseWheel}
                      style={{
                        width: 50,
                        height: 50,
                        margin: '4px auto',
                        borderRadius: '50%',
                        border: '3px solid var(--color-phys)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'ns-resize',
                        fontFamily: 'var(--font-body)',
                        fontSize: 10,
                        color: 'var(--color-mid)',
                        transform: `rotate(${coarseFocus * 3.6}deg)`,
                      }}
                    >
                      {coarseFocus}%
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', marginTop: 8 }}>Fine focus</div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={fineFocus}
                      onChange={(e) => handleFine(Number(e.target.value))}
                      disabled={coarseFocus < 100}
                      style={{ width: 160 }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    width: 300,
                    height: 190,
                    borderRadius: '50%',
                    background: '#111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div style={{ filter: `blur(${blur}px)`, transform: objective === 10 ? 'scale(1.6)' : 'scale(1)', transition: 'transform 0.4s ease' }}>
                    <CellViewSVG width={260} />
                  </div>
                  {cellsInFocus &&
                    STRUCTURES.map((s) => (
                      <motion.div
                        key={s.id}
                        onClick={() => handleHotspot(s.id)}
                        animate={wrongHotspot === s.id ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                        transition={{ duration: 0.35 }}
                        style={{
                          position: 'absolute',
                          left: 150 - 130 + s.x,
                          top: 95 - 80 + s.y,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: placedLabels[s.id] ? 'var(--color-mint)' : armedLabel ? 'rgba(255,255,255,0.8)' : 'transparent',
                          border: placedLabels[s.id] ? 'none' : '2px solid rgba(255,255,255,0.7)',
                          cursor: armedLabel ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#fff',
                        }}
                      >
                        {placedLabels[s.id] && (
                          <motion.div
                            initial={{ y: -24, opacity: 0 }}
                            animate={{ y: -14, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            style={{ position: 'absolute' }}
                          >
                            <Pin color="yellow" size={14} />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                </div>

                {cellsInFocus && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', marginBottom: 6 }}>
                      {labelledCount} / {STRUCTURES.length} structures labelled — tap a label, then tap its spot on the cell.
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {STRUCTURES.filter((s) => !placedLabels[s.id]).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleArm(s.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            border: `1px solid ${armedLabel === s.id ? 'var(--color-start)' : 'var(--color-border)'}`,
                            background: armedLabel === s.id ? 'var(--color-start)' : '#fff',
                            color: armedLabel === s.id ? '#fff' : 'var(--color-dark)',
                            fontSize: 11,
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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

function stepButtonStyle(enabled) {
  return {
    padding: '10px 18px',
    borderRadius: 999,
    border: 'none',
    background: enabled ? 'var(--color-start)' : 'var(--color-border)',
    color: enabled ? '#fff' : '#999',
    fontFamily: 'var(--font-heading)',
    fontSize: 14,
    cursor: enabled ? 'pointer' : 'not-allowed',
  };
}
