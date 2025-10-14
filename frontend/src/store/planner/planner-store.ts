import { Store } from '@tanstack/store'
import * as React from 'react'

export type PlannerTypeColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'

export interface PlannerEvent {
  id: string
  title: string
  type: string
  date: Date
  time: string // "HH:MM"
  durationMinutes?: number
  attendees?: number
}

type PlannerState = {
  events: Array<PlannerEvent>
  typeColors: Record<string, PlannerTypeColor>
}

type PlannerActions = {
  addEvent: (event: PlannerEvent) => void
  addScheduleItem: (event: PlannerEvent) => void // alias for backwards compatibility
  setEventTypeColor: (typeLabel: string, color: PlannerTypeColor) => void
  getEventTypeColor: (typeLabel: string) => PlannerTypeColor
  removeEvent: (id: string) => void
}

const plannerStore: Store<PlannerState> = new Store<PlannerState>({
  events: [],
  typeColors: {},
})

const norm = (s: string) => s.trim().toLowerCase()

const actions: PlannerActions = {
  addEvent(event) {
    plannerStore.setState((s) => ({
      ...s,
      events: [
        ...s.events,
        { ...event, date: new Date(event.date), time: event.time },
      ],
    }))
  },

  addScheduleItem(event) {
    plannerStore.setState((s) => ({
      ...s,
      events: [
        ...s.events,
        { ...event, date: new Date(event.date), time: event.time },
      ],
    }))
  },

  setEventTypeColor(typeLabel, color) {
    const key = norm(typeLabel)
    plannerStore.setState((s) => ({
      ...s,
      typeColors: { ...s.typeColors, [key]: color },
    }))
  },

  getEventTypeColor(typeLabel): PlannerTypeColor {
    const key = norm(typeLabel)
    return plannerStore.state.typeColors[key] ?? 'default'
  },

  removeEvent(id) {
    plannerStore.setState((s) => ({
      ...s,
      events: s.events.filter((e) => e.id !== id),
    }))
  },
}

export function usePlannerStore<T>(
  selector: (state: PlannerState & PlannerActions) => T,
): T {
  const state = React.useSyncExternalStore(
    (onChange) => plannerStore.subscribe(onChange),
    () => plannerStore.state,
    () => plannerStore.state,
  )
  const snapshot = React.useMemo(() => ({ ...state, ...actions }), [state])
  return selector(snapshot)
}

export function getPlannerStore(): Store<PlannerState> {
  return plannerStore
}

export const plannerActions: PlannerActions = actions

export type { PlannerState, PlannerActions }
