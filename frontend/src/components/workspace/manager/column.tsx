import React from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Column } from '@/store/manager/task-store'
import { TaskCard } from './task'
import { dialogActions } from '@/store/manager/dialog-store'
import { SortableItem } from './sortable-item'

type Props = {
  column: Column
}

export const DroppableColumn: React.FC<Props> = ({ column }) => {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-80 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {column.tasks.length}
          </Badge>
        </div>
        <Button
          onClick={() => dialogActions.openAdd(column.id)}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 overflow-x-hidden">
        <SortableContext
          id={column.id}
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef}>
            {column.tasks.map((task) => (
              <SortableItem key={task.id} id={task.id}>
                <TaskCard key={task.id} columnId={column.id} task={task} />
              </SortableItem>
            ))}
          </div>
        </SortableContext>

        <Button
          onClick={() => dialogActions.openAdd(column.id)}
          className="w-full border-2 cursor-pointer border-dashed border-muted-foreground/25 h-20 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
          variant="ghost"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a task
        </Button>
      </div>
    </div>
  )
}
