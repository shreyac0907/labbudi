// Scratch preview route for confirming BenchBackground's perspective,
// blur levels, and lighting in isolation before any equipment renders on
// top of it. Not linked from anywhere in the app nav — reach it directly
// at /test-bench. Click a variant chip to switch tint.
import { useState } from 'react';
import BenchBackground from '../components/BenchBackground';

const VARIANTS = ['chemistry', 'biology', 'physics'];

export default function TestBenchScreen() {
  const [variant, setVariant] = useState('chemistry');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff' }}>
      <BenchBackground variant={variant} />

      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 8 }}>
        {VARIANTS.map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: `2px solid ${v === variant ? '#333' : '#ccc'}`,
              background: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* horizon-line marker for visual calibration only, not part of BenchBackground itself */}
      <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, background: 'rgba(255,0,0,0.4)', zIndex: 10 }} />
      <div style={{ position: 'absolute', top: 'calc(30% - 16px)', left: 16, zIndex: 10, fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(200,0,0,0.7)' }}>
        horizon (30%)
      </div>
    </div>
  );
}
