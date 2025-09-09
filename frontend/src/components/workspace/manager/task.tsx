import React from 'react'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from './types'
import { getPriorityColor, getAssigneeInitials } from './utils'

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-70' : ''}
    >
      <Card className="mb-3 z-50 cursor-grab hover:shadow-md transition-shadow bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight">
              {task.title}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {getAssigneeInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${getPriorityColor(
                  task.priority,
                )}`}
              >
                {task.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '-- --'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
