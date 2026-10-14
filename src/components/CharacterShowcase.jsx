import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AssetImage from './AssetImage';
import SpeechBubble from './SpeechBubble';
import { PostIt } from './corkboard/PostIt';
import { Pin } from './corkboard/Pin';
import { ASSETS } from '../config/assets';

const CHARACTERS = ['pip', 'lili', 'madu', 'lumi'];
const DISMISS_MS = 5000;
const POSTIT_COLOR = { pip: 'green', lili: 'pink', madu: 'yellow', lumi: 'blue' };
const PIN_COLOR = { pip: 'red', lili: 'pink', madu: 'yellow', lumi: 'blue' };

// A single pinned post-it that shows whichever character is currently
// speaking — the same visual pattern used everywhere else in the app
// (JourneyScreen's Pip cluster), so the Wet Lab doesn't look like a
// different app. No big fixed Pip column, no character wheel.
export default function CharacterShowcase({ practicalDialogue = {}, currentTrigger = null, inset = 0 }) {
  const [speaker, setSpeaker] = useState('pip');
  const [variant, setVariant] = useState('idle');
  const [dialogue, setDialogue] = useState('');
  const [visible, setVisible] = useState(false);

  const lastSpeakerRef = useRef(null);
  const lastTriggerKeyRef = useRef(null);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    if (!currentTrigger) return;
    const key = `${currentTrigger.type}-${currentTrigger.index}`;
    if (lastTriggerKeyRef.current === key) return;
    lastTriggerKeyRef.current = key;

    let nextSpeaker;
    let line;
    let v;
    if (currentTrigger.character && currentTrigger.text != null) {
      nextSpeaker = currentTrigger.character;
      line = currentTrigger.text;
      v = currentTrigger.variant ?? 'speaking';
    } else {
      const candidates = CHARACTERS.filter((c) => c !== lastSpeakerRef.current);
      nextSpeaker = candidates[Math.floor(Math.random() * candidates.length)];
      const lines = practicalDialogue[currentTrigger.type] ?? [];
      line = lines.length ? lines[Math.floor(Math.random() * lines.length)] : '';
      v = currentTrigger.type === 'celebrate' ? 'celebrate' : currentTrigger.type === 'error' ? 'react' : 'speaking';
    }
    lastSpeakerRef.current = nextSpeaker;

    setSpeaker(nextSpeaker);
    setVariant(v);
    setDialogue(line);
    setVisible(true);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setVisible(false), DISMISS_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrigger?.type, currentTrigger?.index]);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    },
    []
  );

  return (
    <div style={{ position: 'fixed', bottom: inset + 20, right: inset + 20, zIndex: 40 }}>
      <div style={{ position: 'relative', width: 130 }}>
        <SpeechBubble
          text={dialogue}
          visible={visible && !!dialogue}
          maxWidth={220}
          style={{ bottom: '85%', right: 10, left: 'auto', zIndex: 0 }}
          pointerStyle={{ left: 'auto', right: 24, transform: 'none' }}
        />
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <Pin color={PIN_COLOR[speaker]} size={18} />
        </div>
        <motion.div
          animate={{ scale: visible ? 1.06 : 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <PostIt color={POSTIT_COLOR[speaker]} width={130} rotate={-3}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: 10 }}>
              <AssetImage src={ASSETS.characters[speaker][variant] ?? ASSETS.characters[speaker].idle} alt={speaker} width={82} height={82} />
            </div>
          </PostIt>
        </motion.div>
      </div>
    </div>
  );
}
