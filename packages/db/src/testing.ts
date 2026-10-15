import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import type { Database } from './client.ts'
import * as schema from './schema/index.ts'

const migrationsFolder = new URL('../drizzle', import.meta.url).pathname

/**
 * A migrated, empty database, built once per test worker and then copied.
 * Starting Postgres and replaying every migration is most of the cost of a
 * database test; restoring a copy of the result is several times faster.
 */
let template: Promise<Blob> | undefined

async function buildTemplate(): Promise<Blob> {
  const client = new PGlite()
  await migrate(drizzle({ client }), { migrationsFolder })
  const dump = await client.dumpDataDir('none')
  await client.close()
  return dump
}

/**
 * A real, migrated Postgres running in-process (PGlite), for tests.
 * Same SQL, constraints and cascades as production; nothing to start.
 * Each call gets its own database, so tests never see each other's rows.
 */
export async function createTestDb() {
  template ??= buildTemplate()
  const client = new PGlite({ loadDataDir: await template })
  // PGlite starts in the background, and closing one that has not finished starting hangs.
  await client.waitReady
  const db: Database = drizzle({ client, schema, casing: 'snake_case' })
  return { db, close: () => client.close() }
}
