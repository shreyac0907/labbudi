import { useState, useMemo, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { getPractical } from '../data/practicals';
import ProgressionManager from '../engine/ProgressionManager';
import { navigateWithTransition } from '../utils/pageTransition';
import MedalStars from '../components/MedalStars';
import { ASSETS } from '../config/assets';
import { useImageBox } from '../utils/useImageBox';
import { ROADMAP_ART, NODE_DIAMETER, SLOTS, FRACTIONS, POLY, NODE_ICONS } from '../config/roadmapLayout';

// Route: /roadmap/:practicalId. The practical's checkpoints are laid along a painted path: one
// node per checkpoint (a green ring around a painted flower), its name beside it and a row of
// three stars underneath for the medal it earned. The number of nodes follows the practical:
// seven checkpoints sit exactly where the reference artwork puts them, any other number is
// spread along the same path. A node you can play bobs, locked ones are greyed with a lock,
// and tapping a finished one shows its result with a retry. All movement is GSAP.

const RING = '#20A964';
const COUNT_MEDALS = { gold: 3, silver: 2, bronze: 1 };

// where on the path (artwork pixels) a point at arc-length fraction f sits
const arc = (() => {
  const len = [0];
  for (let i = 1; i < POLY.length; i += 1) len.push(len[i - 1] + Math.hypot(POLY[i][0] - POLY[i - 1][0], POLY[i][1] - POLY[i - 1][1]));
  return len;
})();
function pointAt(f) {
  const d = f * arc[arc.length - 1];
  let i = 1;
  while (i < arc.length - 1 && arc[i] < d) i += 1;
  const k = (d - arc[i - 1]) / Math.max(1e-6, arc[i] - arc[i - 1]);
  return { x: POLY[i - 1][0] + (POLY[i][0] - POLY[i - 1][0]) * k, y: POLY[i - 1][1] + (POLY[i][1] - POLY[i - 1][1]) * k };
}

// n nodes along the path: the seven reference slots are stretched (or squeezed) to n
function nodePositions(n) {
  return Array.from({ length: n }, (_, i) => {
    const tt = n === 1 ? 0 : i / (n - 1);
    const ref = SLOTS[Math.round(tt * 6)];
    if (n === 7) return { x: SLOTS[i].x, y: SLOTS[i].y, label: SLOTS[i].label, stars: SLOTS[i].stars };
    const j = Math.min(5, Math.floor(tt * 6));
    const f = FRACTIONS[j] + (FRACTIONS[j + 1] - FRACTIONS[j]) * (tt * 6 - j);
    const p = pointAt(f);
    return { x: p.x, y: p.y, label: ref.label, stars: ref.stars };
  });
}

function Stars({ medal, size }) {
  const earned = COUNT_MEDALS[medal] ?? 0;
  return (
    <div style={{ display: 'flex', gap: size * 0.1 }} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1, filter: i < earned ? 'none' : 'grayscale(1)', opacity: i < earned ? 1 : 0.35 }}>
          ⭐
        </span>
      ))}
    </div>
  );
}

export default function RoadmapScreen() {
  const { practicalId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const box = useImageBox(ROADMAP_ART);
  const practical = useMemo(() => getPractical(practicalId), [practicalId]);
  const [resultPopup, setResultPopup] = useState(null);

  const checkpoints = practical?.checkpoints ?? [];
  const total = checkpoints.length;
  const completedCheckpoints = ProgressionManager.getCompletedCheckpoints(practicalId);
  const checkpointResults = ProgressionManager.getCheckpointResults(practicalId);
  const nextIncomplete = ProgressionManager.getNextIncompleteCheckpoint(practicalId, total);
  const isComplete = ProgressionManager.isPracticalComplete(practicalId);
  const positions = useMemo(() => nodePositions(total), [total]);
  const ready = !!box && total > 0 && !!practical && !practical.stub;

  // nodes pop onto the path one after another; the one to play next bobs, the rest sway a little
  useLayoutEffect(() => {
    if (!ready) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.rm-node', { scale: 0, opacity: 0, rotation: -40, duration: 0.6, stagger: 0.12, delay: 0.15, ease: 'back.out(2)' });
      gsap.from('.rm-tag', { opacity: 0, y: 10, duration: 0.45, stagger: 0.12, delay: 0.45, ease: 'power2.out' });
      gsap.from('.rm-title', { opacity: 0, x: 24, duration: 0.6, delay: 0.1, ease: 'power2.out' });
      gsap.to('.rm-node-idle', { rotation: 3, duration: 'random(2.6,3.8)', ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.25 });
      gsap.to('.rm-current .rm-bob', { y: -9, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo('.rm-halo', { scale: 0.9, opacity: 0.85 }, { scale: 1.28, opacity: 0, duration: 1.4, ease: 'power1.out', repeat: -1 });
    });
    return () => ctx.revert();
  }, [ready, total, nextIncomplete]);

  if (!practical || practical.stub) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-mid)' }}>
          <p>{t('roadmap.not_built')}</p>
        </div>
      </div>
    );
  }

  function isLocked(index) {
    return ProgressionManager.isCheckpointLocked(practicalId, index);
  }

  function handleNodeClick(index) {
    if (isLocked(index)) return;
    if (completedCheckpoints.includes(index) && index !== nextIncomplete) {
      setResultPopup({ index, result: checkpointResults[index] });
      return;
    }
    navigateWithTransition(navigate, `/checkpoint/${practicalId}/${index}`);
  }

  const s = box?.scale ?? 1;
  // nodes shrink a little when there are more than the seven the artwork was drawn for
  const diameter = NODE_DIAMETER * s * Math.min(1, Math.sqrt(7 / Math.max(7, total)));
  const ring = Math.max(7, diameter * 0.1);
  // a square picture fits inside a circle when its side is at most inner diameter / 1.414, and the
  // flowers are round-ish blobs, so 0.76 of the inner circle keeps every flower whole inside its ring
  const iconSide = (diameter - 2 * ring) * 0.76;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#fff' }}>
      <img src={ASSETS.ui.bgRoadmap} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }} />

      {box && (
        <>
          <div className="rm-title" style={{ position: 'absolute', right: 22, top: 16, maxWidth: '44vw', textAlign: 'right', padding: '6px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.94)', boxShadow: '0 3px 10px rgba(0,0,0,0.13)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: Math.max(13, 18 * s), lineHeight: 1.15, color: '#111', zIndex: 5 }}>
            {practical.title}
          </div>

          {checkpoints.map((checkpoint, index) => {
            const pos = positions[index];
            const locked = isLocked(index);
            const completed = completedCheckpoints.includes(index);
            const current = index === nextIncomplete && !isComplete;
            const medal = checkpointResults[index]?.medal;
            const cx = box.x(pos.x);
            const cy = box.y(pos.y);
            const icon = NODE_ICONS[index % NODE_ICONS.length];
            return (
              <div key={checkpoint.id} className={current ? 'rm-current' : undefined}>
                {/* the node */}
                <div className="rm-node" style={{ position: 'absolute', left: cx - diameter / 2, top: cy - diameter / 2, width: diameter, height: diameter, zIndex: current ? 4 : 3 }}>
                  <div className="rm-bob rm-node-idle" style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {current && <div className="rm-halo" style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `${Math.max(4, ring * 0.6)}px solid #FFD166`, pointerEvents: 'none' }} />}
                    <button
                      type="button"
                      aria-label={checkpoint.name}
                      title={checkpoint.name}
                      onClick={() => handleNodeClick(index)}
                      onMouseEnter={(e) => !locked && gsap.to(e.currentTarget, { scale: 1.08, duration: 0.25, ease: 'back.out(2)' })}
                      onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.25 })}
                      style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', padding: 0, border: `${ring}px solid ${locked ? '#B7C2B3' : RING}`, background: '#fff', cursor: locked ? 'default' : 'pointer', overflow: 'hidden', boxShadow: locked ? 'none' : '0 6px 14px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <img src={`/assets/ui/roadmap/icon_${icon}.png`} alt="" draggable={false} style={{ width: iconSide, height: iconSide, objectFit: 'contain', filter: locked ? 'grayscale(1)' : 'none', opacity: locked ? 0.4 : 1 }} />
                      {locked && (
                        <svg width={diameter * 0.26} height={diameter * 0.3} viewBox="0 0 24 28" fill="none" stroke="#7D7D7D" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute' }}>
                          <rect x="3" y="12" width="18" height="14" rx="3" fill="#BDBDBD" />
                          <path d="M7 12V8a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* the name with the stars under it, on the side of the node the artwork leaves free
                    (above, below, left or right, as in the reference). One block, so a long or
                    wrapped name pushes the stars down instead of running into them; a node near
                    the bottom edge puts the stars beside the name, where there is no room under. */}
                {(() => {
                  const [dx, dy] = pos.label;
                  const mode = dy < -60 ? 'above' : dy >= 60 ? 'below' : dx < 0 ? 'left' : 'right';
                  const gap = 10 * s;
                  const r = diameter / 2;
                  const roomBelow = pos.y + NODE_DIAMETER / 2 + 78 <= ROADMAP_ART.h;
                  const row = mode === 'below' && !roomBelow;
                  const box =
                    mode === 'above'
                      ? { left: cx, top: cy - r - gap, transform: 'translate(-50%, -100%)', alignItems: 'center' }
                      : mode === 'below'
                        ? { left: cx, top: cy + r + gap, transform: 'translate(-50%, 0)', alignItems: 'center' }
                        : mode === 'left'
                          ? { left: cx - r - gap * 1.6, top: cy + dy * s, transform: 'translate(-100%, -50%)', alignItems: 'flex-end' }
                          : { left: cx + r + gap * 1.6, top: cy + dy * s, transform: 'translate(0, -50%)', alignItems: 'flex-start' };
                  return (
                    // the outer block only positions (CSS transform); the inner one is what GSAP animates, so
                    // the two never fight over the same transform
                    <div style={{ position: 'absolute', ...box, maxWidth: 220 * s, pointerEvents: 'none', zIndex: 4 }}>
                      <div className="rm-tag" style={{ display: 'flex', flexDirection: row ? 'row' : 'column', gap: row ? 10 * s : 4 * s, alignItems: row ? 'center' : box.alignItems }}>
                        <div style={{ maxWidth: 170 * s, textAlign: mode === 'left' ? 'right' : mode === 'right' ? 'left' : 'center', fontFamily: 'Inter, sans-serif', fontWeight: current ? 700 : 500, fontSize: Math.max(12, 20 * s), lineHeight: 1.15, color: locked ? '#8C968A' : '#111' }}>{checkpoint.name}</div>
                        <Stars medal={completed ? medal : undefined} size={Math.max(14, 25 * s)} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </>
      )}

      {isComplete && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigateWithTransition(navigate, `/result/${practicalId}`)}
          style={{ position: 'absolute', right: 26, bottom: 24, padding: '14px 30px', borderRadius: 999, border: '3px solid #fff', background: RING, color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.22)', zIndex: 6 }}
        >
          {t('roadmap.view_results')}
        </motion.button>
      )}

      <AnimatePresence>
        {resultPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setResultPopup(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 28, width: 260, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginBottom: 10 }}>{checkpoints[resultPopup.index]?.name}</div>
              <div style={{ fontSize: 30 }}>{resultPopup.result?.medal ? <MedalStars medal={resultPopup.result.medal} /> : '—'}</div>
              <button
                onClick={() => navigateWithTransition(navigate, `/checkpoint/${practicalId}/${resultPopup.index}`)}
                style={{ marginTop: 18, padding: '10px 24px', borderRadius: 999, border: 'none', background: RING, color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 14, cursor: 'pointer' }}
              >
                {t('ui.retry_button')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
