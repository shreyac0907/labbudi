import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getPractical } from '../data/practicals';
import SaveManager from '../engine/SaveManager';
import AssetImage from '../components/AssetImage';
import { ASSETS } from '../config/assets';
import { useGameState } from '../engine/GameState';
import { setHighScoreIfBeaten } from '../engine/DailyChallenge';
import { BADGE_DEFS, getEarnedBadges } from '../engine/Badges';
import { navigateWithTransition } from '../utils/pageTransition';
import MedalStars from '../components/MedalStars';
import { MissionFooter } from '../components/MissionFooter';

// The grass footer along the bottom (the mission page's footer, shorter here) and the room the
// content leaves for it.
const FOOTER_H = 'min(20vw, 24vh)';

// Route: /result/:practicalId
export default function PracticalResultScreen() {
  const { practicalId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const practical = getPractical(practicalId);
  const save = SaveManager.load(practicalId);
  const { state } = useGameState();
  // Daily Challenge — this run's live score vs. this practical's saved
  // best. Written exactly once per mount (StrictMode's double-invoke
  // aside): a second write of the same result is harmless (setHighScoreIfBeaten
  // is idempotent — re-saving the same or lower score is a no-op).
  const dailyResultRef = useRef(null);
  if (dailyResultRef.current === null) {
    dailyResultRef.current = setHighScoreIfBeaten(practicalId, state.score);
  }
  const { beaten: newHighScore, prevBest } = dailyResultRef.current;

  if (!practical || !save) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-mid)' }}>
          <p>{t('results.no_results')}</p>
        </div>
      </div>
    );
  }

  const checkpointResults = save.checkpointResults ?? [];
  const checkpointScores = (practical.checkpoints ?? []).map((checkpoint, i) => ({
    ...checkpoint,
    medal: checkpointResults[i]?.medal ?? 'none',
  }));

  const unlockedId = practical.unlocks?.[0];
  const unlockedPractical = unlockedId ? getPractical(unlockedId) : null;
  const earnedBadges = getEarnedBadges(practicalId);

  const celebrate = ASSETS.characters[practical.character]?.celebrate;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `20px 24px calc(${FOOTER_H} + 24px)`,
        boxSizing: 'border-box',
      }}
    >
      {/* title: the logo, big, with "Practical Complete!" under it */}
      <img src={ASSETS.ui.logoTitleHq} alt="LabBudi" draggable={false} style={{ display: 'block', width: 'min(560px, 56vw)', height: 'auto', marginTop: 4 }} />
      <div style={{ fontFamily: 'Inter, var(--font-heading)', fontWeight: 600, fontSize: 28, color: 'var(--color-dark)', marginTop: 6 }}>{t('ui.practical_complete')}</div>

      {/* character on the left (big), results on the right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(6vw, 80px)', width: '100%', maxWidth: 1100, marginTop: 18, flexWrap: 'wrap' }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          style={{ flex: '0 1 auto' }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <AssetImage src={celebrate} alt="" style={{ display: 'block', height: 'min(42vh, 360px)', width: 'auto' }} />
          </motion.div>
        </motion.div>

        <div style={{ flex: '1 1 340px', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, duration: 0.6 }}
              style={{ fontSize: 40 }}
            >
              <MedalStars medal={save.bestMedal} />
            </motion.div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)' }}>
              {t('ui.score_label')}: {state.score}
            </div>
          </div>

          {prevBest != null && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
              style={{
                alignSelf: 'flex-start',
                marginTop: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: newHighScore ? '#FFD700' : '#F4F0E4',
                color: newHighScore ? '#3A2A00' : 'var(--color-mid)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {newHighScore ? t('results.new_best', { prev: prevBest }) : t('results.daily_still', { prev: prevBest })}
            </motion.div>
          )}

          {earnedBadges.length > 0 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260 }}
              style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}
            >
              {earnedBadges.map((id) => (
                <div key={id} style={{ padding: '6px 12px', borderRadius: 999, background: '#FFF6DC', border: '2px solid #E8A020', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, color: '#B87A10' }}>
                  {t(BADGE_DEFS[id].labelKey)}
                </div>
              ))}
            </motion.div>
          )}

          <div style={{ marginTop: 12 }}>
            {checkpointScores.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 4px', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                <span>{c.name}</span>
                <span style={{ fontSize: 15 }}>{c.medal ? <MedalStars medal={c.medal} /> : '—'}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateWithTransition(navigate, `/roadmap/${practicalId}`)}
              style={{ padding: '10px 22px', borderRadius: 999, border: '2px solid var(--color-chem)', background: '#fff', color: 'var(--color-dark)', fontFamily: 'var(--font-heading)', fontSize: 13, cursor: 'pointer' }}
            >
              {t('ui.play_again')}
            </button>
            <button
              onClick={() => navigateWithTransition(navigate, `/practicals/${practical.year}`)}
              style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: 'var(--color-start)', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 13, cursor: 'pointer' }}
            >
              {t('ui.back_to_practicals')}
            </button>
          </div>

          {unlockedPractical && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.3 }}
              style={{ marginTop: 16, padding: '10px 16px', borderRadius: 16, background: 'var(--color-bg)', border: '2px solid var(--color-chem)', textAlign: 'center' }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-mid)', textTransform: 'uppercase' }}>{t('ui.unlocked')}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-dark)', marginTop: 4 }}>{unlockedPractical.title}</div>
            </motion.div>
          )}
        </div>
      </div>

      <MissionFooter height={FOOTER_H} fadeHeightPx={40} />
    </div>
  );
}
