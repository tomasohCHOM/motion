import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useStore } from '@tanstack/react-store'
import React from 'react'
import { useLoaderData } from '@tanstack/react-router'
import { TaskCard } from './task'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import {
  kanbanActions,
  kanbanHelpers,
  kanbanStore,
} from '@/store/manager/task-store'
import { columnIdToStatus } from '@/utils/taskTransform'
import { useUpdateTask } from '@/client/tasks/updateTask'

type Props = {
  children: React.ReactNode
}

export const KanbanDndProvider: React.FC<Props> = ({ children }) => {
  const { workspace } = useLoaderData({ from: '/workspace/$workspaceId' })
  const kanbanState = useStore(kanbanStore)
  const updateTaskMutation = useUpdateTask()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  /**
   * Needed so users can see the "floating" task as they drag it to other columns.
   * They would not be able to see the task leave its original column otherwise.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = kanbanHelpers.findTaskById(kanbanState, active.id as string)
    kanbanActions.setActiveTask(task)
  }

  /**
   * Performed when the user stops dragging the task, but does not let off the
   * cursor. It updates which new column the dragged task would belong to, but
   * does not care about the actual index inside the `tasks` array of that
   * column yet.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the columns containing the active and over items
    const activeColumn = kanbanState.columns.find((col) =>
      col.tasks.some((task) => task.id === activeId),
    )
    const overColumn = kanbanState.columns.find(
      (col) =>
        col.tasks.some((task) => task.id === overId) || col.id === overId,
    )

    if (!activeColumn || !overColumn) return
    if (activeColumn.id === overColumn.id) return

    // Move task between different columns
    kanbanActions.moveTaskBetweenColumns(
      activeId,
      activeColumn.id,
      overColumn.id,
    )
  }

  /**
   * User lets go off the task, dragging ends. Organizes `tasks` array of the
   * targeted column with correct index of elements.
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!kanbanState.activeTask || !over) return

    const activeId = active.id as string
    const overId = over.id as string

    const originColumnId = kanbanState.activeTask.status

    // Find the column containing the over items
    const overColumn = kanbanState.columns.find(
      (col) =>
        col.tasks.some((task) => task.id === overId) || col.id === overId,
    )
    if (!overColumn) return

    // If same column, reorder within column and stop there
    if (originColumnId === overColumn.id) {
      const tasks = overColumn.tasks
      const oldIndex = tasks.findIndex((task) => task.id === activeId)
      const newIndex = tasks.findIndex((task) => task.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        kanbanActions.reorderTasksInColumn(overColumn.id, oldIndex, newIndex)
      }
      return
    }

    const activeTask = kanbanState.activeTask
    kanbanActions.setActiveTask(null)

    const previousState = kanbanActions.moveTaskBetweenColumns(
      activeTask.id,
      originColumnId,
      overColumn.id,
    )

    try {
      await updateTaskMutation.mutateAsync({
        taskId: activeTask.id,
        workspaceId: workspace.id,
        taskData: {
          title: activeTask.title,
          description: activeTask.description ?? undefined,
          assignee_id: activeTask.assignee.id,
          status: columnIdToStatus(overColumn.id),
          priority: activeTask.priority,
          due_date: activeTask.dueDate ?? undefined,
        },
      })
    } catch (err) {
      kanbanActions.rollback(previousState)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={kanbanState.columns.map((col) => col.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>

      <DragOverlay>
        {kanbanState.activeTask ? (
          <TaskCard columnId="" task={kanbanState.activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
