import { useState } from 'react';
import { ASSETS } from '../config/assets';

// Slot for a hand-drawn illustration (replaces emoji everywhere in the app).
// Every key in ASSETS.illustrations has a path, but the files are delivered
// later, so the image's onError also falls back to the dashed amber
// placeholder. Dropping the PNG at the configured path replaces it with no
// code change.
export function HanddrawnIcon({ assetKey, size = 24, className = '', style = {} }) {
  const src = ASSETS.illustrations?.[assetKey];
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`handdrawn-placeholder ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          border: '2px dashed #C8A050',
          borderRadius: '4px',
          fontSize: '8px',
          color: '#C8A050',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
          boxSizing: 'border-box',
          ...style,
        }}
        title={assetKey}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}
