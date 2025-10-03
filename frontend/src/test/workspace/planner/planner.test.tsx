import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import PlannerPage from '@/routes/workspace/$workspaceId/planner/index'

// Mock TanStack Router's createFileRoute to isolate the component
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => ({
    component: PlannerPage,
  }),
}))

describe('PlannerPage', () => {
  // Use a fixed date to ensure tests are consistent
  const today = new Date('2025-10-26T10:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(today)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  it('renders the planner page with the current date and all sections', () => {
    render(<PlannerPage />)

    // Check for main headers
    expect(
      screen.getByRole('heading', { name: "Today's Schedule" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: "Today's Overview" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Upcoming Tasks' }),
    ).toBeInTheDocument()

    // Check if the current date is displayed
    expect(
      screen.getByRole('button', { name: formatDate(today) }),
    ).toBeInTheDocument()
  })

  it('navigates to the next day when the right chevron is clicked', () => {
    render(<PlannerPage />)

    // Find button by its accessible name (from the icon) or a more robust selector
    const nextDayButton = screen.getAllByRole('button')[2]
    fireEvent.click(nextDayButton)

    const nextDay = new Date(today)
    nextDay.setDate(today.getDate() + 1)

    expect(
      screen.getByRole('button', { name: formatDate(nextDay) }),
    ).toBeInTheDocument()
  })

  it('navigates to the previous day when the left chevron is clicked', () => {
    render(<PlannerPage />)
    const prevDayButton = screen.getAllByRole('button')[0]
    fireEvent.click(prevDayButton)

    const prevDay = new Date(today)
    prevDay.setDate(today.getDate() - 1)

    expect(
      screen.getByRole('button', { name: formatDate(prevDay) }),
    ).toBeInTheDocument()
  })

  it('resets to today when the "Today" button is clicked after navigating', () => {
    render(<PlannerPage />)
    const nextDayButton = screen.getAllByRole('button')[2]
    fireEvent.click(nextDayButton) // Go to tomorrow

    const todayButton = screen.getByRole('button', { name: 'Today' })
    fireEvent.click(todayButton)

    expect(
      screen.getByRole('button', { name: formatDate(today) }),
    ).toBeInTheDocument()
  })

  it('displays all mock schedule items and upcoming tasks', () => {
    render(<PlannerPage />)

    // Check for schedule items
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Design Review')).toBeInTheDocument()
    expect(screen.getByText('Project Deadline')).toBeInTheDocument()

    // Check for upcoming tasks
    expect(screen.getByText('Complete API Documentation')).toBeInTheDocument()
    expect(screen.getByText('Review Pull Requests')).toBeInTheDocument()
    expect(screen.getByText('Update Design System')).toBeInTheDocument()
  })

  it('opens the calendar popover when the date button is clicked', () => {
    render(<PlannerPage />)
    const dateButton = screen.getByRole('button', { name: formatDate(today) })
    fireEvent.click(dateButton)

    // Check if the calendar popover is visible by looking for a unique element inside it
    expect(screen.getByText('October')).toBeInTheDocument()
  })
})
