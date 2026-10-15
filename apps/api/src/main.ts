import { createDb } from '@acme-corp/db'
import { buildApp } from './app.ts'
import { createAuth } from './auth.ts'
import { loadEnv } from './env.ts'
import { createJobs } from './jobs.ts'
import { createLogger } from './logger.ts'

const env = loadEnv()
const logger = createLogger(env)

const { db, close: closeDb } = createDb(env.DATABASE_URL)
const { jobs, close: closeJobs } = createJobs(env.REDIS_URL, logger)
const auth = createAuth({
  db,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.WEB_ORIGIN],
})

const app = buildApp({
  db,
  auth,
  jobs,
  webOrigin: env.WEB_ORIGIN,
  logger,
  ...(env.NODE_ENV === 'production'
    ? { webDist: new URL('../../web/dist', import.meta.url).pathname }
    : {}),
})

app.addHook('onClose', async () => {
  await closeJobs()
  await closeDb()
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    app.log.info({ signal }, 'shutting down')
    void app.close().then(() => process.exit(0))
  })
}

await app.listen({ port: env.PORT, host: '0.0.0.0' })
