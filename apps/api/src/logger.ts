import { type Logger, pino } from 'pino'
import type { Env } from './env.ts'

export type { Logger }

/** One Pino logger for the process: Fastify, the worker and your own code all log through it. */
export function createLogger(env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>): Logger {
  return pino({
    level: env.LOG_LEVEL,
    // Never log secrets or session cookies.
    redact: [
      'password',
      'token',
      'secret',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    ...(env.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {}),
  })
}
