import { account, type Database, session, user, verification } from '@acme-corp/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { FastifyRequest } from 'fastify'
import { HttpError } from './http-error.ts'

export interface AuthOptions {
  db: Database
  secret: string
  /** Where the browser reaches the API. Behind the Vite proxy that is the web origin. */
  baseURL: string
  trustedOrigins: string[]
}

export function createAuth({ db, secret, baseURL, trustedOrigins }: AuthOptions) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    secret,
    baseURL,
    trustedOrigins,
    // Email and password keeps the template self-contained. Add social or OIDC
    // providers (Keycloak, GitHub, Google…) in `socialProviders` or with the
    // `genericOAuth` plugin when you need them.
    emailAndPassword: { enabled: true },
    session: {
      // Checking a session normally costs a database query on every request.
      // With this, it is read from a signed cookie for up to five minutes
      // instead. The trade-off: a session revoked on another device keeps
      // working here until the cookie is next refreshed.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

/** Fastify's header object as a web `Headers`, which is what Better Auth reads. */
export function toHeaders(raw: FastifyRequest['headers']): Headers {
  const headers = new Headers()
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue
    for (const v of Array.isArray(value) ? value : [value]) headers.append(key, v)
  }
  return headers
}

/** The signed-in user, or a 401. Call it at the top of every route that needs one. */
export async function requireUser(auth: Auth, request: FastifyRequest) {
  const result = await auth.api.getSession({ headers: toHeaders(request.headers) })
  if (!result) throw new HttpError(401, 'unauthorized')
  return result.user
}
