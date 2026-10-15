import { z } from 'zod'

// Shapes shared by the API and the web app, so a field cannot change on one side only.

export const todoSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  done: z.boolean(),
  createdAt: z.iso.datetime(),
})
export type Todo = z.infer<typeof todoSchema>

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
})
export type CreateTodo = z.infer<typeof createTodoSchema>

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    done: z.boolean(),
  })
  .partial()
export type UpdateTodo = z.infer<typeof updateTodoSchema>
