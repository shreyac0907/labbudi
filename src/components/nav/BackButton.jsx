import { useRef } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { getPractical } from '../../data/practicals';
import { navigateWithTransition } from '../../utils/pageTransition';

// "Back" pill shown once the player is past year select: the overworld, a
// practical's roadmap and a checkpoint. It lives in App (like the cloud menu) and
// works out where "back" goes from the current URL:
//
//   /practicals/:year                  -> /year-select
//   /roadmap/:practicalId              -> /practicals/<that practical's year>
//   /checkpoint/:practicalId/:index    -> /roadmap/:practicalId
//
// It sits just under the cloud menu's logo (top-left), below the menu (z 999) so the
// opened cloud covers it instead of fighting it.

function backTarget(pathname) {
  if (matchPath('/practicals/:year', pathname)) return '/year-select';
  const road = matchPath('/roadmap/:practicalId', pathname);
  if (road) {
    const year = getPractical(road.params.practicalId)?.year;
    return year ? `/practicals/${year}` : '/year-select';
  }
  const cp = matchPath('/checkpoint/:practicalId/:checkpointIndex', pathname);
  if (cp) return `/roadmap/${cp.params.practicalId}`;
  return null;
}

export default function BackButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const chevron = useRef(null);

  const to = backTarget(pathname);
  if (!to) return null;

  return (
    <button
      type="button"
      aria-label={t('nav.back_aria')}
      onClick={() => navigateWithTransition(navigate, to)}
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, { scale: 1.06, duration: 0.2, ease: 'back.out(2)' });
        gsap.to(chevron.current, { x: -3, duration: 0.2, ease: 'power2.out' });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
        gsap.to(chevron.current, { x: 0, duration: 0.2 });
      }}
      style={{
        position: 'fixed',
        top: 96,
        left: 12,
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 18px 9px 12px',
        border: 'none',
        borderRadius: 999,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
        fontFamily: 'Inter, var(--font-body, sans-serif)',
        fontWeight: 600,
        fontSize: 15,
        color: '#2D2D2D',
        cursor: 'pointer',
      }}
    >
      <svg ref={chevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 5 8 12 15 19" />
      </svg>
      <span>{t('nav.back')}</span>
    </button>
  );
}
