import { beforeEach, describe, expect, it } from 'vitest'
import type {
  PlannerEvent,
  PlannerTypeColor,
} from '@/store/planner/planner-store'
import { getPlannerStore, plannerActions } from '@/store/planner/planner-store'

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const uid = () => `test-${Math.random().toString(16).slice(2)}`

beforeEach(() => {
  getPlannerStore().setState({ events: [], typeColors: {} })
})

function makeEvent(p: Partial<PlannerEvent> = {}): PlannerEvent {
  return {
    id: uid(),
    title: 'Event',
    type: 'Meeting',
    date: startOfDay(new Date('2025-10-10T00:00:00')),
    time: '09:05',
    ...p,
  }
}

describe('planner-store: event CRUD + colors', () => {
  it('adds an event and preserves its calendar date', () => {
    const ts = new Date('2025-10-10T15:45:00') // hours may be non-zero
    plannerActions.addEvent(makeEvent({ date: ts }))

    const { events } = getPlannerStore().state
    expect(events).toHaveLength(1)

    // Assert the calendar date (Y/M/D) rather than midnight normalization
    const d = events[0].date
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(9) // Oct = 9
    expect(d.getDate()).toBe(10)

    // Time string persisted separately
    expect(events[0].time).toBe('09:05')
  })

  it('addScheduleItem aliases addEvent', () => {
    const e = makeEvent({ id: 'X1' })
    plannerActions.addScheduleItem(e)
    expect(
      getPlannerStore().state.events.find((x) => x.id === 'X1'),
    ).toBeTruthy()
  })

  it('stores color PER EVENT, not globally', () => {
    const a = makeEvent({ id: 'A', type: 'Class', color: 'blue' })
    const b = makeEvent({ id: 'B', type: 'Class', color: 'red' })
    plannerActions.addEvent(a)
    plannerActions.addEvent(b)

    plannerActions.setEventTypeColor('Class', 'green')

    const { events } = getPlannerStore().state
    const A = events.find((e) => e.id === 'A')!
    const B = events.find((e) => e.id === 'B')!
    expect(A.color).toBe('blue')
    expect(B.color).toBe('red')
  })

  it('falls back to type default color if per-event color missing', () => {
    plannerActions.setEventTypeColor('Workshop', 'purple')
    plannerActions.addEvent(
      makeEvent({ id: 'C', type: 'Workshop', color: undefined }),
    )

    const C = getPlannerStore().state.events.find((e) => e.id === 'C')!
    const c: PlannerTypeColor = C.color!
    expect(c).toBe('purple')
  })

  it('updates an event in place', () => {
    const e = makeEvent({ id: 'U', title: 'Old' })
    plannerActions.addEvent(e)

    plannerActions.updateEvent({ ...e, title: 'New', color: 'orange' })
    const U = getPlannerStore().state.events.find((x) => x.id === 'U')!
    expect(U.title).toBe('New')
    const c: PlannerTypeColor = U.color!
    expect(c).toBe('orange')
  })

  it('removes an event', () => {
    const e1 = makeEvent({ id: '1' })
    const e2 = makeEvent({ id: '2' })
    plannerActions.addEvent(e1)
    plannerActions.addEvent(e2)

    plannerActions.removeEvent('1')
    const { events } = getPlannerStore().state
    expect(events).toHaveLength(1)
    expect(events[0].id).toBe('2')
  })

  it("getEventTypeColor returns 'default' when missing", () => {
    expect(plannerActions.getEventTypeColor('unknown')).toBe('default')
  })
})
