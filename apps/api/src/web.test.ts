import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createTestDb } from '@acme-corp/db/testing'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from './app.ts'
import { createAuth } from './auth.ts'

const ORIGIN = 'http://localhost:3000'
let app: ReturnType<typeof buildApp>
let dist: string
let closeDb: () => Promise<void>

beforeAll(async () => {
  dist = await mkdtemp(join(tmpdir(), 'web-dist-'))
  await mkdir(join(dist, 'assets'))
  await writeFile(join(dist, 'index.html'), '<!doctype html><title>app</title>')
  await writeFile(join(dist, 'assets', 'app-abc123.js'), 'console.log(1)')
  await writeFile(join(dist, 'assets', 'app-abc123.js.br'), 'brotli-bytes')

  const testDb = await createTestDb()
  closeDb = testDb.close
  const auth = createAuth({
    db: testDb.db,
    secret: 'test-secret-that-is-at-least-32-characters-long',
    baseURL: ORIGIN,
    trustedOrigins: [ORIGIN],
  })
  app = buildApp({
    db: testDb.db,
    auth,
    jobs: { async todoCreated() {} },
    webOrigin: ORIGIN,
    webDist: dist,
  })
})

afterAll(async () => {
  await app.close()
  await closeDb()
  await rm(dist, { recursive: true })
})

describe('serving the web app', () => {
  it('caches hashed assets forever and sends the pre-compressed copy', async () => {
    const response = await app.inject({
      url: '/assets/app-abc123.js',
      headers: { 'accept-encoding': 'br, gzip' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable')
    expect(response.headers['content-encoding']).toBe('br')
    expect(response.body).toBe('brotli-bytes')
  })

  it('answers any page with index.html, revalidated every time', async () => {
    const response = await app.inject({ url: '/todos', headers: { accept: 'text/html' } })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('<title>app</title>')
    expect(response.headers['cache-control']).toBe('no-cache')
  })

  it('keeps unknown API paths a JSON 404', async () => {
    const response = await app.inject({ url: '/api/nope', headers: { accept: 'text/html' } })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ statusCode: 404 })
  })
})
