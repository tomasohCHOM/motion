import React, { useState } from 'react'
import { Calendar, MoreHorizontal, Plus, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageContent from '@/components/workspace/layout/page-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockManagerTestData } from '@/static/workspace/manager'

type Task = {
  id: string
  title: string
  description?: string
  assignee: {
    name: string
    avatar?: string
  }
  priority: string
  dueDate?: string
  tags?: Array<string>
}

type Column = {
  id: string
  title: string
  tasks: Array<Task>
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getAssigneeInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

const ManagerHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between border-b p-6 border-sidebar-border w-full">
      <div className="flex gap-4 items-center">
        <h1 className="font-bold text-lg">Manager Board</h1>
        <Badge variant="outline" className="text-xs">
          6 tasks
        </Badge>
      </div>
      <div className="flex gap-4 items-center">
        <Button variant="outline" className="cursor-pointer">
          <User /> Assign member
        </Button>
        <Button className="cursor-pointer">
          <Plus /> New task
        </Button>
      </div>
    </div>
  )
}

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <Card className="mb-3 cursor-grab hover:shadow-md transition-shadow bg-card border-border">
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
          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
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
            className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}
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

const Board: React.FC<{ columns: Array<Column> }> = ({ columns }) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col w-80">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              <Button
                variant="ghost"
                className="w-full border-2 border-dashed border-muted-foreground/25 h-20 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkspaceManager() {
  const [columns, _] = useState<Array<Column>>(mockManagerTestData)

  return (
    <PageContent>
      <ManagerHeader />
      <Board columns={columns} />
    </PageContent>
  )
}
