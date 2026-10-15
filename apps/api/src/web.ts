import { existsSync } from 'node:fs'
import { join } from 'node:path'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'

/**
 * Serves the built web app from the same origin as the API, which is what the
 * Vite proxy does in development, so auth cookies work identically in both.
 *
 * - `/assets/*` have content hashes in their names, so they never change: cached
 *   for a year and never revalidated.
 * - `index.html` is revalidated on every visit, so a deploy is picked up at once.
 * - The `.br` / `.gz` files written at build time are sent as-is, so nothing is
 *   compressed per request.
 * - Any other GET that accepts HTML gets `index.html`, and the router takes it from there.
 */
export async function serveWeb(app: FastifyInstance, { root }: { root: string }) {
  if (!existsSync(join(root, 'index.html'))) {
    throw new Error(`No web build at ${root}. Run \`bun run build\` first.`)
  }

  await app.register(fastifyStatic, {
    root,
    preCompressed: true,
    cacheControl: false,
    setHeaders(reply, path) {
      reply.header(
        'cache-control',
        path.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      )
    },
  })

  app.setNotFoundHandler((request, reply) => {
    const wantsPage =
      request.method === 'GET' &&
      !request.url.startsWith('/api/') &&
      (request.headers.accept ?? '').includes('text/html')
    if (wantsPage) return reply.header('cache-control', 'no-cache').sendFile('index.html')
    return reply.code(404).send({ error: 'Not Found', statusCode: 404 })
  })
}
