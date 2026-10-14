import AssetImage from '../AssetImage';
import SpeechBubble from '../SpeechBubble';
import { ASSETS } from '../../config/assets';

const PIP_SIZE_CSS = 'clamp(56px, 16vw, 90px)';

export default function PipCorner({ text, visible = true, variant = 'speaking' }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 40,
        '--pip-size': PIP_SIZE_CSS,
      }}
    >
      <SpeechBubble
        text={text}
        visible={visible && !!text}
        maxWidth="min(240px, 58vw)"
        style={{ bottom: '105%', right: 0, left: 'auto' }}
        pointerStyle={{ left: 'auto', right: 'calc(var(--pip-size) / 2 - 8px)', transform: 'none' }}
      />
      <AssetImage
        src={ASSETS.characters.pip[variant] ?? ASSETS.characters.pip.speaking}
        alt="Pip"
        style={{ width: 'var(--pip-size)', height: 'var(--pip-size)' }}
      />
    </div>
  );
}
