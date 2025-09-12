import React from 'react'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task } from '@/store/manager/task-store'
import { kanbanHelpers } from '@/store/manager/task-store'

type Props = {
  task: Task
}

const getAssigneeInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

export const TaskCard: React.FC<Props> = ({ task }) => {
  return (
    <Card className="min-h-[180px] mb-3 z-50 flex flex-col justify-between cursor-grab hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader>
        <div className="grid gap-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight">
              {task.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2 -mt-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" alignOffset={-10}>
                <DropdownMenuItem>Edit task</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
              className={`text-xs px-2 py-0.5 ${kanbanHelpers.getPriorityColor(
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
  )
}
