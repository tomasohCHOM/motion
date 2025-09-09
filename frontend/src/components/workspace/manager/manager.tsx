import { useState } from 'react'
import PageContent from '@/components/workspace/layout/page-content'
import { mockManagerTestData } from '@/static/workspace/manager'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Board } from './board'
import { ManagerHeader } from './header'
import { TaskCard } from './task'
import type { Task, Column } from './types'

export default function WorkspaceManager() {
  const [columns, setColumns] = useState<Array<Column>>(mockManagerTestData)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const findTaskById = (id: string) => {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === id)
      if (task) return task
    }
    return null
  }

  const handleDragStart = (e: DragStartEvent) => {
    const task = findTaskById(e.active.id as string)
    setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = columns.find(
      (col) => col.tasks.some((t) => t.id === activeId) || col.id === activeId,
    )
    const overColumn = columns.find(
      (col) => col.tasks.some((t) => t.id === overId) || col.id === overId,
    )

    if (!activeColumn || !overColumn) return
    if (activeColumn.id === overColumn.id) return

    setColumns((prev) => {
      const activeColIndex = prev.findIndex((c) => c.id === activeColumn.id)
      const overColIndex = prev.findIndex((c) => c.id === overColumn.id)

      const activeTask = activeColumn.tasks.find((t) => t.id === activeId)
      if (!activeTask) return prev

      const newColumns = [...prev]

      newColumns[activeColIndex] = {
        ...activeColumn,
        tasks: activeColumn.tasks.filter((t) => t.id !== activeId),
      }

      newColumns[overColIndex] = {
        ...overColumn,
        tasks: [...overColumn.tasks, activeTask],
      }

      return newColumns
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const column = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId || t.id === overId),
    )

    if (column) {
      setColumns((prev) => {
        const colIndex = prev.findIndex((c) => c.id === column.id)
        const tasks = column.tasks

        const oldIndex = tasks.findIndex((t) => t.id === activeId)
        const newIndex = tasks.findIndex((t) => t.id === overId)

        const newTasks = arrayMove(tasks, oldIndex, newIndex)
        const newColumns = [...prev]
        newColumns[colIndex] = { ...column, tasks: newTasks }
        return newColumns
      })
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <PageContent>
        <ManagerHeader />
        <Board columns={columns} />
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </PageContent>
    </DndContext>
  )
}
