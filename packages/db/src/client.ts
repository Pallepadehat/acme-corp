import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

/**
 * Any Drizzle Postgres database with our schema: postgres.js in the app,
 * PGlite in tests. Write code against this type, not against a driver.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>

/** One per process; it holds the connection pool. */
export function createDb(url: string) {
  const client = postgres(url)
  const db: Database = drizzle({ client, schema, casing: 'snake_case' })
  return { db, close: () => client.end() }
}
