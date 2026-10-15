import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import i18n from './i18n/config.ts'

// Pin tests to English, whatever language the machine running them prefers.
await i18n.changeLanguage('en')

afterEach(() => {
  cleanup()
})
