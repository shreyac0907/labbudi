import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ASSETS } from '../../config/assets';
import { navigateWithTransition } from '../../utils/pageTransition';

// Mounted once in App.jsx, outside the routed page, so it is on every screen
// and never takes part in page transitions.
//
// Collapsed, only the labbudi logo shows in the top-left corner. Hovering it
// grows the watercolour cloud out from behind the logo, with the menu on it:
//   [logo] [copyright] [Home Page] [Terms & Conditions] [Change Language] [Our Mission]
// Change Language opens a separate modal dialog over the page (see
// LanguageModal), like an admin edit dialog, instead of a dropdown.
//
// cloud_menu.png is 666x374 but the painted cloud only fills a thin band of it
// (x 0-469, y 131-229). CLOUD_BAND is that band; the image is scaled so the
// band exactly fills the 560x160 expanded cloud instead of the whole canvas
// (filling the canvas would squash the cloud to a quarter of its height).

const Z = 999;
const FULL = { w: 660, h: 160 };
const SMALL = { w: 90, h: 88 }; // just the logo's hit area
const LOGO = { top: 8, left: 6, size: 72 };

const CLOUD_BAND = { x0: 0, y0: 131, w: 470, h: 99, nw: 666, nh: 374 };
const sx = FULL.w / CLOUD_BAND.w;
const sy = FULL.h / CLOUD_BAND.h;
const CLOUD_IMG = {
  position: 'absolute',
  maxWidth: 'none',
  width: CLOUD_BAND.nw * sx,
  height: CLOUD_BAND.nh * sy,
  left: -CLOUD_BAND.x0 * sx,
  top: -CLOUD_BAND.y0 * sy,
  pointerEvents: 'none',
  opacity: 0, // the cloud only appears on hover
};

const PRACTICAL_ROUTE = /^\/(checkpoint|roadmap|result|step)\//;

const LANGUAGES = [
  { code: 'en', native: 'English', sub: 'language.english_sub' },
  { code: 'zh', native: '中文', sub: 'language.mandarin_sub' },
  { code: 'ko', native: '한국어', sub: 'language.korean_sub' },
  { code: 'ms', native: 'Bahasa Malaysia', sub: 'language.malay_sub' },
  { code: 'hi', native: 'हिन्दी', sub: 'language.hindi_sub' },
];

// Small hand-drawn icon above a link. Until the art is delivered the image
// simply isn't shown (the labels read cleanly on their own).
function NavIcon({ assetKey, size = 20 }) {
  const [failed, setFailed] = useState(false);
  const src = ASSETS.illustrations?.[assetKey];
  if (!src || failed) return null;
  return <img src={src} alt="" draggable={false} onError={() => setFailed(true)} style={{ width: size, height: size, objectFit: 'contain' }} />;
}

// A dialog over a dimmed page: title + subtitle, a close button, and the five
// languages as tiles. The chosen one gets a green ring and a check, then the
// dialog closes.
function LanguageModal({ currentLang, onPick, onClose }) {
  const { t } = useTranslation();
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const closingRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(backdropRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      gsap.from(cardRef.current, { opacity: 0, y: 16, scale: 0.96, duration: 0.3, ease: 'back.out(1.5)' });
      gsap.from('.lang-tile', { opacity: 0, y: 10, duration: 0.25, stagger: 0.05, delay: 0.15, ease: 'power2.out' });
    });
    cardRef.current.focus();
    return () => ctx.revert();
  }, []);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    gsap.to(cardRef.current, { opacity: 0, y: 10, scale: 0.97, duration: 0.18, ease: 'power2.in' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (code, e) => {
    const tile = e.currentTarget;
    onPick(code, tile, close);
  };

  return (
    <div
      ref={backdropRef}
      className="lang-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(30,30,30,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
        tabIndex={-1}
        style={{ position: 'relative', width: 'min(560px, 100%)', maxHeight: '100%', overflowY: 'auto', background: '#F7F6F2', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: '36px 40px 40px', boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, var(--font-body)' }}
      >
        <button
          onClick={close}
          aria-label={t('nav.close_aria')}
          style={{ position: 'absolute', top: 22, right: 22, width: 36, height: 36, border: 'none', background: 'transparent', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { backgroundColor: 'rgba(0,0,0,0.06)', duration: 0.15 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.15 })}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M3 3l12 12M15 3L3 15" />
          </svg>
        </button>

        <h2 id="lang-modal-title" style={{ margin: 0, paddingRight: 40, fontSize: 24, fontWeight: 600, color: '#1F1F1F', lineHeight: 1.25 }}>
          {t('ui.language_select_title')}
        </h2>
        <p style={{ margin: '8px 0 28px', fontSize: 16, color: '#6B8A72', lineHeight: 1.4 }}>{t('language.select_subtitle')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LANGUAGES.map((lang) => {
            const selected = currentLang === lang.code;
            return (
              <div
                key={lang.code}
                className="lang-tile"
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onClick={(e) => pick(lang.code, e)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(lang.code, e)}
                onMouseEnter={(e) => !selected && gsap.to(e.currentTarget, { borderColor: '#BFD8C8', duration: 0.15 })}
                onMouseLeave={(e) => !selected && gsap.to(e.currentTarget, { borderColor: '#E4E4DD', duration: 0.15 })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  minHeight: 64,
                  padding: '10px 20px',
                  borderRadius: 18,
                  border: `${selected ? 2 : 1}px solid ${selected ? '#3F9B6A' : '#E4E4DD'}`,
                  boxShadow: selected ? '0 0 0 3px rgba(63,155,106,0.18)' : 'none',
                  background: '#F7F6F2',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ width: 36, height: 36, borderRadius: 10, background: '#ECE8DC', color: '#8A6D2F', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {lang.code.toUpperCase()}
                </span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#1F1F1F', lineHeight: 1.25 }}>{lang.native}</span>
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#7B8A80', lineHeight: 1.3 }}>{t(lang.sub)}</span>
                </span>
                {selected && (
                  <span className="lang-check" style={{ width: 24, height: 24, borderRadius: '50%', background: '#3F9B6A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CloudMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  const boxRef = useRef(null);
  const cloudRef = useRef(null);
  const contentRef = useRef(null);
  const expandedRef = useRef(false);
  const blurTimer = useRef(null);
  const busyRef = useRef(false);

  const [langOpen, setLangOpen] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const [cloudFailed, setCloudFailed] = useState(false);

  const onPractical = PRACTICAL_ROUTE.test(pathname);
  const restOpacity = useRef(1);
  restOpacity.current = onPractical ? 0.8 : 1;
  const currentLang = i18n.resolvedLanguage || i18n.language;
  const iconSrc = iconFailed ? ASSETS.ui.logoMark : ASSETS.ui.labbudiIconButton;

  const startBob = () => gsap.to(boxRef.current, { y: 4, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // idle bob, running while collapsed
  useEffect(() => {
    const ctx = gsap.context(() => startBob());
    return () => ctx.revert();
  }, []);

  // slightly see-through at rest on practical screens
  useEffect(() => {
    if (!expandedRef.current) gsap.to(boxRef.current, { opacity: restOpacity.current, duration: 0.3 });
  }, [onPractical]);

  const cloudEl = () => cloudRef.current ?? boxRef.current.querySelector('.cloud-placeholder');

  const expand = () => {
    clearTimeout(blurTimer.current);
    if (expandedRef.current) return;
    expandedRef.current = true;
    const box = boxRef.current;
    gsap.killTweensOf(box); // stops the bob and any collapse in flight
    gsap.set(box, { y: 0 });
    gsap.to(box, { opacity: 1, duration: 0.2 });
    gsap.to(box, { width: FULL.w, height: FULL.h, duration: 0.5, ease: 'back.out(1.3)' });
    gsap.to(cloudEl(), { opacity: 1, duration: 0.35, ease: 'power2.out', overwrite: true });
    gsap.set(contentRef.current, { opacity: 1, pointerEvents: 'auto' });
    gsap.fromTo('.cloud-menu-item', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.07, delay: 0.25, ease: 'power2.out', overwrite: true });
  };

  const collapse = () => {
    clearTimeout(blurTimer.current);
    if (!expandedRef.current) return;
    expandedRef.current = false;
    const box = boxRef.current;
    gsap.killTweensOf(box);
    gsap.killTweensOf('.cloud-menu-item');
    gsap.to('.cloud-menu-item', { opacity: 0, y: 4, duration: 0.15, stagger: 0.04, ease: 'power2.in' });
    gsap.set(contentRef.current, { pointerEvents: 'none' });
    gsap.to(cloudEl(), { opacity: 0, duration: 0.3, delay: 0.2, ease: 'power2.in', overwrite: true });
    gsap.to(box, { opacity: restOpacity.current, duration: 0.3, delay: 0.2 });
    gsap.to(box, { width: SMALL.w, height: SMALL.h, duration: 0.4, delay: 0.2, ease: 'power2.inOut', onComplete: startBob });
  };

  const go = (path) => navigateWithTransition(navigate, path);

  // The logo is the trigger. On a touch screen (no hover) the first tap opens
  // the cloud; once it is open, clicking the logo goes Home.
  const onLogoClick = (e) => {
    e.stopPropagation();
    if (!expandedRef.current) expand();
    else go('/');
  };

  const pickLanguage = (code, tile, closeModal) => {
    if (busyRef.current) return;
    busyRef.current = true;
    gsap.timeline().to(tile, { backgroundColor: '#E8F5EC', duration: 0.1 }).to(tile, { backgroundColor: '#F7F6F2', duration: 0.2 });
    i18n.changeLanguage(code);
    localStorage.setItem('labbudi_lang', code);
    // the checkmark mounts on the next render; pop it in on the chosen tile
    setTimeout(() => {
      const check = tile.querySelector('.lang-check');
      if (check) gsap.fromTo(check, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2)' });
    }, 30);
    // a beat so the student sees the check before the dialog goes
    setTimeout(() => {
      busyRef.current = false;
      closeModal();
    }, 450);
  };

  const navLinks = [
    { key: 'home', labelKey: 'nav.home_page', onClick: () => go('/'), icon: null },
    { key: 'terms', labelKey: 'nav.terms', onClick: () => go('/terms'), icon: null },
    { key: 'lang', labelKey: 'nav.change_language', onClick: () => { collapse(); setLangOpen(true); }, icon: 'nav_language' },
    { key: 'mission', labelKey: 'nav.our_mission', onClick: () => go('/mission'), icon: 'nav_mission' },
  ];

  return (
    <>
      <div
        ref={boxRef}
        className="cloud-menu"
        role="navigation"
        aria-label={t('nav.main_aria')}
        tabIndex={0}
        onMouseEnter={expand}
        onMouseLeave={collapse}
        onFocus={expand}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(collapse, 150);
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: SMALL.w, height: SMALL.h, overflow: 'hidden', zIndex: Z, cursor: 'pointer', pointerEvents: 'all', outline: 'none' }}
      >
        {/* the cloud: invisible until hover; same image, the container reveals it */}
        {cloudFailed ? (
          <div ref={cloudRef} className="cloud-placeholder" style={{ position: 'absolute', top: 0, left: 0, width: FULL.w, height: FULL.h, background: 'rgba(176,220,240,0.6)', borderRadius: '0 0 40px 40px', filter: 'blur(2px)', pointerEvents: 'none', opacity: 0 }} />
        ) : (
          <img ref={cloudRef} src={ASSETS.ui.cloudMenu} alt="" draggable={false} onError={() => setCloudFailed(true)} style={CLOUD_IMG} />
        )}

        {/* the menu, to the right of the logo */}
        <div
          ref={contentRef}
          className="cloud-menu-content"
          style={{ position: 'absolute', top: 20, left: LOGO.left + LOGO.size + 18, right: 20, bottom: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0, opacity: 0, pointerEvents: 'none' }}
        >
          <div className="cloud-menu-item cloud-copyright" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 11, color: '#444444', lineHeight: 1.5, minWidth: 110, paddingRight: 8, whiteSpace: 'pre-line' }}>
            {t('nav.copyright')}
          </div>

          {navLinks.map((link) => (
            <div
              key={link.key}
              className="cloud-menu-item cloud-nav-link"
              role="button"
              tabIndex={0}
              onClick={link.onClick}
              onKeyDown={(e) => e.key === 'Enter' && link.onClick()}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -3, duration: 0.2, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', padding: '4px 16px', borderRadius: 12, minWidth: 80, textAlign: 'center', boxSizing: 'border-box' }}
            >
              {link.icon && <NavIcon assetKey={link.icon} size={20} />}
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#2D2D2D', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{t(link.labelKey)}</span>
            </div>
          ))}
        </div>

        {/* the logo: always visible, on top of the cloud */}
        <button
          onClick={onLogoClick}
          aria-label={t('nav.home_aria')}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, rotation: -8, duration: 0.2, ease: 'back.out(2)' })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotation: 0, duration: 0.2 })}
          style={{ position: 'absolute', top: LOGO.top, left: LOGO.left, width: LOGO.size, height: LOGO.size, padding: 0, border: 'none', borderRadius: '50%', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
        >
          <img src={iconSrc} alt="" draggable={false} onError={() => setIconFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }} />
        </button>
      </div>

      {langOpen && <LanguageModal currentLang={currentLang} onPick={pickLanguage} onClose={() => setLangOpen(false)} />}
    </>
  );
}
