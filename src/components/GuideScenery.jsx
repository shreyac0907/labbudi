import { motion } from 'framer-motion';
import { ASSETS } from '../config/assets';
import { MISSION_FOOTER as F } from '../config/missionFooter';
import { TOP_BANNER_CLEARANCE, BOTTOM_STRIP_HEIGHT } from './chromeLayout';

// The decoration around the character guide column on a checkpoint step:
// a drifting watercolour cloud under the Back button, a green line dividing the
// column from the game, and a small copy of the Our Mission page's grass footer
// along the bottom of the column. `width` is the column's full width from the
// screen edge (CANVAS_LEFT + the guide width).
//
// The footer uses the same settings as the mission page (src/config/missionFooter.js),
// scaled down to the column: the Canva embed is bottom-anchored in a clipping box,
// pushed hideCanvaBarPx below it so Canva's control strip is cut off.

// cloud_menu.png (666x374) holds a cloud band at x 0, y 131, 470x99
const CLOUD = { w: 666, h: 374, bandY: 131, bandW: 470, bandH: 99 };

export default function GuideScenery({ width }) {
  const cloudW = width - 56;
  const k = cloudW / CLOUD.bandW;
  const cloudH = CLOUD.bandH * k;
  const footerH = Math.round(width * F.widthFactor);
  // the embed is drawn twice as wide as the column and centre-cropped, so Canva's fixed-size
  // control strip (hidden below the edge) costs a small slice of the artwork instead of a big one
  const embedW = width * 2;
  const barPx = F.hideCanvaBarPx; // Canva's control strip is a fixed size, so it is not scaled with the footer

  return (
    <>
      {/* cloud, under the Back button */}
      <motion.div
        animate={{ x: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 24,
          top: 142,
          width: cloudW,
          height: cloudH,
          backgroundImage: `url(${ASSETS.ui.cloudMenu})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${CLOUD.w * k}px ${CLOUD.h * k}px`,
          backgroundPosition: `0px ${-CLOUD.bandY * k}px`,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* grass footer */}
      <div style={{ position: 'absolute', left: 0, bottom: BOTTOM_STRIP_HEIGHT, width, height: footerH, overflow: 'hidden', pointerEvents: 'none', zIndex: 3, background: F.background }}>
        {F.source === 'image' ? (
          <img src={F.imageUrl} alt="" draggable={false} style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }} />
        ) : (
          <iframe
            title=""
            loading="lazy"
            src={F.canvaUrl}
            tabIndex={-1}
            style={{ position: 'absolute', left: -(embedW - width) / 2, bottom: -barPx, width: embedW, aspectRatio: '100 / 56.3415', height: 'auto', border: 'none', padding: 0, margin: 0 }}
          />
        )}
      </div>

      {/* green divider between the column and the game */}
      <div
        style={{
          position: 'absolute',
          left: width - 2,
          top: TOP_BANNER_CLEARANCE,
          bottom: BOTTOM_STRIP_HEIGHT,
          width: 4,
          borderRadius: 2,
          background: '#3CB043',
          pointerEvents: 'none',
          zIndex: 60,
        }}
      />
    </>
  );
}
