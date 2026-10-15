import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4100',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Tests run against the production build, served by the real API on an
  // in-process Postgres: what users get, with nothing to start by hand.
  webServer: {
    command: 'bun run build && node apps/api/e2e-server.ts',
    url: 'http://localhost:4100/health',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
