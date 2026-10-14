// Merges scripts/translations/data-*.json (index -> [zh, ko, ms, hi]) into the
// "data" section of each locale file, keyed like the English one. Aborts if a
// string is missing or if a translation lost a number from its English source
// (a cheap check that an index was not misaligned).
import fs from 'node:fs';

const LANGS = ['zh', 'ko', 'ms', 'hi'];
const en = JSON.parse(fs.readFileSync('scripts/.data-en.json', 'utf8'));
const keys = Object.keys(en);
const tr = {};
for (const f of fs.readdirSync('scripts/translations').filter((n) => /^data-\d+\.json$/.test(n))) {
  Object.assign(tr, JSON.parse(fs.readFileSync(`scripts/translations/${f}`, 'utf8')));
}

const nums = (s) => (s.match(/\d+(\.\d+)?/g) ?? []).sort().join(',');
const bad = [];
keys.forEach((k, i) => {
  const t = tr[String(i)];
  if (!t || t.length !== 4 || t.some((x) => !x || !x.trim())) return bad.push(`MISSING ${i} ${en[k]}`);
  // Hindi may spell out digits in words, but none of these strings do.
  t.forEach((x, li) => { if (nums(x) !== nums(en[k])) bad.push(`NUM-MISMATCH ${i} [${LANGS[li]}] ${en[k]} => ${x}`); });
});
const extra = Object.keys(tr).filter((i) => Number(i) >= keys.length);
if (extra.length) bad.push(`EXTRA indices: ${extra.join(',')}`);
if (bad.length) { console.log(bad.join('\n')); console.log(bad.length, 'problems'); process.exit(1); }

LANGS.forEach((lang, li) => {
  const p = `src/i18n/locales/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  j.data = Object.fromEntries(keys.map((k, i) => [k, tr[String(i)][li]]));
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
});
console.log(`merged ${keys.length} strings into ${LANGS.join(', ')}`);
