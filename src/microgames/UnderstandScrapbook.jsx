import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { ScrapbookBoard, Polaroid, SB_FONT, commonsUrl } from '../components/scrapbook/scrapbook';
import { UNDERSTAND_IMAGES } from '../config/understandImages';

// The "What does it mean?" step as a scrapbook. Each card is one open page of the book:
// a title, a ruled journal page whose notes (the card's sentences) write themselves in, and two
// taped photos or diagrams from the practical. The four pages use four different layouts, in
// the spirit of the page-layout ideas the project was given. Arrow buttons, dots and the arrow
// keys turn the page; "Got it!" appears on the last page once every page has been seen. All
// of it is set in Inter. GSAP does the movement: the book turns to the next page, photos drop
// onto the page, the title writes itself, notes and bullets stagger in, stickers pop and sway.

const PALETTE = [
  ['#E8456B', '#FF8E53'],
  ['#F5A300', '#FB8500'],
  ['#2FA98C', '#7AB648'],
  ['#4C62D8', '#4FBFA8'],
];
const FLOWERS = ['sun_l', 'pink_l', 'orange', 'pink_r', 'sun_r'].map((n) => `/assets/ui/home/${n}.png`);

// Page layouts. Boxes are % of one page; w is the photo width. A photo's height is about 0.97w + 8.5 (% of
// the page height), so keep top + 0.97w + 8.5 under ~97 or it runs off the page.
// side 'L' / 'R' is the page the part goes on.
const LAYOUTS = [
  { title: { side: 'L', left: 6, top: 4, w: 88 }, a: { side: 'L', left: 6, top: 26, w: 52, rot: -3 }, b: { side: 'L', left: 52, top: 46, w: 40, rot: 3 }, notes: { side: 'R', left: 6, top: 6, w: 88, h: 88 }, flower: { side: 'L', left: 2, top: 78, w: 12 } },
  { title: { side: 'R', left: 6, top: 4, w: 88 }, a: { side: 'R', left: 8, top: 27, w: 50, rot: 2 }, b: { side: 'R', left: 52, top: 46, w: 40, rot: -3 }, notes: { side: 'L', left: 6, top: 6, w: 88, h: 88 }, flower: { side: 'R', left: 84, top: 76, w: 12 } },
  { title: { side: 'L', left: 6, top: 4, w: 88 }, a: { side: 'R', left: 10, top: 8, w: 54, rot: -2 }, b: { side: 'R', left: 50, top: 48, w: 40, rot: 4 }, notes: { side: 'L', left: 6, top: 24, w: 88, h: 70 }, flower: { side: 'R', left: 4, top: 70, w: 13 } },
  { title: { side: 'R', left: 6, top: 4, w: 88 }, a: { side: 'L', left: 6, top: 9, w: 48, rot: 3 }, b: { side: 'L', left: 46, top: 46, w: 42, rot: -2 }, notes: { side: 'R', left: 6, top: 24, w: 88, h: 70 }, flower: { side: 'L', left: 2, top: 74, w: 12 } },
];

// split a card's text into note lines (works for spaced and CJK sentence ends)
function toNotes(text) {
  const parts = String(text ?? '').match(/[^.!?。！？]+[.!?。！？]+["'”’)）]*|[^.!?。！？]+$/g);
  return (parts ?? [text]).map((p) => p.trim()).filter(Boolean);
}

export default function UnderstandScrapbook({ step, onComplete }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language ?? 'en').slice(0, 2);
  const { targets, timeLimit = 0 } = step.parameters;
  const n = targets.length;

  const [index, setIndex] = useState(0);
  const [viewed, setViewed] = useState(() => new Set([0]));
  const rootRef = useRef(null);
  const dirRef = useRef(1);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());

  const card = targets[index];
  const layout = LAYOUTS[index % LAYOUTS.length];
  const [c1, c2] = PALETTE[index % PALETTE.length];
  const notes = toNotes(card.content);
  const images = UNDERSTAND_IMAGES[`${step.id}:${card.id}`] ?? [];
  const allSeen = viewed.size >= n;
  const last = index === n - 1;
  const chars = notes.join(' ').length;
  const noteSize = chars > 520 ? 'clamp(11.5px, 1.05vw, 14px)' : chars > 400 ? 'clamp(12.5px, 1.18vw, 16px)' : 'clamp(13.5px, 1.3vw, 18px)';
  const credits = [...new Set(images.map((i) => i.by).filter(Boolean))].join(', '); // our own diagrams carry no credit

  // fetch every page's photos up front so turning the page never waits on a picture
  useEffect(() => {
    targets.forEach((tg) => (UNDERSTAND_IMAGES[`${step.id}:${tg.id}`] ?? []).forEach((img) => {
      const im = new Image();
      im.src = img.src ? img.src.replace('{lang}', lang) : commonsUrl(img.file);
    }));
  }, [targets, step.id, lang]);

  // the book turns to a page: it arrives from the side it was travelling to, then its parts settle in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const dir = dirRef.current;
      gsap.set('.sb-frame', { rotation: (i, el) => Number(el.dataset.rot) });
      const tl = gsap.timeline({ onComplete: () => (busyRef.current = false) });
      tl.fromTo('.sb-spread', { x: 90 * dir, opacity: 0, rotateY: -8 * dir, transformPerspective: 1200 }, { x: 0, opacity: 1, rotateY: 0, duration: 0.5, ease: 'power3.out' })
        .from('.sb-frame', { y: -120, opacity: 0, rotation: (i, el) => Number(el.dataset.rot) + (i % 2 ? 12 : -12), duration: 0.65, stagger: 0.14, ease: 'back.out(1.5)' }, '-=0.25')
        .from('.sb-tape', { scaleX: 0, transformOrigin: 'left center', duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '-=0.45')
        .fromTo('.sb-title', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.inOut' }, 0.35)
        .from('.sb-journal', { y: 36, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.35)
        .from('.sb-note', { y: 18, opacity: 0, duration: 0.45, stagger: 0.15, ease: 'power2.out' }, 0.6)
        .from('.sb-bullet', { scale: 0, rotation: -90, duration: 0.5, stagger: 0.15, ease: 'back.out(2.4)' }, 0.6)
        .from('.sb-sticker', { scale: 0, rotation: -120, duration: 0.55, ease: 'back.out(2.4)' }, 0.9);
      gsap.to('.sb-sticker', { rotation: '+=8', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
      gsap.to('.sb-frame', { y: -3, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.5, delay: 1.4 });
      gsap.to('.sb-bullet-img', { rotation: 8, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 });
    }, rootRef);
    return () => ctx.revert();
  }, [index]);

  useEffect(() => {
    gsap.to('.sb-progress-fill', { width: `${(viewed.size / n) * 100}%`, duration: 0.5, ease: 'power2.out' });
  }, [viewed, n]);

  useEffect(() => {
    if (allSeen && last) gsap.fromTo('.sb-finish', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' });
  }, [allSeen, last]);

  const go = useCallback(
    (to) => {
      if (busyRef.current || doneRef.current || to < 0 || to >= n || to === index) return;
      busyRef.current = true;
      dirRef.current = to > index ? 1 : -1;
      gsap.to('.sb-spread', {
        x: -70 * dirRef.current,
        opacity: 0,
        rotateY: 8 * dirRef.current,
        transformPerspective: 1200,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setIndex(to);
          setViewed((prev) => (prev.has(to) ? prev : new Set(prev).add(to)));
        },
      });
    },
    [index, n],
  );

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  function finish() {
    if (doneRef.current || !allSeen) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    gsap
      .timeline({ onComplete: () => onComplete({ accuracy: 1, timing, completion: 1, mistakes: 0, score: 100 }) })
      .to('.sb-finish', { scale: 1.2, duration: 0.15, ease: 'power2.out' })
      .to('.sb-spread', { y: -30, opacity: 0, duration: 0.35, ease: 'power2.in' });
  }

  const arrow = (dir, disabled, onClick, label) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(e) => !disabled && gsap.to(e.currentTarget, { scale: 1.12, duration: 0.2, ease: 'back.out(2)' })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
      style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #fff', background: disabled ? '#D9D4CA' : `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: disabled ? 'none' : '0 3px 10px rgba(0,0,0,0.22)', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points={dir === 'back' ? '15 5 8 12 15 19' : '9 5 16 12 9 19'} />
      </svg>
    </button>
  );

  const onSide = (side) => {
    const parts = [];
    if (layout.title.side === side) {
      parts.push(
        <div key="title" className="sb-title" style={{ position: 'absolute', left: `${layout.title.left}%`, top: `${layout.title.top}%`, width: `${layout.title.w}%`, fontWeight: 800, fontSize: 'clamp(22px, 2.9vw, 42px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: c1, transform: 'rotate(-1.5deg)', transformOrigin: 'left center' }}>
          {card.label}
          <div style={{ marginTop: 6, height: 5, width: '34%', borderRadius: 3, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
        </div>,
      );
    }
    [['a', images[0]], ['b', images[1]]].forEach(([key, img]) => {
      const pos = layout[key];
      if (!img || pos.side !== side) return;
      parts.push(
        <Polaroid key={`${index}-${key}`} file={img.file} src={img.src ? img.src.replace('{lang}', lang) : undefined} contain={img.contain} caption={key === 'a' ? card.label : ''} fallbackText={card.label} accent={c1} tape={((index + (key === 'a' ? 0 : 2)) % 4) + 1} rot={pos.rot} box={pos} zIndex={key === 'a' ? 3 : 2} />,
      );
    });
    if (layout.notes.side === side) {
      parts.push(
        <div key="notes" className="sb-journal" style={{ position: 'absolute', left: `${layout.notes.left}%`, top: `${layout.notes.top}%`, width: `${layout.notes.w}%`, height: `${layout.notes.h}%`, background: '#FFF8C9', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.5deg)', boxSizing: 'border-box', padding: '16px 18px 14px 44px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 32, top: 0, bottom: 0, width: 2, background: 'rgba(210,100,100,0.4)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '1.6%' }}>
            {notes.map((note, i) => (
              <div key={`${index}-${i}`} className="sb-note" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span className="sb-bullet" style={{ flex: '0 0 22px', marginLeft: -30, marginTop: 1, display: 'flex' }}>
                  <img className="sb-bullet-img" src={FLOWERS[(index + i) % FLOWERS.length]} alt="" draggable={false} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                </span>
                <span style={{ fontSize: noteSize, lineHeight: 1.5, color: '#2B2B2B', fontWeight: 500 }}>{note}</span>
              </div>
            ))}
          </div>
        </div>,
      );
    }
    if (layout.flower.side === side) {
      parts.push(<img key="flower" className="sb-sticker" src={FLOWERS[(index + 1) % FLOWERS.length]} alt="" draggable={false} style={{ position: 'absolute', left: `${layout.flower.left}%`, top: `${layout.flower.top}%`, width: `${layout.flower.w}%`, pointerEvents: 'none' }} />);
    }
    if (side === 'L' || side === 'R') {
      parts.push(
        <div key="page" style={{ position: 'absolute', bottom: '1.5%', [side === 'L' ? 'left' : 'right']: '3%', fontSize: 11, fontWeight: 600, color: '#A39A86' }}>{side === 'L' ? '' : t('game.slide_of', { n: index + 1, total: n })}</div>,
      );
    }
    return parts;
  };

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '4px 14px 6px', boxSizing: 'border-box', minHeight: 0, fontFamily: SB_FONT }}>
      <ScrapbookBoard
        left={onSide('L')}
        right={onSide('R')}
        below={
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {arrow('back', index === 0, () => go(index - 1), t('game.slide_prev'))}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, minWidth: 140 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {targets.map((tg, i) => (
                    <button key={tg.id} type="button" aria-label={tg.label} title={tg.label} onClick={() => go(i)} style={{ width: i === index ? 26 : 12, height: 12, borderRadius: 6, border: 'none', padding: 0, cursor: 'pointer', background: i === index ? c1 : viewed.has(i) ? '#BFD9B0' : '#D9D4CA', transition: 'width 0.25s, background 0.25s' }} />
                  ))}
                </div>
                <div style={{ width: 140, height: 6, borderRadius: 3, background: '#E9E4D9', overflow: 'hidden' }}>
                  <div className="sb-progress-fill" style={{ width: 0, height: '100%', background: 'linear-gradient(90deg, #7AB648, #3E8E5C)' }} />
                </div>
              </div>
              {last && allSeen ? (
                <button type="button" className="sb-finish" onClick={finish} style={{ padding: '11px 26px', borderRadius: 999, border: '3px solid #fff', background: 'linear-gradient(135deg, #7AB648, #3E8E5C)', color: '#fff', fontFamily: SB_FONT, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
                  {t('game.slide_finish')}
                </button>
              ) : (
                arrow('next', last, () => go(index + 1), t('game.slide_next'))
              )}
            </div>
            {credits && <div style={{ fontSize: 10, color: '#9A9488' }}>{t('scrap.credits', { names: credits })}</div>}
          </div>
        }
      />
    </div>
  );
}
