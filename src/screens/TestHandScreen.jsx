// Scratch preview route for confirming PipHand's 5 states and transitions
// in isolation before wiring it into any microgame. Not linked from
// anywhere in the app nav — reach it directly at /test-hand. Move the
// pointer over the grey zone and click a state chip to switch pose.
import { useRef, useState } from 'react';
import PipHand, { PipHandCelebrate } from '../components/PipHand';

const STATES = ['open', 'grip', 'pointing', 'squeeze', 'swipe'];

export default function TestHandScreen() {
  const zoneRef = useRef(null);
  const [state, setState] = useState('open');
  const [swiping, setSwiping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', padding: 40, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: `2px solid ${s === state ? '#333' : '#ccc'}`,
              background: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setSwiping((v) => !v)}
          style={{ padding: '8px 16px', borderRadius: 999, border: `2px solid ${swiping ? '#333' : '#ccc'}`, background: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          swiping: {swiping ? 'on' : 'off'}
        </button>
        <button
          onClick={() => setRotation((r) => (r + 45) % 360)}
          style={{ padding: '8px 16px', borderRadius: 999, border: '2px solid #ccc', background: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          rotation: {rotation}° (rotate knob test)
        </button>
        <button
          onClick={() => {
            setShowCelebrate(true);
            setTimeout(() => setShowCelebrate(false), 500);
          }}
          style={{ padding: '8px 16px', borderRadius: 999, border: '2px solid #ccc', background: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          trigger celebrate
        </button>
      </div>

      <div
        ref={zoneRef}
        style={{
          width: '100%',
          height: 500,
          background: 'linear-gradient(180deg, #EFEFEF, #DADADA)',
          borderRadius: 16,
          border: '2px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          color: '#999',
        }}
      >
        Move the pointer here: top = further away (85% scale), bottom = closest (100% scale)
      </div>

      <PipHand containerRef={zoneRef} state={state} rotation={rotation} swiping={swiping} />
      {showCelebrate && <PipHandCelebrate x={400} y={300} />}
    </div>
  );
}
