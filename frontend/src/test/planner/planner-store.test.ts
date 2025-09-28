import { beforeEach, describe, expect, it } from 'vitest'

import { plannerActions, plannerStore } from '../../store/planner-store'
import type { Block } from '../../store/planner-store'

// Reset store state before each test to ensure isolation
beforeEach(() => {
  plannerStore.setState(() => ({
    blocks: [
      { id: '1', type: 'heading', content: 'Initial Heading' },
      { id: '2', type: 'paragraph', content: 'Initial Paragraph' },
      { id: '3', type: 'todo', content: 'Initial Todo', isCompleted: false },
    ],
  }))
})

describe('plannerStore actions', () => {
  it('should add a new block after a target block', () => {
    const newBlock: Block = {
      id: '4',
      type: 'paragraph',
      content: 'Newly Added Block',
    }
    const targetBlockId = '2'

    // Act
    plannerActions.addBlock(newBlock, targetBlockId)

    // Assert
    const state = plannerStore.state
    expect(state.blocks.length).toBe(4)
    const newBlockIndex = state.blocks.findIndex(
      (b: Block) => b.id === newBlock.id,
    )
    const targetBlockIndex = state.blocks.findIndex(
      (b: Block) => b.id === targetBlockId,
    )
    expect(newBlockIndex).toBe(targetBlockIndex + 1)
    expect(state.blocks[newBlockIndex]).toEqual(newBlock)
  })

  it('should update an existing block', () => {
    const updatedContent = 'Updated Content'
    const blockToUpdateId = '2'

    // Act
    plannerActions.updateBlock({ id: blockToUpdateId, content: updatedContent })

    // Assert
    const state = plannerStore.state
    const updatedBlock = state.blocks.find(
      (b: Block) => b.id === blockToUpdateId,
    )
    expect(updatedBlock).toBeDefined()
    expect(updatedBlock?.content).toBe(updatedContent)
  })

  it('should toggle the isCompleted status of a todo block', () => {
    const todoBlockId = '3'
    const initialTodo = plannerStore.state.blocks.find(
      (b: Block) => b.id === todoBlockId,
    )
    expect(initialTodo?.isCompleted).toBe(false)

    // Act
    plannerActions.updateBlock({ id: todoBlockId, isCompleted: true })

    // Assert
    const state = plannerStore.state
    const updatedTodo = state.blocks.find((b: Block) => b.id === todoBlockId)
    expect(updatedTodo).toBeDefined()
    expect(updatedTodo?.isCompleted).toBe(true)
  })

  it('should delete a block', () => {
    const blockToDeleteId = '2'

    // Act
    plannerActions.deleteBlock(blockToDeleteId)

    // Assert
    const state = plannerStore.state
    const deletedBlock = state.blocks.find(
      (b: Block) => b.id === blockToDeleteId,
    )
    expect(deletedBlock).toBeUndefined()
    expect(state.blocks.length).toBe(2)
  })

  it('should reorder blocks correctly', () => {
    const initialBlocks = plannerStore.state.blocks
    const blockToMove = initialBlocks[0]
    expect(initialBlocks.map((b: Block) => b.id)).toEqual(['1', '2', '3'])

    // Act (move from index 0 to 2)
    plannerActions.reorderBlocks(0, 2)

    // Assert
    const state = plannerStore.state
    expect(state.blocks.length).toBe(3)
    expect(state.blocks[2].id).toBe(blockToMove.id)
    expect(state.blocks.map((b: Block) => b.id)).toEqual(['2', '3', '1'])
  })
})
