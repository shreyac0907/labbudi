// Scratch preview route for confirming the 3D equipment depth system in
// isolation before wiring it into any microgame. Not linked from anywhere
// in the app nav — reach it directly at /preview/equipment.
import { useState } from 'react';
import TestTube from '../components/equipment/TestTube';
import Ramp from '../components/equipment/Ramp';
import ClampStand from '../components/equipment/ClampStand';
import NewtonMeter from '../components/equipment/NewtonMeter';
import Block from '../components/equipment/Block';

export default function EquipmentPreview() {
  const [angle, setAngle] = useState(30);
  const [reading, setReading] = useState(2.5);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', overflow: 'auto', padding: 40 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginBottom: 20 }}>Test tube</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 50, marginBottom: 50 }}>
        <div style={{ textAlign: 'center' }}>
          <TestTube size={2.2} liquidLevel={0} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>empty</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TestTube size={2.2} liquidLevel={0.7} liquidColour="#2E7D32" label="Water" />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>filled, labelled</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TestTube size={2.2} liquidLevel={0.9} liquidColour="#C62828" isHeld />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>lifted (shadow grows)</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TestTube size={2.2} liquidLevel={0.5} liquidColour="#1565C0" rotation={25} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>tilted 25°</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TestTube size={2.2} liquidLevel={0.6} liquidColour="#1565C0" state="hot" />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>hot</div>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginBottom: 20 }}>P2 apparatus</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 60, marginBottom: 30 }}>
        <div style={{ textAlign: 'center' }}>
          <Ramp size={1.3} angleDeg={angle} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>ramp @ {angle}°</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ClampStand size={1.1} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>clamp stand</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <NewtonMeter size={1.6} reading={reading} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>newton meter @ {reading}N</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <NewtonMeter size={2.6} reading={reading} zoomed />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>zoomed reading view</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Block size={1.6} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>block</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Block size={1.6} isHeld />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 8 }}>block, lifted</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>
          Ramp angle: <input type="range" min="0" max="65" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        </label>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>
          Meter reading: <input type="range" min="0" max="5" step="0.1" value={reading} onChange={(e) => setReading(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
