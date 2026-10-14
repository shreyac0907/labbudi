import i18n from './index';
import { slugKey, isText, TEXT_FIELDS, TEXT_ARRAYS } from './dataKeys';

// Runtime side of the practical-data translation layer (see dataKeys.js).

// Translates an English string from the practical data by value. Used where
// the data keeps the English as a lookup key (table rows, tube and indicator
// labels) and only the on-screen text needs translating. Falls back to the
// English itself, so an untranslated string still renders.
export function tv(english) {
  if (!isText(english)) return english;
  return i18n.t(`data.${slugKey(english)}`, { defaultValue: english });
}

// Returns a copy of a practical in which every translatable string is a live
// getter: it asks i18next at read time, so the practical follows the current
// language even when a screen holds on to the object (the engine memoises it
// per practical id). Everything else is copied through untouched.
export function localizePractical(value, field = '') {
  if (Array.isArray(value)) {
    const out = [];
    value.forEach((item, i) => {
      if (typeof item === 'string' && TEXT_ARRAYS.has(field) && isText(item)) {
        Object.defineProperty(out, i, { enumerable: true, configurable: true, get: () => tv(item) });
      } else {
        out[i] = typeof item === 'object' && item ? localizePractical(item, field) : item;
      }
    });
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      if (typeof v === 'string') {
        if (TEXT_FIELDS.has(k) && isText(v)) Object.defineProperty(out, k, { enumerable: true, configurable: true, get: () => tv(v) });
        else out[k] = v;
      } else out[k] = v && typeof v === 'object' ? localizePractical(v, k) : v;
    });
    return out;
  }
  return value;
}
