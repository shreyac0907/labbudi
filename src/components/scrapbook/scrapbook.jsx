import { useState, useRef, useLayoutEffect } from 'react';

// Shared pieces of the scrapbook layouts (the "Chemicals are everywhere!" page and the
// Understand pages): the kraft board with its two cream pages and fold, taped polaroids,
// and the photo URLs. Every scrapbook layout is set in Inter, nothing else.

export const SB_FONT = 'Inter, sans-serif';
export const SB_ASPECT = 2.5; // the open book's width : height

// Photos are hot-linked from Wikimedia Commons (free licences, credited under the book).
export const commonsUrl = (file, width = 640) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

const PAGE = {
  position: 'relative',
  flex: 1,
  minWidth: 0,
  background: '#FFFDF5',
  backgroundImage: 'radial-gradient(rgba(190,170,130,0.22) 1px, transparent 1px)',
  backgroundSize: '18px 18px',
  overflow: 'hidden',
};

// The open book. It keeps a fixed shape and is as large as the space it is given allows, so it
// takes up most of the screen. `left` / `right` are the page contents; `below` is the line under it.
export function ScrapbookBoard({ left, right, below, spreadRef }) {
  const areaRef = useRef(null);
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return undefined;
    const measure = () => {
      const width = Math.min(el.clientWidth, el.clientHeight * SB_ASPECT);
      setBox({ w: Math.floor(width), h: Math.floor(width / SB_ASPECT) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div ref={areaRef} style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={spreadRef}
          className="sb-spread"
          style={{ width: box ? box.w : '100%', height: box ? box.h : '100%', flex: '0 0 auto', display: 'flex', padding: 12, boxSizing: 'border-box', background: 'linear-gradient(135deg, #D2AE82, #C49A6C)', borderRadius: 16, boxShadow: '0 10px 28px rgba(0,0,0,0.28)', position: 'relative', fontFamily: SB_FONT }}
        >
          <div style={{ ...PAGE, borderRadius: '6px 0 0 6px' }}>{left}</div>
          <div style={{ width: 0, position: 'relative', zIndex: 8 }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: -18, width: 36, background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(60,40,10,0.22) 50%, rgba(0,0,0,0))', pointerEvents: 'none' }} />
          </div>
          <div style={{ ...PAGE, borderRadius: '0 6px 6px 0' }}>{right}</div>
        </div>
      </div>
      {below}
    </>
  );
}

// A taped polaroid. `rot` is the resting angle (GSAP owns the transform from there: it reads
// data-rot), `contain` shows a diagram uncropped. `caption` fills the white strip; `children`
// are overlays (ticks, chips). `box` places it on the page in % units.
export function Polaroid({ file, src, caption, fallbackText, accent = '#999', tape = 1, rot = 0, box, contain = false, alt = '', onClick, onMouseEnter, onMouseLeave, extra, children, className = 'sb-frame', zIndex = 2, outline, dataId }) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      className={className}
      data-id={dataId}
      data-rot={rot}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: 'absolute', left: `${box.left}%`, top: `${box.top}%`, width: `${box.w}%`, cursor: onClick ? 'pointer' : 'default', zIndex, fontFamily: SB_FONT }}
    >
      <div style={{ background: '#fff', padding: '7px 7px 0', boxShadow: outline ? `0 12px 26px rgba(0,0,0,0.3), 0 0 0 3px ${accent}` : '0 5px 14px rgba(0,0,0,0.22)', borderRadius: 3, transition: 'box-shadow 0.25s' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: contain ? '#fff' : accent }}>
          {!broken && <img src={src ?? commonsUrl(file)} alt={alt} draggable={false} onError={() => setBroken(true)} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', display: 'block' }} />}
          {broken && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>{fallbackText ?? caption}</div>}
        </div>
        <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '0 4px' }}>
          <span style={{ fontWeight: 700, fontSize: 'clamp(11px, 1.05vw, 14px)', color: '#2B2B2B', lineHeight: 1.15 }}>{caption}</span>
          {extra}
        </div>
      </div>
      <img className="sb-tape" src={`/assets/misc/washi_tape_${tape}.svg`} alt="" draggable={false} style={{ position: 'absolute', top: -16, left: '50%', width: '46%', transform: 'translateX(-50%) rotate(-4deg)', pointerEvents: 'none', opacity: 0.92 }} />
      {children}
    </div>
  );
}
