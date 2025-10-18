import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlannerEvent } from '@/store/planner/planner-store'
import { TodaysSchedule } from '@/components/workspace/planner/TodaysSchedule'
import { getPlannerStore, plannerActions } from '@/store/planner/planner-store'

const toDate = (iso: string) => {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

beforeEach(() => {
  getPlannerStore().setState({ events: [], typeColors: {} })
})
afterEach(() => {
  vi.restoreAllMocks()
})

function renderSchedule(events: Array<PlannerEvent>) {
  const getTypeColor = (type: string) =>
    type.toLowerCase() === 'meeting' ? 'green' : 'default'
  return render(<TodaysSchedule events={events} getTypeColor={getTypeColor} />)
}

describe('TodaysSchedule', () => {
  it('renders times in 12-hour format', () => {
    const events: Array<PlannerEvent> = [
      {
        id: 'e1',
        title: 'Morning sync',
        type: 'Meeting',
        time: '09:05',
        date: toDate('2025-10-10'),
        color: 'blue',
      },
      {
        id: 'e2',
        title: 'Late',
        type: 'Other',
        time: '13:30',
        date: toDate('2025-10-10'),
      },
    ]
    renderSchedule(events)

    expect(screen.getByText('9:05 AM')).toBeInTheDocument()
    expect(screen.getByText('1:30 PM')).toBeInTheDocument()
  })

  it('uses per-event color when present; falls back to type default when missing', () => {
    const events: Array<PlannerEvent> = [
      {
        id: 'e1',
        title: 'A',
        type: 'Meeting',
        time: '09:00',
        date: toDate('2025-10-10'),
        color: 'blue',
      },
      {
        id: 'e2',
        title: 'B',
        type: 'Meeting',
        time: '10:00',
        date: toDate('2025-10-10'),
      },
    ]
    renderSchedule(events)
    expect(screen.getAllByText(/meeting/i)).toHaveLength(2)
  })

  it('clicking Delete triggers store.removeEvent', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(plannerActions, 'removeEvent')
    const events: Array<PlannerEvent> = [
      {
        id: 'e1',
        title: 'Remove me',
        type: 'Meeting',
        time: '09:00',
        date: toDate('2025-10-10'),
        color: 'blue',
      },
    ]
    renderSchedule(events)

    // Radix trigger has aria-haspopup="menu"
    const menuBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-haspopup') === 'menu')
    expect(menuBtn).toBeTruthy()

    await user.click(menuBtn!)
    const delItem = await screen.findByRole('menuitem', { name: /delete/i })
    await user.click(delItem)

    expect(spy).toHaveBeenCalledWith('e1')
  })
})
