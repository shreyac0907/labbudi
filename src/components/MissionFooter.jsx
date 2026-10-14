import { useTranslation } from 'react-i18next';
import { MISSION_FOOTER as F, MISSION_FOOTER_HEIGHT } from '../config/missionFooter';

// Footer for the Our Mission page, fixed to the bottom of the screen so it stays
// put while the text scrolls behind it. All of its settings (which artwork, how
// tall, how much of Canva's own UI to hide, the fade) live in
// src/config/missionFooter.js.
//
// The Canva embed is a full 16:9 card (56.34% tall) whose grass fills its lower
// part. Only the bottom is shown: the iframe is bottom-anchored inside a
// clipping box, pushed hideCanvaBarPx below it so Canva's control strip is cut
// off. The box ignores the pointer, so the mouse wheel still scrolls the page
// over the grass. The footer is opaque; a white fade sits just above its top edge
// so the text dissolves before it reaches the flowers instead of running into them.

// `height` and `fadeHeightPx` override the mission page's sizes (the results page uses a shorter footer).
export function MissionFooter({ height = MISSION_FOOTER_HEIGHT, fadeHeightPx = F.fadeHeightPx }) {
  const { t } = useTranslation();
  return (
    <>
      {fadeHeightPx > 0 && (
        <div
          className="mission-footer-fade"
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: height,
            height: fadeHeightPx,
            zIndex: 5,
            pointerEvents: 'none',
            background: `linear-gradient(to top, ${F.background}, rgba(255,255,255,0))`,
          }}
        />
      )}
      <div
        className="mission-footer-wrapper"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height,
          overflow: 'hidden',
          zIndex: 5,
          pointerEvents: 'none',
          background: F.background,
        }}
      >
        {F.source === 'image' ? (
          <img
            src={F.imageUrl}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }}
          />
        ) : (
          <iframe
            title={t('mission.footer_title')}
            loading="lazy"
            src={F.canvaUrl}
            tabIndex={-1}
            style={{ position: 'absolute', left: 0, bottom: -F.hideCanvaBarPx, width: '100%', aspectRatio: '100 / 56.3415', height: 'auto', border: 'none', padding: 0, margin: 0 }}
          />
        )}
      </div>
    </>
  );
}
