import React from 'react'
import { Calendar, MoreHorizontal } from 'lucide-react'
import { useParams } from '@tanstack/react-router'
import type { WorkspaceTask } from '@/types/task'
import { getMemberInitials } from '@/utils/initals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { kanbanActions, kanbanHelpers } from '@/store/manager/task-store'
import { dialogActions } from '@/store/manager/dialog-store'
import { useDeleteTask } from '@/client/tasks/deleteTask'

type Props = {
  columnId: string
  task: WorkspaceTask
}

export const TaskCard: React.FC<Props> = ({ columnId, task }) => {
  const { workspaceId } = useParams({
    from: '/workspace/$workspaceId/manager/',
  })
  const deleteTaskMutation = useDeleteTask()

  const handleDelete = async () => {
    // Optimistic update
    const previousState = kanbanActions.deleteTask(columnId, task.id)

    // API call
    try {
      await deleteTaskMutation.mutateAsync({
        taskId: task.id,
        workspaceId,
      })
    } catch (error) {
      // Rollback on error
      kanbanActions.rollback(previousState)
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <Card className="min-h-[180px] mb-3 z-50 flex flex-col justify-between cursor-grab hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader>
        <div className="grid gap-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight">
              {task.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 -mr-2 -mt-1">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" alignOffset={-10}>
                <DropdownMenuItem
                  onClick={() => dialogActions.openEdit(columnId, task)}
                >
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                >
                  {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete task'}
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
              <AvatarFallback className="text-xs">
                {getMemberInitials(task.assignee.fullName)}
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
