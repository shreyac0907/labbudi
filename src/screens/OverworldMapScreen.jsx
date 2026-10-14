import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import AssetImage from '../components/AssetImage';
import FloatingParticles from '../components/FloatingParticles';
import { ASSETS } from '../config/assets';
import { PRACTICALS } from '../config/practicals';
import { navigateWithTransition } from '../utils/pageTransition';

// bg_overworld_y7.png's own pixel dimensions, needed to work out exactly
// where object-fit: contain letterboxes it. A plain "left: 28%" would be 28%
// of the whole *viewport*, but contain only fills part of that viewport (bars
// above/below on a tall screen, bars left/right on a very wide one), so naive
// percentages drift off the painted terrain by a different amount on every
// screen shape. Computing the real content box and positioning inside *that*
// keeps everything pinned to the artwork regardless of viewport aspect ratio.
const MAP_NATURAL = { w: 1366, h: 768 };

function useContainBox(containerRef, natural) {
  const [box, setBox] = useState(null);
  useEffect(() => {
    function update() {
      const el = containerRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const scale = Math.min(cw / natural.w, ch / natural.h);
      const w = natural.w * scale;
      const h = natural.h * scale;
      setBox({ left: (cw - w) / 2, top: (ch - h) / 2, width: w, height: h });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural.w, natural.h]);
  return box;
}

// Route: /practicals/:year (spec calls this "the overworld map"). Only Y7
// has an illustrated map (bg_overworld_y7.png) right now; Y8/Y9 show a
// coming-soon placeholder instead of guessing at unbuilt artwork.
//
// bg_overworld_y7.png already has "practicals!" and "click to explore more"
// painted into it, so neither exists as DOM text here.
//
// Layout is an exact match for the design reference at 1366x768. Every number
// below is in that 1366x768 space (measured from the reference by diffing it
// against the map: sprite scales and positions fitted pixel-for-pixel, text
// bounds and line positions read off directly). At runtime the map is shown
// with object-fit: contain and everything is mapped into the same image box
// (see useContainBox) and scaled with it, so the layout holds at any window
// shape.
//
// Each bee is nested so no two tweens write the same property on one node:
//   .practical-zone  positioned, owns the mouse handlers
//   .zone-enter      entrance drop, hover scale, click jump / vanish
//   .zone-idle       endless bob (+ a sway or nod on most bees)
// Labels split the same way (.label-pN enters, .label-idle bobs and scales).
//
// bee_p1/p3 and bee_p2/p5 are the same sprite on purpose.

// bee: left/top of the sprite image and its width. label: centre x of the
// text, top of its first line box, and the width it wraps at (the wrap widths
// reproduce the reference's line breaks). sway: [rotation, seconds, origin].
const BEES = [
  { n: 1, asset: 'beeP1', bee: { left: 340, top: -15, width: 174 }, label: { cx: 286.5, top: 90, width: 145 } },
  { n: 2, asset: 'beeP2', bee: { left: 975, top: 93, width: 229 }, label: { cx: 1216.5, top: 103, width: 150 }, sway: [3, 1.8, 'top center'] },
  { n: 3, asset: 'beeP3', bee: { left: 828, top: 584, width: 174 }, label: { cx: 1095, top: 628, width: 130 }, sway: [1.5, 3.5, 'bottom center'] },
  { n: 4, asset: 'beeP4', bee: { left: 313, top: 553, width: 297 }, label: { cx: 245.3, top: 632, width: 240 }, sway: [-1, 2.8, 'bottom center'] },
  { n: 5, asset: 'beeP5', bee: { left: 156, top: 266, width: 229 }, label: { cx: 138.3, top: 402, width: 165 }, sway: [-3, 2.1, 'top center'] },
];
const BEE_BOB = { 1: 2.2, 2: 2.7, 3: 2.4, 4: 3.0, 5: 2.5 };

function PipBubble() {
  const { t } = useTranslation();
  const ref = useRef(null);
  useLayoutEffect(() => {
    const tween = gsap.from(ref.current, { scale: 0, opacity: 0, transformOrigin: 'bottom center', duration: 0.3, ease: 'back.out(2)' });
    return () => tween.kill();
  }, []);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '100%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 11,
      }}
    >
      <div
        ref={ref}
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #DDD8D0',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, var(--font-body)',
          fontWeight: 600,
          fontSize: 12,
          color: '#2D2D2D',
        }}
      >
        {t('overworld.pip_bubble')}
      </div>
    </div>
  );
}

function ComingSoon({ year }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FAFAF5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-dark)' }}>
        {(year ?? '').toUpperCase()}: {t('ui.coming_soon')}!
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-mid)', maxWidth: 320, textAlign: 'center' }}>
        {t('overworld.coming_soon_blurb')}
      </p>
    </div>
  );
}

export default function OverworldMapScreen() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pipHovered, setPipHovered] = useState(false);
  const jumpingRef = useRef(false);
  const containerRef = useRef(null);
  const box = useContainBox(containerRef, MAP_NATURAL);

  const practicalList = PRACTICALS[year]?.list ?? [];
  const available = PRACTICALS[year]?.available ?? false;

  useEffect(() => {
    if (!available) return undefined;
    const ctx = gsap.context(() => {
      const zones = BEES.map((b) => `.p${b.n}-zone .zone-enter`);
      const labels = BEES.map((b) => `.label-p${b.n}`);

      // Phase 1-4: map fades in, bees drop in, labels follow, Pip slides in
      gsap.from('.overworld-map-bg', { opacity: 0, duration: 0.5, ease: 'power2.out' });
      gsap.from(zones, { y: -50, opacity: 0, scale: 0.6, duration: 0.65, stagger: 0.12, delay: 0.4, ease: 'back.out(2.4)' });
      gsap.from(labels, { opacity: 0, y: -6, duration: 0.4, stagger: 0.1, delay: 1.1, ease: 'power2.out' });
      gsap.from('.pip-corner', { x: 100, opacity: 0, duration: 0.6, delay: 1.4, ease: 'back.out(1.8)' });

      // Idle: start once the bees have landed (0.4s + 4 staggers + 0.65s)
      const idleDelay = 1.55;
      BEES.forEach(({ n, sway }) => {
        gsap.to(`.p${n}-zone .zone-idle`, { y: -12, duration: BEE_BOB[n], ease: 'sine.inOut', yoyo: true, repeat: -1, delay: idleDelay });
        gsap.to(`.label-p${n} .label-idle`, { y: -12, duration: BEE_BOB[n], ease: 'sine.inOut', yoyo: true, repeat: -1, delay: idleDelay });
        if (sway) {
          const [rotation, duration, transformOrigin] = sway;
          gsap.to(`.p${n}-zone .zone-idle`, { rotation, transformOrigin, duration, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: idleDelay });
        }
      });

      // Pip wiggles in his corner
      gsap.to('.pip-corner', { rotation: 6, y: -8, duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    }, containerRef);
    return () => ctx.revert();
  }, [available]);

  if (!available) {
    return <ComingSoon year={year} />;
  }

  // Until the container has been measured (first paint), fall back to
  // percentages of the container; the real box lands on the next render.
  const sizeScale = box ? box.width / MAP_NATURAL.w : 1;
  // design-space (1366x768) px -> screen px inside the map's image box
  const place = (x, y) =>
    box ? { left: box.left + x * sizeScale, top: box.top + y * sizeScale } : { left: `${(x / MAP_NATURAL.w) * 100}%`, top: `${(y / MAP_NATURAL.h) * 100}%` };

  const zoneEl = (n) => containerRef.current?.querySelector(`.p${n}-zone .zone-enter`);
  const labelEl = (n) => containerRef.current?.querySelector(`.label-p${n} .label-idle`);

  const onEnter = (n) => {
    gsap.to(zoneEl(n), { scale: 1.15, duration: 0.3, ease: 'back.out(1.8)', overwrite: 'auto' });
    gsap.to(labelEl(n), { scale: 1.06, duration: 0.2, ease: 'power2.out' });
  };
  const onLeave = (n) => {
    gsap.to(zoneEl(n), { scale: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(labelEl(n), { scale: 1, duration: 0.2 });
  };
  const onClick = (n, practicalId) => {
    if (jumpingRef.current) return;
    jumpingRef.current = true;
    gsap
      .timeline({ onComplete: () => navigateWithTransition(navigate, `/roadmap/${practicalId}`) })
      .to(zoneEl(n), { y: -30, scale: 1.2, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
      .to(zoneEl(n), { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' })
      .to(containerRef.current.querySelector(`.label-p${n}`), { opacity: 0, duration: 0.15 }, '<');
  };

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#FFFFFF' }}>
      {/* LAYER 1: the map itself (z 0) */}
      <div className="overworld-map-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <AssetImage
          src={ASSETS.ui.bgOverworldY7}
          alt={t('overworld.map_alt')}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vh', objectFit: 'contain', objectPosition: 'center' }}
        />
      </div>

      {/* ambient particles, fireflies/seeds drifting over the map */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <FloatingParticles count={5} sizeMin={3} sizeMax={6} colors={['#FFD166', '#FFFFFF', '#7AB648']} opacityMin={0.2} opacityMax={0.3} durationMin={9} durationMax={15} staggerDelay={1.2} />
      </div>

      {BEES.map(({ n, asset, bee, label }) => {
        const meta = practicalList[n - 1];
        const practicalId = `${year}_p${n}`;
        const isLocked = !!meta?.locked;
        const beePos = place(bee.left, bee.top);
        // keep a readable minimum width on very small windows, centred on the same x
        const labelW = Math.max(label.width * sizeScale, 90);
        const labelC = place(label.cx, label.top);
        // (before the map has been measured the position is a percentage string, so it cannot be subtracted from)
        const labelPos = { left: typeof labelC.left === 'number' ? labelC.left - labelW / 2 : `calc(${labelC.left} - ${labelW / 2}px)`, top: labelC.top };
        return (
          <div key={n}>
            {/* character click zone */}
            <div
              className={`practical-zone p${n}-zone`}
              onMouseEnter={isLocked ? undefined : () => onEnter(n)}
              onMouseLeave={isLocked ? undefined : () => onLeave(n)}
              onClick={isLocked ? undefined : () => onClick(n, practicalId)}
              style={{ position: 'absolute', left: beePos.left, top: beePos.top, width: bee.width * sizeScale, cursor: isLocked ? 'default' : 'pointer', zIndex: 10 }}
            >
              <div className="zone-enter" style={{ transformOrigin: 'center bottom' }}>
                <div className="zone-idle">
                  <AssetImage
                    src={ASSETS.ui[asset]}
                    alt=""
                    style={{ width: '100%', display: 'block', filter: isLocked ? 'grayscale(0.8) saturate(0.5)' : 'none' }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* label: a separate element so it can be placed on its own */}
            <div
              className={`practical-label label-p${n}`}
              style={{
                position: 'absolute',
                left: labelPos.left,
                top: labelPos.top,
                width: labelW,
                zIndex: 20,
                pointerEvents: 'none',
                textAlign: 'center',
                fontFamily: "'Inter Tight', Inter, sans-serif",
                fontWeight: 400,
                fontSize: Math.max(10, 20 * sizeScale),
                letterSpacing: `${-0.4 * Math.max(0.5, sizeScale)}px`,
                lineHeight: `${Math.max(15, 30 * sizeScale)}px`,
                color: '#000000',
                whiteSpace: 'normal',
                textShadow: '0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.7)',
              }}
            >
              <div className="label-idle">{`P${n}: ${t(`overworld.label_p${n}`)}`}</div>
            </div>
          </div>
        );
      })}

      {/* Pip: fixed in the bottom-right corner of the screen. Clicking him opens the mission page. */}
      <div className="pip-corner" style={{ position: 'fixed', right: 11 * sizeScale, bottom: -13 * sizeScale, width: Math.max(70, 200 * sizeScale), zIndex: 10 }}>
        <div
          onMouseEnter={() => setPipHovered(true)}
          onMouseLeave={() => setPipHovered(false)}
          onClick={() => navigateWithTransition(navigate, '/mission')}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <AssetImage src={ASSETS.ui.pipHome} alt="Pip" style={{ width: '100%', display: 'block' }} draggable={false} />
          {pipHovered && <PipBubble />}
        </div>
      </div>
    </div>
  );
}
