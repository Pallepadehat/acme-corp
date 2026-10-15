import { createTodoSchema, type Todo, updateTodoSchema } from '@acme-corp/contract'
import { type Database, todo } from '@acme-corp/db'
import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { type Auth, requireUser } from '../auth.ts'
import { HttpError } from '../http-error.ts'
import type { Jobs } from '../jobs.ts'

interface Deps {
  db: Database
  auth: Auth
  jobs: Jobs
}

const paramsSchema = z.object({ id: z.uuid() })

function toWire(row: typeof todo.$inferSelect): Todo {
  return { id: row.id, title: row.title, done: row.done, createdAt: row.createdAt.toISOString() }
}

/** A todo id from the URL. A malformed one is just as "not found" as a missing one. */
function todoId(params: unknown): string {
  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) throw new HttpError(404, 'not found')
  return parsed.data.id
}

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw new HttpError(400, z.prettifyError(parsed.error))
  return parsed.data
}

// Every query carries the caller's userId in its WHERE clause, so "not yours"
// and "does not exist" look exactly the same from outside.
export async function registerTodoRoutes(app: FastifyInstance, { db, auth, jobs }: Deps) {
  app.get('/api/todos', async (request) => {
    const user = await requireUser(auth, request)
    const rows = await db
      .select()
      .from(todo)
      .where(eq(todo.userId, user.id))
      .orderBy(desc(todo.createdAt))
    return rows.map(toWire)
  })

  app.post('/api/todos', async (request, reply) => {
    const user = await requireUser(auth, request)
    const { title } = parseBody(createTodoSchema, request.body)
    const [row] = await db.insert(todo).values({ userId: user.id, title }).returning()
    if (!row) throw new HttpError(500, 'insert returned nothing')
    await jobs.todoCreated({ id: row.id, userId: user.id })
    return reply.code(201).send(toWire(row))
  })

  app.patch('/api/todos/:id', async (request) => {
    const user = await requireUser(auth, request)
    const id = todoId(request.params)
    const changes = parseBody(updateTodoSchema, request.body)
    const [row] = await db
      .update(todo)
      .set(changes)
      .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
      .returning()
    if (!row) throw new HttpError(404, 'not found')
    return toWire(row)
  })

  app.delete('/api/todos/:id', async (request, reply) => {
    const user = await requireUser(auth, request)
    const id = todoId(request.params)
    const [row] = await db
      .delete(todo)
      .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
      .returning({ id: todo.id })
    if (!row) throw new HttpError(404, 'not found')
    return reply.code(204).send()
  })
}
