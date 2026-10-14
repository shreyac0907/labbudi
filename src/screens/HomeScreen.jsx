import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ASSETS } from '../config/assets';
import { SCENERY } from '../config/homeScenery';
import { useImageBox } from '../utils/useImageBox';

// Route: /. bg_home.png is the painted garden (sky, flowers, grass) and never
// moves. Everything else is an overlay positioned in the ARTWORK's own pixel
// coordinates (useImageBox), so it stays pinned to the painting at any
// viewport shape instead of drifting like viewport percentages would.
//
// The layout recreates the design reference. Every number below was measured
// from it: the reference was registered onto bg_home.png (it is the same art at
// 1.237x), then each character was fitted by minimising the pixel difference
// between the reference and the sprite drawn over the background, so sizes and
// positions are the reference's own (the ladybug, honey bee and purple bee are
// very slightly non-uniformly scaled there, so width and height are given
// separately). All numbers are in bg_home.png's 1366x768 space.
//
// Layers: bg (0) · flowers + ladybugs (1) · butterflies + title + tagline (3) ·
// the four characters and the speech bubble (4) · pollen (5).
//
// All four characters hover in the open sky and are the way in: clicking any of
// them (or the speech bubble) goes to year select.

const NATURAL = { w: 1366, h: 768 };

// left/top/w/h: sprite image box. sway: [rotation, seconds]. bob: [px, seconds].
// depth: how far the mouse parallax moves it.
const CHARACTERS = [
  { id: 'ladybug', src: 'beeP4', left: 165, top: 207.5, w: 277.2, h: 193.1, sway: [-2.5, 3.4], bob: [9, 2.6], depth: 1.0, idleNat: [840, 585], wig: { src: 'liliWiggle', nat: [832, 559], dx: -18, dy: 0 } },
  { id: 'pip', src: 'pipHome', left: 434.9, top: 242.5, w: 232.4, h: 175.5, sway: [5, 2.8], bob: [8, 2.2], depth: 1.2, alt: 'Pip', idleNat: [695, 535], wig: { src: 'pipWiggle', nat: [686, 476], dx: 30, dy: 36 } },
  { id: 'honey', src: 'beeP1', left: 709.0, top: 274.0, w: 175.2, h: 179.5, sway: [3, 3.2], bob: [10, 2.9], depth: 0.9, idleNat: [682, 723], wig: { src: 'maduWiggle', nat: [759, 712], dx: -42, dy: 0 } },
  { id: 'purple', src: 'beeP2', left: 938.5, top: 258.7, w: 222.0, h: 140.6, sway: [-4, 2.6], bob: [11, 2.4], depth: 1.1, idleNat: [740, 449], wig: { src: 'lumiWiggle', nat: [829, 491], dx: -24, dy: -24 } },
];

// Hovering a character swaps it for its wiggle pose (the "YAY!" art in
// public/assets/characters). Each wiggle PNG is registered onto its idle sprite
// by the dx/dy offsets above (in the idle sprite's own pixels, same scale), so
// the body stays put when the swap happens.
const WIGGLE_SRC = {
  liliWiggle: ASSETS.characters.lili.wiggle,
  pipWiggle: ASSETS.characters.pip.wiggle,
  maduWiggle: ASSETS.characters.madu.wiggle,
  lumiWiggle: ASSETS.characters.lumi.wiggle,
};


function wiggleOn(el) {
  const idle = el.querySelector('.char-idle-img');
  const wig = el.querySelector('.char-wiggle-img');
  gsap.to(el, { scale: 1.06, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
  gsap.set(idle, { opacity: 0 });
  gsap.set(wig, { opacity: 1, rotation: -3 });
  gsap.to(wig, { rotation: 3, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: -1, overwrite: 'auto' });
}

function wiggleOff(el) {
  const idle = el.querySelector('.char-idle-img');
  const wig = el.querySelector('.char-wiggle-img');
  gsap.to(el, { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  gsap.killTweensOf(wig);
  gsap.set(wig, { opacity: 0, rotation: 0 });
  gsap.set(idle, { opacity: 1 });
}

// logo_title_hq.png (884x244) is cut out of the reference at its native
// resolution; the old logo_title.svg is an auto-trace and looks posterised.
const TITLE = { left: 381.5, top: 48, w: 608 };
// "discover science through play", centred under the logo
const TAGLINE = { centreX: 685, top: 204, fontSize: 28 };

// The bubble sits in the clear sky just under the tagline, in the gap between Pip
// (right edge ~651, ~659 at the end of its sway) and the honey bee (left edge ~720), tail pointing down at Pip.
// Its left edge is fixed and it is as wide as its text (up to maxW), so it grows to
// the right and stays one line in every language. The vertical room is only ~35px
// (tagline text ends ~239, the sprites start ~276-293 and bob up ~10), so it is
// kept to a slim 29px and floats downward from its rest position, never up.
const BUBBLE = { left: 670, top: 246, maxW: 250, tailX: 16 };

const POLLEN_COLOURS = ['#FFD166', '#FF8FAB', '#7AB648', '#4FBFA8'];
const rand = (a, b) => a + Math.random() * (b - a);

export default function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const box = useImageBox(NATURAL);
  const ready = !!box;

  const rootRef = useRef(null);
  const leaving = useRef(false);

  const pollen = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        size: rand(4, 9),
        colour: POLLEN_COLOURS[i % POLLEN_COLOURS.length],
      })),
    [],
  );

  const handleStart = () => {
    if (leaving.current) return;
    leaving.current = true;
    const targets = ['.char-enter', '.home-bubble-enter'];
    gsap
      .timeline({ onComplete: () => navigate('/year-select') })
      .to(targets, { scale: 1.15, duration: 0.15, ease: 'power2.out' })
      .to(targets, { scale: 0, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .to('.home-screen', { opacity: 0, duration: 0.3 }, '-=0.1');
  };

  useEffect(() => {
    if (!ready) return undefined;

    const ctx = gsap.context(() => {
      // ── title and tagline: drop in, then float gently (separate wrappers) ─
      gsap.from('.home-title-enter', { y: -50, scale: 0.85, opacity: 0, transformOrigin: 'center top', duration: 1.0, delay: 0.2, ease: 'back.out(1.6)' });
      // a gentle drift: y, x and a hair of tilt on three different periods so it never repeats exactly
      gsap.to('.home-title-float', { y: -9, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      gsap.to('.home-title-float', { x: 7, duration: 3.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      gsap.to('.home-title-float', { rotation: 0.8, duration: 4.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4, transformOrigin: '50% 50%' });
      gsap.from('.home-tagline', { y: 14, opacity: 0, duration: 0.7, delay: 0.8, ease: 'power2.out' });

      // ── the four characters: pop in one after another, then hover. Each
      //    one is parallax > bob > sway > enter so those transforms never
      //    fight over the same property. ────────────────────────────────────
      CHARACTERS.forEach((c, i) => {
        const root = `.char-${c.id}`;
        gsap.from(`${root} .char-enter`, { scale: 0, opacity: 0, transformOrigin: 'bottom center', duration: 0.7, delay: 0.6 + i * 0.15, ease: 'back.out(2.5)' });
        gsap.to(`${root} .char-sway`, { rotation: c.sway[0], transformOrigin: 'bottom center', duration: c.sway[1], ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 + i * 0.2 });
        gsap.to(`${root} .char-bob`, { y: -c.bob[0], duration: c.bob[1], ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 + i * 0.25 });
      });

      // ── speech bubble: entrance, float, and a pulse every ~5s ──────────
      gsap.from('.home-bubble-enter', { scale: 0, opacity: 0, transformOrigin: '10% 100%', duration: 0.5, delay: 1.3, ease: 'back.out(2)' });
      gsap.to('.home-bubble-float', { y: 3, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 });
      gsap
        .timeline({ repeat: -1, repeatDelay: 5, delay: 3.4 })
        .to('.home-bubble-enter', { scale: 1.05, duration: 0.2, ease: 'power2.out' })
        .to('.home-bubble-enter', { scale: 1, duration: 0.2, ease: 'power2.in' });

      // ── scenery cut from the painting ──────────────────────────────────
      // Flower heads sway in a breeze: each rocks about its own centre on its own
      // period, and every few seconds a gust leans all of them the same way.
      gsap.utils.toArray('.sc-flower').forEach((el, i) => {
        const sway = el.querySelector('.sc-a');
        const gust = el.querySelector('.sc-b');
        gsap.fromTo(sway, { rotation: -6 }, { rotation: 6, duration: 'random(3.2,5)', ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.9 });
        gsap.to(gust, { scale: 1.03, duration: 'random(2.5,4)', ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 'random(0,2)' });
      });
      const gustTl = gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 2.5 });
      gsap.utils.toArray('.sc-flower .sc-b').forEach((el, i) => {
        gustTl.to(el, { rotation: 5, duration: 0.9, ease: 'sine.inOut' }, i * 0.18).to(el, { rotation: 0, duration: 1.6, ease: 'elastic.out(1,0.35)' }, 0.9 + i * 0.18);
      });

      // Butterflies flap (squash across the body axis) while drifting round a loose figure of eight.
      gsap.utils.toArray('.sc-butterfly').forEach((el, i) => {
        const path = el.querySelector('.sc-a');
        const flap = el.querySelector('.sc-b');
        gsap.fromTo(flap, { scaleX: 1 }, { scaleX: 0.4, duration: 0.13 + i * 0.015, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo(path, { x: -34 }, { x: 34, duration: 3.6 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i });
        gsap.fromTo(path, { y: -4 }, { y: -30, duration: 2.1 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.6 });
        gsap.fromTo(path, { rotation: -16 }, { rotation: 16, duration: 3.6 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i });
      });

      // Ladybugs shuffle and twitch like the characters do: a little crawl plus a wobble.
      gsap.utils.toArray('.sc-ladybug').forEach((el, i) => {
        const crawl = el.querySelector('.sc-a');
        const wobble = el.querySelector('.sc-b');
        gsap.fromTo(crawl, { y: 3 }, { y: -4, duration: 'random(2.2,3.4)', ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.7 });
        gsap.fromTo(wobble, { rotation: -14 }, { rotation: 14, duration: 'random(0.9,1.6)', ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 0.4 });
      });

      // ── pollen: each drifts up, fading in and out, then respawns ───────
      gsap.utils.toArray('.pollen-drift').forEach((el, i) => {
        const run = () => {
          const duration = rand(10, 18);
          gsap.set(el, { left: `${rand(0, 100)}vw`, top: `${rand(25, 85)}vh`, x: 0, y: 0, opacity: 0, scale: rand(0.5, 1.2) });
          gsap.to(el, { y: -rand(60, 110), x: rand(-40, 40), duration, ease: 'none' });
          gsap.timeline({ onComplete: run }).to(el, { opacity: 0.65, duration: duration * 0.25, ease: 'none' }).to(el, { opacity: 0, duration: duration * 0.25, ease: 'none' }, duration * 0.75);
        };
        gsap.delayedCall(i * 1.6, run);
      });

      // ── mouse parallax on the characters, bubble and pollen only (never the bg) ─
      const onMove = (e) => {
        const xF = e.clientX / window.innerWidth - 0.5;
        const yF = e.clientY / window.innerHeight - 0.5;
        CHARACTERS.forEach((c) => {
          gsap.to(`.char-${c.id}`, { x: xF * -20 * c.depth, y: yF * -12 * c.depth, duration: 0.9, ease: 'power1.out', overwrite: 'auto' });
        });
        gsap.to('.home-bubble-parallax', { x: xF * -6, y: yF * -2, duration: 0.9, ease: 'power1.out', overwrite: 'auto' });
        gsap.to('.pollen-particle', { x: (i) => xF * -(12 + i * 2), y: (i) => yF * -(8 + i * 1.5), duration: 1.2, ease: 'power1.out', stagger: 0.02, overwrite: 'auto' });
      };
      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    }, rootRef);

    return () => ctx.revert();
  }, [ready]);

  const s = box?.scale ?? 1;

  return (
    <div ref={rootRef} className="home-screen" style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#fff' }}>
      {/* BACKGROUND — static, never moves */}
      <img
        src={ASSETS.ui.bgHomeStill}
        alt=""
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }}
      />

      {ready && (
        <>
          {/* SCENERY: flower heads, butterflies and ladybugs cut out of the painting.
              Each is positioned in artwork pixels, rotates about its own pivot and
              sits above the (cleaned) background but below the characters. */}
          {SCENERY.map((m) => (
            <div
              key={m.name}
              className={`sc-${m.kind}`}
              style={{ position: 'absolute', left: box.x(m.x), top: box.y(m.y), width: m.w * s, height: m.h * s, pointerEvents: 'none', zIndex: m.kind === 'butterfly' ? 3 : 1 }}
            >
              <div className="sc-a" style={{ width: '100%', height: '100%', transformOrigin: `${((m.cx - m.x) / m.w) * 100}% ${((m.cy - m.y) / m.h) * 100}%` }}>
                <div className="sc-b" style={{ width: '100%', height: '100%', transformOrigin: `${((m.cx - m.x) / m.w) * 100}% ${((m.cy - m.y) / m.h) * 100}%` }}>
                  <img src={m.src} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
                </div>
              </div>
            </div>
          ))}

          {/* TITLE */}
          <div
            style={{
              position: 'absolute',
              left: box.x(TITLE.left),
              top: box.y(TITLE.top),
              width: TITLE.w * s,
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <div className="home-title-float">
              <div className="home-title-enter">
                <img src={ASSETS.ui.logoTitleHq} alt="LabBudi" draggable={false} style={{ display: 'block', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* TAGLINE: Inter, centred just under the logo */}
          <div
            className="home-tagline"
            style={{
              position: 'absolute',
              left: box.x(TAGLINE.centreX) - 360 * s,
              width: 720 * s,
              top: box.y(TAGLINE.top),
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: TAGLINE.fontSize * s,
              letterSpacing: '-0.02em',
              textTransform: 'lowercase',
              lineHeight: 1.25,
              color: '#1a1a1a',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {t('ui.app_subtitle')}
          </div>

          {/* THE FOUR CHARACTERS */}
          {CHARACTERS.map((c) => (
            <div
              key={c.id}
              className={`char-${c.id}`}
              onClick={handleStart}
              onMouseEnter={(e) => wiggleOn(e.currentTarget)}
              onMouseLeave={(e) => wiggleOff(e.currentTarget)}
              style={{ position: 'absolute', left: box.x(c.left), top: box.y(c.top), width: c.w * s, height: c.h * s, cursor: 'pointer', zIndex: 4 }}
            >
              <div className="char-bob" style={{ width: '100%', height: '100%' }}>
                <div className="char-sway" style={{ width: '100%', height: '100%', transformOrigin: 'bottom center' }}>
                  <div className="char-enter" style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img className="char-idle-img" src={ASSETS.ui[c.src]} alt={c.alt ?? ''} draggable={false} style={{ display: 'block', width: '100%', height: '100%' }} />
                    <img
                      className="char-wiggle-img"
                      src={WIGGLE_SRC[c.wig.src]}
                      alt=""
                      draggable={false}
                      style={{
                        position: 'absolute',
                        left: `${(c.wig.dx / c.idleNat[0]) * 100}%`,
                        top: `${(c.wig.dy / c.idleNat[1]) * 100}%`,
                        width: `${(c.wig.nat[0] / c.idleNat[0]) * 100}%`,
                        height: `${(c.wig.nat[1] / c.idleNat[1]) * 100}%`,
                        opacity: 0,
                        pointerEvents: 'none',
                        transformOrigin: '50% 100%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* SPEECH BUBBLE: just under the tagline, tail pointing down at Pip */}
          <div
            className="home-bubble-parallax"
            style={{ position: 'absolute', left: box.x(BUBBLE.left), top: box.y(BUBBLE.top), width: BUBBLE.maxW * s, display: 'flex', justifyContent: 'flex-start', pointerEvents: 'none', zIndex: 4 }}
          >
            <div className="home-bubble-float">
              <div className="home-bubble-enter">
                <div
                  className="pip-bubble pip-bubble--down"
                  onClick={handleStart}
                  style={{ '--tail-x': `${BUBBLE.tailX * s}px`, fontSize: Math.max(11, 13 * s), padding: `${6 * s}px ${12 * s}px`, pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  {t('ui.pip_home_cta')}
                </div>
              </div>
            </div>
          </div>

          {/* POLLEN — outer wrapper takes the parallax, inner one the drift */}
          {pollen.map((p, i) => (
            <div key={i} className="pollen-particle" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
              <div className="pollen-drift" style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: p.colour, opacity: 0 }} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
