import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TodaysOverview } from '@/components/workspace/planner/TodaysOverview'

describe('TodaysOverview', () => {
  it('renders rows with labels on left, counts on right', () => {
    render(
      <TodaysOverview
        total={3}
        typeCounts={[
          { label: 'Meetings', count: 2 },
          { label: 'Deadlines', count: 1 },
        ]}
      />,
    )

    expect(screen.getByText(/Today'?s Overview/)).toBeInTheDocument()
    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Meetings')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Deadlines')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
