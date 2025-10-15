import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
} from 'lucide-react'

import type {
  PlannerEvent,
  PlannerTypeColor,
} from '@/store/planner/planner-store'
import type { TaskPriority } from '@/store/planner/tasks-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

import { usePlannerStore } from '@/store/planner/planner-store'

import { useTasksStore } from '@/store/planner/tasks-store'

import { DateTimePicker } from '@/components/workspace/planner/date-time-picker'
import { TodaysOverview } from '@/components/workspace/planner/TodaysOverview'
import { TodaysSchedule } from '@/components/workspace/planner/TodaysSchedule'
import {
  TasksDialog,
  UpcomingTasksCard,
} from '@/components/workspace/planner/UpcomingTasks'

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
function endOfWeek(d: Date) {
  const x = startOfDay(d)
  const diff = 6 - x.getDay()
  x.setDate(x.getDate() + diff)
  x.setHours(23, 59, 59, 999)
  return x
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function getInitialAddTab(): 'event' | 'task' {
  if (typeof window === 'undefined') return 'event'
  const v = window.localStorage.getItem('planner-add-tab')
  return v === 'task' ? 'task' : 'event'
}

export const Route = createFileRoute('/workspace/$workspaceId/planner/')({
  component: PlannerRoute,
})

function PlannerRoute() {
  const allEvents = usePlannerStore((s) => s.events)
  const getEventTypeColor = usePlannerStore((s) => s.getEventTypeColor)

  const allTasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.addTask)
  const toggleComplete = useTasksStore((s) => s.toggleComplete)
  const removeTask = useTasksStore((s) => s.removeTask)

  const [openAdd, setOpenAdd] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'event' | 'task'>(
    getInitialAddTab,
  )
  React.useEffect(() => {
    try {
      localStorage.setItem('planner-add-tab', activeTab)
    } catch {}
  }, [activeTab])

  const [openTasks, setOpenTasks] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(() =>
    startOfDay(new Date()),
  )
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false)

  const events = React.useMemo(
    () =>
      allEvents
        .filter((e) => sameDay(e.date, selectedDate))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [allEvents, selectedDate],
  )

  const totalEvents = events.length
  const typeCounts = React.useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()
    for (const e of events) {
      const key = e.type.trim().toLowerCase()
      const label = e.type.trim()
      const prev = map.get(key)
      if (prev) prev.count += 1
      else map.set(key, { label, count: 1 })
    }
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label),
    )
  }, [events])

  const upcomingTasks = React.useMemo(() => {
    const start = startOfDay(selectedDate)
    const end = endOfWeek(selectedDate)
    return allTasks
      .filter(
        (t) =>
          !t.completed &&
          startOfDay(t.due).getTime() >= start.getTime() &&
          startOfDay(t.due).getTime() <= end.getTime(),
      )
      .sort((a, b) => startOfDay(a.due).getTime() - startOfDay(b.due).getTime())
      .slice(0, 3)
  }, [allTasks, selectedDate])

  const activeTasks = React.useMemo(
    () =>
      allTasks
        .filter((t) => !t.completed)
        .sort(
          (a, b) => startOfDay(a.due).getTime() - startOfDay(b.due).getTime(),
        ),
    [allTasks],
  )
  const completedTasks = React.useMemo(
    () =>
      allTasks
        .filter((t) => t.completed)
        .sort(
          (a, b) => startOfDay(a.due).getTime() - startOfDay(b.due).getTime(),
        ),
    [allTasks],
  )

  const headerDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const gotoPrev = () => setSelectedDate((d) => addDays(d, -1))
  const gotoNext = () => setSelectedDate((d) => addDays(d, 1))
  const gotoToday = () => setSelectedDate(startOfDay(new Date()))

  return (
    <div className="mt-8 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9"
              onClick={gotoPrev}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-[32ch] sm:w-[36ch] justify-center px-2 font-semibold text-base sm:text-lg overflow-hidden text-ellipsis whitespace-nowrap"
                aria-label="Change date"
              >
                {headerDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(startOfDay(d))
                    setDatePopoverOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="w-9">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9"
              onClick={gotoNext}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-[88px]">
            <Button
              variant="secondary"
              className="w-[88px] ml-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={gotoToday}
            >
              Today
            </Button>
          </div>
        </div>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add</DialogTitle>
              <DialogDescription className="sr-only">
                Create a new event or task.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'event' | 'task')}
              className="w-full"
            >
              <TabsList className="mb-4 grid w-full grid-cols-2 rounded-full bg-black/20 dark:bg-white/15">
                <TabsTrigger
                  value="event"
                  className="rounded-full text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Event
                </TabsTrigger>
                <TabsTrigger
                  value="task"
                  className="rounded-full text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  Task
                </TabsTrigger>
              </TabsList>

              <TabsContent value="event" className="mt-0">
                <AddEventForm
                  onClose={() => setOpenAdd(false)}
                  defaultDate={selectedDate}
                />
              </TabsContent>
              <TabsContent value="task" className="mt-0">
                <AddTaskInlineForm
                  onClose={() => setOpenAdd(false)}
                  defaultDate={selectedDate}
                  onAddTask={addTask}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="submit"
                form={
                  activeTab === 'event' ? 'add-event-form' : 'add-task-form'
                }
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TodaysSchedule
          events={events}
          getTypeColor={getEventTypeColor}
          ClockIcon={Clock}
          UsersIcon={Users}
        />
        <div className="space-y-4">
          <TodaysOverview total={totalEvents} typeCounts={typeCounts} />
          <UpcomingTasksCard
            tasks={upcomingTasks}
            baseDate={selectedDate}
            onViewAll={() => setOpenTasks(true)}
            onToggleTask={toggleComplete}
          />
        </div>
      </div>

      <TasksDialog
        open={openTasks}
        onOpenChange={setOpenTasks}
        baseDate={selectedDate}
        active={activeTasks}
        completed={completedTasks}
        onToggleTask={toggleComplete}
        onRemoveTask={removeTask}
        onAddTask={addTask}
      />
    </div>
  )
}

function AddEventForm({
  onClose,
  defaultDate,
}: {
  onClose: () => void
  defaultDate: Date
}) {
  const addEvent = usePlannerStore((s) => s.addEvent)
  const setEventTypeColor = usePlannerStore((s) => s.setEventTypeColor)
  const getEventTypeColor = usePlannerStore((s) => s.getEventTypeColor)

  const [title, setTitle] = React.useState('')
  const [type, setType] = React.useState('Meeting')
  const [typeColor, setTypeColor] = React.useState<PlannerTypeColor>(
    getEventTypeColor('Meeting'),
  )
  const [dateTime, setDateTime] = React.useState<Date | undefined>(defaultDate)
  const [duration, setDuration] = React.useState<string>('')
  const [attendees, setAttendees] = React.useState<string>('')

  React.useEffect(() => {
    setTypeColor(getEventTypeColor(type))
  }, [type, getEventTypeColor])

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (!title || !type || !dateTime) return

    const d = new Date(dateTime)
    const dateOnly = new Date(d)
    dateOnly.setHours(0, 0, 0, 0)
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

    setEventTypeColor(type, typeColor)

    const payload: PlannerEvent = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type: type.trim(),
      date: dateOnly,
      time,
      durationMinutes: duration
        ? Math.max(0, parseInt(duration, 10))
        : undefined,
      attendees: attendees ? Math.max(0, parseInt(attendees, 10)) : undefined,
    }

    addEvent(payload)
    onClose()
  }

  return (
    <form id="add-event-form" onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Team Standup"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            placeholder="Meeting"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <TypeColorPicker typeColor={typeColor} setTypeColor={setTypeColor} />
      </div>

      <div className="space-y-2">
        <Label>Date &amp; time</Label>
        <DateTimePicker date={dateTime} setDate={setDateTime} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            placeholder="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendees">Attendees</Label>
          <Input
            id="attendees"
            type="number"
            min={0}
            placeholder="6"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>
      </div>
    </form>
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

function TypeColorPicker({
  typeColor,
  setTypeColor,
}: {
  typeColor: PlannerTypeColor
  setTypeColor: (c: PlannerTypeColor) => void
}) {
  const COLOR_LABELS: Record<PlannerTypeColor, string> = {
    default: 'Default',
    gray: 'Gray',
    brown: 'Brown',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    purple: 'Purple',
    pink: 'Pink',
    red: 'Red',
  }

  function ColorDot({ c }: { c: PlannerTypeColor }) {
    const HEX: Record<PlannerTypeColor, string> = {
      default: '#E5E7EB',
      gray: '#9CA3AF',
      brown: '#8B4513',
      orange: '#F97316',
      yellow: '#F59E0B',
      green: '#10B981',
      blue: '#3B82F6',
      purple: '#8B5CF6',
      pink: '#EC4899',
      red: '#EF4444',
    }
    return (
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-full border border-black/10"
        style={{ backgroundColor: HEX[c] }}
      />
    )
  }

  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <span className="mr-2">
              <ColorDot c={typeColor} />
            </span>
            <span className="truncate">{COLOR_LABELS[typeColor]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel>Colors</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={typeColor}
            onValueChange={(v) => setTypeColor(v as PlannerTypeColor)}
          >
            {(Object.keys(COLOR_LABELS) as Array<PlannerTypeColor>).map((c) => (
              <DropdownMenuRadioItem key={c} value={c}>
                <span className="mr-2">
                  <ColorDot c={c} />
                </span>
                {COLOR_LABELS[c]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function AddTaskInlineForm({
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
    onAddTask({ title: title.trim(), description, due, priority })
    onClose()
  }

  return (
    <form id="add-task-form" onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          placeholder="Complete project documentation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc">Description</Label>
        <Textarea
          id="task-desc"
          placeholder="Add task details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
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

      <div className="space-y-2">
        <Label>Due date</Label>
        <DatePicker date={due} setDate={setDue} />
      </div>
    </form>
  )
}
