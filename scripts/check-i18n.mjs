// Sanity checks for the locale files:
//   1. every language has exactly the same keys as English, none empty
//   2. every translation key referenced in src/ exists
//   3. no non-English file still holds English text for a key (reported only)
import fs from 'node:fs';
import path from 'node:path';

const LANGS = ['en', 'zh', 'ko', 'ms', 'hi'];
const flat = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) typeof v === 'object' ? flat(v, p + k + '.', out) : (out[p + k] = v);
  return out;
};
const L = Object.fromEntries(LANGS.map((l) => [l, flat(JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, 'utf8')))]));
let problems = 0;
const en = L.en;
for (const l of LANGS.slice(1)) {
  const missing = Object.keys(en).filter((k) => !(k in L[l]));
  const extra = Object.keys(L[l]).filter((k) => !(k in en));
  const empty = Object.keys(L[l]).filter((k) => !String(L[l][k]).trim());
  if (missing.length || extra.length || empty.length) { problems++; console.log(l, { missing: missing.slice(0, 10), extra: extra.slice(0, 10), empty }); }
  // identical to English (allowed for names/loanwords, but worth a look)
  const same = Object.keys(en).filter((k) => L[l][k] === en[k] && /[a-z]{4,}/i.test(en[k]));
  console.log(`${l}: ${Object.keys(L[l]).length} keys; ${same.length} identical to English${same.length ? ' e.g. ' + same.slice(0, 8).join(', ') : ''}`);
}

const SECTIONS = new Set(Object.keys(JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'))));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const refRe = new RegExp(`['"\`]((?:${[...SECTIONS].join('|')})\\.[a-z0-9_]+)['"\`]`, 'g');
const dynamicOk = (k) => /^ui\.p\d_title$/.test(k) || `${k}_other` in en; // plural base keys
for (const f of walk('src').filter((f) => /\.(jsx?|tsx?)$/.test(f) && !f.includes('i18n/'))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(refRe)) if (!(m[1] in en) && !dynamicOk(m[1])) { problems++; console.log(`unknown key ${m[1]} in ${f}`); }
}
console.log(problems ? `${problems} problem(s)` : 'OK');
process.exit(problems ? 1 : 0);
