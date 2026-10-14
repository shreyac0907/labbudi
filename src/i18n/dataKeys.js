// Pure helpers (no i18next import) for the practical-data translation layer.
// Shared by the runtime wrapper (dataText.js) and scripts/extract-i18n.mjs, so
// the keys the app looks up are exactly the keys the extractor writes.
//
// The practical data files (src/data/practicals/y7p*.js) keep their English as
// the authoring source. Every translatable string is looked up in the "data"
// section of the locale files by a key derived from the English text itself,
// so the same words always get the same translation, wherever they appear.

// Fields whose string value is visible text.
export const TEXT_FIELDS = new Set([
  'title',
  'instruction',
  'name',
  'label',
  'rule',
  'content',
  'introLine',
  'success',
  'failure',
  'note',
  'successMsg',
  'resultLabel',
  'question',
  'correct',
]);

// Fields that are arrays of visible strings.
export const TEXT_ARRAYS = new Set(['options', 'hints', 'columns']);

// Deliberately NOT translated in the data: `tubeLabel`, `indicatorLabel` and
// `table.rows`. The games use them as lookup keys (tint tables, the answers
// map), so they stay English and are translated where they are displayed,
// with tv() from dataText.js.

// Key = readable slug + a short hash of the exact English, so strings that
// differ only in case or punctuation ("Cell membrane" / "Cell Membrane") never
// share a key.
export function slugKey(english) {
  const base = english
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  let slug = base || 'text';
  if (slug.length > 48) {
    const cut = slug.slice(0, 48);
    const i = cut.lastIndexOf('_');
    slug = i > 24 ? cut.slice(0, i) : cut;
  }
  let hash = 5381;
  for (let i = 0; i < english.length; i++) hash = ((hash << 5) + hash + english.charCodeAt(i)) >>> 0;
  return `${slug}_${hash.toString(36).padStart(4, '0').slice(-4)}`;
}

export const isText = (s) => typeof s === 'string' && s.trim() !== '' && /[A-Za-z]{2}/.test(s) && !/^[\w]+\.[LR]$/.test(s);

// Walks any practical object and calls visit(english) for each translatable string.
export function collectTexts(value, visit, field = '') {
  if (typeof value === 'string') {
    if (TEXT_FIELDS.has(field) && isText(value)) visit(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => {
      if (typeof v === 'string') {
        if (TEXT_ARRAYS.has(field) && isText(v)) visit(v);
      } else collectTexts(v, visit, field);
    });
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => collectTexts(v, visit, k));
  }
}
