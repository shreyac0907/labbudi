import { useTranslation } from 'react-i18next';

// Scaffold only — not used by y7_p1. Will be built out for a future
// practical (e.g. reading a value off a meter/microscope).
export default function ObserveGame({ step, onComplete }) {
  const { t } = useTranslation();
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: '#999' }}>
        <div>{t('game.not_built', { name: 'ObserveGame' })}</div>
        <button onClick={() => onComplete({ accuracy: 1, timing: 1, completion: 1, mistakes: 0, score: 100 })} style={{ marginTop: 12 }}>
          {t('game.skip_dev')}
        </button>
      </div>
    </div>
  );
}
