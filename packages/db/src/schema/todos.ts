import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth.ts'

// The example table. Rename or delete it once you have tables of your own.
export const todo = pgTable(
  'todo',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    done: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index().on(t.userId, t.createdAt)],
)

export type Todo = typeof todo.$inferSelect
export type NewTodo = typeof todo.$inferInsert
