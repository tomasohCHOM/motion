import { arrayMove } from '@dnd-kit/sortable'
import { Store } from '@tanstack/store'
import { mockManagerTestData } from '@/static/workspace/manager'

export type Task = {
  id: string
  title: string
  description?: string
  assignee: {
    name: string
    avatar?: string
  }
  priority: string
  dueDate?: string
}

export type Column = {
  id: string
  title: string
  tasks: Array<Task>
}

type KanbanState = {
  columns: Array<Column>
  activeTask: Task | null
}

export const columnTypes = [
  { id: 'to-do', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
]

export const priorityLabels = ['low', 'medium', 'high']

export const teamMembers = [
  'Donovan Bosson',
  'Nathan Chen',
  'Josh Holman',
  'Tomas Oh',
]

export const kanbanStore = new Store<KanbanState>({
  columns: mockManagerTestData,
  activeTask: null,
})

export const kanbanActions = {
  addTask: (columnId: string, task: Task) => {
    kanbanStore.setState((prev) => {
      const columns = prev.columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column,
      )
      return { ...prev, columns }
    })
  },

  deleteTask: (columnId: string, taskId: string) => {
    kanbanStore.setState((prev) => {
      const columns = prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          : column,
      )
      return { ...prev, columns }
    })
  },

  updateTask: (columnId: string, updatedTask: Task) => {
    kanbanStore.setState((prev) => {
      const fromColumnIndex = prev.columns.findIndex((col) =>
        col.tasks.some((t) => t.id === updatedTask.id),
      )
      if (fromColumnIndex === -1) return prev
      const fromColumn = prev.columns[fromColumnIndex]

      // If moving within the same column, update in place
      if (prev.columns[fromColumnIndex].id === columnId) {
        const newColumns = [...prev.columns]
        newColumns[fromColumnIndex] = {
          ...fromColumn,
          tasks: fromColumn.tasks.map((t) =>
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t,
          ),
        }
        return { ...prev, columns: newColumns }
      }

      const toColumnIndex = prev.columns.findIndex((col) => col.id === columnId)
      if (toColumnIndex === -1) return prev

      const newColumns = [...prev.columns]
      newColumns[fromColumnIndex] = {
        ...fromColumn,
        tasks: fromColumn.tasks.filter((t) => t.id !== updatedTask.id),
      }
      newColumns[toColumnIndex] = {
        ...newColumns[toColumnIndex],
        tasks: [...newColumns[toColumnIndex].tasks, updatedTask],
      }

      return { ...prev, columns: newColumns }
    })
  },

  setActiveTask: (task: Task | null) => {
    kanbanStore.setState((prev) => ({ ...prev, activeTask: task }))
  },

  moveTaskBetweenColumns: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
  ) => {
    kanbanStore.setState((prev) => {
      const fromColumnIndex = prev.columns.findIndex(
        (col) => col.id === fromColumnId,
      )
      const toColumnIndex = prev.columns.findIndex(
        (col) => col.id === toColumnId,
      )

      if (fromColumnIndex === -1 || toColumnIndex === -1) return prev

      const fromColumn = prev.columns[fromColumnIndex]
      const toColumn = prev.columns[toColumnIndex]

      const taskIndex = fromColumn.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) return prev

      const task = fromColumn.tasks[taskIndex]

      const newColumns = [...prev.columns]

      // Remove task from source column
      newColumns[fromColumnIndex] = {
        ...fromColumn,
        tasks: fromColumn.tasks.filter((t) => t.id !== taskId),
      }

      // Add task to destination column
      newColumns[toColumnIndex] = {
        ...toColumn,
        tasks: [...toColumn.tasks, task],
      }

      return {
        ...prev,
        columns: newColumns,
      }
    })
  },

  reorderTasksInColumn: (
    columnId: string,
    oldIndex: number,
    newIndex: number,
  ) => {
    kanbanStore.setState((prev) => {
      const columnIndex = prev.columns.findIndex((col) => col.id === columnId)
      if (columnIndex === -1) return prev

      const column = prev.columns[columnIndex]
      const newTasks = arrayMove(column.tasks, oldIndex, newIndex)

      const newColumns = [...prev.columns]
      newColumns[columnIndex] = {
        ...column,
        tasks: newTasks,
      }

      return {
        ...prev,
        columns: newColumns,
      }
    })
  },
}

export const kanbanHelpers = {
  findTaskById: (state: KanbanState, taskId: string): Task | null => {
    for (const column of state.columns) {
      const found = column.tasks.find((task) => task.id === taskId)
      if (found) return found
    }
    return null
  },

  findColumnByTaskId: (state: KanbanState, taskId: string): Column | null => {
    return (
      state.columns.find((column) =>
        column.tasks.some((task) => task.id === taskId),
      ) || null
    )
  },

  getTotalTaskCount: (state: KanbanState): number => {
    return state.columns.reduce((total, col) => total + col.tasks.length, 0)
  },

  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  },
}
