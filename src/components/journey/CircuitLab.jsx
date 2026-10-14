import { useState, useEffect, useRef } from 'react';
import CharacterShowcase from '../CharacterShowcase';
import { BatterySVG, BulbSVG, SwitchSVG, AmmeterSVG, VoltmeterSVG, MotorSVG, FanSVG, CircuitMatSVG } from './CircuitEquipment';
import { screenFiveResultsKey, screenFiveProgressKey, screenFiveCompleteKey } from '../../data/practicalStorage';

const AMMETER_READING = 0.3;
const VOLTMETER_READING = 1.5;
const COUNT_UP_MS = 500;

const STAGE_REQUIRED = {
  1: ['battery', 'bulb', 'switch'],
  2: ['battery', 'bulb', 'switch', 'ammeter'],
  3: ['battery', 'bulb', 'switch', 'ammeter', 'voltmeter'],
};
const COMPONENT_LABEL = { battery: 'Battery', bulb: 'Bulb', switch: 'Switch', ammeter: 'Ammeter', voltmeter: 'Voltmeter' };

function useCountUp(target, durationMs) {
  const [value, setValue] = useState(target);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = value;
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(from + (target - from) * t);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

export default function CircuitLab({ year, practicalId, wetLabDialogue, onContinue }) {
  const [stage, setStage] = useState(1);
  const [placed, setPlaced] = useState(new Set());
  const [switchClosed, setSwitchClosed] = useState(false);
  const [results, setResults] = useState({});
  const [substitution, setSubstitution] = useState('bulb'); // bulb | motor | fan
  const [trigger, setTrigger] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  const triggerIdRef = useRef(0);
  const welcomedRef = useRef(false);

  const targetAmmeter = switchClosed && stage >= 2 ? AMMETER_READING : 0;
  const targetVoltmeter = switchClosed && stage >= 3 ? VOLTMETER_READING : 0;
  const ammeterDisplay = useCountUp(targetAmmeter, COUNT_UP_MS);
  const voltmeterDisplay = useCountUp(targetVoltmeter, COUNT_UP_MS);

  function fireCharacterTrigger(character, text, variant) {
    triggerIdRef.current += 1;
    setTrigger({ type: 'scripted', index: triggerIdRef.current, character, text, variant });
  }

  useEffect(() => {
    if (!welcomedRef.current) {
      welcomedRef.current = true;
      fireCharacterTrigger('lumi', "We're going to build three circuits today, each one more complex than the last. Start by finding the battery.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const required = STAGE_REQUIRED[stage];
  const missing = required.filter((c) => !placed.has(c));
  const readyToClose = missing.length === 0;

  function handleAdd(component) {
    setPlaced((prev) => new Set(prev).add(component));
  }

  function saveResults(nextResults) {
    localStorage.setItem(screenFiveResultsKey(year, practicalId), JSON.stringify(nextResults));
    localStorage.setItem(screenFiveProgressKey(year, practicalId), String(stage));
  }

  function handleResetPractical() {
    const confirmed = window.confirm(
      'Reset the Wet Lab? All your circuits and saved results for this practical will be cleared, as if you never started.'
    );
    if (!confirmed) return;

    localStorage.removeItem(screenFiveResultsKey(year, practicalId));
    localStorage.removeItem(screenFiveProgressKey(year, practicalId));
    localStorage.removeItem(screenFiveCompleteKey(year, practicalId));

    setStage(1);
    setPlaced(new Set());
    setSwitchClosed(false);
    setResults({});
    setSubstitution('bulb');
    setShowContinue(false);
    fireCharacterTrigger('pip', "All clear! The Wet Lab's reset — let's start fresh.");
  }

  function handleCloseSwitch() {
    if (!readyToClose) {
      fireCharacterTrigger('lili', "The circuit isn't complete yet — there's a gap. Place all the required components first.");
      return;
    }
    setSwitchClosed(true);

    if (stage === 1) {
      fireCharacterTrigger('madu', 'THE BULB IS ON! The circuit is complete — electrons are flowing from the battery, through the bulb, and back again right now!');
      const next = { ...results, circuit1: { componentsUsed: required, litBulb: true } };
      setResults(next);
      saveResults(next);
    } else if (stage === 2) {
      setTimeout(() => fireCharacterTrigger('lumi', '0.3 amperes — that\'s the current flowing through every part of this series circuit. Same everywhere.'), 600);
      const next = { ...results, circuit2: { componentsUsed: required, ammeter: AMMETER_READING } };
      setResults(next);
      saveResults(next);
      setTimeout(() => fireCharacterTrigger('pip', 'Two circuits down, one to go. Progress saved!'), 2200);
    } else if (stage === 3) {
      setTimeout(() => fireCharacterTrigger('lumi', '1.5 volts across the bulb. That is the potential difference — the energy per unit charge being transferred to the bulb as light and heat.'), 600);
      const next = { ...results, circuit3: { componentsUsed: required, ammeter: AMMETER_READING, voltmeter: VOLTMETER_READING } };
      setResults(next);
      saveResults(next);
      localStorage.setItem(screenFiveCompleteKey(year, practicalId), 'true');
      setShowContinue(true);
    }
  }

  function handleNextCircuit() {
    setSwitchClosed(false);
    setStage((s) => s + 1);
  }

  function handleSubstitute(kind) {
    setSubstitution(kind);
    fireCharacterTrigger('madu', 'Same battery, same switch, same current — completely different output! The component determines what the electrical energy becomes.');
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '150px 24px 40px 24px',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <h1 className="heading" style={{ fontSize: 22, margin: 0, marginBottom: 16 }}>
          The Wet Lab
        </h1>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, marginBottom: 16 }}>Circuit {stage} / 3</div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, width: 420 }}>
            <div style={{ position: 'relative' }}>
              <CircuitMatSVG width={380} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                  padding: '0 20px',
                }}
              >
                {placed.has('battery') && <BatterySVG width={44} />}
                {placed.has('bulb') &&
                  (substitution === 'bulb' ? (
                    <BulbSVG lit={switchClosed} width={30} />
                  ) : substitution === 'motor' ? (
                    <MotorSVG spinning={switchClosed} width={34} />
                  ) : (
                    <FanSVG spinning={switchClosed} width={34} />
                  ))}
                {placed.has('switch') && <SwitchSVG closed={switchClosed} width={40} />}
                {placed.has('ammeter') && <AmmeterSVG reading={stage >= 2 ? ammeterDisplay : null} width={36} />}
                {placed.has('voltmeter') && <VoltmeterSVG reading={stage >= 3 ? voltmeterDisplay : null} width={36} />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
              {missing.map((c) => (
                <button key={c} onClick={() => handleAdd(c)} style={stepButtonStyle(true)}>
                  Add {COMPONENT_LABEL[c]}
                </button>
              ))}
              {readyToClose && !switchClosed && (
                <button onClick={handleCloseSwitch} style={stepButtonStyle(true)}>
                  Close switch
                </button>
              )}
              {switchClosed && stage < 3 && (
                <button onClick={handleNextCircuit} style={stepButtonStyle(true)}>
                  Build circuit {stage + 1} →
                </button>
              )}
            </div>

            {switchClosed && stage === 3 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', marginBottom: 6 }}>
                  Experiment further — swap the bulb:
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button onClick={() => handleSubstitute('bulb')} style={stepButtonStyle(substitution !== 'bulb')}>
                    Bulb
                  </button>
                  <button onClick={() => handleSubstitute('motor')} style={stepButtonStyle(substitution !== 'motor')}>
                    Motor
                  </button>
                  <button onClick={() => handleSubstitute('fan')} style={stepButtonStyle(substitution !== 'fan')}>
                    Fan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>Results</div>
              <button
                onClick={handleResetPractical}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid #E0A296',
                  background: '#fff',
                  color: '#C0503D',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Reset practical
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 70px 70px', gap: 8, fontFamily: 'var(--font-body)', fontSize: 11 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-mid)' }}>Circuit</div>
                <div style={{ fontWeight: 600, color: 'var(--color-mid)' }}>Ammeter</div>
                <div style={{ fontWeight: 600, color: 'var(--color-mid)' }}>Voltmeter</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>1</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>—</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>—</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>2</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>{results.circuit2 ? '0.3A' : '—'}</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>—</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>3</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>{results.circuit3 ? '0.3A' : '—'}</div>
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>{results.circuit3 ? '1.5V' : '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {showContinue && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={onContinue}
              style={{
                background: 'var(--color-start)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                padding: '12px 32px',
                borderRadius: 32,
                border: 'none',
              }}
            >
              Continue to Results →
            </button>
          </div>
        )}
      </div>

      <CharacterShowcase practicalDialogue={wetLabDialogue ?? {}} currentTrigger={trigger} inset={56} />
    </div>
  );
}

function stepButtonStyle(enabled) {
  return {
    padding: '10px 18px',
    borderRadius: 999,
    border: 'none',
    background: enabled ? 'var(--color-start)' : 'var(--color-border)',
    color: enabled ? '#fff' : '#999',
    fontFamily: 'var(--font-heading)',
    fontSize: 13,
    cursor: enabled ? 'pointer' : 'not-allowed',
  };
}
