import type { Database } from '@acme-corp/db'
import cors from '@fastify/cors'
import Fastify, { type FastifyBaseLogger } from 'fastify'
import { type Auth, toHeaders } from './auth.ts'
import type { Jobs } from './jobs.ts'
import { registerTodoRoutes } from './routes/todos.ts'
import { serveWeb } from './web.ts'

export interface AppDeps {
  db: Database
  auth: Auth
  jobs: Jobs
  webOrigin: string
  /** Omit in tests for silence. */
  logger?: FastifyBaseLogger
  /** The web app's build output. Set in production; in development Vite serves it. */
  webDist?: string
}

/**
 * Builds the app from what it needs and nothing else: no connections are opened
 * here. That is what lets tests call `app.inject()` against a PGlite database.
 */
export function buildApp({ db, auth, jobs, webOrigin, logger, webDist }: AppDeps) {
  const app = Fastify(logger ? { loggerInstance: logger } : { logger: false })

  app.register(cors, { origin: webOrigin, credentials: true })

  // Every response is one user's data behind a cookie: never let a browser or proxy cache it.
  app.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/api')) reply.header('cache-control', 'no-store')
  })

  app.get('/health', async () => ({ ok: true }))

  // Better Auth owns everything under /api/auth. Do not add routes there.
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const response = await auth.handler(
        new Request(new URL(request.url, `http://${request.headers.host}`), {
          method: request.method,
          headers: toHeaders(request.headers),
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        }),
      )
      reply.status(response.status)
      response.headers.forEach((value, key) => {
        if (key !== 'set-cookie') reply.header(key, value)
      })
      const cookies = response.headers.getSetCookie()
      if (cookies.length > 0) reply.header('set-cookie', cookies)
      return reply.send(response.body ? await response.text() : null)
    },
  })

  app.register(registerTodoRoutes, { db, auth, jobs })

  if (webDist) app.register(serveWeb, { root: webDist })

  return app
}
