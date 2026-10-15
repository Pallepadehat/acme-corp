import type { Todo } from '@acme-corp/contract'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { TodoList } from '@/components/todo-list.tsx'
import { api } from '@/lib/api.ts'

export const Route = createFileRoute('/_authed/todos')({
  // The router fetches before rendering; `router.invalidate()` re-runs this after a change.
  loader: () => api<Todo[]>('/api/todos'),
  component: TodosPage,
})

function TodosPage() {
  const { t } = useTranslation()
  const todos = Route.useLoaderData()
  const router = useRouter()
  const refresh = () => router.invalidate()

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t('todos.title')}</h1>
      <TodoList
        todos={todos}
        onAdd={async (title) => {
          await api('/api/todos', { method: 'POST', body: JSON.stringify({ title }) })
          await refresh()
        }}
        onToggle={async (todo) => {
          await api(`/api/todos/${todo.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ done: !todo.done }),
          })
          await refresh()
        }}
        onDelete={async (todo) => {
          await api(`/api/todos/${todo.id}`, { method: 'DELETE' })
          await refresh()
        }}
      />
    </section>
  )
}
