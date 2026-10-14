import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../engine/GameState';
import { tv } from '../i18n/dataText';
import { useTranslation } from 'react-i18next';

const QUESTION_MS = 5000;
const DEFAULT_QUESTIONS = [
  {
    question: 'What controls what enters the cell?',
    options: ['Cell wall', 'Cell membrane', 'Nucleus'],
    correct: 'Cell membrane',
  },
  {
    question: "What would NOT be found in Pip's cheek cells?",
    options: ['Nucleus', 'Cell wall', 'Cytoplasm'],
    correct: 'Cell wall',
  },
  {
    question: 'Why is iodine used?',
    options: ['It adds colour', 'It stains the nucleus to make it visible', 'It kills bacteria'],
    correct: 'It stains the nucleus to make it visible',
  },
];

// Circular 5-second countdown ring drawn around the question card.
function CountdownRing({ questionKey, onExpire }) {
  const R = 30;
  const CIRC = 2 * Math.PI * R;
  return (
    <motion.svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: -8, right: -8 }}>
      <circle cx="34" cy="34" r={R} fill="none" stroke="#EDEFF2" strokeWidth="5" />
      <motion.circle
        key={questionKey}
        cx="34"
        cy="34"
        r={R}
        fill="none"
        stroke="var(--color-bio, #4FBFA8)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: CIRC }}
        transition={{ duration: QUESTION_MS / 1000, ease: 'linear' }}
        onAnimationComplete={onExpire}
        transform="rotate(-90 34 34)"
      />
    </motion.svg>
  );
}

// Rapid-fire 3-question knowledge check, immediately after labelling the
// cell — separate from the later "understand" flashcards (Prompt 3): this
// is a timed quiz with a score, not untimed reading.
export default function CellQuizGame({ step, onComplete, onFeedback }) {
  const { t } = useTranslation();
  const questions = step.parameters?.questions ?? DEFAULT_QUESTIONS;
  const { actions } = useGameState();

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(null); // { picked, correct } | null
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  const answeredRef = useRef(false);

  const q = questions[index];

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(null);
      answeredRef.current = false;
    }
  }, [index, questions.length]);

  const resolve = useCallback(
    (picked) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      const correct = picked === q.correct;
      setAnswered({ picked, correct });
      if (correct) {
        setCorrectCount((c) => c + 1);
        actions.addScore(100);
        onFeedback?.(t('game.quiz_right'));
      } else {
        onFeedback?.(t('game.quiz_wrong', { answer: tv(q.correct) }), 'wrong');
      }
      setTimeout(advance, 1300);
    },
    [q, advance, actions, onFeedback],
  );

  const handleExpire = useCallback(() => {
    if (!answeredRef.current) resolve(null); // no pick = wrong, correct answer still reveals
  }, [resolve]);

  useEffect(() => {
    if (!finished || doneRef.current) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const accuracy = correctCount / questions.length;
    const timeLimit = step.parameters?.timeLimit ?? 0;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    const t = setTimeout(() => onComplete({ accuracy, timing, completion: 1, mistakes: questions.length - correctCount, score: Math.round(accuracy * 100) }), 1400);
    return () => clearTimeout(t);
  }, [finished, correctCount, questions.length, onComplete, step.parameters]);

  if (finished) {
    const perfect = correctCount === questions.length;
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            padding: '24px 40px',
            borderRadius: 20,
            background: perfect ? 'linear-gradient(180deg,#FFF6DC,#FFEBAE)' : '#F4FBF9',
            border: `2px solid ${perfect ? '#E8A020' : 'var(--color-mint)'}`,
            textAlign: 'center',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-dark)' }}>{correctCount} / {questions.length}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: perfect ? '#B87A10' : 'var(--color-mint)', marginTop: 6 }}>
            {perfect ? t('game.quiz_perfect') : t('game.quiz_good')}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: -60, opacity: 0 }}
          animate={
            answered
              ? { y: 0, opacity: 1, x: answered.correct ? 0 : [0, -8, 8, -6, 6, 0], backgroundColor: answered.correct ? 'rgba(79,191,168,0.16)' : 'rgba(255,85,85,0.12)' }
              : { y: 0, opacity: 1, x: 0 }
          }
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            position: 'relative',
            width: 380,
            padding: '22px 28px 26px',
            borderRadius: 18,
            background: '#fff',
            border: '2px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {!answered && <CountdownRing questionKey={index} onExpire={handleExpire} />}

          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--color-dark)', marginBottom: 18, paddingRight: 40 }}>
            {tv(q.question)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt) => {
              const isCorrectOpt = opt === q.correct;
              const isPicked = answered?.picked === opt;
              const reveal = !!answered;
              return (
                <motion.button
                  key={opt}
                  onClick={() => !answered && resolve(opt)}
                  whileTap={!answered ? { scale: 0.97 } : {}}
                  disabled={!!answered}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `2px solid ${reveal && isCorrectOpt ? 'var(--color-mint)' : reveal && isPicked ? '#FF5555' : 'var(--color-border)'}`,
                    background: reveal && isCorrectOpt ? 'rgba(79,191,168,0.14)' : reveal && isPicked ? 'rgba(255,85,85,0.1)' : '#fafafa',
                    color: 'var(--color-dark)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: answered ? 'default' : 'pointer',
                  }}
                >
                  {tv(opt)}
                  {reveal && isCorrectOpt && ' ✓'}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
