import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AssetImage from '../components/AssetImage';
import SpeechBubble from '../components/SpeechBubble';
import { ASSETS } from '../config/assets';
import { zoomOrigin } from '../utils/zoomNav';

const CHARACTERS = ['pip', 'lili', 'madu', 'lumi'];
const YEAR_CARDS = [
  { year: 'y7', labelKey: 'yearSelect.y7Label', subKey: 'yearSelect.y7Sub', card: 'cardY7' },
  { year: 'y8', labelKey: 'yearSelect.y8Label', subKey: 'yearSelect.y8Sub', card: 'cardY8' },
  { year: 'y9', labelKey: 'yearSelect.y9Label', subKey: 'yearSelect.y9Sub', card: 'cardY9' },
];

export default function YearSelectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="page-root" style={{ overflowY: 'auto' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#C8E8C8' }}>
        <AssetImage
          src={ASSETS.ui.bgHome}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 20, paddingBottom: 60 }}>
        <h2
          className="heading"
          style={{ textAlign: 'center', marginTop: 80, fontSize: 28 }}
        >
          {t('yearSelect.meetCrew')}
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginTop: 48,
            flexWrap: 'wrap',
          }}
        >
          {CHARACTERS.map((name) => (
            <div
              key={name}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered((h) => (h === name ? null : h))}
            >
              <SpeechBubble
                text={t(`characters.${name}.intro`)}
                visible={hovered === name}
                style={{ bottom: '105%', left: '50%', transform: 'translateX(-50%)' }}
              />
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <AssetImage
                  src={hovered === name ? ASSETS.characters[name].wiggle : ASSETS.characters[name].idle}
                  alt={name}
                  width={150}
                  height={150}
                />
              </motion.div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 56,
            flexWrap: 'wrap',
          }}
        >
          {YEAR_CARDS.map(({ year, labelKey, subKey, card }) => (
            <motion.div
              key={year}
              whileHover={{ translateY: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              onClick={(e) => navigate(`/corkboard/${year}`, { state: zoomOrigin(e) })}
              style={{
                background: '#fff',
                borderRadius: 20,
                border: '1px solid var(--color-border)',
                padding: '24px 32px',
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: 160,
              }}
            >
              <AssetImage src={ASSETS.ui[card]} alt={year} width={100} height={100} />
              <div className="heading" style={{ fontSize: 22, marginTop: 12 }}>
                {t(labelKey)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#888888' }}>
                {t(subKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
