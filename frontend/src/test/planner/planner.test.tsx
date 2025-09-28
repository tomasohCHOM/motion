import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as DndKitCore from '@dnd-kit/core'
import type * as DndKitSortable from '@dnd-kit/sortable'

import PlannerPage from '../../components/workspace/planner/planner'
import { type Block, plannerStore } from '../../store/planner-store'

// Mock DndContext and SortableContext as drag-and-drop is hard to test with RTL
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const original = await importOriginal<typeof DndKitCore>()
  return {
    ...original,
    DndContext: vi.fn(({ children }) => children),
  }
})

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const original = await importOriginal<typeof DndKitSortable>()
  return {
    ...original,
    SortableContext: vi.fn(({ children }) => children),
    useSortable: vi.fn(() => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    })),
  }
})

describe('PlannerPage Component', () => {
  beforeEach(() => {
    // Reset store state before each test
    plannerStore.setState(() => ({
      blocks: [
        { id: '1', type: 'heading', content: 'Meeting Notes' },
        { id: '2', type: 'todo', content: 'Review budget', isCompleted: false },
      ],
    }))
    // Mock the IntersectionObserver
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  })

  it('should render the main title and initial blocks from the store', () => {
    render(<PlannerPage />)

    // Assert header is rendered
    expect(
      screen.getByRole('heading', { name: /Planner/i }),
    ).toBeInTheDocument()

    // Assert initial blocks are rendered
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    expect(screen.getByText('Review budget')).toBeInTheDocument()
  })

  it('should toggle a todo item when the checkbox is clicked', () => {
    render(<PlannerPage />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    // Act
    fireEvent.click(checkbox)

    // Assert
    expect(checkbox).toBeChecked()
    const todoBlock = plannerStore.state.blocks.find((b: Block) => b.id === '2')
    expect(todoBlock?.isCompleted).toBe(true)
  })

  it('should delete a block when the delete button is clicked', () => {
    render(<PlannerPage />)

    // Ensure the block is initially present
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()

    // Find delete button
    const blockGroup = screen.getByText('Meeting Notes').closest('.group')
    const deleteButton = blockGroup?.querySelector(
      'button[aria-label="Delete block"]',
    )

    expect(deleteButton).not.toBeNull()

    // Act - click the delete button
    fireEvent.click(deleteButton!)

    // Assert
    expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument()
    const state = plannerStore.state
    expect(state.blocks.find((b: Block) => b.id === '1')).toBeUndefined()
    expect(state.blocks.length).toBe(1)
  })
})
