import { useState, useRef, useEffect } from 'react';
import CharacterShowcase from '../components/CharacterShowcase';

const DUMMY_DIALOGUE = {
  welcome: ["Welcome to the lab! Let's do this.", "Ready? Let's go!"],
  celebrate: ["Yes! That's exactly right!", "Perfect — nice work."],
  error: ["Oops! Let's try that again.", "Not quite — here's what happened."],
  fact: ['Fun fact: this reaction changes colour!', 'Did you know this is pH at work?'],
  checkpoint: ['Checkpoint saved!', 'Progress saved — you can come back anytime.'],
};

const TRIGGER_TYPES = ['welcome', 'celebrate', 'error', 'fact', 'checkpoint'];
const AUTO_FIRE_MS = 4000;

export default function TestShowcasePage() {
  const [trigger, setTrigger] = useState(null);
  const idRef = useRef(0);

  function fire(type) {
    idRef.current += 1;
    setTrigger({ type, index: idRef.current });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const type = TRIGGER_TYPES[Math.floor(Math.random() * TRIGGER_TYPES.length)];
      fire(type);
    }, AUTO_FIRE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-root" style={{ padding: '100px 24px 40px', background: 'var(--color-bg)' }}>
      <h1 className="heading" style={{ fontSize: 26 }}>
        Character Showcase — Test Harness
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-mid)', maxWidth: 480 }}>
        Click a trigger below. A random character (never the one who just spoke) will pop up in the
        showcase with a random line for that trigger type. The bubble auto-dismisses after 4 seconds
        unless another trigger fires first.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
        {TRIGGER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => fire(type)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              textTransform: 'capitalize',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {trigger && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#999', marginTop: 12 }}>
          Last fired: {trigger.type} (#{trigger.index})
        </p>
      )}

      <CharacterShowcase practicalDialogue={DUMMY_DIALOGUE} currentTrigger={trigger} />
    </div>
  );
}
