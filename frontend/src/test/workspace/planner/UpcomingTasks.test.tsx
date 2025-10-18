import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '@/store/planner/tasks-store'
import { UpcomingTasksCard } from '@/components/workspace/planner/UpcomingTasks'

const start = (iso: string) => {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

describe('UpcomingTasksCard', () => {
  it('renders tasks and toggles completion via checkbox', async () => {
    const onToggle = vi.fn()

    const tasks: Array<Task> = [
      {
        id: 't1',
        title: 'Doc',
        description: '',
        due: start('2025-10-10'),
        priority: 'medium',
        completed: false,
      },
      {
        id: 't2',
        title: 'Review',
        description: '',
        due: start('2025-10-11'),
        priority: 'low',
        completed: false,
      },
    ]

    render(
      <UpcomingTasksCard
        tasks={tasks}
        baseDate={start('2025-10-10')}
        onViewAll={() => {}}
        onToggleTask={onToggle}
      />,
    )

    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(firstCheckbox)
    expect(onToggle).toHaveBeenCalledWith('t1')
  })
})
