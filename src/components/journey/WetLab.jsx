import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Screen5Layout from './Screen5Layout';
import { SolutionBottleSVG, IndicatorBottleSVG, PipetteSVG } from './WetLabEquipment';
import { SOLUTIONS, RESULTS, SOLUTION_BOTTLE_COLOR, wetlabResultsKey, wetlabCompleteKey } from '../../data/wetLabResults';
import { StampBadge } from '../corkboard/Stickers';

const SQUEEZE_MS = 600;

const SLIDES = [
  {
    id: 'universal',
    indicatorLabel: 'Universal Indicator',
    indicatorColor: '#FF8F00',
    results: RESULTS.universal,
    notesCard: {
      title: 'Universal Indicator Test',
      bullets: ['3 drops is enough — no more', 'Watch the colour AFTER mixing', 'Record IMMEDIATELY — colour fades'],
    },
  },
  {
    id: 'litmus',
    indicatorLabel: 'Litmus',
    indicatorColor: '#6A1B9A',
    results: RESULTS.litmus,
    notesCard: {
      title: 'Litmus Test',
      bullets: ['Litmus only shows acid OR alkali', 'No specific pH — just two outcomes', 'Red = acid, Blue = alkali'],
    },
  },
  {
    id: 'phenolphthalein',
    indicatorLabel: 'Phenolphthalein',
    indicatorColor: null,
    results: RESULTS.phenolphthalein,
    notesCard: {
      title: 'Phenolphthalein Test',
      bullets: ['Colourless in acid — that IS a result', 'Faint pink means weakly alkaline', 'Bright pink means strongly alkaline'],
    },
  },
];

function TestTubeSVG({ colorStage, color }) {
  // colorStage: null (empty) | 'solution' (pale) | 'result' (final)
  return (
    <svg width="42" height="108" viewBox="0 0 46 120" style={{ display: 'block', overflow: 'visible' }}>
      <path d="M12,4 L12,88 Q12,110 23,110 Q34,110 34,88 L34,4" fill="none" stroke="#9AA0A6" strokeWidth="2.5" />
      <line x1="7" y1="4" x2="39" y2="4" stroke="#9AA0A6" strokeWidth="2.5" strokeLinecap="round" />
      <motion.path
        d="M14,50 L14,88 Q14,106 23,106 Q32,106 32,88 L32,50 Z"
        initial={{ fill: 'rgba(255,255,255,0)' }}
        animate={{ fill: colorStage ? color ?? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0)' }}
        transition={{ duration: colorStage === 'result' ? 1.5 : 0.6, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function ColourBurst() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none' }}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * 30, y: Math.sin(angle) * 30, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#FFD166' }}
          />
        );
      })}
    </div>
  );
}

function FallingDrops({ color }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: -10, opacity: 1 }}
          animate={{ y: 40, opacity: [1, 1, 0] }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          style={{ position: 'absolute', top: 0, left: '50%', width: 6, height: 6, borderRadius: '50%', background: color, transform: 'translateX(-50%)' }}
        />
      ))}
    </>
  );
}

export default function WetLab({ year, practicalId, onBack, onContinue }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [poured, setPoured] = useState({});
  const [filled, setFilled] = useState({});
  const [pastSlides, setPastSlides] = useState([]); // [{id, results}]
  const [showNotepad, setShowNotepad] = useState(false);
  const [pipTrigger, setPipTrigger] = useState(null);
  const [subjectTrigger, setSubjectTrigger] = useState(null);

  const [dragging, setDragging] = useState(null); // {type:'solution'|'indicator', id}
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredTube, setHoveredTube] = useState(null);
  const [dropperTube, setDropperTube] = useState(null); // indicator pipette: parked tube id, or null = home
  const [parkedSolTube, setParkedSolTube] = useState(null); // solution pipette: parked tube id (=== solId), or null = home
  const [squeezing, setSqueezing] = useState(false);
  const [dropping, setDropping] = useState(null);
  const [burstTube, setBurstTube] = useState(null);
  const [wrongTube, setWrongTube] = useState(null);
  const [colourlessNote, setColourlessNote] = useState(null);

  const boardRef = useRef(null);
  const bottleHomeRef = useRef({});
  const dropperHomeRef = useRef({ x: 0, y: 0 });
  const squeezeStartRef = useRef(0);
  const squeezeTargetRef = useRef(null); // {type:'solution'|'indicator', tubeId} — bound at mousedown
  const draggingRef = useRef(null);
  const hoveredTubeRef = useRef(null);
  const pouredRef = useRef({});
  const filledRef = useRef({});
  const dropperTubeRef = useRef(null);
  const triggerRef = useRef(0);
  const welcomedRef = useRef(false);

  const slide = SLIDES[slideIndex];

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);
  useEffect(() => {
    hoveredTubeRef.current = hoveredTube;
  }, [hoveredTube]);
  useEffect(() => {
    pouredRef.current = poured;
  }, [poured]);
  useEffect(() => {
    filledRef.current = filled;
  }, [filled]);
  useEffect(() => {
    dropperTubeRef.current = dropperTube;
  }, [dropperTube]);
  const parkedSolTubeRef = useRef(null);
  useEffect(() => {
    parkedSolTubeRef.current = parkedSolTube;
  }, [parkedSolTube]);

  function speak(setter, text) {
    triggerRef.current += 1;
    setter({ text, key: triggerRef.current });
  }

  useEffect(() => {
    if (!welcomedRef.current) {
      welcomedRef.current = true;
      speak(setPipTrigger, 'Use the pipette to draw up each solution and squeeze it into its test tube!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function relPos(e) {
    const rect = boardRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDragSolution(e, solId) {
    setDragging({ type: 'solution', id: solId });
    setDragPos(relPos(e));
  }
  function startDragIndicator(e) {
    setDragging({ type: 'indicator', id: slide.id });
    setDragPos(relPos(e));
    setDropperTube(null);
  }

  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return;
      setDragPos(relPos(e));
    }
    function onUp() {
      const d = draggingRef.current;
      if (!d) return;
      const tubeId = hoveredTubeRef.current;
      setDragging(null);

      if (d.type === 'solution') {
        if (tubeId === d.id && !pouredRef.current[tubeId]) {
          setParkedSolTube(tubeId);
          speak(setPipTrigger, 'Now hold and squeeze the pipette to release it!');
        } else if (tubeId && tubeId !== d.id) {
          setWrongTube(tubeId);
          speak(setPipTrigger, "That's the wrong tube for this solution!");
          setTimeout(() => setWrongTube(null), 350);
        }
      } else if (d.type === 'indicator') {
        if (tubeId && pouredRef.current[tubeId] && !filledRef.current[tubeId]) {
          setDropperTube(tubeId);
        } else if (tubeId && !pouredRef.current[tubeId]) {
          setWrongTube(tubeId);
          speak(setPipTrigger, 'Pour the solution into this tube first!');
          setTimeout(() => setWrongTube(null), 350);
        }
      }
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSqueezeDown(target) {
    squeezeTargetRef.current = target;
    setSqueezing(true);
    squeezeStartRef.current = Date.now();
  }

  function saveResults(id, resultsMap) {
    const newEntries = {};
    Object.keys(resultsMap).forEach((solId) => {
      newEntries[`${solId}_${id}`] = slide.results[solId];
    });
    const existing = JSON.parse(localStorage.getItem(wetlabResultsKey(year, practicalId)) || '{}');
    localStorage.setItem(wetlabResultsKey(year, practicalId), JSON.stringify({ ...existing, ...newEntries }));
  }

  useEffect(() => {
    function onSqueezeUp() {
      setSqueezing((was) => {
        if (!was) return false;
        const elapsed = Date.now() - squeezeStartRef.current;
        const target = squeezeTargetRef.current;
        if (!target) return false;

        if (target.type === 'solution') {
          const tubeId = target.tubeId;
          if (parkedSolTubeRef.current !== tubeId || pouredRef.current[tubeId]) return false;
          if (elapsed < SQUEEZE_MS) {
            speak(setPipTrigger, 'Hold the squeeze a little longer!');
            return false;
          }
          setDropping({ tubeId, stage: 'solution' });
          setTimeout(() => {
            setDropping(null);
            setParkedSolTube(null);
            setPoured((prev) => ({ ...prev, [tubeId]: true }));
            speak(setPipTrigger, 'Solution poured — now bring the indicator over.');
          }, 500);
          return false;
        }

        // indicator
        const tubeId = dropperTubeRef.current;
        if (!tubeId || filledRef.current[tubeId]) return false;

        if (elapsed < SQUEEZE_MS) {
          speak(setPipTrigger, 'Hold the squeeze a little longer!');
          return false;
        }

        setDropping({ tubeId, stage: 'indicator' });
        setTimeout(() => {
          setDropping(null);
          setDropperTube(null);
          setFilled((prev) => {
            const next = { ...prev, [tubeId]: true };
            const result = slide.results[tubeId];
            if (result.label && result.label.toLowerCase().includes('olourless')) {
              setColourlessNote(tubeId);
              speak(setPipTrigger, 'No change is still a result! Colourless means acidic or neutral with this indicator.');
            } else {
              speak(setPipTrigger, "See that colour? That's your pH result. Remember it!");
            }
            speak(setSubjectTrigger, 'Every colour tells a different story about the H⁺ ion concentration.');
            setBurstTube(tubeId);
            setTimeout(() => setBurstTube(null), 350);

            if (Object.keys(next).length === SOLUTIONS.length) {
              saveResults(slide.id, next);
              setTimeout(() => setShowNotepad(true), 400);
            }
            return next;
          });
        }, 500);

        return false;
      });
    }
    window.addEventListener('mouseup', onSqueezeUp);
    return () => window.removeEventListener('mouseup', onSqueezeUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  const allFilled = Object.keys(filled).length === SOLUTIONS.length;
  const isLastSlide = slideIndex === SLIDES.length - 1;

  function handleNextSlide() {
    setPastSlides((prev) => [...prev, { id: slide.id, results: filled }]);
    if (isLastSlide) {
      localStorage.setItem(wetlabCompleteKey(year, practicalId), 'true');
      onContinue();
      return;
    }
    setSlideIndex((i) => i + 1);
    setPoured({});
    setFilled({});
    setShowNotepad(false);
    setDropperTube(null);
    setParkedSolTube(null);
    speak(setPipTrigger, `Now let's try ${SLIDES[slideIndex + 1].indicatorLabel}!`);
  }

  function handleResetPractical() {
    const confirmed = window.confirm('Reset the Wet Lab? All your test tube results will be cleared, as if you never started.');
    if (!confirmed) return;
    localStorage.removeItem(wetlabResultsKey(year, practicalId));
    localStorage.removeItem(wetlabCompleteKey(year, practicalId));
    setSlideIndex(0);
    setPoured({});
    setFilled({});
    setPastSlides([]);
    setShowNotepad(false);
    setDropperTube(null);
    setParkedSolTube(null);
    setDragging(null);
    speak(setPipTrigger, "All clear! Let's start fresh.");
  }

  const dropperResting = dropperTube == null;

  return (
    <Screen5Layout
      subject="chem"
      subjectCharacter="madu"
      slideIndex={slideIndex}
      totalSlides={3}
      notesCard={slide.notesCard}
      doodle={<DoodlePhScale />}
      pipTrigger={pipTrigger}
      subjectTrigger={subjectTrigger}
      instruction={
        dragging
          ? dragging.type === 'solution'
            ? 'Drop the pipette into its matching test tube'
            : 'Drop the indicator over a tube with solution in it'
          : parkedSolTube || dropperTube
          ? 'Hold and squeeze!'
          : 'Drag each pipette into its tube, then hold and squeeze to fill it'
      }
      onBack={onBack}
      onNext={handleNextSlide}
      nextEnabled={allFilled}
      nextLabel={isLastSlide ? 'Continue to Results →' : 'Next →'}
      onReset={handleResetPractical}
    >
      <div ref={boardRef} style={{ position: 'relative', width: '100%', height: '100%', padding: '10px 14px 0' }}>
        {pastSlides.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, opacity: 0.4, marginBottom: 2 }}>
            {pastSlides.map((p) => (
              <div key={p.id} style={{ display: 'flex', gap: 3 }}>
                {SOLUTIONS.map((sol) => (
                  <div key={sol.id} style={{ width: 10, height: 10, borderRadius: 2, background: p.results[sol.id] ? RESULTS[p.id][sol.id].color : '#eee' }} />
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 2 }}>
          {SOLUTIONS.map((sol) => (
            <div key={sol.id} style={{ width: 42, display: 'flex', justifyContent: 'center' }}>
              <SolutionBottleSVG liquidColor={SOLUTION_BOTTLE_COLOR[sol.id]} width={22} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 4, minHeight: 24 }}>
          {SOLUTIONS.map((sol) => {
            const homePipetteVisible = !poured[sol.id] && parkedSolTube !== sol.id;
            return (
              <div key={sol.id} style={{ width: 42, display: 'flex', justifyContent: 'center', opacity: homePipetteVisible ? 1 : 0.25 }}>
                {homePipetteVisible && (
                  <div
                    onMouseDown={(e) => startDragSolution(e, sol.id)}
                    style={{ cursor: 'grab', touchAction: 'none' }}
                  >
                    <PipetteSVG fillColor={SOLUTION_BOTTLE_COLOR[sol.id]} fillLevel={1} width={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, paddingBottom: 6 }}>
          {SOLUTIONS.map((sol) => {
            const colorStage = filled[sol.id] ? 'result' : poured[sol.id] ? 'solution' : null;
            const color = filled[sol.id] ? slide.results[sol.id].color : poured[sol.id] ? SOLUTION_BOTTLE_COLOR[sol.id] : null;
            return (
              <div
                key={sol.id}
                onMouseOver={() => dragging && setHoveredTube(sol.id)}
                onMouseLeave={() => setHoveredTube((h) => (h === sol.id ? null : h))}
                style={{ position: 'relative', width: 42, textAlign: 'center' }}
              >
                <motion.div
                  animate={{ scale: hoveredTube === sol.id ? 1.03 : 1, x: wrongTube === sol.id ? [0, -5, 5, -3, 3, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: 8,
                      border: hoveredTube === sol.id && dragging ? '2px solid #4FBFA8' : '2px solid transparent',
                    }}
                  />
                  <TestTubeSVG colorStage={colorStage} color={color} />
                  {dropping?.tubeId === sol.id && (
                    <FallingDrops color={dropping.stage === 'solution' ? SOLUTION_BOTTLE_COLOR[sol.id] : slide.results[sol.id].color} />
                  )}
                  {burstTube === sol.id && <ColourBurst />}
                  {parkedSolTube === sol.id && (
                    <div style={{ position: 'absolute', top: -46, left: '50%', transform: 'translateX(-50%)' }}>
                      <div onMouseDown={() => handleSqueezeDown({ type: 'solution', tubeId: sol.id })} style={{ cursor: 'pointer' }}>
                        <PipetteSVG fillColor={SOLUTION_BOTTLE_COLOR[sol.id]} fillLevel={1} width={14} />
                      </div>
                      {squeezing && squeezeTargetRef.current?.type === 'solution' && squeezeTargetRef.current?.tubeId === sol.id && (
                        <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', top: -2, left: -13, pointerEvents: 'none' }}>
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#4FBFA8" strokeWidth="3" strokeDasharray="100" strokeDashoffset="100" style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}>
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${SQUEEZE_MS}ms`} fill="freeze" />
                          </circle>
                        </svg>
                      )}
                    </div>
                  )}
                  {dropperTube === sol.id && (
                    <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)' }}>
                      <div onMouseDown={() => handleSqueezeDown({ type: 'indicator', tubeId: sol.id })} style={{ cursor: 'pointer' }}>
                        <IndicatorBottleSVG liquidColor={slide.indicatorColor} width={22} />
                      </div>
                      {squeezing && squeezeTargetRef.current?.type === 'indicator' && squeezeTargetRef.current?.tubeId === sol.id && (
                        <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', top: -6, left: -9, pointerEvents: 'none' }}>
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#4FBFA8" strokeWidth="3" strokeDasharray="100" strokeDashoffset="100" style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}>
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${SQUEEZE_MS}ms`} fill="freeze" />
                          </circle>
                        </svg>
                      )}
                    </div>
                  )}
                </motion.div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 9.5, lineHeight: 1.15, marginTop: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {sol.name}
                  {filled[sol.id] && <span style={{ color: '#4FBFA8' }}>✓</span>}
                </div>
                {colourlessNote === sol.id && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 8.5, color: '#999' }}>No change — colourless</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Indicator dropper's home shelf, positioned lower on the whiteboard */}
        {dropperResting && (
          <div style={{ position: 'absolute', bottom: 54, left: 16, textAlign: 'center' }}>
            <div onMouseDown={startDragIndicator} style={{ cursor: 'grab', touchAction: 'none' }}>
              <IndicatorBottleSVG liquidColor={slide.indicatorColor} width={28} />
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#999' }}>{slide.indicatorLabel}</div>
          </div>
        )}

        {/* Drag ghost */}
        {dragging && (
          <div style={{ position: 'absolute', top: dragPos.y - 20, left: dragPos.x - 7, pointerEvents: 'none', zIndex: 30 }}>
            {dragging.type === 'solution' ? (
              <PipetteSVG fillColor={SOLUTION_BOTTLE_COLOR[dragging.id]} fillLevel={1} width={14} />
            ) : (
              <IndicatorBottleSVG liquidColor={slide.indicatorColor} width={28} />
            )}
          </div>
        )}

        <AnimatePresence>
          {showNotepad && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: `translateX(-50%) rotate(${pastSlides.length * -3}deg)`,
                background: '#FFF8E7',
                border: '1.5px solid #E4D3AC',
                borderRadius: 12,
                padding: 10,
                boxShadow: '0 -4px 14px rgba(0,0,0,0.15)',
                width: '90%',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.2 }}
                style={{ position: 'absolute', top: -14, right: -10 }}
              >
                {isLastSlide ? <StampBadge kind="done" size={44} /> : <StampBadge kind="checkpoint" size={38} />}
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SOLUTIONS.length}, 1fr)`, gap: 5 }}>
                {SOLUTIONS.map((sol) => (
                  <div key={sol.id} style={{ textAlign: 'center' }}>
                    <div style={{ width: 18, height: 12, background: slide.results[sol.id].color, margin: '0 auto 2px', borderRadius: 3, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <div style={{ fontSize: 7.5, fontFamily: 'var(--font-body)', color: 'var(--color-mid)' }}>{sol.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
              {isLastSlide && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  style={{ textAlign: 'center', marginTop: 8 }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9.5, color: 'var(--color-mint)' }}>
                    Full pH reference chart complete!
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen5Layout>
  );
}

function DoodlePhScale() {
  return (
    <svg width="70" height="46" viewBox="0 0 70 46">
      <defs>
        <linearGradient id="phgrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C62828" />
          <stop offset="50%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#4A148C" />
        </linearGradient>
      </defs>
      <rect x="2" y="16" width="66" height="10" rx="3" fill="url(#phgrad)" stroke="#8B6914" strokeWidth="1" />
      <text x="35" y="40" fontSize="11" textAnchor="middle" fontFamily="var(--font-heading)" fill="#5B4636">
        pH 1–14
      </text>
    </svg>
  );
}
