'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function DateTimePicker({
  date,
  setDate,
}: {
  date: Date | undefined
  setDate: (d: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  const [time, setTime] = React.useState(() => {
    const base = date ?? new Date()
    return `${String(base.getHours()).padStart(2, '0')}:${String(
      base.getMinutes(),
    ).padStart(2, '0')}`
  })

  React.useEffect(() => {
    if (date) {
      setTime(
        `${String(date.getHours()).padStart(2, '0')}:${String(
          date.getMinutes(),
        ).padStart(2, '0')}`,
      )
    }
  }, [date])

  const apply = (nextDate: Date | undefined, hhmm: string) => {
    if (!nextDate) {
      setDate(undefined)
      return
    }
    const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10))
    const merged = new Date(nextDate)
    merged.setHours(
      Number.isFinite(h) ? h : 0,
      Number.isFinite(m) ? m : 0,
      0,
      0,
    )
    setDate(merged)
  }

  return (
    <div className="flex w-full items-end gap-4">
      <div className="flex-1">
        <Label htmlFor="date-picker" className="px-1 font-semibold">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-full justify-start text-left font-normal mt-2 h-12 px-4 text-base"
            >
              {date
                ? date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select date'}
              <ChevronDownIcon className="h-4 w-4 opacity-50 ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(d) => {
                setOpen(false)
                if (d) apply(d, time)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1">
        <Label htmlFor="time-picker" className="px-1 font-semibold">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={time}
          onChange={(e) => {
            const next = e.target.value
            setTime(next)
            if (date) apply(date, next)
          }}
          className="w-full bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none mt-2 h-12 px-4 text-base"
        />
      </div>
    </div>
  )
}
