// Merges scripts/translations/keyed-*.json ("dotted.key": [en, zh, ko, ms, hi])
// into the locale files, creating nested sections as needed. Aborts if the
// {{placeholders}}, <tags> or numbers differ between languages (a cheap check
// that a translation did not lose or mangle something).
import fs from 'node:fs';

const LANGS = ['en', 'zh', 'ko', 'ms', 'hi'];
const entries = {};
for (const f of fs.readdirSync('scripts/translations').filter((n) => /^keyed-\d+\.json$/.test(n)).sort()) {
  for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(`scripts/translations/${f}`, 'utf8')))) {
    if (entries[k]) throw new Error(`duplicate key ${k} in ${f}`);
    entries[k] = v;
  }
}

const sig = (s) => ({
  ph: (s.match(/\{\{\w+\}\}/g) ?? []).sort().join(','),
  tags: (s.match(/<\/?\w+\s?\/?>/g) ?? []).sort().join(''), // order may differ between languages
  nums: (s.match(/\d+(\.\d+)?/g) ?? []).sort().join(','),
});
const bad = [];
const warn = [];
for (const [k, v] of Object.entries(entries)) {
  if (v.length !== 5 || v.some((x) => typeof x !== 'string' || !x.trim())) { bad.push(`BAD ARRAY ${k}`); continue; }
  const base = sig(v[0]);
  v.forEach((x, i) => {
    const s = sig(x);
    for (const f of ['ph', 'tags']) if (s[f] !== base[f]) bad.push(`${f.toUpperCase()} MISMATCH ${k} [${LANGS[i]}]: ${base[f]} vs ${s[f]}`);
    // digits may legitimately become words (zero) or localised numerals (year names)
    if (s.nums !== base.nums) warn.push(`numbers differ: ${k} [${LANGS[i]}] ${base.nums || '-'} vs ${s.nums || '-'}`);
  });
}
if (warn.length) console.log(warn.join('\n'));
if (bad.length) { console.log(bad.join('\n')); console.log(bad.length, 'problems'); process.exit(1); }

const setPath = (obj, path, value) => {
  const parts = path.split('.');
  let o = obj;
  parts.slice(0, -1).forEach((p) => (o = o[p] ??= {}));
  o[parts.at(-1)] = value;
};
LANGS.forEach((lang, li) => {
  const p = `src/i18n/locales/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [k, v] of Object.entries(entries)) setPath(j, k, v[li]);
  // the Home bubble uses a plain "!" in every language but Chinese
  if (lang !== 'en' && lang !== 'zh') j.ui.pip_home_cta = j.ui.pip_home_cta.replace('！', '!');
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
});
console.log(`merged ${Object.keys(entries).length} keyed strings`);
