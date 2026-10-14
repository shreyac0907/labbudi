import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AssetImage from '../AssetImage';
import { ASSETS } from '../../config/assets';

function completeKey(year, practicalId) {
  return `labbudi_${year}_${practicalId}_complete`;
}

function withLogo(text) {
  const parts = text.split('LabBudi');
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <AssetImage
          src={ASSETS.ui.logo}
          alt="LabBudi"
          width={54}
          height={16}
          style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }}
        />
      )}
    </span>
  ));
}

function PromptCard({ text, acked, onAck }) {
  return (
    <div
      style={{
        marginTop: 14,
        background: acked ? '#EAF7F3' : '#fff',
        border: `1px solid ${acked ? 'var(--color-mint)' : 'var(--color-border)'}`,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-dark)', margin: 0 }}>{text}</p>
      {acked ? (
        <span
          style={{
            marginTop: 10,
            display: 'inline-block',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-mint)',
          }}
        >
          ✓ Considered
        </span>
      ) : (
        <button
          onClick={onAck}
          style={{
            marginTop: 10,
            padding: '8px 18px',
            borderRadius: 999,
            border: '1px solid var(--color-border)',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}
        >
          I've thought about this
        </button>
      )}
    </div>
  );
}

export default function Reflection({ year, practicalId, data, onFeedback, onPipVariant, onComplete, onBackToNotebook }) {
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [conclusion, setConclusion] = useState('');
  const [fired, setFired] = useState(false);

  const bothAcked = ack1 && ack2;

  useEffect(() => {
    if (bothAcked && !fired) {
      setFired(true);
      localStorage.setItem(completeKey(year, practicalId), 'true');
      onFeedback?.(withLogo(data.completeMessage));
      onPipVariant?.('celebrate');
      onComplete?.();
    }
  }, [bothAcked, fired, year, practicalId, data.completeMessage, onFeedback, onPipVariant, onComplete]);

  return (
    <>
      <h1 className="heading" style={{ fontSize: 26 }}>
        {data.title}
      </h1>

      <PromptCard text={data.prompts[0]} acked={ack1} onAck={() => setAck1(true)} />
      <PromptCard text={data.prompts[1]} acked={ack2} onAck={() => setAck2(true)} />

      {bothAcked && (
        <div style={{ marginTop: 16 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#999' }}>
            Conclusion (optional)
          </label>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Write your conclusion here..."
            rows={4}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 999,
          padding: '6px 14px',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--color-bio)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
          }}
        >
          S
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-mid)' }}>
          Skill: {data.gpsSkill}
        </span>
      </div>

      {bothAcked && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: [0, 1.1, 1], rotate: [-15, 3, 2] }}
            transition={{ duration: 0.4, times: [0, 0.6, 1], ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'inline-block' }}
          >
            <AssetImage src={ASSETS.misc.stampComplete} alt="Completed" width={110} height={110} />
          </motion.div>

          <div style={{ marginTop: 16 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBackToNotebook}
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
              Back to Notebook →
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
}
