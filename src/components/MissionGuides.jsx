import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { ASSETS } from '../config/assets';

// "Meet your guides!" on the Our Mission page: the four characters in a line, like the home page. They drift gently; hover
// one (or tap it, or tab to it) and it turns into its speaking pose and says something about its subject.
//
// w is the idle sprite's width on the home page (1366px wide). The speaking pictures are not the same size as the idle ones,
// so each is drawn at the same scale as its idle picture (width x its natural width / the idle's natural width) and sits on
// the same bottom centre, so the body stays put when they swap. nat: [idle width, speaking width] in image pixels.
const GUIDES = [
  { id: 'pip', name: 'Pip', idle: ASSETS.ui.pipHome, speak: ASSETS.characters.pip.speaking, w: 232, nat: [695, 729], bob: [7, 2.4], sway: 2.5 },
  { id: 'lili', name: 'Lili', idle: ASSETS.ui.beeP4, speak: ASSETS.characters.lili.speaking, w: 277, nat: [840, 795], bob: [6, 2.9], sway: -2 },
  { id: 'madu', name: 'Madu', idle: ASSETS.ui.beeP1, speak: ASSETS.characters.madu.speaking, w: 175, nat: [682, 737], bob: [8, 2.6], sway: 2 },
  { id: 'lumi', name: 'Lumi', idle: ASSETS.ui.beeP2, speak: ASSETS.characters.lumi.speaking, w: 222, nat: [740, 734], bob: [7, 2.2], sway: -3 },
];

const vw = (px) => `min(${px}px, ${((px / 1366) * 100).toFixed(2)}vw)`;

export default function MissionGuides() {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);
  const rootRef = useRef(null);

  // the gentle drift: each guide bobs and sways on its own period, so they never move in step
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      GUIDES.forEach((g, i) => {
        gsap.to(`.guide-float-${g.id}`, { y: -g.bob[0], duration: g.bob[1], ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.35 });
        gsap.to(`.guide-float-${g.id}`, { rotation: g.sway, duration: g.bob[1] + 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2, transformOrigin: '50% 100%' });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // the speaking guide grows a little
  useLayoutEffect(() => {
    GUIDES.forEach((g) => gsap.to(`.guide-pose-${g.id}`, { scale: active === g.id ? 1.07 : 1, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto', transformOrigin: '50% 100%' }));
  }, [active]);

  return (
    <section ref={rootRef} className="mission-guides">
      <h2 className="mission-heading mission-guides-title">{t('mission.guides_title')}</h2>
      <div className="mission-guides-row">
        {GUIDES.map((g) => {
          const speaking = active === g.id;
                    const speakW = (g.w * g.nat[1]) / g.nat[0];
          return (
            <figure
              key={g.id}
              className="mission-guide"
              tabIndex={0}
              onPointerEnter={() => setActive(g.id)}
              onPointerLeave={() => setActive((a) => (a === g.id ? null : a))}
              onFocus={() => setActive(g.id)}
              onBlur={() => setActive((a) => (a === g.id ? null : a))}
              onClick={() => setActive((a) => (a === g.id ? null : g.id))}
            >
              {/* what it says */}
              <div className={`mission-guide-bubble${speaking ? ' is-on' : ''}`} role="status" aria-live="polite">
                {speaking ? t(`mission.guide_say_${g.id}`) : ''}
              </div>

              <div className={`guide-float-${g.id}`}>
                <div className={`guide-pose-${g.id}`} style={{ position: 'relative', width: vw(g.w) }}>
                  <img src={g.idle} alt={g.name} draggable={false} className="mission-guide-img" style={{ width: '100%', opacity: speaking ? 0 : 1 }} />
                  <img src={g.speak} alt="" aria-hidden="true" draggable={false} className="mission-guide-img mission-guide-img--speak" style={{ width: vw(speakW), opacity: speaking ? 1 : 0 }} />
                </div>
              </div>

              <figcaption>
                <span className="mission-guide-name">{g.name}</span>
                <span className="mission-guide-subject">{t(`mission.guide_${g.id}`)}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
