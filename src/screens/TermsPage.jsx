import { ASSETS } from '../config/assets';
import terms from '../../docs/labbudi_terms.md?raw';

// Route: /terms. A plain page: white background, the labbudi logo at the top and then the Terms & Conditions text in
// black Inter. The text is the markdown draft in docs/labbudi_terms.md, shown as it is written there (English only).

// **bold**, *italic* and [text](link) inside a line
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline', wordBreak: 'break-all' }}>
          {link[1]}
        </a>
      );
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// the few markdown shapes the document uses: # / ## headings, paragraphs, "- " bullets, > notes and --- rules
function blocks(md) {
  const out = [];
  let list = null;
  let para = [];
  const flushPara = () => {
    if (para.length) out.push({ type: 'p', text: para.join(' ') });
    para = [];
  };
  const flushList = () => {
    if (list) out.push({ type: 'ul', items: list });
    list = null;
  };
  md.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line === '---') {
      flushPara();
      flushList();
      out.push({ type: 'hr' });
    } else if (line.startsWith('## ')) {
      flushPara();
      flushList();
      out.push({ type: 'h2', text: line.slice(3) });
    } else if (line.startsWith('# ')) {
      flushPara();
      flushList();
      out.push({ type: 'h1', text: line.slice(2) });
    } else if (line.startsWith('- ')) {
      flushPara();
      (list ??= []).push(line.slice(2));
    } else if (line.startsWith('> ')) {
      flushPara();
      flushList();
      out.push({ type: 'note', text: line.slice(2) });
    } else {
      flushList();
      para.push(line);
    }
  });
  flushPara();
  flushList();
  return out;
}

const FONT = 'Inter, sans-serif';

export default function TermsPage() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#000', fontFamily: FONT }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src={ASSETS.ui.logoTitleHq} alt="LabBudi" draggable={false} style={{ width: 'min(340px, 70%)', height: 'auto' }} />
        </div>

        {blocks(terms).map((b, i) => {
          if (b.type === 'h1') return <h1 key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, margin: '0 0 16px' }}>{inline(b.text)}</h1>;
          if (b.type === 'h2') return <h2 key={i} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 21, margin: '8px 0 10px' }}>{inline(b.text)}</h2>;
          if (b.type === 'hr') return <hr key={i} style={{ border: 'none', borderTop: '1px solid #000', opacity: 0.15, margin: '26px 0' }} />;
          if (b.type === 'ul')
            return (
              <ul key={i} style={{ fontFamily: FONT, fontSize: 16, lineHeight: 1.65, margin: '0 0 14px', paddingLeft: 24 }}>
                {b.items.map((item, k) => (
                  <li key={k} style={{ marginBottom: 4 }}>{inline(item)}</li>
                ))}
              </ul>
            );
          if (b.type === 'note') return <p key={i} style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.6, margin: '0 0 14px', paddingLeft: 14, borderLeft: '3px solid #000' }}>{inline(b.text)}</p>;
          return <p key={i} style={{ fontFamily: FONT, fontSize: 16, lineHeight: 1.65, margin: '0 0 14px' }}>{inline(b.text)}</p>;
        })}
      </div>
    </div>
  );
}
