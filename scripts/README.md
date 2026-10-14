# Translation scripts

All visible text goes through i18next (`src/i18n/locales/{en,zh,ko,ms,hi}.json`).

| Section | What it holds | Source of truth |
| --- | --- | --- |
| `data.*` | Practical step text (titles, instructions, feedback, rules, cards, quiz) | English in `src/data/practicals/y7p*.js`; keys are derived from the English (`src/i18n/dataKeys.js`) |
| `game.*`, `equip.*`, `overworld.*`, `results.*`, `roadmap.*`, `checkpoint.*`, `nav.*`, `mission.*`, `language.*` | Hand-keyed UI strings | `scripts/translations/keyed-*.json` |
| `ui.*`, `science.*` | Earlier UI copy and protected science vocabulary | the locale files |

## Adding or changing text

- **Practical data** (`src/data/practicals/*.js`): edit the English there, then
  `node scripts/extract-i18n.mjs --write` (updates `en.json` and `scripts/.data-en.json`),
  add the other four languages as `scripts/translations/data-N.json` (`"<index in .data-en.json>": [zh, ko, ms, hi]`),
  then `node scripts/merge-data-translations.mjs`.
- **UI strings**: add `"section.key": [en, zh, ko, ms, hi]` to a new `scripts/translations/keyed-N.json`,
  use `t('section.key')` in the component, then `node scripts/merge-keyed-translations.mjs`.
  `{{placeholders}}` and `<tags>` must match across languages (the script checks).
- Run `node scripts/check-i18n.mjs` before committing: it checks every language has the same keys,
  none are empty, and every key used in `src/` exists.

Practical data text is read through `getPractical()` (live getters, so it follows the language
without remounting). `tubeLabel`, `indicatorLabel` and `table.rows` stay English in the data because
the games use them as lookup keys; they are translated where displayed with `tv()` from `src/i18n/dataText.js`.
