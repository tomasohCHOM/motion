import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import type { Task } from '@/store/manager/task-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { dialogActions, dialogStore } from '@/store/manager/dialog-store'
import {
  columnTypes,
  kanbanActions,
  kanbanHelpers,
  priorityLabels,
  teamMembers,
} from '@/store/manager/task-store'
import { DateInput } from '@/components/ui/date-picker'

const EditTask: React.FC = () => {
  const {
    isOpen,
    isAdding,
    task,
    columnId: currColumnId,
  } = useStore(dialogStore)

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [columnId, setColumnId] = useState(currColumnId ?? '')
  const [assignee, setAssignee] = useState(task?.assignee.name ?? '')
  const [priority, setPriority] = useState(task?.priority ?? '')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined,
  )

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setColumnId(currColumnId ?? '')
    setAssignee(task?.assignee.name ?? '')
    setPriority(task?.priority ?? '')
    setDueDate(task?.dueDate ? new Date(task.dueDate) : undefined)
  }, [task, currColumnId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData: Task = {
      id: task?.id ?? crypto.randomUUID(),
      title,
      description,
      assignee: {
        name: assignee,
      },
      priority,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
    }

    if (isAdding) {
      kanbanActions.addTask(columnId, taskData)
    } else {
      kanbanActions.updateTask(columnId, taskData)
    }
    dialogActions.close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={dialogActions.close}>
      <DialogContent className="sm:max-w-[30rem]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Add a new task' : 'Edit a task'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                name="task-title"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Optional"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
              />
            </div>
            <div className="grid gap-3">
              <Label>Column</Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Indicate task status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kanban Column</SelectLabel>
                    {columnTypes.map(({ id, title: columnTitle }) => {
                      return (
                        <SelectItem key={`item-${id}`} value={id}>
                          {columnTitle}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Indicate task assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Assignee</SelectLabel>
                    {teamMembers.map((member) => {
                      return (
                        <SelectItem key={`member-${member}`} value={member}>
                          {member}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 justify-between w-full">
              <div className="grid gap-3">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="(Optional) Add labels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Labels</SelectLabel>
                      {priorityLabels.map((label) => {
                        return (
                          <SelectItem key={`priority-${label}`} value={label}>
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0.5 ${kanbanHelpers.getPriorityColor(
                                label,
                              )}`}
                            >
                              {label}
                            </Badge>
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label>Due date</Label>
                <DateInput value={dueDate} onChange={setDueDate} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" className="cursor-pointer">
              {isAdding ? 'Add task' : 'Edit task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditTask
