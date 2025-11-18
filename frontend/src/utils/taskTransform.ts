import type { WorkspaceTask } from '@/types/task'
import type { Column } from '@/store/manager/task-store'

/**
 * Maps backend status to frontend column ID
 */
export function statusToColumnId(status: string): string {
  const statusMap: Record<string, string> = {
    'To-Do': 'to-do',
    'In Progress': 'in-progress',
    Review: 'review',
    Done: 'done',
  }
  return statusMap[status] || 'to-do'
}

/**
 * Maps frontend column ID to backend status
 */
export function columnIdToStatus(columnId: string): string {
  const columnMap: Record<string, string> = {
    'to-do': 'To-Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Done',
  }
  return columnMap[columnId] || 'To-Do'
}

/**
 * Maps backend priority to frontend priority (lowercase)
 */
export function normalizePriority(priority: string | null): string {
  if (!priority) return 'medium'
  return priority.toLowerCase()
}

/**
 * Converts array of backend tasks to frontend columns structure
 */
export function transformTasksToColumns(
  tasks: Array<WorkspaceTask>,
): Array<Column> {
  const columnTypes = [
    { id: 'to-do', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ]

  // Initialize columns with empty tasks
  const columnsMap = new Map<string, Column>()
  for (const col of columnTypes) {
    columnsMap.set(col.id, {
      id: col.id,
      title: col.title,
      tasks: [],
    })
  }

  // Group tasks by status/column
  for (const task of tasks) {
    const columnId = statusToColumnId(task.status)
    const column = columnsMap.get(columnId)
    if (column) {
      column.tasks.push(task)
    }
  }

  // Return columns in order
  return columnTypes.map((col) => columnsMap.get(col.id)!)
}
