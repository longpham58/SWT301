import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import en from './locales/en.json';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng;
});

export default i18n;
