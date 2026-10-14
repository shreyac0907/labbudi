import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import MicrogameManager from '../engine/MicrogameManager';
import FeedbackManager from '../engine/FeedbackManager';
import EvaluationEngine from '../engine/EvaluationEngine';
import { useGameState } from '../engine/GameState';
import FloatingSpeechBubble from './FloatingSpeechBubble';
import ScoreCounter from './ScoreCounter';
import StreakBadge from './StreakBadge';
import CharacterGuide from './CharacterGuide';
import { TOP_BANNER_CLEARANCE, BOTTOM_STRIP_HEIGHT, CANVAS_LEFT, GUIDE_TOP, useGuideWidth } from './chromeLayout';
import { useTranslation } from 'react-i18next';

export const TOP_BAR_HEIGHT = TOP_BANNER_CLEARANCE;

// the pause between one step and the next, so the speech bubble can be read
const MIN_PAUSE_MS = 3000;
const MAX_PAUSE_MS = 8000;
const PAUSE_MS_PER_CHAR = 60;

// Reads the current step's declared primary interactive object position (if
// any) so the floating speech bubble can dodge it — defaults to the right
// side, flipping to the left only when the object itself leans right.
function primaryObjectSide(step) {
  const p = step?.parameters;
  const x = p?.toZone?.x ?? p?.slot?.x ?? p?.components?.[0]?.slot?.x;
  return typeof x === 'number' && x > 55 ? 'left' : 'right';
}

// The extra information the step's character offers, in reading order: the step's
// own lines, intro and hints (data fields, already translated), and finally a "Tip:"
// built from the step's failure hint (unless the step sets `noTip`, e.g. when its hints already say what the piece is for). Everything is about THIS step; the previous
// step's result line is not carried over (it described something else). A step can
// also list its own lines in `info: []`.
function guideItems(step, tipPrefix) {
  const p = step?.parameters ?? {};
  const raw = [...(Array.isArray(step?.info) ? step.info : []), p.introLine, ...(Array.isArray(p.hints) ? p.hints : []), step?.feedback?.failure && !p.noTip ? `${tipPrefix} ${step.feedback.failure}` : null];
  const seen = new Set();
  return raw.filter((m) => typeof m === 'string' && m.trim() && !seen.has(m) && seen.add(m)).map((text) => ({ text, wrong: false }));
}

// The wrapper that launches any microgame: looks up the component for
// step.type and renders it full-width alongside a floating speech bubble. A
// checkpoint is one continuous flow, so when a microgame reports its result this
// scores it and hands straight on to the next step: no full-screen character
// takeover and no wait in between. The step's success line is passed up with the
// result and shown as the speech bubble on the next step, so it reads as the hand-off
// ("The pipette is full! Now drag it above the test tube and squeeze."). Only when the
// whole checkpoint is done does CheckpointScreen play its one celebration. Mistakes are
// soft (they lower the medal, never block progress); each microgame still tracks its own
// step.parameters.timeLimit internally purely to compute the `timing` factor for scoring.
export default function MicrogameRenderer({ step, onStepComplete, onStepError, onHint, introMessage = null, transparentBg = false, extraProps = {} }) {
  const { t } = useTranslation();
  const { state: gameState, actions } = useGameState();
  const guideWidth = useGuideWidth(step);
  const [feedback, setFeedback] = useState({ message: introMessage });
  const [live, setLive] = useState([]); // messages the game itself sends while it runs
  const [guideView, setGuideView] = useState(null); // the bubble the student has moved to (back/forward), for games that show what it was about
  const lockedRef = useRef(false);
  const advanceTimerRef = useRef(null); // the pending move to the next step, cleared if the screen goes away first
  const streakRef = useRef(gameState.streak);

  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  useEffect(() => {
    streakRef.current = gameState.streak;
  }, [gameState.streak]);

  useEffect(() => {
    lockedRef.current = false;
  }, [step.id]);

  const Microgame = useMemo(() => MicrogameManager.launch(step.type), [step.type]);

  const handleFeedback = useCallback(
    // tone === 'wrong' marks a message about something the student did wrong (the guide shows its react pose)
    // `meta` rides along with the message (e.g. { collar: 1 }) so the game can show what the bubble was about when the student comes back to it
    (message, tone, meta) => {
      if (lockedRef.current || !message) return;
      setFeedback({ message });
      const wrong = tone === 'wrong';
      setLive((prev) => {
        const at = prev.findIndex((m) => m.text === message);
        const entry = { text: message, wrong, meta, at: Date.now() + Math.random() };
        if (at === -1) return [...prev, entry].slice(-5);
        // a repeat of an earlier message (e.g. the same mistake again) is moved to the end so it shows again
        const next = prev.filter((_, i) => i !== at);
        return [...next, entry];
      });
    },
    [],
  );

  // Step-completion score (+50 clean, +30 with a mistake) and streak tracking live
  // here, the one chokepoint every microgame's result already passes through, so no
  // individual game file needs to know about scoring.
  const handleComplete = useCallback(
    (rawResult) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const result = EvaluationEngine.buildResult(rawResult);
      const fb = FeedbackManager.feedbackForResult(step, result);

      const clean = (rawResult.mistakes ?? 0) === 0;
      actions.addScore(clean ? 50 : 30);
      if (clean) actions.bumpStreak();
      else actions.resetStreak();

      const advance = () => onStepComplete(rawResult, fb.message);
      // Between steps, hold on the step's closing line in the speech bubble long enough to read it before the next step
      // starts. (A game that already holds on its own closing message says so with `skipPause`.)
      if (fb.message && !rawResult.skipPause) {
        setFeedback({ message: fb.message });
        setLive((prev) => [...prev.filter((m) => m.text !== fb.message), { text: fb.message, wrong: false, at: Date.now() + Math.random() }].slice(-5));
        advanceTimerRef.current = setTimeout(advance, Math.max(MIN_PAUSE_MS, Math.min(MAX_PAUSE_MS, fb.message.length * PAUSE_MS_PER_CHAR)));
      } else {
        advance();
      }
    },
    [onStepComplete, actions, step],
  );

  const baseItems = useMemo(() => guideItems(step, t('game.tip_prefix')), [step, t]);
  const items = useMemo(() => [...baseItems, ...live.filter((m) => !baseItems.some((b) => b.text === m.text))], [baseItems, live]);
  const showGuide = guideWidth > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: transparentBg ? 'transparent' : '#FFFFFF' }}>
      <div style={{ position: 'absolute', top: TOP_BANNER_CLEARANCE, left: CANVAS_LEFT + guideWidth, right: 0, bottom: BOTTOM_STRIP_HEIGHT, background: transparentBg ? 'transparent' : '#FFFFFF' }}>
        <Microgame step={step} onComplete={handleComplete} onFeedback={handleFeedback} onError={onStepError} onHint={onHint} guideView={guideView} {...extraProps} />
      </div>
      {showGuide ? (
        <div style={{ position: 'absolute', top: GUIDE_TOP, left: CANVAS_LEFT + 8, width: guideWidth - 24, bottom: BOTTOM_STRIP_HEIGHT, zIndex: 40, pointerEvents: 'none' }}>
          <CharacterGuide key={step.id} character={FeedbackManager.characterForStep(step)} items={items} characterHeight={Math.min(250, guideWidth - 30)} onShow={(item, byStudent) => setGuideView(byStudent && item?.meta ? { meta: item.meta } : null)} />
        </div>
      ) : (
        <FloatingSpeechBubble message={feedback.message} side={primaryObjectSide(step)} />
      )}

      <ScoreCounter hidden={!!step.parameters?.challengeMode} />
      <StreakBadge />

    </div>
  );
}
