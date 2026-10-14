import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssetImage from './AssetImage';
import { ASSETS } from '../config/assets';
import StarRatingReveal from './StarRatingReveal';
import { useTranslation } from 'react-i18next';

const SUBJECT_GLOW = { chemistry: '#E8A020', physics: '#5B6FE0', biology: '#4FBFA8' };

function tierFor(medal) {
  if (medal === 'gold') return 'celebrate';
  if (medal === 'silver' || medal === 'bronze') return 'good';
  return 'fail';
}

function StarBurst() {
  const stars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        angle: (i / 14) * 360 + Math.random() * 12,
        dist: 60 + Math.random() * 30,
        size: 8 + Math.random() * 12,
        delay: i * 0.03,
      })),
    [],
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {stars.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        return (
          <motion.div
            key={s.id}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: Math.cos(rad) * s.dist, y: Math.sin(rad) * s.dist }}
            transition={{ duration: 0.6, delay: s.delay, ease: 'easeOut' }}
            style={{ position: 'absolute', left: '50%', top: '38%' }}
          >
            <span style={{ display: 'block', fontSize: s.size * 1.5, lineHeight: 1, transform: 'translate(-50%, -50%)' }} aria-hidden="true">
              ⭐
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function ThumbsUp() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: -6, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{ position: 'absolute', left: '62%', top: '30%', fontSize: 26 }}
    >
      {t('game.nice')}
    </motion.div>
  );
}

function SweatDrop() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, 4, 8] }}
      transition={{ duration: 1 }}
      style={{ position: 'absolute', left: '66%', top: '18%' }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20">
        <path d="M8 0 C8 0 15 10 15 14 A7 7 0 0 1 1 14 C1 10 8 0 8 0 Z" fill="#7EC8E3" />
      </svg>
    </motion.div>
  );
}

// The checkpoint-complete scene: the checkpoint's character in its celebrate pose, ringed by a
// halo of painted flowers over a soft glow, with the checkpoint's name beside it, the star rating
// below and a DONE! stamp slammed down at the corner. Laid out on a 16:9 stage so it holds its
// shape at any window size.
const HALO = [
  { src: '/assets/ui/home/pink_r.png', x: 50.5, y: 14, w: 11, delay: 0.1, sway: 6 },
  { src: '/assets/ui/home/orange.png', x: 37, y: 17.5, w: 8.8, delay: 0.25, sway: -7 },
  { src: '/assets/ui/home/orange.png', x: 64, y: 17.5, w: 8.8, delay: 0.25, sway: 7 },
  { src: '/assets/ui/home/pink_l.png', x: 29, y: 31, w: 9.5, delay: 0.4, sway: -5 },
  { src: '/assets/ui/home/pink_l.png', x: 72, y: 31, w: 9.5, delay: 0.4, sway: 5 },
];

function CheckpointScene({ character, medal, title, onDone }) {
  const { t } = useTranslation();
  const duration = 4600;
  const art = ASSETS.characters[character];
  const src = medal === 'none' ? art?.react ?? art?.idle : art?.celebrate ?? art?.idle;

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onDone?.()}
      style={{ position: 'fixed', inset: 0, zIndex: 300, cursor: 'pointer', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ position: 'relative', width: 'min(100vw, 177.78vh)', height: 'min(56.25vw, 100vh)' }}>
        {/* the picture sits right of centre, with the name in its own column on the left */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateX(9%)' }}>
        {/* soft glow behind the character (positioned by the plain div, animated by the motion one inside it) */}
        <div style={{ position: 'absolute', left: '50.5%', top: '52%', width: '58%', height: '84%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,205,110,0.42) 0%, rgba(255,205,110,0.16) 45%, rgba(255,255,255,0) 70%)' }}
          />
        </div>

        {/* flower halo */}
        {HALO.map((f, i) => (
          <div key={i} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, transform: 'translate(-50%, -50%)' }}>
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15, delay: f.delay }}
            >
              <motion.img
                src={f.src}
                alt=""
                draggable={false}
                animate={{ rotate: [-f.sway, f.sway, -f.sway] }}
                transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </motion.div>
          </div>
        ))}

        {/* the character */}
        <div style={{ position: 'absolute', left: '50.5%', bottom: '15%', height: '62%', width: '42%', transform: 'translateX(-50%)' }}>
          <motion.div
            initial={{ y: 120, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
            style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <AssetImage src={src} alt={character} style={{ height: '100%', width: '100%', objectFit: 'contain', objectPosition: 'bottom', display: 'block' }} />
          </motion.div>
        </div>

        {/* the checkpoint's name: in its own column down the left (the wrapper is shifted 9% right, so -6% is 3% from the edge) */}
        <div style={{ position: 'absolute', left: '-6%', top: '55%', transform: 'translateY(-50%)', width: '28%' }}>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ textAlign: 'left', fontFamily: 'Inter, var(--font-heading)', fontSize: 'min(2.6vw, 4.6vh)', lineHeight: 1.25, color: '#111' }}
          >
            <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>{title}:</div>
            <div style={{ fontWeight: 400 }}>{t('checkpoint.complete_label')}</div>
          </motion.div>
        </div>

        {/* stars */}
        <div style={{ position: 'absolute', left: '50.5%', bottom: '2%', transform: 'translateX(-50%)' }}>
          <StarRatingReveal medal={medal} />
        </div>

        {/* DONE! stamp */}
        <motion.img
          src="/assets/misc/stamp_complete.svg"
          alt=""
          draggable={false}
          initial={{ scale: 2.6, rotate: -28, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 16, delay: 1.3 }}
          style={{ position: 'absolute', left: '61%', top: '70%', width: '14%', height: 'auto' }}
        />
        </div>
      </div>
    </motion.div>
  );
}

// Full-screen Cooking-Mama-style character takeover, fired on every step's
// success/failure evaluation. `mode='checkpoint'` is the bigger version
// (longer hold, star rating, all particles) for checkpoint completion.
function StepReaction({ character = 'pip', medal = 'gold', message, mode = 'step', onDone }) {
  const tier = tierFor(medal);
  const duration = mode === 'checkpoint' ? 3000 : 1800;
  const glow = SUBJECT_GLOW.chemistry;
  const src = ASSETS.characters[character]?.[tier === 'celebrate' ? 'celebrate' : tier === 'good' ? 'speaking' : 'react'] ?? ASSETS.characters[character]?.idle;

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onDone?.()}
      style={{ position: 'fixed', inset: 0, zIndex: 300, cursor: 'pointer', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', width: '60%', maxWidth: 420, height: '70%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {/* soft glow behind the character */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '20%',
            transform: 'translateX(-50%)',
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}66 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {tier === 'celebrate' && <StarBurst />}

        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          exit={{ y: 200, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
          style={{ position: 'relative', height: '90%', display: 'flex', alignItems: 'flex-end' }}
        >
          <AssetImage src={src} alt={character} style={{ height: '100%', width: 'auto', display: 'block' }} />
          {tier === 'good' && <ThumbsUp />}
          {tier === 'fail' && <SweatDrop />}

          {/* sparkles near the character on a perfect result */}
          {tier === 'celebrate' &&
            [0, 1, 2, 3].map((i) => (
              <motion.svg
                key={i}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 0.9, delay: 0.15 * i, repeat: Infinity, repeatDelay: 1.2 }}
                style={{ position: 'absolute', left: `${10 + i * 24}%`, top: `${8 + (i % 2) * 22}%` }}
              >
                <path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4 Z" fill="#fff" />
              </motion.svg>
            ))}
        </motion.div>

        {/* speech bubble */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [0, 1.1, 1] }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            style={{
              position: 'absolute',
              right: '-6%',
              top: '14%',
              width: 220,
              background: tier === 'fail' ? 'rgba(255,235,235,0.95)' : 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              padding: '14px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: glow, lineHeight: 1.3 }}>{message}</div>
          </motion.div>
        )}
      </div>

      {mode === 'checkpoint' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '4%', display: 'flex', justifyContent: 'center' }}>
          <StarRatingReveal medal={medal} />
        </div>
      )}
    </motion.div>
  );
}

export default function CharacterReaction({ character = 'pip', medal = 'gold', message, title, mode = 'step', onDone }) {
  if (mode === 'checkpoint') return <CheckpointScene character={character} medal={medal} title={title ?? message} onDone={onDone} />;
  return <StepReaction character={character} medal={medal} message={message} mode={mode} onDone={onDone} />;
}

export function CharacterReactionLayer({ active, ...props }) {
  return <AnimatePresence>{active && <CharacterReaction {...props} />}</AnimatePresence>;
}
