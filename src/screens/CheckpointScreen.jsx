import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MicrogameRenderer from '../components/MicrogameRenderer';
import RibbonBanner from '../components/RibbonBanner';
import StepStrip from '../components/StepStrip';
import { TOP_BANNER_CLEARANCE, BOTTOM_STRIP_HEIGHT, CANVAS_LEFT, useGuideWidth } from '../components/chromeLayout';
import DeskScene from '../components/DeskScene';
import BenchBackground from '../components/BenchBackground';
import GuideScenery from '../components/GuideScenery';
import { CharacterReactionLayer } from '../components/CharacterReaction';
import { usePracticalEngine } from '../engine/PracticalEngine';
import { useGameState } from '../engine/GameState';
import { getHighScore } from '../engine/DailyChallenge';
import { navigateWithTransition } from '../utils/pageTransition';
import { useTranslation } from 'react-i18next';

const DESK_EQUIPMENT_IDS = new Set([
  'ramp_3d',
  'clamp_stand_3d',
  'newton_meter_3d',
  'block_3d',
  'tripod_3d',
  'gauze_3d',
  'evaporating_dish_3d',
  'bunsen_burner_3d',
  'heat_mat_3d',
  'slide_3d',
  'slide_3d_sample',
  'slide_3d_prepared',
  'microscope_3d',
  'battery_3d',
  'bulb_3d',
  'switch_3d',
  'ammeter_3d',
]);

const SUBJECT_COLORS = { chemistry: '#E8A020', physics: '#5B6FE0', biology: '#4FBFA8' };

// Splits a single instruction string into a large "main verb" line plus a
// small qualifier for the ribbon banner, since the banner spec wants at
// most one bold line — without rewriting every practical's instruction
// copy. Splits on the first comma, " — ", or ". " if the string is long;
// otherwise the whole thing is just the main line.
function splitInstruction(text) {
  if (!text) return { main: '', sub: null };
  if (text.length <= 34) return { main: text, sub: null };
  const seps = [' — ', ', ', '. '];
  for (const sep of seps) {
    const idx = text.indexOf(sep);
    if (idx > 0 && idx < text.length - sep.length) {
      return { main: text.slice(0, idx).trim(), sub: text.slice(idx + sep.length).trim() };
    }
  }
  return { main: text, sub: null };
}

// BenchBackground (and the sharp-vs-blurred depth-of-field it implies)
// only makes sense behind microgames that show physical lab equipment.
// TapGame (cards) and RecordGame (results table) are plain white,
// notebook-style screens — no bench.
const PHYSICAL_TYPES = new Set(['drag', 'squeeze', 'hold', 'rotate', 'draw_swab', 'scroll_knob', 'zoom_read', 'timer_watch', 'drag_connect', 'draw_pipette', 'litmus_test', 'ramp_angle', 'light_bunsen', 'heat_observe', 'reverse_reaction', 'stain_slide', 'microscope_stage', 'coverslip', 'flame_education', 'circuit_builder', 'zero_meter', 'tie_knot']);

// Route: /checkpoint/:practicalId/:checkpointIndex — runs one checkpoint's
// entire sub-step sequence as a single continuous scene. Sub-steps advance
// in place (RibbonBanner + StepStrip update, the microgame swaps) with no
// route change and no roadmap round-trip; only once every sub-step in the
// checkpoint has reported in does this screen navigate away, back to the
// roadmap (or on to PracticalResult if this was the last checkpoint).
export default function CheckpointScreen() {
  const { t } = useTranslation();
  const { practicalId, checkpointIndex } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useGameState();
  const engine = usePracticalEngine(practicalId);
  const guideWidth = useGuideWidth(engine.currentSubStep);
  const [celebration, setCelebration] = useState(null); // { result, isLastCheckpoint } while showing the checkpoint-complete beat
  const [showDailyBanner, setShowDailyBanner] = useState(false);
  const furthestRef = useRef(0); // furthest sub-step reached in this checkpoint (for jumping back and forward again)
  const [hint, setHint] = useState(null); // the current game's how-to line, shown in the instruction bar
  const [handoff, setHandoff] = useState(null); // the previous step's success line, shown as the next step's speech bubble

  const targetIndex = Number(checkpointIndex) || 0;
  // Read fresh every render rather than stashing in state — it's read-only
  // for the whole run (only written once, at the end, by
  // PracticalResultScreen), and CheckpointScreen actually remounts on every
  // checkpoint navigation (PageTransition keys on the full pathname), so a
  // plain localStorage read is more reliable than component state here.
  const dailyBest = getHighScore(practicalId);
  const dailyChallenge = dailyBest != null;

  useEffect(() => {
    if (state.practicalId !== practicalId) {
      actions.setPractical(practicalId, targetIndex);
    } else {
      actions.setCheckpointIndex(targetIndex);
    }
    actions.setScreen('MICROGAME');
    setCelebration(null);
    furthestRef.current = 0;
    if (targetIndex === 0 && getHighScore(practicalId) != null) {
      setShowDailyBanner(true);
      const t = setTimeout(() => setShowDailyBanner(false), 3200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicalId, targetIndex]);

  const handleSubStepComplete = useCallback(
    (rawResult, message) => {
      const outcome = engine.submitSubStepResult(rawResult);
      if (!outcome) return;
      if (outcome.checkpointDone) {
        // Checkpoint bonuses (Prompt 3): +150 for reaching a new checkpoint,
        // plus a medal bonus on top.
        actions.addScore(150);
        if (outcome.result.medal === 'gold') actions.addScore(200);
        else if (outcome.result.medal === 'silver') actions.addScore(100);
        setCelebration(outcome);
      } else {
        setHandoff(message ?? null);
        // after redoing an earlier step, carry on from the furthest step reached, not from the one after it
        const next = Math.max(engine.subStepIndex + 1, furthestRef.current);
        furthestRef.current = next;
        engine.goToSubStep(next);
      }
    },
    [engine, actions],
  );

  useEffect(() => {
    setHint(null);
  }, [engine.currentSubStep?.id]);

  const handleCelebrationDone = useCallback(() => {
    if (celebration?.isLastCheckpoint) {
      navigateWithTransition(navigate, `/result/${practicalId}`);
    } else {
      navigateWithTransition(navigate, `/roadmap/${practicalId}`);
    }
  }, [celebration, navigate, practicalId]);

  const checkpointSteps = useMemo(
    () =>
      engine.subSteps.map((s, i) => ({
        id: s.id,
        label: s.title,
        iconType: s.iconType ?? s.type,
        // done = it has a result; the one on screen is active; the rest are still ahead
        status: i === engine.subStepIndex ? 'active' : engine.subStepResults[i] ? 'completed' : 'upcoming',
        reachable: i <= furthestRef.current || !!engine.subStepResults[i],
      })),
    [engine.subSteps, engine.subStepIndex, engine.subStepResults],
  );

  // the flowers in the step strip: go back (or forward again) to a step already reached
  const handleSelectStep = useCallback(
    (i) => {
      if (i === engine.subStepIndex) return;
      setHandoff(null);
      engine.goToSubStep(i);
    },
    [engine],
  );

  // test tubes already filled in earlier squeeze steps keep their colour and label on screen
  const previousTubes = useMemo(
    () =>
      engine.subSteps
        .map((st, i) => ({ st, i }))
        .filter(({ st, i }) => st.type === 'squeeze' && i !== engine.subStepIndex && engine.subStepResults[i])
        .map(({ st }) => ({ x: st.parameters.targetZone.x, label: st.parameters.tubeLabel, colour: st.parameters.resultColour })),
    [engine.subSteps, engine.subStepIndex, engine.subStepResults],
  );

  const desk = useMemo(() => {
    const currentSubStep = engine.currentSubStep;
    const isDeskEligible = currentSubStep?.type === 'drag' || currentSubStep?.type === 'drag_connect';
    if (!isDeskEligible) return { show: false, placedItems: [], upcomingIds: [] };

    const placedItems = engine.subSteps
      .slice(0, engine.subStepIndex)
      .filter((s) => s.parameters?.objectId && DESK_EQUIPMENT_IDS.has(s.parameters.objectId) && s.parameters?.toZone)
      .map((s) => ({ id: s.id, objectId: s.parameters.objectId, x: s.parameters.toZone.x, y: s.parameters.toZone.y, rig: s.parameters.rig, stack: s.parameters.stack, layout: s.parameters.layout }));

    // the P2 rig and the P3 stack are built big on the whole bench, so there is no shelf of pieces still to come
    const upcomingIds = engine.subSteps.some((s) => s.parameters?.rig || s.parameters?.stack)
      ? []
      : engine.subSteps
      .slice(engine.subStepIndex + 1)
      .map((s) => s.parameters?.objectId)
      .filter((id) => id && DESK_EQUIPMENT_IDS.has(id));

    const show = placedItems.length > 0 || DESK_EQUIPMENT_IDS.has(currentSubStep.parameters?.objectId);
    return { show, placedItems, upcomingIds };
  }, [engine.currentSubStep, engine.subSteps, engine.subStepIndex]);

  if (!engine.practical || engine.practical.stub || !engine.currentSubStep) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-mid)' }}>
          <p>{t('checkpoint.not_available')}</p>
        </div>
      </div>
    );
  }

  const subject = engine.practical.subject;
  const subjectColor = SUBJECT_COLORS[subject] ?? '#5B6FE0';
  const showBench = PHYSICAL_TYPES.has(engine.currentSubStep.type);
  const { main, sub } = splitInstruction(engine.currentSubStep.instruction);

  if (celebration) {
    const character = engine.currentCheckpoint.character ?? engine.practical.character;
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#fff' }}>
        <CharacterReactionLayer
          active
          character={character}
          medal={celebration.result.medal}
          message={t('checkpoint.complete', { name: engine.currentCheckpoint.name })}
          title={engine.currentCheckpoint.name}
          mode="checkpoint"
          onDone={handleCelebrationDone}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        boxShadow: dailyChallenge ? 'inset 0 0 0 6px #FFD700, inset 0 0 30px rgba(255,215,0,0.25)' : 'none',
      }}
    >
      <AnimatePresence>
        {showDailyBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{
              position: 'fixed',
              top: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 260,
              padding: '12px 24px',
              borderRadius: 999,
              background: '#FFD700',
              color: '#3A2A00',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 6px 18px rgba(232,160,32,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('game.daily_banner', { best: dailyBest })}
          </motion.div>
        )}
      </AnimatePresence>

      {showBench && (
        <div style={{ position: 'absolute', top: TOP_BANNER_CLEARANCE, left: CANVAS_LEFT + guideWidth, right: 0, bottom: BOTTOM_STRIP_HEIGHT }}>
          <BenchBackground variant={engine.practical.subject === 'physics' ? 'chemistry' : engine.practical.subject} tabletop={!!engine.practical.tabletop} />
        </div>
      )}
      {desk.show && (
        <div style={{ position: 'absolute', top: TOP_BANNER_CLEARANCE, left: CANVAS_LEFT + guideWidth, right: 0, bottom: BOTTOM_STRIP_HEIGHT }}>
          <DeskScene placedItems={desk.placedItems} upcomingIds={desk.upcomingIds} />
        </div>
      )}
      {guideWidth > 0 && <GuideScenery width={CANVAS_LEFT + guideWidth} />}
      <MicrogameRenderer
        key={engine.currentSubStep.id}
        step={engine.currentSubStep}
        onStepComplete={handleSubStepComplete}
        onStepError={() => {}}
        introMessage={handoff}
        onHint={setHint}
        transparentBg={showBench}
        extraProps={showBench ? { transparentBg: true, subjectColor, previousTubes } : { subjectColor, previousTubes }}
      />

      <RibbonBanner subject={subject} main={main} sub={sub} hint={hint} stepKey={engine.currentSubStep.id} />
      <StepStrip subject={subject} subjectColor={subjectColor} subSteps={checkpointSteps} onSelect={handleSelectStep} />

    </div>
  );
}
