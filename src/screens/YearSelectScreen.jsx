import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGameState } from '../engine/GameState';
import FloatingParticles from '../components/FloatingParticles';
import { ASSETS } from '../config/assets';
import { SUN, YEAR_SCENERY } from '../config/yearScenery';
import { useImageBox } from '../utils/useImageBox';

// Route: /year-select. bg_year_select.png is the whole watercolour garden and
// never moves. The three year flowers are cut-out PNGs fitted to the reference
// layout by template matching (scale/left/top below, in the artwork's own
// 1366x768 pixels, so the fit holds at any viewport shape via useImageBox).
//
// The cut-outs are taller than the painting shows (their stems run past the
// bottom of the screen), which is why they're positioned by `top`, not
// `bottom: 0`.
//
// Each flower is four nested elements so no two tweens ever write the same
// transform property on the same node:
//   .fl-rot   idle sway / hover straighten      (rotation)
//   .fl-lift  hover lift, click bloom / recede  (y, scale, opacity)
//   .fl-grow  page-entrance growth              (y, scaleY, opacity)
// bg_year_select.png has no flowers painted in, so there is nothing to hide
// underneath them.
//
// Each year also has a permanent two-line label ("YEAR 7 / AGES 11-12") placed
// where the reference artwork has it (LABEL.cx / cy, in artwork pixels). Labels
// bob and drift on their own, and ride up with their flower when it enlarges.

const NATURAL = { w: 1366, h: 768 };

// Hover: the flower enlarges about the bottom edge of the artwork (so it grows up
// out of the ground rather than about its off-screen stem end).
const HOVER_SCALE = 1.1;

const YEARS = [
  {
    year: 'y7',
    labelKey: 'ui.year_7',
    ageKey: 'ui.ages_11_12',
    asset: 'flowerY9', // (flower_y9.png is the sunflower; the y7/y9 file names are swapped)
    label: { cx: 400, cy: 185.5 },
    art: { left: 350, top: 213, w: 189.7, h: 573.8 },
    zone: { left: 350, width: 195 },
    sway: { rotation: 3.4, duration: 4.2, delay: 0 },
  },
  {
    year: 'y8',
    labelKey: 'ui.year_8',
    ageKey: 'ui.ages_12_13',
    asset: 'flowerY8',
    label: { cx: 606, cy: 106.5 },
    art: { left: 507, top: 111, w: 274.1, h: 679.1 },
    zone: { left: 548, width: 212 },
    sway: { rotation: -3, duration: 3.6, delay: 0.5 },
  },
  {
    year: 'y9',
    labelKey: 'ui.year_9',
    ageKey: 'ui.ages_13_14',
    asset: 'flowerY7', // (flower_y7.png is the red ball flower)
    label: { cx: 894, cy: 173.5 },
    art: { left: 760, top: 212, w: 248.2, h: 578.7 },
    zone: { left: 765, width: 243 },
    sway: { rotation: 2.6, duration: 4.8, delay: 1.1 },
  },
];

export default function YearSelectScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { actions } = useGameState();
  const box = useImageBox(NATURAL);
  const ready = !!box;

  const rootRef = useRef(null);
  const api = useRef({}); // enter/leave/select handlers, bound inside the GSAP context
  const scaleRef = useRef(1); // screen px per artwork px, read by the handlers
  const leaving = useRef(false);

  useEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      const q = (sel) => gsap.utils.toArray(sel);
      const rots = q('.fl-rot');
      const lifts = q('.fl-lift');
      const grows = q('.fl-grow');
      const labelFades = q('.yr-fade');
      const labelLifts = q('.yr-lift');
      const labelFloats = q('.yr-float');
      // how far a label must rise to stay clear of its flower head when it enlarges
      // (the flower head sits ~50px below the label's centre, so measure from there)
      const rise = (i) => ((NATURAL.h - YEARS[i].label.cy - 50) * (HOVER_SCALE - 1) + 6) * scaleRef.current;
      const sways = [];

      const startSway = (i) => {
        const { sway } = YEARS[i];
        sways[i]?.kill();
        sways[i] = gsap.to(rots[i], {
          rotation: sway.rotation,
          transformOrigin: 'bottom center',
          duration: sway.duration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: sway.delay,
        });
      };

      // ENTRANCE — the flowers grow up out of the ground, then start swaying
      gsap
        .timeline({ delay: 0.2, onComplete: () => YEARS.forEach((_, i) => startSway(i)) })
        .from(grows, { y: '40vh', scaleY: 0.3, transformOrigin: 'bottom center', opacity: 0, duration: 1.0, stagger: 0.15, ease: 'back.out(1.2)' });

      // labels fade in after the flowers, then bob and drift (different periods per axis)
      gsap.from(labelFades, { opacity: 0, duration: 0.7, delay: 1.0, stagger: 0.15, ease: 'power2.out' });
      labelFloats.forEach((el, i) => {
        gsap.fromTo(el, { y: -5 }, { y: 6, duration: 2.4 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.8 });
        gsap.fromTo(el, { x: -4 }, { x: 4, duration: 3.3 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 1.1 });
        gsap.fromTo(el, { rotation: -1.2 }, { rotation: 1.2, duration: 4 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.5 });
      });

      // A gust bends all three flowers the same way every few seconds (skew about the
      // ground), then they spring back. Skew is its own property on .fl-grow, so it
      // never fights the entrance growth or the sway on .fl-rot.
      const gust = gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 3.5 });
      grows.forEach((el, i) => {
        gust
          .to(el, { skewX: -4, duration: 0.9, ease: 'sine.inOut' }, i * 0.2)
          .to(el, { skewX: 0, duration: 1.8, ease: 'elastic.out(1,0.3)' }, 0.9 + i * 0.2);
      });

      // The sun: the disc breathes and turns a little, each ray rocks about the sun's
      // centre on its own period so they shimmer.
      gsap.to('.ys-disc .ys-a', { scale: 1.035, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo('.ys-disc .ys-b', { rotation: -2 }, { rotation: 2, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.utils.toArray('.ys-ray .ys-a').forEach((el, i) => {
        gsap.fromTo(el, { rotation: -2.5 }, { rotation: 2.5, duration: 2.6 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.7 });
      });

      // The two painted flower clusters bend in the breeze, pinned to the bottom edge.
      gsap.utils.toArray('.ys-cluster .ys-a').forEach((el, i) => {
        gsap.fromTo(el, { skewX: -2 }, { skewX: 2.2, duration: 3.8 + i * 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 1.5 });
      });

      api.current.enter = (i) => {
        if (leaving.current) return;
        sways[i]?.pause();
        gsap.to(rots[i], { rotation: 0, duration: 0.45, ease: 'back.out(1.8)', overwrite: 'auto' });
        gsap.to(lifts[i], { y: -6 * scaleRef.current, scale: HOVER_SCALE, duration: 0.45, ease: 'back.out(1.8)', overwrite: 'auto' });
        gsap.to(labelLifts[i], { y: -rise(i), scale: 1.08, duration: 0.45, ease: 'back.out(1.8)', overwrite: 'auto' });
      };

      api.current.leave = (i) => {
        if (leaving.current) return;
        gsap.to(lifts[i], { y: 0, scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(labelLifts[i], { y: 0, scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        startSway(i); // overwrite:'auto' on hover paused the sway; resume it
      };

      api.current.select = (i) => {
        if (leaving.current) return;
        leaving.current = true;
        const { year } = YEARS[i];
        actions.setYear(year);
        sways.forEach((s) => s?.kill());
        gsap
          .timeline({ onComplete: () => navigate(`/practicals/${year}`) })
          .to(lifts[i], { scale: 1.14, y: -40, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
          .to(
            lifts.filter((_, k) => k !== i),
            { scale: 0.9, opacity: 0.3, y: 20, duration: 0.25, ease: 'power2.in', overwrite: 'auto' },
            '<',
          )
          .to(labelFades, { opacity: 0, duration: 0.15 }, '<')
          .to('.year-select-screen', { opacity: 0, duration: 0.3 });
      };
    }, rootRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const s = box?.scale ?? 1;
  scaleRef.current = s;

  return (
    <div ref={rootRef} className="year-select-screen" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#fff' }}>
      {/* BACKGROUND — static */}
      <img
        src={ASSETS.ui.bgYearSelectStill}
        alt=""
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }}
      />

      <FloatingParticles count={5} sizeMin={4} sizeMax={8} colors={['#FF8FAB', '#FFD166', '#FFA726']} durationMin={8} durationMax={14} staggerDelay={1.5} />

      {/* SCENERY cut from the painting: sun and the two flower clusters */}
      {ready &&
        YEAR_SCENERY.map((m) => {
          const origin = m.kind === 'cluster' ? '50% 100%' : `${((SUN.cx - m.x) / m.w) * 100}% ${((SUN.cy - m.y) / m.h) * 100}%`;
          return (
            <div key={m.name} className={`ys-${m.kind}`} style={{ position: 'absolute', left: box.x(m.x), top: box.y(m.y), width: m.w * s, height: m.h * s, pointerEvents: 'none', zIndex: 1 }}>
              <div className="ys-a" style={{ width: '100%', height: '100%', transformOrigin: origin }}>
                <div className="ys-b" style={{ width: '100%', height: '100%', transformOrigin: origin }}>
                  <img src={m.src} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
                </div>
              </div>
            </div>
          );
        })}

      {ready &&
        YEARS.map((y, i) => {
          const frame = { position: 'absolute', left: box.x(y.art.left), top: box.y(y.art.top), width: y.art.w * s, height: y.art.h * s };
          const src = ASSETS.ui[y.asset];
          return (
            <div key={y.year}>
              <div className="fl-rot" style={{ ...frame, transformOrigin: 'bottom center', pointerEvents: 'none', zIndex: 10 }}>
                <div className="fl-lift" style={{ width: '100%', height: '100%', transformOrigin: `50% ${((NATURAL.h - y.art.top) / y.art.h) * 100}%` }}>
                  <div className="fl-grow" style={{ width: '100%', height: '100%', transformOrigin: 'bottom center' }}>
                    <img src={src} alt={t(y.labelKey)} draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
                  </div>
                </div>
              </div>

              {/* permanent two-line label, as in the reference */}
              <div style={{ position: 'absolute', left: box.x(y.label.cx), top: box.y(y.label.cy), transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 20 }}>
                <div className="yr-fade">
                  <div className="yr-lift">
                    <div
                      className="yr-float"
                      style={{
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase',
                        fontFamily: "'Inter Tight', Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 20 * s,
                        lineHeight: `${32 * s}px`,
                        letterSpacing: `${-0.4 * s}px`,
                        color: '#111',
                        userSelect: 'none',
                      }}
                    >
                      {t(y.labelKey)}
                      <br />
                      {t(y.ageKey)}
                    </div>
                  </div>
                </div>
              </div>

              {/* transparent click / hover zone */}
              <div
                onMouseEnter={() => api.current.enter?.(i)}
                onMouseLeave={() => api.current.leave?.(i)}
                onClick={() => api.current.select?.(i)}
                style={{
                  position: 'absolute',
                  left: box.x(y.zone.left),
                  width: y.zone.width * s,
                  top: box.y(y.art.top),
                  bottom: 0,
                  cursor: 'pointer',
                  zIndex: 30,
                }}
              />
            </div>
          );
        })}
    </div>
  );
}
