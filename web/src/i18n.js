/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';

const stored = localStorage.getItem('lang');
const fallback = import.meta.env.VITE_DEFAULT_LOCALE || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, de: { translation: de } },
    lng: stored || fallback,
    fallbackLng: fallback,
    interpolation: { escapeValue: false }
  });

export default i18n;