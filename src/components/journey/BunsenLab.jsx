import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, pointerWithin } from '@dnd-kit/core';
import CharacterShowcase from '../CharacterShowcase';
import {
  BunsenBurnerSVG,
  FlameSVG,
  TripodSVG,
  GauzeMatSVG,
  EvaporatingDishSVG,
  HeatProofMatSVG,
  SafetyGogglesSVG,
  SpatulaSVG,
  WaterDropperSVG,
  SteamParticles,
} from './BunsenEquipment';
import { Starburst } from '../corkboard/Stickers';
import { screenFiveResultsKey, screenFiveProgressKey, screenFiveCompleteKey } from '../../data/practicalStorage';

const BLUE = '#1565C0';
const WHITE = '#E0E0E0';
const HEAT_MS = 8000;
const COOL_S = 5;
const MATCH_MS = 3000;
const REVERSE_MS = 2000;

const OBSERVATION_CHIPS = [
  { id: 'colour', label: 'Colour changed' },
  { id: 'white_grey', label: 'White/grey in colour' },
  { id: 'steam', label: 'Steam was produced' },
];

function DraggableGoggles() {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'goggles' });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 30 : 1,
        position: 'relative',
      }}
    >
      <SafetyGogglesSVG width={44} />
      <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', color: '#999', textAlign: 'center' }}>Drag to head</div>
    </div>
  );
}

function HeadDropZone({ wearing }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'head' });
  return (
    <div
      ref={setNodeRef}
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: `2px dashed ${wearing ? 'transparent' : isOver ? 'var(--color-mint)' : 'var(--color-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: wearing ? 'transparent' : 'rgba(0,0,0,0.03)',
      }}
    >
      {wearing ? <SafetyGogglesSVG width={44} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="0.6" fill="#6B6B6B" /><circle cx="15" cy="10" r="0.6" fill="#6B6B6B" /><path d="M8 14.5c1.2 1.6 6.8 1.6 8 0" /></svg>}
    </div>
  );
}

function DraggableMatch({ ignited }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'match', disabled: !ignited });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        position: 'relative',
        width: 8,
        height: 40,
        background: '#C9A876',
        borderRadius: 2,
        cursor: ignited ? 'grab' : 'default',
        touchAction: 'none',
        zIndex: isDragging ? 30 : 1,
      }}
    >
      {ignited && (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}
        >
          <FlameSVG kind="safety" width={12} />
        </motion.div>
      )}
    </div>
  );
}

function BurnerDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'burner_top' });
  return (
    <div ref={setNodeRef} style={{ position: 'relative', width: 30, height: 30, border: isOver ? '2px dashed var(--color-start)' : 'none', borderRadius: 8 }}>
      {children}
    </div>
  );
}

export default function BunsenLab({ year, practicalId, wetLabDialogue, onContinue }) {
  const [goggles, setGoggles] = useState(false);
  const [collarClosed, setCollarClosed] = useState(false);
  const [collarZoomed, setCollarZoomed] = useState(false);
  const [matchboxOpen, setMatchboxOpen] = useState(false);
  const [matchIgnited, setMatchIgnited] = useState(false);
  const [matchFailedFlash, setMatchFailedFlash] = useState(false);
  const [lit, setLit] = useState(false);
  const [roaring, setRoaring] = useState(false);
  const [heating, setHeating] = useState(false);
  const [heatDone, setHeatDone] = useState(false);
  const [cooling, setCooling] = useState(false);
  const [coolSecondsLeft, setCoolSecondsLeft] = useState(COOL_S);
  const [cooled, setCooled] = useState(false);
  const [magnified, setMagnified] = useState(false);
  const [crystalColor, setCrystalColor] = useState(BLUE);
  const [transitionMs, setTransitionMs] = useState(HEAT_MS);
  const [placedChips, setPlacedChips] = useState({});
  const [observationRecorded, setObservationRecorded] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [trigger, setTrigger] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  const triggerIdRef = useRef(0);
  const welcomedRef = useRef(false);
  const matchTimerRef = useRef(null);

  function fireCharacterTrigger(character, text, variant) {
    triggerIdRef.current += 1;
    setTrigger({ type: 'scripted', index: triggerIdRef.current, character, text, variant });
  }

  useEffect(() => {
    if (!welcomedRef.current) {
      welcomedRef.current = true;
      fireCharacterTrigger('madu', 'Welcome to the best experiment in Y7 chemistry. Drag your goggles on to begin.');
    }
    return () => clearTimeout(matchTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveProgress(step) {
    localStorage.setItem(screenFiveProgressKey(year, practicalId), String(step));
  }

  function handleResetPractical() {
    const confirmed = window.confirm(
      'Reset the Wet Lab? Your progress heating the copper sulfate will be cleared, as if you never started.'
    );
    if (!confirmed) return;

    localStorage.removeItem(screenFiveResultsKey(year, practicalId));
    localStorage.removeItem(screenFiveProgressKey(year, practicalId));
    localStorage.removeItem(screenFiveCompleteKey(year, practicalId));
    clearTimeout(matchTimerRef.current);

    setGoggles(false);
    setCollarClosed(false);
    setCollarZoomed(false);
    setMatchboxOpen(false);
    setMatchIgnited(false);
    setLit(false);
    setRoaring(false);
    setHeating(false);
    setHeatDone(false);
    setCooling(false);
    setCoolSecondsLeft(COOL_S);
    setCooled(false);
    setMagnified(false);
    setCrystalColor(BLUE);
    setPlacedChips({});
    setObservationRecorded(false);
    setReversed(false);
    setShowContinue(false);
    fireCharacterTrigger('pip', "All clear! The Wet Lab's reset — let's start fresh.");
  }

  function handleGoggleDrop(event) {
    if (event.over?.id === 'head') {
      setGoggles(true);
      fireCharacterTrigger('lili', 'Goggles on first — always. Non-negotiable.');
      saveProgress(1);
    }
  }

  function handleCollarToggle() {
    if (!collarClosed) {
      setCollarClosed(true);
      setTimeout(() => setCollarZoomed(false), 500);
    }
  }

  function handleOpenMatchbox() {
    setMatchboxOpen(true);
  }

  function handleStrike() {
    if (!goggles) {
      fireCharacterTrigger('lili', 'Goggles first! Safety is not optional.');
      return;
    }
    if (!collarClosed) {
      fireCharacterTrigger('lili', 'Close the collar before lighting — safety flame first, always.');
      return;
    }
    setMatchIgnited(true);
    matchTimerRef.current = setTimeout(() => {
      setMatchIgnited(false);
      setMatchFailedFlash(true);
      fireCharacterTrigger('pip', 'The match went out — strike another one and get it to the burner quickly!');
      setTimeout(() => setMatchFailedFlash(false), 400);
    }, MATCH_MS);
  }

  function handleMatchDragEnd(event) {
    if (event.active.id !== 'match' || !matchIgnited) return;
    if (event.over?.id === 'burner_top') {
      clearTimeout(matchTimerRef.current);
      setMatchIgnited(false);
      setMatchboxOpen(false);
      setLit(true);
      fireCharacterTrigger('madu', 'Safety flame lit! Yellow means the collar is closed. Now we can work safely.');
      saveProgress(2);
    }
  }

  function handleOpenCollar() {
    if (!lit) return;
    setCollarClosed(false);
    setRoaring(true);
    fireCharacterTrigger('madu', 'BLUE FLAME! This is the roaring flame — hotter, more focused, perfect for heating.');
    saveProgress(3);
  }

  function handleHeat() {
    if (!roaring || heating || heatDone) return;
    setHeating(true);
    setTransitionMs(HEAT_MS);
    setCrystalColor(WHITE);
    saveProgress(4);

    setTimeout(() => fireCharacterTrigger('lumi', 'The water molecules trapped inside the crystal structure are escaping as steam!'), HEAT_MS / 2);
    setTimeout(() => {
      setHeating(false);
      setHeatDone(true);
      setRoaring(false);
      setCollarClosed(true);
      setCooling(true);
      fireCharacterTrigger('pip', 'The crystals turned white! Let it cool before we look closely.', 'celebrate');

      let remaining = COOL_S;
      const interval = setInterval(() => {
        remaining -= 1;
        setCoolSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          setCooling(false);
          setCooled(true);
        }
      }, 1000);
    }, HEAT_MS);
  }

  function handleChipDragEnd(event) {
    const { active, over } = event;
    if (!over || over.id !== 'observation_card') return;
    setPlacedChips((prev) => {
      const next = { ...prev, [active.id]: true };
      if (Object.keys(next).length === OBSERVATION_CHIPS.length && !observationRecorded) {
        setObservationRecorded(true);
        const record = { before: 'blue', after: 'white' };
        localStorage.setItem(screenFiveResultsKey(year, practicalId), JSON.stringify(record));
        localStorage.setItem(screenFiveCompleteKey(year, practicalId), 'true');
        fireCharacterTrigger('pip', "Nicely recorded — you've captured the whole transformation.");
        setShowContinue(true);
      }
      return next;
    });
  }

  function handleReverse() {
    if (reversed) return;
    setTransitionMs(REVERSE_MS);
    setCrystalColor(BLUE);
    setReversed(true);
    fireCharacterTrigger('madu', 'IT WENT BLUE AGAIN! This tells us something huge — the change was REVERSIBLE.');
  }

  const flameKind = roaring ? 'roaring' : lit ? 'safety' : null;
  const unplacedChips = OBSERVATION_CHIPS.filter((c) => !placedChips[c.id]);

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
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, width: 420 }}>
            <motion.div
              animate={{ scale: collarZoomed ? 1.6 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ position: 'relative', height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transformOrigin: 'bottom center' }}
            >
              {heating && <SteamParticles />}
              <div style={{ position: 'absolute', bottom: 90, textAlign: 'center' }}>
                <EvaporatingDishSVG crystalColor={crystalColor} width={56} />
                <div
                  style={{
                    width: 40,
                    height: 8,
                    margin: '0 auto',
                    background: crystalColor,
                    borderRadius: 4,
                    transition: `background-color ${transitionMs}ms ease`,
                  }}
                />
              </div>
              <div style={{ position: 'absolute', bottom: 66 }}>
                <TripodSVG width={90} />
              </div>
              <div style={{ position: 'absolute', bottom: 78 }}>
                <GauzeMatSVG width={70} />
              </div>
              {flameKind && (
                <motion.div
                  key={flameKind}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  style={{ position: 'absolute', bottom: 46 }}
                >
                  <FlameSVG kind={flameKind === 'roaring' ? 'roaring' : 'safety'} width={22} />
                </motion.div>
              )}
              <DndContext collisionDetection={pointerWithin} onDragEnd={handleMatchDragEnd}>
                <div style={{ position: 'absolute', bottom: 0 }}>
                  <BurnerDropZone>
                    <BunsenBurnerSVG width={50} />
                  </BurnerDropZone>
                </div>
                {matchboxOpen && !lit && (
                  <div style={{ position: 'absolute', bottom: 10, left: 20 }}>
                    <DraggableMatch ignited={matchIgnited} />
                  </div>
                )}
              </DndContext>
              <div style={{ position: 'absolute', bottom: -6, width: 110 }}>
                <HeatProofMatSVG width={110} />
              </div>
            </motion.div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
              <DndContext collisionDetection={pointerWithin} onDragEnd={handleGoggleDrop}>
                {!goggles ? (
                  <>
                    <DraggableGoggles />
                    <HeadDropZone wearing={goggles} />
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <SafetyGogglesSVG width={36} />
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', color: '#999' }}>Worn</div>
                  </div>
                )}
              </DndContext>
              <div style={{ textAlign: 'center' }}>
                <SpatulaSVG width={34} />
                <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', color: '#999' }}>Spatula</div>
              </div>
              {cooled && (
                <div style={{ textAlign: 'center', opacity: reversed ? 0.4 : 1, cursor: reversed ? 'default' : 'pointer' }} onClick={handleReverse}>
                  {!reversed && (
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Starburst width={28} color="#FFD166" wobble={false}>
                        <span style={{ fontSize: 6 }}>Try it!</span>
                      </Starburst>
                    </motion.div>
                  )}
                  <WaterDropperSVG width={26} />
                  <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', color: '#999' }}>Water</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
            {goggles && !collarClosed && !lit && (
              <motion.button
                animate={matchFailedFlash ? { x: [0, -4, 4, 0] } : {}}
                onClick={() => {
                  setCollarZoomed(true);
                  handleCollarToggle();
                }}
                style={stepButtonStyle(true)}
              >
                1. Close the collar (safety flame)
              </motion.button>
            )}
            {goggles && collarClosed && !lit && !matchboxOpen && (
              <button onClick={handleOpenMatchbox} style={stepButtonStyle(true)}>
                2. Open the match box
              </button>
            )}
            {matchboxOpen && !lit && !matchIgnited && (
              <button onClick={handleStrike} style={stepButtonStyle(true)}>
                Strike the match
              </button>
            )}
            {matchIgnited && (
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', marginBottom: 6 }}>
                  Quick — drag the lit match to the burner!
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: MATCH_MS / 1000, ease: 'linear' }}
                    style={{ height: '100%', background: 'linear-gradient(to right, #FFD166, #C0503D)' }}
                  />
                </div>
              </div>
            )}
            {lit && !roaring && !heatDone && (
              <button onClick={handleOpenCollar} style={stepButtonStyle(true)}>
                3. Open the collar (roaring flame)
              </button>
            )}
            {roaring && !heating && !heatDone && (
              <button onClick={handleHeat} style={stepButtonStyle(true)}>
                4. Heat the copper sulfate
              </button>
            )}
            {heating && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-mid)' }}>Heating… watch the crystals.</div>
            )}
            {cooling && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-mid)' }}>
                Cooling… {coolSecondsLeft}s
              </div>
            )}
            {cooled && !magnified && !observationRecorded && (
              <button onClick={() => setMagnified(true)} style={stepButtonStyle(true)}>
                Zoom in on the dish
              </button>
            )}
            {magnified && !observationRecorded && (
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)', marginBottom: 8 }}>
                  Drag what you observed onto your notecard:
                </div>
                <DndContext collisionDetection={pointerWithin} onDragEnd={handleChipDragEnd}>
                  <ObservationCard placedChips={placedChips} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {unplacedChips.map((c) => (
                      <ObservationChip key={c.id} chip={c} />
                    ))}
                  </div>
                </DndContext>
              </div>
            )}
            {observationRecorded && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mint)' }}>
                Observation recorded — feel free to try adding water back to the crystals.
              </div>
            )}
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

function ObservationChip({ chip }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: chip.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 20 : 1,
        padding: '8px 12px',
        borderRadius: 999,
        border: '2px dashed var(--color-border)',
        background: '#F7F4EF',
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      {chip.label}
    </div>
  );
}

function ObservationCard({ placedChips }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'observation_card' });
  const placed = OBSERVATION_CHIPS.filter((c) => placedChips[c.id]);
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 70,
        border: `2px ${isOver ? 'solid var(--color-mint)' : 'dashed var(--color-border)'}`,
        borderRadius: 10,
        background: isOver ? 'rgba(79,191,168,0.08)' : '#fff',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {placed.length === 0 && <span style={{ fontSize: 11, color: '#bbb', fontFamily: 'var(--font-body)' }}>Drop observations here</span>}
      <AnimatePresence>
        {placed.map((c) => (
          <motion.div
            key={c.id}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--color-dark)' }}
          >
            ✓ {c.label}
          </motion.div>
        ))}
      </AnimatePresence>
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
