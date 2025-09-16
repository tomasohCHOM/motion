import React from 'react'
import { useStore } from '@tanstack/react-store'
import { DroppableColumn } from './column'
import { KanbanDndProvider } from './kanban-dnd-provider'
import { kanbanStore } from '@/store/manager/task-store'

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
