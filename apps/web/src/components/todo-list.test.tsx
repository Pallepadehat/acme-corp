import type { Todo } from '@acme-corp/contract'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodoList } from './todo-list.tsx'

const milk: Todo = {
  id: '00000000-0000-4000-8000-000000000001',
  title: 'Buy milk',
  done: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderList(todos: Todo[] = []) {
  const handlers = {
    onAdd: vi.fn(async () => {}),
    onToggle: vi.fn(async () => {}),
    onDelete: vi.fn(async () => {}),
  }
  render(<TodoList todos={todos} {...handlers} />)
  return handlers
}

describe('TodoList', () => {
  it('says so when there is nothing to do', () => {
    renderList()
    expect(screen.getByText('Nothing to do. Enjoy it.')).toBeInTheDocument()
  })

  it('adds a todo and clears the box', async () => {
    const { onAdd } = renderList()
    const box = screen.getByRole('textbox', { name: 'What needs doing?' })
    await userEvent.type(box, 'Walk the dog{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Walk the dog')
    expect(box).toHaveValue('')
  })

  it('toggles and deletes', async () => {
    const { onToggle, onDelete } = renderList([milk])
    await userEvent.click(screen.getByRole('checkbox', { name: 'Buy milk' }))
    expect(onToggle).toHaveBeenCalledWith(milk)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(milk)
  })

  it('counts what is left', () => {
    renderList([milk, { ...milk, id: '00000000-0000-4000-8000-000000000002', done: true }])
    expect(screen.getByText('1 left')).toBeInTheDocument()
  })
})
