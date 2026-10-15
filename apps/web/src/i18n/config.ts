import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { da } from './da.ts'
import { en } from './en.ts'

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'da', name: 'Dansk' }, // listed by their own name, so anybody can find theirs
] as const

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, da: { translation: da } },
    fallbackLng: 'en',
    supportedLngs: LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: true, // browsers say 'da-DK', not 'da'
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    interpolation: { escapeValue: false }, // React escapes already
  })

export default i18n
