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
  color?: PlannerTypeColor
}

type PlannerState = {
  events: Array<PlannerEvent>
  typeColors: Record<string, PlannerTypeColor>
}

type PlannerActions = {
  addEvent: (event: PlannerEvent) => void
  addScheduleItem: (event: PlannerEvent) => void
  updateEvent: (updated: PlannerEvent) => void
  setEventTypeColor: (typeLabel: string, color: PlannerTypeColor) => void
  getEventTypeColor: (typeLabel: string) => PlannerTypeColor
  removeEvent: (id: string) => void
}

const plannerStore: Store<PlannerState> = new Store<PlannerState>({
  events: [],
  typeColors: {},
})

const norm = (s: string) => s.trim().toLowerCase()
const resolveDefaultColor = (typeLabel: string): PlannerTypeColor =>
  plannerStore.state.typeColors[norm(typeLabel)] ?? 'default'

const actions: PlannerActions = {
  addEvent(event) {
    const color = event.color ?? resolveDefaultColor(event.type)
    plannerStore.setState((s) => ({
      ...s,
      events: [...s.events, { ...event, color, date: new Date(event.date) }],
    }))
  },

  addScheduleItem(event) {
    const color = event.color ?? resolveDefaultColor(event.type)
    plannerStore.setState((s) => ({
      ...s,
      events: [...s.events, { ...event, color, date: new Date(event.date) }],
    }))
  },

  updateEvent(updated) {
    const color = updated.color ?? resolveDefaultColor(updated.type)
    plannerStore.setState((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id === updated.id
          ? { ...updated, color, date: new Date(updated.date) }
          : e,
      ),
    }))
  },

  setEventTypeColor(typeLabel, color) {
    plannerStore.setState((s) => ({
      ...s,
      typeColors: { ...s.typeColors, [norm(typeLabel)]: color },
    }))
  },

  getEventTypeColor(typeLabel): PlannerTypeColor {
    return resolveDefaultColor(typeLabel)
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
