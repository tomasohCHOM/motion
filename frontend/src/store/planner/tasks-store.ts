import { Store } from '@tanstack/store'
import * as React from 'react'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  due: Date
  priority: TaskPriority
  completed: boolean
}

type TasksState = {
  tasks: Array<Task>
}

type TasksActions = {
  addTask: (input: {
    title: string
    description?: string
    due: Date
    priority: TaskPriority
  }) => void
  toggleComplete: (id: string) => void
  removeTask: (id: string) => void
}

const store = new Store<TasksState>({
  tasks: [],
})

const actions: TasksActions = {
  addTask(input) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description ?? '',
      due: new Date(input.due),
      priority: input.priority,
      completed: false,
    }
    store.setState((s) => ({ tasks: [task, ...s.tasks] }))
  },

  toggleComplete(id) {
    store.setState((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    }))
  },

  removeTask(id) {
    store.setState((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
    }))
  },
}

export function useTasksStore<T>(
  selector: (state: TasksState & TasksActions) => T,
): T {
  const state = React.useSyncExternalStore(
    (onChange) => store.subscribe(onChange),
    () => store.state,
    () => store.state,
  )

  const snapshot = React.useMemo(() => ({ ...state, ...actions }), [state])

  return selector(snapshot)
}

export function getTasksStore() {
  return store
}

export type { TasksState, TasksActions }
