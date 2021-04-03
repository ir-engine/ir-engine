import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import editor from './i18n/en/editor.json';

export const initI18N = () => {
    const resources = {
        en: {
            editor,
        },
    };

    i18n.use(LanguageDetector).use(initReactI18next).init({
        fallbackLng: 'en',
        ns: ['editor'],
        resources,
    });
};
