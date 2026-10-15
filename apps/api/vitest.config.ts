import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Each test file boots its own in-process Postgres, which is slower than Vitest's default.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
