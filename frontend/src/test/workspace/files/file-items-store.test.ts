import { describe, expect, it } from 'vitest'
import { fileItemsActions, fileItemsStore } from '@/store/files/files-store'

describe('fileItemsStore', () => {
  it('should add a file', () => {
    fileItemsActions.addFile({
      id: '1',
      name: 'test',
      fileType: 'document',
      size: 1000,
      modifiedAt: '2024-01-15',
      modifiedBy: { name: 'Test User' },
      starred: false,
    })
    expect(fileItemsStore.state.fileItems).toHaveLength(1)
  })

  it('should add multiple files', () => {
    fileItemsActions.addFile({
      id: '2',
      name: 'test2',
      fileType: 'document',
      size: 1000,
      modifiedAt: '2024-01-15',
      modifiedBy: { name: 'Test User' },
      starred: false,
    })
    expect(fileItemsStore.state.fileItems).toHaveLength(2)
  })

  it('should remove a file', () => {
    fileItemsActions.removeFile('1')
    expect(fileItemsStore.state.fileItems).toHaveLength(1)
  })

  it('should toggle the star for a file', () => {
    fileItemsActions.toggleStar('2')
    expect(fileItemsStore.state.fileItems[0].starred).toBe(true)
  })
})
