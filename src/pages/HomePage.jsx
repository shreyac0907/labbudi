import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AssetImage from '../components/AssetImage';
import CharacterFloat from '../components/CharacterFloat';
import { ASSETS } from '../config/assets';

const FLOATERS = [
  { name: 'pip', size: 230, speed: 1.6 },
  { name: 'lili', size: 210, speed: 2.1 },
  { name: 'madu', size: 220, speed: 2.4 },
  { name: 'lumi', size: 215, speed: 1.3 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="page-root">
      <div style={{ position: 'absolute', inset: 0 }}>
        <AssetImage
          src={ASSETS.ui.bgHome}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {FLOATERS.map((f) => (
        <CharacterFloat key={f.name} src={ASSETS.characters[f.name].idle} size={f.size} speed={f.speed} />
      ))}

      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          textAlign: 'center',
        }}
      >
        <AssetImage src={ASSETS.ui.logo} alt="Home" width={320} />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--color-dark)',
            marginTop: 16,
            maxWidth: 360,
          }}
        >
          {t('home.subtext')}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/year-select')}
          style={{
            marginTop: 24,
            background: 'var(--color-start)',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontSize: 18,
            padding: '14px 40px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(200,97,74,0.35)',
          }}
        >
          {t('home.startButton')}
        </motion.button>
      </div>
    </div>
  );
}
