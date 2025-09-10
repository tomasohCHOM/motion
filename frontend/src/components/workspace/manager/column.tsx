import React from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Column } from './types'
import { TaskCard } from './task'

type Props = {
  column: Column
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DroppableColumn: React.FC<Props> = ({
  column,
  setIsDialogOpen,
}) => {
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
          onClick={() => setIsDialogOpen(true)}
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
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        <Button
          onClick={() => setIsDialogOpen(true)}
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
