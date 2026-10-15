import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, expect, it } from 'vitest'
import type { Database } from './client.ts'
import { todo, user } from './schema/index.ts'
import { createTestDb } from './testing.ts'

let db: Database
let close: () => Promise<void>

beforeEach(async () => {
  ;({ db, close } = await createTestDb())
})

afterEach(async () => {
  await close()
})

it('applies the migrations and fills in defaults', async () => {
  await db.insert(user).values({ id: 'u1', name: 'Ada', email: 'ada@example.com' })
  const [row] = await db.insert(todo).values({ userId: 'u1', title: 'Write tests' }).returning()
  expect(row).toMatchObject({ title: 'Write tests', done: false })
  expect(row?.id).toMatch(/^[0-9a-f-]{36}$/)
})

it("deletes a user's todos with the user", async () => {
  await db.insert(user).values({ id: 'u1', name: 'Ada', email: 'ada@example.com' })
  await db.insert(todo).values({ userId: 'u1', title: 'Write tests' })
  await db.delete(user).where(eq(user.id, 'u1'))
  expect(await db.select().from(todo)).toEqual([])
})
