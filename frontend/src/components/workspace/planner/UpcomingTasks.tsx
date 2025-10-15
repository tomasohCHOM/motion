import * as React from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react'
import type { Task, TaskPriority } from '@/store/planner/tasks-store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function endOfWeek(d: Date) {
  const x = startOfDay(d)
  const diff = 6 - x.getDay()
  x.setDate(x.getDate() + diff)
  x.setHours(23, 59, 59, 999)
  return x
}
function relativeDueLabel(due: Date, base: Date) {
  const b = startOfDay(base)
  const dd = startOfDay(due)
  if (sameDay(dd, b)) return 'Today'
  if (sameDay(dd, addDays(b, 1))) return 'Tomorrow'
  if (dd.getTime() <= endOfWeek(b).getTime()) return 'This Week'
  return dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function UpcomingTasksCard({
  tasks,
  baseDate,
  onViewAll,
  onToggleTask,
}: {
  tasks: Array<Task>
  baseDate: Date
  onViewAll: () => void
  onToggleTask?: (id: string) => void
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-base font-medium mb-3">Upcoming Tasks</div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
            No upcoming tasks.
          </div>
        ) : (
          tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              baseDate={baseDate}
              compact
              onToggleTask={onToggleTask}
            />
          ))
        )}
      </div>
      <div className="pt-4">
        <Button variant="secondary" className="w-full" onClick={onViewAll}>
          View All Tasks
        </Button>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  baseDate,
  compact = false,
  onToggleTask,
}: {
  task: Task
  baseDate: Date
  compact?: boolean
  onToggleTask?: (id: string) => void
}) {
  const label = relativeDueLabel(task.due, baseDate)
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 ${compact ? 'py-2' : 'py-3'}`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleTask?.(task.id)}
          aria-label="Toggle task"
        />
        <div className="min-w-0">
          <div
            className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}
          >
            {task.title}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <PriorityChip p={task.priority} />
      </div>
    </div>
  )
}

type PriorityMap = Record<
  TaskPriority,
  { bg: string; text: string; ring: string }
>
const TASK_STYLES: PriorityMap = {
  low: {
    bg: 'rgba(16,185,129,0.14)',
    text: '#065F46',
    ring: 'rgba(16,185,129,0.25)',
  },
  medium: {
    bg: 'rgba(245,158,11,0.15)',
    text: '#92400E',
    ring: 'rgba(245,158,11,0.25)',
  },
  high: {
    bg: 'rgba(239,68,68,0.14)',
    text: '#991B1B',
    ring: 'rgba(239,68,68,0.25)',
  },
}

function PriorityChip({ p }: { p: TaskPriority }) {
  const s = TASK_STYLES[p]
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium ring-1"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
      }}
    >
      {p}
    </span>
  )
}

export function TasksDialog({
  open,
  onOpenChange,
  baseDate,
  active,
  completed,
  onToggleTask,
  onRemoveTask,
  onAddTask,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  baseDate: Date
  active: Array<Task>
  completed: Array<Task>
  onToggleTask: (id: string) => void
  onRemoveTask: (id: string) => void
  onAddTask: (payload: {
    title: string
    description: string
    due: Date
    priority: TaskPriority
  }) => void
}) {
  const [addOpen, setAddOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none [&_[data-slot='dialog-close']]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Tasks</DialogTitle>
          <DialogDescription>
            View, add, and manage all tasks.
          </DialogDescription>
        </DialogHeader>

        <Card className="w-full max-w-3xl shadow-2xl">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription className="text-gray-600">
                    {active.length} active · {completed.length} completed
                  </CardDescription>
                </div>
              </div>

              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <AddTaskFormDialog
                  onClose={() => setAddOpen(false)}
                  defaultDate={baseDate}
                  onAddTask={onAddTask}
                />
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="max-h-[600px] overflow-y-auto space-y-6">
              <div className="space-y-3">
                {active.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg bg-white p-12 text-center text-gray-500">
                    No tasks yet. Add one to get started.
                  </div>
                ) : (
                  active.map((t) => (
                    <FullTaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => onToggleTask(t.id)}
                      onDelete={() => onRemoveTask(t.id)}
                    />
                  ))
                )}
              </div>

              {completed.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 px-1">Completed</div>
                  {completed.map((t) => (
                    <FullTaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => onToggleTask(t.id)}
                      onDelete={() => onRemoveTask(t.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

const PRIORITY_CARD: Record<TaskPriority, { border: string; badge: string }> = {
  high: {
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  medium: {
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  low: {
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
}

function FullTaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  const styles = PRIORITY_CARD[task.priority]
  const dueLabel = task.due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className={[
        'group bg-white rounded-lg p-4 hover:shadow-md transition-all',
        'border-y border-r border-l-4',
        styles.border,
        task.completed ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-1"
          aria-label="Toggle task"
        />
        <div className="flex-1 min-w-0">
          <h3
            className={[
              'font-medium',
              task.completed ? 'line-through text-gray-500' : '',
            ].join(' ')}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={[
                'text-sm mb-3',
                task.completed ? 'line-through text-gray-400' : 'text-gray-600',
              ].join(' ')}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={styles.badge}>
              {task.priority}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{dueLabel}</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
        </Button>
      </div>
    </div>
  )
}

function AddTaskFormDialog({
  onClose,
  defaultDate,
  onAddTask,
}: {
  onClose: () => void
  defaultDate: Date
  onAddTask: (payload: {
    title: string
    description: string
    due: Date
    priority: TaskPriority
  }) => void
}) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [due, setDue] = React.useState<Date>(() => startOfDay(defaultDate))
  const [priority, setPriority] = React.useState<TaskPriority>('medium')

  const submit: React.FormEventHandler = (e) => {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!title || !due) return
    onAddTask({
      title: title.trim(),
      description,
      due: startOfDay(due),
      priority,
    })
    onClose()
  }

  return (
    <DialogContent className="sm:max-w-[600px] [&_[data-slot='dialog-close']]:hidden">
      <DialogHeader>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new task with title, description, priority, and due date.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-task-title" className="mt-1.5">
            Title
          </Label>
          <Input
            id="new-task-title"
            placeholder="Complete project documentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-task-desc" className="mt-1.5">
            Description
          </Label>
          <Textarea
            id="new-task-desc"
            placeholder="Add task details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="mt-1.5">Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="mt-1.5">Due date</Label>
          <div className="relative">
            <DatePicker date={due} setDate={setDue} />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-black text-white px-8 hover:bg-gray-800"
          >
            Add
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

function DatePicker({
  date,
  setDate,
}: {
  date?: Date
  setDate: (d: Date) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(startOfDay(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
