import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ForceGraph, { GRAPH, gx, gy } from '../components/ForceGraph';

// P2 results: a slider tilts a straight line that starts at the first cross. Slide it until the line goes
// through every cross; let go there to lock it in. The crosses turn green as the line reaches them.
const START = { x: 0, y: 0.3 }; // the line is pinned at the first result
const TOUCH = 0.22; // how close (in N) the line has to pass to a cross to count as through it

export default function BestFitGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const { points, timeLimit = 0, startSlope = 0.025 } = step.parameters;

  const [slope, setSlope] = useState(startSlope); // newtons per degree
  const [locked, setLocked] = useState(false);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    onFeedback?.(t('game.fit_start'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yAt = (angle, m = slope) => START.y + m * (angle - START.x);
  const hit = points.map((p, i) => (Math.abs(yAt(p.x) - p.y) <= TOUCH ? i : -1)).filter((i) => i >= 0);
  const allHit = hit.length === points.length;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: Math.round(90 + timing * 10) });
  }, [onComplete, timeLimit]);

  // let go of the slider: lock in a line through every cross, otherwise say which way to move it
  function release() {
    if (doneRef.current) return;
    if (allHit) {
      setLocked(true);
      onFeedback?.(t('game.fit_good'));
      setTimeout(finish, 1500);
    } else {
      const mid = points[Math.floor(points.length / 2)];
      onFeedback?.(t(yAt(mid.x) > mid.y ? 'game.fit_high' : 'game.fit_low'));
    }
  }

  // the line runs from the first cross to the edge of the graph (or the top)
  const maxAngle = Math.min(GRAPH.xMax, (GRAPH.yMax - START.y) / slope);
  const end = { x: gx(maxAngle), y: gy(yAt(maxAngle)) };
  const colour = locked || allHit ? '#1E9E5A' : '#4C62D8';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '10px 20px' }}>
      <style>{`
        .fit-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 16px; border-radius: 8px; background: linear-gradient(90deg, #BFD0FF, #4C62D8); outline: none; touch-action: none; }
        .fit-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 44px; height: 44px; border-radius: 50%; background: #FFD76A; border: 4px solid #E8A020; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: grab; }
        .fit-slider::-moz-range-thumb { width: 38px; height: 38px; border-radius: 50%; background: #FFD76A; border: 4px solid #E8A020; cursor: grab; }
      `}</style>
      <div style={{ flex: '1 1 auto', width: 'min(100%, 760px)', minHeight: 0 }}>
        <ForceGraph points={points} hit={hit}>
          <line x1={gx(START.x)} y1={gy(START.y)} x2={end.x} y2={end.y} stroke={colour} strokeWidth={5} strokeLinecap="round" />
          <circle cx={gx(START.x)} cy={gy(START.y)} r={7} fill={colour} stroke="#fff" strokeWidth={2.5} />
        </ForceGraph>
      </div>
      <div style={{ width: 'min(70%, 520px)', paddingBottom: 6 }}>
        <input
          className="fit-slider"
          type="range"
          min={0.02}
          max={0.12}
          step={0.0005}
          value={slope}
          disabled={locked}
          onChange={(e) => !locked && setSlope(Number(e.target.value))}
          onPointerUp={release}
          onKeyUp={release}
        />
      </div>
    </div>
  );
}
