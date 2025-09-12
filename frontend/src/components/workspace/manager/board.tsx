import React from 'react'
import { DroppableColumn } from './column'
import { useStore } from '@tanstack/react-store'
import { kanbanStore } from '@/store/manager/task-store'
import { KanbanDndProvider } from './kanban-dnd-provider'

export const Board: React.FC = () => {
  const { columns } = useStore(kanbanStore)
  return (
    <KanbanDndProvider>
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </KanbanDndProvider>
  )
}
