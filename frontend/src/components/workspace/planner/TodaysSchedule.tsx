import * as React from 'react'
import { Clock, Users } from 'lucide-react'
import type {
  PlannerEvent,
  PlannerTypeColor,
} from '@/store/planner/planner-store'

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

function to12h(hhmm: string) {
  const [hh, mm] = hhmm.split(':')
  let h = Number(hh)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${mm} ${ampm}`
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
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2 text-base font-medium mb-2">
          <span>Today's Schedule</span>
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
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
