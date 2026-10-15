import 'i18next'
import type { en } from './en.ts'

// Makes t('…') keys, plurals and placeholders type-checked against the English catalogue.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
    strictKeyChecks: true
  }
}
