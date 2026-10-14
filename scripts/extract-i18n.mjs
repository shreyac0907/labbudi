// Collects every translatable string in the practical data into the "data"
// section shape of the locale files: { <slug of the English>: <English> }.
//
//   node scripts/extract-i18n.mjs            print a summary
//   node scripts/extract-i18n.mjs --write    merge into src/i18n/locales/en.json
//
// Re-run after editing the English in src/data/practicals/*.js so en.json
// stays in step; then translate any new keys in the other locale files
// (scripts/check-i18n.mjs lists what is missing).
import fs from 'node:fs';
import { createServer } from 'vite';

// src/i18n/index.js touches browser globals when it loads.
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { documentElement: {} };

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const data = await server.ssrLoadModule('/src/data/practicals/index.js');
const keys = await server.ssrLoadModule('/src/i18n/dataKeys.js');
const config = await server.ssrLoadModule('/src/config/practicals.js');

const out = {};
const clash = [];
const add = (english) => {
  const k = keys.slugKey(english);
  if (out[k] && out[k] !== english) clash.push([k, out[k], english]);
  out[k] = english;
};

for (const year of Object.keys(config.PRACTICALS)) {
  config.PRACTICALS[year].list.forEach((_, i) => {
    const p = data.getPractical(`${year}_p${i + 1}`);
    if (p) keys.collectTexts(JSON.parse(JSON.stringify(p)), add);
  });
}
// tube / indicator labels and table rows stay English in the data (lookup
// keys) and are translated at display time with tv(), so collect them too.
const extra = new Set();
const grab = (v, field = '') => {
  if (typeof v === 'string') { if (['tubeLabel', 'indicatorLabel'].includes(field) && keys.isText(v)) extra.add(v); }
  else if (Array.isArray(v)) v.forEach((x) => (field === 'rows' && typeof x === 'string' ? keys.isText(x) && extra.add(x) : grab(x, field)));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => grab(x, k));
};
for (const year of Object.keys(config.PRACTICALS)) {
  config.PRACTICALS[year].list.forEach((_, i) => grab(JSON.parse(JSON.stringify(data.getPractical(`${year}_p${i + 1}`)))));
}
extra.forEach(add);

console.log(`${Object.keys(out).length} unique strings, ${clash.length} key collisions`);
clash.forEach((c) => console.log('CLASH', c));

if (process.argv.includes('--write')) {
  const p = 'src/i18n/locales/en.json';
  const en = JSON.parse(fs.readFileSync(p, 'utf8'));
  en.data = out;
  fs.writeFileSync(p, JSON.stringify(en, null, 2) + '\n');
  fs.writeFileSync('scripts/.data-en.json', JSON.stringify(out, null, 2) + '\n');
  console.log('written to', p);
}
await server.close();
