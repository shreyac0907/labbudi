import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import RigStage from '../components/equipment/RigStage';
import PipHand from '../components/PipHand';
import { woodGrainPaths, CHROME } from '../components/equipment/materials';
import { useTranslation } from 'react-i18next';

// P2 setup, after the Newton meter is in place: tie the string to the block's eye and to the meter's hook.
// Each end takes three presses on the glowing spot: feed the string through the ring, loop the loose end over
// the string, pull the knot tight. Press anywhere else and it is a mistake (the guide says where to press).
// The block's end comes first, then the meter's, which is the same moves mirrored.

const STRING = '#7A4F1D';
const RING_L = { x: -262, y: -62 }; // the eye on the block, in scene units (ground at y = 0)
const RING_R = { x: 150, y: -62 }; // the hook ring on the meter
const SPAN = { l: { x: RING_L.x + 60, y: RING_L.y + 8 }, r: { x: RING_R.x - 60, y: RING_R.y + 8 } };

// spots to press at each stage, relative to the ring (the string runs towards +x)
const SPOTS = [
  { x: 0, y: 0 }, // the ring
  { x: -20, y: 44 }, // the loose end
  { x: 34, y: 4 }, // the loop
];
const MESSAGES = ['game.knot_thread', 'game.knot_loop', 'game.knot_tighten'];

// what one end looks like at each stage, relative to the ring; the string runs to the right, to (60,8)
function EndShape({ stage }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    const tween = gsap.fromTo(ref.current, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' });
    return () => tween.kill();
  }, [stage]);

  const common = { fill: 'none', stroke: STRING, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <g ref={ref}>
      {stage === 0 && <path d="M60,8 C46,30 40,50 52,66" {...common} />}
      {stage === 1 && <path d="M60,8 C40,-4 18,-9 -4,-6 C -24,-3 -30,22 -20,46" {...common} />}
      {stage === 2 && <path d="M60,8 C40,-4 18,-9 -4,-6 C -26,-2 -26,34 0,38 C 30,42 52,26 40,6 C 36,-2 28,-2 28,6" {...common} />}
      {stage === 3 && (
        <>
          <path d="M60,8 L34,2 M4,-4 L14,0" {...common} />
          <path d="M12,10 C6,22 5,30 9,40" {...common} strokeWidth={4} />
          <ellipse cx={24} cy={0} rx={17} ry={13} fill="#9A6A2C" stroke="#4A2F10" strokeWidth={2.5} />
          <path d="M12,-6 L22,10 M20,-11 L30,12 M28,-10 L35,6" stroke="#4A2F10" strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      )}
    </g>
  );
}

function Eye({ x, y, mirror, threaded }) {
  // the eye is drawn first (behind the string) and, once the string passes through it, its near arc is drawn again over the string
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -1 : 1} 1)`}>
      <circle r={17} fill="none" stroke={CHROME.base} strokeWidth={5} />
      <circle r={17} fill="none" stroke={CHROME.highlight} strokeWidth={1.5} />
      {threaded && <path d="M12,-12 A17,17 0 0 1 12,12" fill="none" stroke={CHROME.base} strokeWidth={5} strokeLinecap="round" />}
    </g>
  );
}

export default function TieKnotGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { timeLimit = 0 } = step.parameters ?? {};
  const [stage, setStage] = useState(0); // presses made so far, 0-6: the block's end first, then the meter's
  const [sag, setSag] = useState(48);
  const sagRef = useRef({ v: 48 });
  const sceneRef = useRef(null);
  const startRef = useRef(Date.now());
  const mistakesRef = useRef(0);
  const doneRef = useRef(false);
  const pulseRef = useRef(null);

  const done = stage >= 6;
  const rightEnd = stage >= 3;
  const stageL = Math.min(stage, 3);
  const stageR = Math.max(0, Math.min(stage - 3, 3));
  const k = stage % 3;

  // say what to press next, in the guide's speech bubble
  useEffect(() => {
    if (stage >= 6) return;
    if (stage === 3) onFeedback?.(t('game.knot_next_end'));
    else onFeedback?.(t(MESSAGES[k]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // the glowing spot breathes
  useEffect(() => {
    if (!pulseRef.current || done) return undefined;
    const tween = gsap.fromTo(pulseRef.current, { scale: 0.85, transformOrigin: '50% 50%' }, { scale: 1.15, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    return () => tween.kill();
  }, [stage, done]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const accuracy = mistakesRef.current === 0 ? 1 : Math.max(0.6, 1 - mistakesRef.current * 0.1);
    onComplete({ accuracy, timing, completion: 1, mistakes: mistakesRef.current, score: Math.round(accuracy * 90 + timing * 10) });
  }, [onComplete, timeLimit]);

  function press() {
    if (done) return;
    const next = stage + 1;
    setStage(next);
    if (next === 6) {
      const tween = gsap.to(sagRef.current, { v: 0, duration: 0.6, ease: 'power2.out', onUpdate: () => setSag(sagRef.current.v) });
      setTimeout(() => {
        tween.kill();
        finish();
      }, 1400);
    }
  }

  function miss() {
    if (done) return;
    mistakesRef.current += 1;
    onFeedback?.(t('game.knot_wrong'), 'wrong');
  }

  const ringX = rightEnd ? RING_R.x : RING_L.x;
  const ringY = rightEnd ? RING_R.y : RING_L.y;
  const spot = SPOTS[k];
  const spotX = ringX + (rightEnd ? -spot.x : spot.x);
  const spotY = ringY + spot.y;

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <RigStage angleDeg={0}>
        {({ w, h }) => {
          const u = Math.min(w / 900, h / 380);
          return (
            <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', touchAction: 'none' }} onPointerDown={miss}>
              <g transform={`translate(${w / 2 - 35 * u} ${h * 0.8}) scale(${u})`}>
                {/* the block, front on, with its eye */}
                <path d="M-400,-110 L-250,-110 L-228,-132 L-378,-132 Z" fill="#D8A465" stroke="#5C3A1B" strokeWidth={2} />
                <path d="M-250,-110 L-228,-132 L-228,-22 L-250,0 Z" fill="#8A5C2E" stroke="#4A2E15" strokeWidth={2} />
                <rect x={-400} y={-110} width={150} height={110} fill="#B9803F" stroke="#5C3A1B" strokeWidth={2.5} />
                <rect x={-394} y={-104} width={138} height={10} fill="rgba(255,255,255,0.28)" />
                {woodGrainPaths(-392, -80, 130, 4).map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#5C3A1B" strokeWidth={1.2} opacity={0.2} />
                ))}
                <rect x={-276} y={-72} width={26} height={20} rx={4} fill="#8B919A" stroke="#5B616B" strokeWidth={2} />

                {/* the Newton meter lying on its side, its hook ring to the left */}
                <rect x={190} y={-102} width={280} height={80} rx={14} fill="#00897B" stroke="#00574F" strokeWidth={3} />
                <rect x={206} y={-90} width={248} height={56} rx={6} fill="#FAFAFA" stroke="#CCCCCC" strokeWidth={1.5} />
                {Array.from({ length: 11 }, (_, i) => (
                  <line key={i} x1={222 + i * 21} x2={222 + i * 21} y1={-90} y2={i % 2 ? -78 : -72} stroke="#333" strokeWidth={2} />
                ))}
                <path d="M190,-62 L167,-62" stroke={CHROME.base} strokeWidth={6} strokeLinecap="round" />

                <Eye x={RING_L.x} y={RING_L.y} threaded={stageL >= 1} />
                <Eye x={RING_R.x} y={RING_R.y} mirror threaded={stageR >= 1} />

                {/* the string between the two ends */}
                <path
                  d={`M${SPAN.l.x},${SPAN.l.y} Q${(SPAN.l.x + SPAN.r.x) / 2},${(SPAN.l.y + SPAN.r.y) / 2 + sag * 2} ${SPAN.r.x},${SPAN.r.y}`}
                  fill="none"
                  stroke={STRING}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <g transform={`translate(${RING_L.x} ${RING_L.y})`}>
                  <EndShape stage={stageL} />
                </g>
                <g transform={`translate(${RING_R.x} ${RING_R.y}) scale(-1 1)`}>
                  <EndShape stage={stageR} />
                </g>

                {/* the glowing spot to press */}
                {!done && (
                  <g transform={`translate(${spotX} ${spotY})`}>
                    <g ref={pulseRef}>
                      <circle r={30} fill="rgba(255,214,0,0.28)" stroke="#E8A020" strokeWidth={4} strokeDasharray="7 6" />
                    </g>
                    <circle r={38} fill="transparent" style={{ cursor: 'pointer' }} onPointerDown={(e) => { e.stopPropagation(); press(); }} />
                  </g>
                )}
              </g>
            </svg>
          );
        }}
      </RigStage>
      <PipHand containerRef={sceneRef} state="open" active={!done} />
    </div>
  );
}
