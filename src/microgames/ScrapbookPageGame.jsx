import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { tv } from '../i18n/dataText';
import { ScrapbookBoard, Polaroid, SB_FONT } from '../components/scrapbook/scrapbook';

// "Real Life Connections" (understand, page 2): a two-page scrapbook spread, "Chemicals are
// everywhere!". The five solutions the student tested are real photos pinned in as taped
// polaroids; tapping one writes where you meet it into the journal (it types itself out),
// pins it on the pH ladder and ticks it off. Once all five are in, a DONE stamp slams down
// and "Got it!" finishes the step. The layout follows the page-layout ideas the project was
// given: framed photos at angles, a title tag, ruled journalling lines, tape and stickers.
// GSAP does the movement: pages and photos drop in, the title writes itself, stickers sway,
// photos wobble on hover and lift when picked, pins pop onto the ladder.
//
// Photos are hot-linked from Wikimedia Commons (free licences, credited in the margin). If one
// cannot load, its frame shows a coloured tile with the name instead.

const ITEMS = [
  { id: 'lemon', label: 'Lemon juice', ph: 2, band: 'game.chart_strong_acid', file: 'Lemon - whole and split.jpg', note: 'scrap.note_lemon', page: 'L', left: 4, top: 25, w: 37, rot: -3, colour: '#E53935', tape: 1 },
  { id: 'vinegar', label: 'Vinegar', ph: 4, band: 'game.chart_weak_acid', file: '0092Heinz Apple Cider Vinegar 03.jpg', note: 'scrap.note_vinegar', page: 'L', left: 55, top: 5, w: 37, rot: 3, colour: '#FB8C00', tape: 2 },
  { id: 'water', label: 'Water', ph: 7, band: 'science.neutral', file: 'Glass of water refracting light.jpg', note: 'scrap.note_water', page: 'L', left: 40, top: 50, w: 37, rot: -2, colour: '#43A047', tape: 3 },
  { id: 'bicarb', label: 'Bicarbonate', ph: 8, band: 'game.chart_weak_alkali', file: 'Sodium bicarbonate.jpg', note: 'scrap.note_bicarb', page: 'R', left: 7, top: 4, w: 38, rot: 2, colour: '#00897B', tape: 4 },
  { id: 'bleach', label: 'Bleach', ph: 13, band: 'game.chart_strong_alkali', file: 'Clorox.jpg', note: 'scrap.note_bleach', page: 'R', left: 53, top: 8, w: 38, rot: -3, colour: '#6A1B9A', tape: 1 },
];
const CREDITS = 'Ivar Leidus, JFVelasquez Floro, MarshyBoardwalk, Thavox, Vox Efx';
const PH_STOPS = [[0, '#C62828'], [2, '#E53935'], [3, '#F4511E'], [4, '#FB8C00'], [5, '#FDB52B'], [6, '#FDD835'], [7, '#43A047'], [8, '#00897B'], [9, '#1E88E5'], [10, '#3949AB'], [11, '#5E35B1'], [13, '#6A1B9A'], [14, '#4A148C']];

function Frame({ item, found, active, onPick, onHover }) {
  const { t } = useTranslation();
  return (
    <Polaroid
      dataId={item.id}
      file={item.file}
      alt={tv(item.label)}
      caption={tv(item.label)}
      accent={item.colour}
      tape={item.tape}
      rot={item.rot}
      box={item}
      zIndex={active ? 6 : 2}
      outline={active}
      onClick={() => onPick(item)}
      onMouseEnter={(e) => onHover(e.currentTarget, item, true)}
      onMouseLeave={(e) => onHover(e.currentTarget, item, false)}
      extra={found ? <span style={{ fontWeight: 700, fontSize: 11, color: '#fff', background: item.colour, borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>{t('scrap.ph', { n: item.ph })}</span> : null}
    >
      {found && <div className="sb-check" style={{ position: 'absolute', right: -8, top: -8, width: 28, height: 28, borderRadius: '50%', background: '#3CB043', border: '3px solid #fff', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>✓</div>}
    </Polaroid>
  );
}

export default function ScrapbookPageGame({ step, onComplete, onHint }) {
  const { t } = useTranslation();
  const [found, setFound] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [chars, setChars] = useState(0);
  const rootRef = useRef(null);
  const typeObj = useRef({ n: 0 });
  const typeTween = useRef(null);
  const doneRef = useRef(false);
  const startRef = useRef(Date.now());
  const timeLimit = step?.parameters?.timeLimit ?? 0;

  const active = ITEMS.find((i) => i.id === activeId);
  const noteText = active ? t(active.note) : '';
  const allFound = found.size === ITEMS.length;

  // the how-to line goes in the instruction bar
  useEffect(() => {
    onHint?.(t('scrap.hint'));
    return () => onHint?.(null);
  }, [onHint, t]);

  // entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.sb-frame', { rotation: (i, el) => Number(el.dataset.rot) });
      const tl = gsap.timeline();
      tl.from('.sb-spread', { scale: 0.93, opacity: 0, duration: 0.55, ease: 'power3.out' })
        .from('.sb-frame', { y: -110, opacity: 0, rotation: (i, el) => Number(el.dataset.rot) + (i % 2 ? 14 : -14), duration: 0.7, stagger: 0.13, ease: 'back.out(1.5)' }, '-=0.2')
        .from('.sb-tape', { scaleX: 0, transformOrigin: 'left center', duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '-=0.5')
        .fromTo('.sb-title', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power2.inOut' }, 0.5)
        .from('.sb-sticker', { scale: 0, rotation: -120, duration: 0.6, stagger: 0.12, ease: 'back.out(2.4)' }, 0.9)
        .from('.sb-journal', { y: 40, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.8)
        .from('.sb-ladder', { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.9);
      gsap.to('.sb-sticker', { rotation: '+=8', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4, delay: 1.6 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const onHover = useCallback((el, item, over) => {
    if (item.id === activeId) return;
    gsap.to(el, { rotation: item.rot + (over ? 2.5 : 0), y: over ? -7 : 0, scale: over ? 1.04 : 1, duration: 0.25, ease: 'back.out(2)', overwrite: 'auto' });
  }, [activeId]);

  const pick = useCallback(
    (item) => {
      setActiveId(item.id);
      setFound((prev) => (prev.has(item.id) ? prev : new Set(prev).add(item.id)));
      // the picked photo lifts, the others settle
      gsap.utils.toArray('.sb-frame').forEach((el) => {
        const it = ITEMS.find((i) => i.id === el.dataset.id);
        const on = it.id === item.id;
        gsap.to(el, { rotation: on ? 0 : it.rot, scale: on ? 1.07 : 1, y: on ? -10 : 0, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' });
      });
      // the note writes itself into the journal
      typeTween.current?.kill();
      typeObj.current.n = 0;
      setChars(0);
      const len = t(item.note).length;
      typeTween.current = gsap.to(typeObj.current, { n: len, duration: Math.max(1.2, len * 0.016), ease: 'none', onUpdate: () => setChars(Math.round(typeObj.current.n)) });
    },
    [t],
  );

  // pins pop onto the ladder as photos are found; the DONE stamp slams down at the end
  useEffect(() => {
    if (activeId) gsap.fromTo(`.sb-pin-${activeId}`, { scale: 0, y: -24 }, { scale: 1, y: 0, duration: 0.55, ease: 'back.out(3)' });
  }, [activeId]);
  useEffect(() => {
    if (!allFound) return undefined;
    const tl = gsap.timeline({ delay: 1.2 });
    tl.fromTo('.sb-stamp', { scale: 2.8, rotation: -30, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' })
      .fromTo('.sb-finish', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.1');
    return () => tl.kill();
  }, [allFound]);

  useEffect(() => () => typeTween.current?.kill(), []);

  function finish() {
    if (doneRef.current || !allFound) return;
    doneRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const timing = timeLimit > 0 ? Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - timeLimit) / timeLimit)) : 1;
    gsap.timeline({ onComplete: () => onComplete?.({ accuracy: 1, timing, completion: 1, mistakes: 0, score: 100 }) }).to('.sb-spread', { y: -30, opacity: 0, duration: 0.35, ease: 'power2.in' });
  }

  const ladderX = (ph) => `${(ph / 14) * 100}%`;

  const left = (
    <>
      <div className="sb-title" style={{ position: 'absolute', left: '5%', top: '3%', width: '58%', fontWeight: 800, fontSize: 'clamp(24px, 3.3vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#F0457E', transform: 'rotate(-2deg)' }}>
        {t('scrap.title')}
      </div>
      {ITEMS.filter((i) => i.page === 'L').map((item) => (
        <Frame key={item.id} item={item} found={found.has(item.id)} active={activeId === item.id} onPick={pick} onHover={onHover} />
      ))}
      <img className="sb-sticker" src="/assets/ui/home/pink_l.png" alt="" draggable={false} style={{ position: 'absolute', left: '1%', bottom: '3%', width: '13%', pointerEvents: 'none' }} />
      <img className="sb-sticker" src="/assets/ui/home/orange.png" alt="" draggable={false} style={{ position: 'absolute', right: '2%', bottom: '2%', width: '11%', pointerEvents: 'none' }} />
      <img className="sb-sticker" src="/assets/misc/doodle_star_3.svg" alt="" draggable={false} style={{ position: 'absolute', left: '50%', top: '4%', width: '8%', pointerEvents: 'none' }} />
    </>
  );

  const right = (
    <>
      {ITEMS.filter((i) => i.page === 'R').map((item) => (
        <Frame key={item.id} item={item} found={found.has(item.id)} active={activeId === item.id} onPick={pick} onHover={onHover} />
      ))}

      <div style={{ position: 'absolute', right: '4%', top: '1.5%', display: allFound ? 'none' : 'block', fontWeight: 700, fontSize: 'clamp(12px, 1.2vw, 16px)', color: '#8A6A3C', transform: 'rotate(2deg)' }}>
        {t('scrap.found', { n: found.size, total: ITEMS.length })}
      </div>

      {/* pH ladder */}
      <div className="sb-ladder" style={{ position: 'absolute', left: '7%', right: '7%', top: '56%', height: '12%' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '42%', height: 16, borderRadius: 8, background: `linear-gradient(90deg, ${PH_STOPS.map(([ph, c]) => `${c} ${(ph / 14) * 100}%`).join(', ')})`, boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }} />
        {Array.from({ length: 15 }, (_, ph) => (
          <div key={ph} style={{ position: 'absolute', left: ladderX(ph), top: '78%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: '#6B5E48' }}>{ph}</div>
        ))}
        {ITEMS.map((item) => (
          <div key={item.id} className={`sb-pin-${item.id}`} style={{ position: 'absolute', left: ladderX(item.ph), top: '0%', transform: 'translateX(-50%)', opacity: found.has(item.id) ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 'clamp(10px, 0.95vw, 13px)', color: '#2B2B2B', background: '#fff', borderRadius: 8, padding: '0 6px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', lineHeight: 1.35 }}>{tv(item.label)}</span>
            <span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `8px solid ${item.colour}` }} />
          </div>
        ))}
      </div>

      {/* journal: the note for the picked photo writes itself here */}
      <div className="sb-journal" style={{ position: 'absolute', left: '5%', right: '5%', bottom: '3%', height: '25%', background: '#FFF8C9', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transform: 'rotate(-0.6deg)', padding: '10px 18px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ position: 'relative', fontWeight: 500, fontSize: 'clamp(12px, 1.2vw, 16px)', lineHeight: 1.5, color: active ? '#33291A' : '#9A8E6E' }}>
          {active ? (
            <>
              <span style={{ fontWeight: 700, color: active.colour }}>{tv(active.label)} · {t(active.band)}: </span>
              {noteText.slice(0, chars)}
            </>
          ) : (
            t('scrap.journal_empty')
          )}
        </div>
        {allFound && (
          <button type="button" className="sb-finish" onClick={finish} style={{ position: 'absolute', right: 12, bottom: 10, padding: '8px 22px', borderRadius: 999, border: '3px solid #fff', background: 'linear-gradient(135deg, #7AB648, #3E8E5C)', color: '#fff', fontFamily: SB_FONT, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
            {t('game.slide_finish')}
          </button>
        )}
      </div>

      {allFound && <img className="sb-stamp" src="/assets/misc/stamp_complete.svg" alt="" draggable={false} style={{ position: 'absolute', right: '2%', top: '-0.5%', width: '21%', opacity: 0, pointerEvents: 'none', zIndex: 7 }} />}
    </>
  );

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '4px 14px 6px', boxSizing: 'border-box', minHeight: 0, fontFamily: SB_FONT }}>
      <ScrapbookBoard left={left} right={right} below={<div style={{ flex: '0 0 auto', paddingTop: 5, fontSize: 10.5, color: '#9A9488', textAlign: 'center' }}>{t('scrap.credits', { names: CREDITS })}</div>} />
    </div>
  );
}
