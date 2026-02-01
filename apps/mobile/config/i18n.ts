import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import pt from '@/locales/pt.json';
import es from '@/locales/es.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  pt: { translation: pt },
  es: { translation: es },
};

// Get language: saved preference > phone language > default to English
export const getInitialLanguage = async (): Promise<string> => {
  try {
    // First, check if user has a saved language preference
    const savedLanguage = await SecureStore.getItemAsync('user_language');
    if (savedLanguage) {
      console.log('🔄 Restored saved language:', savedLanguage);
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error reading language preference:', error);
  }

  // Otherwise, use phone language
  const phoneLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  const supportedLanguages = ['en', 'fr', 'pt', 'es'];
  const supportedLanguage = supportedLanguages.includes(phoneLanguage) ? phoneLanguage : 'en';
  console.log('📱 Phone language detected for i18n:', supportedLanguage);
  return supportedLanguage;
};

export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('user_language', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Legacy function for backward compatibility
export const getPhoneLanguage = () => {
  const phoneLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  const supportedLanguages = ['en', 'fr', 'pt', 'es'];
  return supportedLanguages.includes(phoneLanguage) ? phoneLanguage : 'en';
};

// Initialize with English first, then update to saved/phone language
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4' as const,
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  console.log('🌐 i18n initialized with language:', i18n.language);
};

// Auto-initialize
initI18n();

export default i18n;
