import { useTranslation } from 'react-i18next';
import { ASSETS } from '../config/assets';
import { MissionFooter } from '../components/MissionFooter';
import { MISSION_FOOTER, MISSION_FOOTER_HEIGHT } from '../config/missionFooter';
import './MissionPage.css';

// Route: /mission. A plain, still page: white background, big logo, centred
// black Inter paragraphs. The grass footer is fixed to the bottom of the
// screen (MissionFooter), so it stays put while the text scrolls behind it; the
// content is padded by the footer's height so the last paragraph clears it.
// The footer's settings are in src/config/missionFooter.js.
//
// The translations still carry <green>…</green> style tags and <br/> line
// breaks from the earlier animated version; plain() flattens them so every
// paragraph is one block of plain black text.

function plain(s) {
  const sep = /[㐀-鿿]/.test(s) ? '' : ' ';
  return s.replace(/<br\s*\/?>/g, sep).replace(/<\/?(blue|green|amber|coral)>/g, '');
}

export default function MissionPage() {
  const { t } = useTranslation();
  const p = (key) => plain(t(key));

  const paragraphs = [
    p('mission.block1'),
    p('mission.block2'),
    [1, 2, 3, 4].map((n) => p(`mission.block3_s${n}`)).join(/[㐀-鿿]/.test(t('mission.block3_s1')) ? '' : ' '),
    p('mission.block4'),
  ];

  return (
    <div className="mission-scroll" style={{ '--mission-footer-height': MISSION_FOOTER_HEIGHT, '--mission-footer-gap': `${MISSION_FOOTER.endGapPx}px` }}>
      <div className="mission-column">
        <div className="mission-content-wrapper">
          {/* hero */}
          <section className="mission-hero">
            <img className="mission-logo" src={ASSETS.ui.logoTitleHq} alt="LabBudi" draggable={false} />
            <p className="mission-tagline">{t('ui.app_subtitle')}</p>
          </section>

          {/* text */}
          <main className="mission-text">
            {paragraphs.map((text, i) => (
              <p key={i} className="mission-p">
                {text}
              </p>
            ))}

            <h2 className="mission-heading">{plain(t('mission.block5_header'))}</h2>
            <p className="mission-p">{p('mission.block5_body')}</p>

            <p className="mission-p">{p('mission.block6')}</p>

            <blockquote className="mission-quote">
              <p className="mission-quote-text">“{t('mission.quote')}”</p>
              <footer className="mission-quote-attribution">{t('mission.quote_attribution')}</footer>
            </blockquote>
          </main>
        </div>

        <MissionFooter />
      </div>
    </div>
  );
}
