import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import amTranslation from './locales/am/translation.json';
import arTranslation from './locales/ar/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  am: {
    translation: amTranslation
  },
  ar: {
    translation: arTranslation
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // RTL languages
    rtlLanguages: ['ar'],
    
    // Language-specific configurations
    supportedLngs: ['en', 'am', 'ar'],
    
    react: {
      useSuspense: false,
    }
  });

// Handle RTL/LTR direction changes
i18n.on('languageChanged', (lng) => {
  const direction = i18n.dir(lng);
  document.documentElement.dir = direction;
  document.documentElement.lang = lng;
  
  // Add/remove RTL class for Tailwind
  if (direction === 'rtl') {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
});

export default i18n;