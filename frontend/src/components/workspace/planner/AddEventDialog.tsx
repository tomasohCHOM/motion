import * as React from 'react'
import type { ScheduleItem } from '@/store/planner/planner-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { plannerActions } from '@/store/planner/planner-store'
import { DateTimePicker } from '@/components/workspace/planner/date-time-picker'

interface AddEventDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedDate: Date
}

export function AddEventDialog({
  isOpen,
  onOpenChange,
  selectedDate,
}: AddEventDialogProps) {
  const [title, setTitle] = React.useState('')
  const [type, setType] = React.useState('Meeting')
  const [dateTime, setDateTime] = React.useState<Date | undefined>(selectedDate)

  React.useEffect(() => {
    if (isOpen) {
      const newDateTime = new Date(selectedDate.getTime())
      // Default to the next hour from now, or 9 AM if it's in the past
      const now = new Date()
      const nextHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
      )
      if (newDateTime.getTime() < nextHour.getTime()) {
        newDateTime.setHours(9, 0, 0, 0)
      } else {
        newDateTime.setHours(nextHour.getHours(), 0, 0, 0)
      }
      setDateTime(newDateTime)
    }
  }, [isOpen, selectedDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !type || !dateTime) return

    const date = new Date(dateTime)
    date.setHours(0, 0, 0, 0)
    const time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(
      dateTime.getMinutes(),
    ).padStart(2, '0')}`

    plannerActions.addScheduleItem({
      title,
      type,
      date,
      time,
    })

    setTitle('')
    setType('Meeting')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new schedule item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <DateTimePicker date={dateTime} setDate={setDateTime} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Meeting, Deadline"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
