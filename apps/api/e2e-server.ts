// The production build, served the production way, on an in-process Postgres.
// Playwright starts this, so end-to-end tests need no Docker. Not for real use.
import { createTestDb } from '@acme-corp/db/testing'
import { buildApp } from './src/app.ts'
import { createAuth } from './src/auth.ts'

const port = 4100
const origin = `http://localhost:${port}`
const { db } = await createTestDb()
const auth = createAuth({
  db,
  secret: 'e2e-secret-that-is-at-least-32-characters-long',
  baseURL: origin,
  trustedOrigins: [origin],
})
const app = buildApp({
  db,
  auth,
  jobs: { async todoCreated() {} },
  webOrigin: origin,
  webDist: new URL('../web/dist', import.meta.url).pathname,
})
await app.listen({ port })
