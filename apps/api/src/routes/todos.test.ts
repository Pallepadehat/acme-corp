import { createTestDb } from '@acme-corp/db/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.ts'
import { createAuth } from '../auth.ts'
import type { Jobs } from '../jobs.ts'

const ORIGIN = 'http://localhost:3000'

let app: ReturnType<typeof buildApp>
let jobs: Jobs
let close: () => Promise<void>

beforeEach(async () => {
  const testDb = await createTestDb()
  const auth = createAuth({
    db: testDb.db,
    secret: 'test-secret-that-is-at-least-32-characters-long',
    baseURL: ORIGIN,
    trustedOrigins: [ORIGIN],
  })
  jobs = { todoCreated: vi.fn(async () => {}) }
  app = buildApp({ db: testDb.db, auth, jobs, webOrigin: ORIGIN })
  close = async () => {
    await app.close()
    await testDb.close()
  }
})

afterEach(async () => {
  await close()
})

/** Signs up a fresh user through Better Auth and returns their session cookie. */
async function signUp(email: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-up/email',
    headers: { origin: ORIGIN },
    payload: { email, password: 'correct-horse-battery', name: 'Test' },
  })
  expect(response.statusCode).toBe(200)
  const cookie = response.cookies.find((c) => c.name.endsWith('session_token'))
  if (!cookie) throw new Error('no session cookie')
  return `${cookie.name}=${cookie.value}`
}

describe('todos', () => {
  it('refuses anybody who is not signed in', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/todos' })
    expect(response.statusCode).toBe(401)
  })

  it('creates, lists, updates and deletes', async () => {
    const cookie = await signUp('ada@example.com')

    const created = await app.inject({
      method: 'POST',
      url: '/api/todos',
      headers: { cookie },
      payload: { title: '  Buy milk  ' },
    })
    expect(created.statusCode).toBe(201)
    const todo = created.json()
    expect(todo).toMatchObject({ title: 'Buy milk', done: false })
    expect(jobs.todoCreated).toHaveBeenCalledWith({ id: todo.id, userId: expect.any(String) })

    const list = await app.inject({ method: 'GET', url: '/api/todos', headers: { cookie } })
    expect(list.json()).toHaveLength(1)
    expect(list.headers['cache-control']).toBe('no-store')

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${todo.id}`,
      headers: { cookie },
      payload: { done: true },
    })
    expect(updated.json()).toMatchObject({ id: todo.id, done: true })

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/api/todos/${todo.id}`,
      headers: { cookie },
    })
    expect(deleted.statusCode).toBe(204)
  })

  it('rejects an empty title', async () => {
    const cookie = await signUp('ada@example.com')
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      headers: { cookie },
      payload: { title: '   ' },
    })
    expect(response.statusCode).toBe(400)
  })

  it("treats another user's todo as not found", async () => {
    const ada = await signUp('ada@example.com')
    const bob = await signUp('bob@example.com')
    const created = await app.inject({
      method: 'POST',
      url: '/api/todos',
      headers: { cookie: ada },
      payload: { title: 'Secret' },
    })
    const { id } = created.json()

    const asBob = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${id}`,
      headers: { cookie: bob },
      payload: { done: true },
    })
    expect(asBob.statusCode).toBe(404)

    const bobsList = await app.inject({
      method: 'GET',
      url: '/api/todos',
      headers: { cookie: bob },
    })
    expect(bobsList.json()).toEqual([])
  })
})
