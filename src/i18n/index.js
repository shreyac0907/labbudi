import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import ms from './locales/ms.json';
import hi from './locales/hi.json';

// The "science" section of every locale file is protected vocabulary —
// see each JSON's own header comment (removed on JSON parse, but the
// source files carry it) — auto-translated only as a starting point and
// flagged for native-speaker review before launch. "ui" is general
// interface copy, auto-translated and fine to ship as-is.
export const SUPPORTED_LANGUAGES = ['en', 'zh', 'ko', 'ms', 'hi'];

// Maps an i18next language code to the value the <html lang> attribute
// should carry, so browsers pick correct fallback fonts (matters most for
// zh/ko, whose CJK glyphs a plain "lang=en" can mis-render in some stacks).
export const LANG_TO_HTML_LANG = {
  en: 'en',
  zh: 'zh-Hans',
  ko: 'ko',
  ms: 'ms',
  hi: 'hi',
};

const initialLang = localStorage.getItem('labbudi_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ko: { translation: ko },
    ms: { translation: ms },
    hi: { translation: hi },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

function applyHtmlLang(lng) {
  document.documentElement.lang = LANG_TO_HTML_LANG[lng] ?? lng;
}

// Set once on initial load (covers the first paint) and again on every
// future change (covers the nav language menu and anything else that calls
// i18n.changeLanguage) — one listener, so callers never need to remember
// to set the attribute themselves.
applyHtmlLang(initialLang);
i18n.on('languageChanged', applyHtmlLang);

export default i18n;
