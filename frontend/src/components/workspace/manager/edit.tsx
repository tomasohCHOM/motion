import { useEffect, useReducer, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { useParams } from '@tanstack/react-router'
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
import { DateInput } from '@/components/ui/date-picker'
import { dialogActions, dialogStore } from '@/store/manager/dialog-store'
import {
  columnTypes,
  kanbanActions,
  kanbanHelpers,
  priorityLabels,
  teamMembers,
} from '@/store/manager/task-store'
import { useCreateTask } from '@/client/tasks/createTask'
import { useUpdateTask } from '@/client/tasks/updateTask'
import { columnIdToStatus } from '@/utils/taskTransform'

type TaskFormState = {
  title: string
  description: string
  columnId: string
  assignee: string
  priority: string
  dueDate?: Date
}

type Action =
  | { type: 'SET_FIELD'; field: keyof TaskFormState; value?: string | Date }
  | { type: 'RESET'; payload: TaskFormState }

const reducer = (state: TaskFormState, action: Action): TaskFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return { ...action.payload }
    default:
      return state
  }
}

const EditTask: React.FC = () => {
  const { workspaceId } = useParams({
    from: '/workspace/$workspaceId/manager/',
  })
  const {
    isOpen,
    isAdding,
    task,
    columnId: currColumnId,
  } = useStore(dialogStore)
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [state, dispatch] = useReducer(reducer, {
    title: task?.title ?? '',
    description: task?.description ?? '',
    columnId: currColumnId ?? '',
    assignee: task?.assignee.name ?? '',
    priority: task?.priority ?? '',
    dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
  })

  useEffect(() => {
    dispatch({
      type: 'RESET',
      payload: {
        title: task?.title ?? '',
        description: task?.description ?? '',
        columnId: currColumnId ?? '',
        assignee: task?.assignee.name ?? '',
        priority: task?.priority ?? '',
        dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      },
    })
  }, [task, currColumnId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const taskData: Task = {
      id: task?.id ?? crypto.randomUUID(),
      title: state.title,
      description: state.description,
      assignee: { name: state.assignee },
      priority: state.priority,
      dueDate: state.dueDate?.toISOString(),
    }

    try {
      if (isAdding) {
        // Optimistic update
        const previousState = kanbanActions.addTaskOptimistic(
          state.columnId,
          taskData,
        )

        // API call
        try {
          await createTaskMutation.mutateAsync({
            workspaceId,
            taskData: {
              title: state.title,
              description: state.description || undefined,
              assignee_id: undefined, // TODO: Map assignee name to ID
              status: columnIdToStatus(state.columnId),
              priority: state.priority,
              due_date: state.dueDate?.toISOString(),
            },
          })
        } catch (error) {
          // Rollback on error
          kanbanActions.rollback(previousState)
          throw error
        }
      } else {
        // Optimistic update
        const previousState = kanbanActions.updateTaskOptimistic(
          state.columnId,
          taskData,
        )

        // API call
        try {
          await updateTaskMutation.mutateAsync({
            taskId: task!.id,
            workspaceId,
            taskData: {
              title: state.title,
              description: state.description || undefined,
              assignee_id: undefined, // TODO: Map assignee name to ID
              status: columnIdToStatus(state.columnId),
              priority: state.priority,
              due_date: state.dueDate?.toISOString(),
            },
          })
        } catch (error) {
          // Rollback on error
          kanbanActions.rollback(previousState)
          throw error
        }
      }

      dialogActions.close()
    } catch (error) {
      console.error('Failed to save task:', error)
      // Error is handled by mutation's onError
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={dialogActions.close}>
      <DialogContent className="sm:max-w-[30rem]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Add a new task' : 'Edit a task'}
            </DialogTitle>
          </DialogHeader>

          <TaskField
            label="Task Title"
            id="task-title"
            value={state.title}
            onChange={(v) =>
              dispatch({ type: 'SET_FIELD', field: 'title', value: v })
            }
          />

          <TaskField
            label="Description"
            id="description"
            value={state.description}
            onChange={(v) =>
              dispatch({ type: 'SET_FIELD', field: 'description', value: v })
            }
            placeholder="Optional"
          />

          <SelectField
            label="Status"
            value={state.columnId}
            onChange={(v) =>
              dispatch({ type: 'SET_FIELD', field: 'columnId', value: v })
            }
            items={columnTypes.map(({ id, title }) => ({
              value: id,
              label: title,
            }))}
          />

          <SelectField
            label="Assignee"
            value={state.assignee}
            onChange={(v) =>
              dispatch({ type: 'SET_FIELD', field: 'assignee', value: v })
            }
            items={teamMembers.map((m) => ({ value: m, label: m }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Priority"
              value={state.priority}
              onChange={(v) =>
                dispatch({ type: 'SET_FIELD', field: 'priority', value: v })
              }
              items={priorityLabels.map((label) => ({
                value: label,
                label: (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${kanbanHelpers.getPriorityColor(label)}`}
                  >
                    {label}
                  </Badge>
                ),
              }))}
            />
            <div className="grid gap-3">
              <Label>Due date</Label>
              <DateInput
                value={state.dueDate}
                onChange={(date) =>
                  dispatch({ type: 'SET_FIELD', field: 'dueDate', value: date })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isAdding
                  ? 'Add task'
                  : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditTask

const TaskField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) => (
  <div className="grid gap-3">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)

const SelectField = ({
  label,
  value,
  onChange,
  items,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  items: Array<{ value: string; label: React.ReactNode }>
}) => (
  <div className="grid gap-3">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map(({ value: v, label: l }) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
