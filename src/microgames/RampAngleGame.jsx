import { useState, useCallback, useRef } from 'react';
import RampRig, { PLANK_L, PLANK_TK } from '../components/equipment/RampRig';
import RigStage from '../components/equipment/RigStage';
import RampProtractor from '../components/equipment/RampProtractor';
import { BLOCK_T, rigGeometry } from '../components/equipment/rampSetup';
import PipHand from '../components/PipHand';
import BonusBanner from '../components/BonusBanner';
import { useGameState } from '../engine/GameState';
import { useTranslation } from 'react-i18next';

const PRECISION_TOLERANCE = 0.5; // degrees — the "Perfect Angle" surprise bonus

// Set the ramp's angle by dragging a tilt handle at its raised end — the
// natural motion of lifting a ramp, not an abstract dial. The handle is
// rendered in a second <svg> that shares RampRig's exact viewBox/aspect
// ratio, so a plain trig projection of the ramp's own raised-end point
// (the same maths RampRig uses for its book stack) lands the handle
// exactly on the ramp regardless of container size.
export default function RampAngleGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { targetAngle, startAngle = 0, tolerance = 3, timeLimit = 0 } = parameters;
  const { actions } = useGameState();

  const [angle, setAngle] = useState(startAngle);
  const [locked, setLocked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [precisionBonus, setPrecisionBonus] = useState(false);
  const svgRef = useRef(null);
  const sceneRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLocked(true);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 0.95, timing, completion: 1, mistakes: 0, score: Math.round(0.9 * 88 + timing * 12) });
  }, [onComplete, timeLimit]);

  const applyAngle = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(90, next));
      setAngle(clamped);
      if (Math.abs(clamped - targetAngle) <= tolerance) {
        if (Math.abs(clamped - targetAngle) <= PRECISION_TOLERANCE) {
          setPrecisionBonus(true);
          actions.addScore(200);
          setTimeout(() => onFeedback?.(t('game.textbook_accuracy')), 400);
          setTimeout(() => setPrecisionBonus(false), 1400);
        }
        onFeedback?.(t('game.your_angle', { angle: targetAngle }));
        setAngle(targetAngle);
        setTimeout(finish, 300);
      }
    },
    [targetAngle, tolerance, finish, onFeedback, actions],
  );

  // The handle is dragged round the hinge: the ramp follows the pointer's bearing from the hinge,
  // measured from where the drag started so the ramp doesn't jump when the handle is grabbed off-centre.
  function handlePointerDown(e) {
    if (locked) return;
    e.preventDefault();
    setDragging(true);
    const rect = sceneRef.current.getBoundingClientRect();
    const { hingeX, hingeY } = rigGeometry(rect.width, rect.height, targetAngle);
    const bearing = (ev) => (Math.atan2(rect.top + hingeY - ev.clientY, ev.clientX - (rect.left + hingeX)) * 180) / Math.PI;
    const start = { bearing: bearing(e), angle };
    const move = (ev) => applyAngle(start.angle + bearing(ev) - start.bearing);
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const angleRad = (angle * Math.PI) / 180;
  const handleX = PLANK_L * Math.cos(angleRad);
  const handleY = -PLANK_L * Math.sin(angleRad) - PLANK_TK;

  return (
    <div ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <RigStage angleDeg={targetAngle}>
        {({ viewBox }) => (
          <>
            <RampProtractor viewBox={viewBox} target={targetAngle} tolerance={tolerance} />
            <RampRig viewBox={viewBox} angleDeg={angle} blockT={BLOCK_T} size={1.05} />

            {/* tilt handle — shares the exact viewBox of RampRig, so this coordinate always lands on the ramp's raised end */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={viewBox}
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
            >
              <g
                onPointerDown={handlePointerDown}
                style={{ cursor: locked ? 'default' : 'grab', touchAction: 'none', pointerEvents: 'auto' }}
                transform={`translate(${handleX} ${handleY})`}
              >
                <circle r={30} fill="rgba(255,220,80,0.25)" />
                <circle r={15} fill="#E8A020" stroke="#B87A10" strokeWidth="2" />
                <path d="M-6,4 L0,-7 L6,4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              {/* the live angle, beside the handle */}
              <g transform={`translate(${handleX + 48} ${handleY + 6})`} style={{ pointerEvents: 'none' }}>
                <rect x={-4} y={-22} width={62} height={34} rx={9} fill="rgba(40,44,52,0.82)" />
                <text x={27} y={3} textAnchor="middle" fontSize="23" fontWeight="700" fill="#fff" fontFamily="var(--font-heading)">
                  {Math.round(angle)}°
                </text>
              </g>
            </svg>
          </>
        )}
      </RigStage>

      <BonusBanner active={precisionBonus} text={t('ui.precision_bonus')} points={200} color="#FFD700" />

      <PipHand containerRef={sceneRef} state={dragging ? 'grip' : 'open'} active={!locked} />
    </div>
  );
}
