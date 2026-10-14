import { useState, useEffect } from 'react';

function filenameFromSrc(src) {
  if (!src) return 'unknown';
  const parts = src.split('/');
  return parts[parts.length - 1];
}

export default function AssetImage({ src, alt = '', width, height, className = '', style = {} }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`asset-placeholder ${className}`}
        style={{
          width,
          height,
          border: '2px dashed #DDD8D0',
          background: '#F7F4EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          padding: 4,
          ...style,
        }}
      >
        <span style={{ fontSize: 11, color: '#999', fontFamily: 'var(--font-body)', wordBreak: 'break-word' }}>
          [ {filenameFromSrc(src).replace(/\.(png|svg|jpg|jpeg)$/i, '')} ]
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
