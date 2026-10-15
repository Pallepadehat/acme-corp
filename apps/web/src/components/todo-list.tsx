import type { Todo } from '@acme-corp/contract'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Input } from '@/components/ui/input.tsx'

interface TodoListProps {
  todos: Todo[]
  onAdd: (title: string) => Promise<void>
  onToggle: (todo: Todo) => Promise<void>
  onDelete: (todo: Todo) => Promise<void>
}

/** Presentational: takes data and callbacks, fetches nothing, so it is easy to test. */
export function TodoList({ todos, onAdd, onToggle, onDelete }: TodoListProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const remaining = todos.filter((todo) => !todo.done).length

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!title.trim()) return
          await onAdd(title)
          setTitle('')
        }}
      >
        <Input
          aria-label={t('todos.placeholder')}
          placeholder={t('todos.placeholder')}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <Button type="submit">{t('todos.add')}</Button>
      </form>

      {todos.length === 0 ? (
        <p className="text-muted-foreground">{t('todos.empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 px-3 py-2">
              <Checkbox
                id={todo.id}
                checked={todo.done}
                onCheckedChange={() => void onToggle(todo)}
              />
              <label
                htmlFor={todo.id}
                className={`flex-1 ${todo.done ? 'text-muted-foreground line-through' : ''}`}
              >
                {todo.title}
              </label>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('todos.delete')}
                onClick={() => void onDelete(todo)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-sm">{t('todos.remaining', { count: remaining })}</p>
    </div>
  )
}
