import * as React from 'react'
import type {
  PlannerEvent,
  PlannerTypeColor,
} from '@/store/planner/planner-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/workspace/planner/date-time-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { plannerActions, usePlannerStore } from '@/store/planner/planner-store'

/* color dot UI */
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

export function AddEventDialog({
  open,
  onOpenChange,
  defaultDate,
  trigger,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultDate?: Date
  trigger?: React.ReactNode
}) {
  const getEventTypeColor = usePlannerStore((s) => s.getEventTypeColor)
  const setEventTypeColor = usePlannerStore((s) => s.setEventTypeColor)

  const [title, setTitle] = React.useState('')
  const [type, setType] = React.useState('Meeting')
  const [typeColor, setTypeColor] = React.useState<PlannerTypeColor>(
    getEventTypeColor('Meeting'),
  )
  const [dateTime, setDateTime] = React.useState<Date | undefined>(
    defaultDate ?? new Date(),
  )
  const [duration, setDuration] = React.useState<string>('')
  const [attendees, setAttendees] = React.useState<string>('')

  React.useEffect(() => {
    setTypeColor(getEventTypeColor(type))
  }, [type, getEventTypeColor])

  function toTimeString(d: Date) {
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (!title || !type || !dateTime) return

    const dt = new Date(dateTime)
    const onlyDate = new Date(dt)
    onlyDate.setHours(0, 0, 0, 0)

    const event: PlannerEvent = {
      id: crypto.randomUUID(), // fixes “id missing” error
      title: title.trim(),
      type: type.trim(),
      date: onlyDate,
      time: toTimeString(dt),
      durationMinutes: duration
        ? Math.max(0, parseInt(duration, 10))
        : undefined,
      attendees: attendees ? Math.max(0, parseInt(attendees, 10)) : undefined,
    }

    setEventTypeColor(event.type, typeColor)
    plannerActions.addScheduleItem(event) // typed alias of addEvent
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new calendar event.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-event-dialog-form"
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="evt-title">Title</Label>
            <Input
              id="evt-title"
              placeholder="Team Standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="evt-type">Type</Label>
              <Input
                id="evt-type"
                placeholder="Meeting"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

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
                    {(Object.keys(COLOR_LABELS) as Array<PlannerTypeColor>).map(
                      (c) => (
                        <DropdownMenuRadioItem key={c} value={c}>
                          <span className="mr-2">
                            <ColorDot c={c} />
                          </span>
                          {COLOR_LABELS[c]}
                        </DropdownMenuRadioItem>
                      ),
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date &amp; time</Label>
            <DateTimePicker date={dateTime} setDate={setDateTime} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="evt-duration">Duration (minutes)</Label>
              <Input
                id="evt-duration"
                type="number"
                min={0}
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-attendees">Attendees</Label>
              <Input
                id="evt-attendees"
                type="number"
                min={0}
                placeholder="6"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
