import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Tap two terminal nodes to wire them together — order within a pair
// doesn't matter, and pairs can be completed in any order, the way you'd
// actually wire up a circuit by eye rather than in one fixed sequence.
// Renders over the DeskScene showing the components already placed in
// this checkpoint's earlier drag sub-steps (pass transparentBg to sit on
// top of it instead of painting its own white background).
export default function DragConnectGame({ step, onComplete, onFeedback, transparentBg = false }) {
  const { t } = useTranslation();
  const { parameters } = step;
  const { nodes = [], connections = [], timeLimit = 20 } = parameters;

  const [selected, setSelected] = useState(null);
  const [wired, setWired] = useState([]); // array of connection indices already made
  const [wrongFlash, setWrongFlash] = useState(false);
  const mistakesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const score = Math.round((1 - mistakesRef.current * 0.08) * 88 + timing * 12);
    onComplete({ accuracy: 1, timing, completion: 1, mistakes: mistakesRef.current, score: Math.max(40, score) });
  }, [timeLimit, onComplete]);

  function nodeById(id) {
    return nodes.find((n) => n.id === id);
  }

  function handleTap(nodeId) {
    if (doneRef.current) return;
    if (!selected) {
      setSelected(nodeId);
      return;
    }
    if (selected === nodeId) {
      setSelected(null);
      return;
    }
    const matchIndex = connections.findIndex(
      ([a, b], i) => !wired.includes(i) && ((a === selected && b === nodeId) || (a === nodeId && b === selected)),
    );
    if (matchIndex >= 0) {
      const nextWired = [...wired, matchIndex];
      setWired(nextWired);
      setSelected(null);
      if (nextWired.length === connections.length) {
        setTimeout(finish, 500);
      }
    } else {
      mistakesRef.current += 1;
      setWrongFlash(true);
      onFeedback?.(t('game.connect_mismatch'), 'wrong');
      setTimeout(() => setWrongFlash(false), 350);
      setSelected(null);
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: transparentBg ? 'transparent' : '#fff' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {wired.map((connIdx) => {
          const [aId, bId] = connections[connIdx];
          const a = nodeById(aId);
          const b = nodeById(bId);
          if (!a || !b) return null;
          return <line key={connIdx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3E9B4F" strokeWidth="1.2" strokeLinecap="round" />;
        })}
        {selected && (
          <line
            x1={nodeById(selected)?.x}
            y1={nodeById(selected)?.y}
            x2={nodeById(selected)?.x}
            y2={nodeById(selected)?.y}
            stroke="#5B6FE0"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {nodes.map((n) => {
        const isWired = wired.some((i) => connections[i][0] === n.id || connections[i][1] === n.id);
        const isSelected = selected === n.id;
        return (
          <motion.div
            key={n.id}
            onClick={() => handleTap(n.id)}
            animate={wrongFlash && isSelected ? { x: [0, -4, 4, 0] } : {}}
            style={{
              position: 'absolute',
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: isWired ? '#3E9B4F' : isSelected ? '#5B6FE0' : '#fff',
              border: `2px solid ${isWired ? '#2E7B3F' : '#5B6FE0'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              color: isWired || isSelected ? '#fff' : '#5B6FE0',
              fontFamily: 'var(--font-body)',
              zIndex: 5,
            }}
            title={n.label}
          >
            ●
          </motion.div>
        );
      })}
    </div>
  );
}
