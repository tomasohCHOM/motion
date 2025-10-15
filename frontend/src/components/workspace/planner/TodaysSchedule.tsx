import * as React from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import type {
  PlannerEvent,
  PlannerTypeColor,
} from '@/store/planner/planner-store'
import { usePlannerStore } from '@/store/planner/planner-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateTimePicker } from '@/components/workspace/planner/date-time-picker'

/* type chip styles */
const CHIP_STYLES: Record<
  PlannerTypeColor,
  { bg: string; text: string; ring: string }
> = {
  default: {
    bg: 'rgba(229,231,235,0.5)',
    text: '#111827',
    ring: 'rgba(156,163,175,0.35)',
  },
  gray: {
    bg: 'rgba(156,163,175,0.18)',
    text: '#374151',
    ring: 'rgba(156,163,175,0.35)',
  },
  brown: {
    bg: 'rgba(139,69,19,0.12)',
    text: '#7B3E15',
    ring: 'rgba(139,69,19,0.22)',
  },
  orange: {
    bg: 'rgba(249,115,22,0.14)',
    text: '#9A3412',
    ring: 'rgba(249,115,22,0.25)',
  },
  yellow: {
    bg: 'rgba(245,158,11,0.15)',
    text: '#92400E',
    ring: 'rgba(245,158,11,0.25)',
  },
  green: {
    bg: 'rgba(16,185,129,0.14)',
    text: '#065F46',
    ring: 'rgba(16,185,129,0.25)',
  },
  blue: {
    bg: 'rgba(59,130,246,0.14)',
    text: '#1D4ED8',
    ring: 'rgba(59,130,246,0.25)',
  },
  purple: {
    bg: 'rgba(139,92,246,0.14)',
    text: '#5B21B6',
    ring: 'rgba(139,92,246,0.25)',
  },
  pink: {
    bg: 'rgba(236,72,153,0.14)',
    text: '#9D174D',
    ring: 'rgba(236,72,153,0.25)',
  },
  red: {
    bg: 'rgba(239,68,68,0.14)',
    text: '#991B1B',
    ring: 'rgba(239,68,68,0.25)',
  },
}

function TypeChip({
  c,
  children,
}: {
  c: PlannerTypeColor
  children: React.ReactNode
}) {
  const s = CHIP_STYLES[c]
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium ring-1"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
      }}
    >
      {children}
    </span>
  )
}

/* "HH:MM" -> "h:MM AM/PM" */
function to12h(hhmm: string) {
  const [hh, mm] = hhmm.split(':')
  let h = Number(hh)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${mm} ${ampm}`
}

/* combine event.date + event.time to a JS Date */
function toDate(date: Date, time: string) {
  const [hh, mm] = time.split(':').map((n) => Number(n))
  const d = new Date(date)
  d.setHours(hh, mm, 0, 0)
  return d
}

/* color picker used in edit dialog */
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
function TypeColorPicker({
  value,
  onChange,
}: {
  value: PlannerTypeColor
  onChange: (v: PlannerTypeColor) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
        >
          <span className="mr-2">
            <ColorDot c={value} />
          </span>
          <span className="truncate">{COLOR_LABELS[value]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="start">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground px-2">Colors</div>
          <div className="mt-2 grid grid-cols-1">
            {(Object.keys(COLOR_LABELS) as Array<PlannerTypeColor>).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c)
                  setOpen(false)
                }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent text-sm text-foreground"
              >
                <ColorDot c={c} />
                {COLOR_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TodaysSchedule({
  events,
  getTypeColor,
  ClockIcon = Clock,
  UsersIcon = Users,
}: {
  events: Array<PlannerEvent>
  getTypeColor: (type: string) => PlannerTypeColor
  ClockIcon?: typeof Clock
  UsersIcon?: typeof Users
}) {
  const removeEvent = usePlannerStore((s) => s.removeEvent)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 text-base font-medium mb-2">
          <span>Today&apos;s Schedule</span>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-lg border p-6 text-muted-foreground">
              No events for this day.
            </div>
          ) : (
            events.map((e) => {
              const color = getTypeColor(e.type)
              return (
                <div key={e.id} className="flex gap-3 rounded-xl border p-4">
                  <div className="w-24 shrink-0 text-sm text-muted-foreground tabular-nums pt-1">
                    {to12h(e.time)}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm sm:text-base font-semibold">
                      {e.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {typeof e.durationMinutes === 'number' && (
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>{e.durationMinutes}m</span>
                        </span>
                      )}
                      {typeof e.attendees === 'number' && (
                        <span className="inline-flex items-center gap-1">
                          <UsersIcon className="h-3.5 w-3.5" />
                          <span>{e.attendees}</span>
                        </span>
                      )}
                      <TypeChip c={color}>{e.type.toLowerCase()}</TypeChip>
                    </div>
                  </div>

                  <EventActions event={e} onDelete={() => removeEvent(e.id)} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function EventActions({
  event,
  onDelete,
}: {
  event: PlannerEvent
  onDelete: () => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditEventDialog open={open} onOpenChange={setOpen} original={event} />
    </>
  )
}

function EditEventDialog({
  open,
  onOpenChange,
  original,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  original: PlannerEvent
}) {
  const updateEvent = usePlannerStore((s) => (s as any).updateEvent)
  const setEventTypeColor = usePlannerStore((s) => s.setEventTypeColor)
  const getEventTypeColor = usePlannerStore((s) => s.getEventTypeColor)

  const [title, setTitle] = React.useState(original.title)
  const [type, setType] = React.useState(original.type)
  const [color, setColor] = React.useState<PlannerTypeColor>(
    getEventTypeColor(original.type),
  )

  // IMPORTANT: allow undefined to satisfy DateTimePicker's prop contract
  const [dateTime, setDateTime] = React.useState<Date | undefined>(
    toDate(original.date, original.time),
  )

  const [duration, setDuration] = React.useState<string>(
    original.durationMinutes?.toString() ?? '',
  )
  const [attendees, setAttendees] = React.useState<string>(
    original.attendees?.toString() ?? '',
  )

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateTime) return // guard for typing

    const d = new Date(dateTime)
    const dateOnly = new Date(d)
    dateOnly.setHours(0, 0, 0, 0)
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes(),
    ).padStart(2, '0')}`

    setEventTypeColor(type, color)

    const updated: PlannerEvent = {
      id: original.id,
      title: title.trim(),
      type: type.trim(),
      date: dateOnly,
      time,
      durationMinutes: duration
        ? Math.max(0, parseInt(duration, 10))
        : undefined,
      attendees: attendees ? Math.max(0, parseInt(attendees, 10)) : undefined,
    }

    updateEvent(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription className="sr-only">
            Change the event details and save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="e-title">Title</Label>
            <Input
              id="e-title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-type">Type</Label>
              <Input
                id="e-type"
                value={type}
                onChange={(ev) => setType(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <TypeColorPicker value={color} onChange={setColor} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date &amp; time</Label>
            <DateTimePicker date={dateTime} setDate={setDateTime} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-duration">Duration (minutes)</Label>
              <Input
                id="e-duration"
                type="number"
                min={0}
                value={duration}
                onChange={(ev) => setDuration(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-attendees">Attendees</Label>
              <Input
                id="e-attendees"
                type="number"
                min={0}
                value={attendees}
                onChange={(ev) => setAttendees(ev.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
