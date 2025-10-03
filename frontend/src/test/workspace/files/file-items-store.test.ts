import { beforeEach, describe, expect, it } from 'vitest'
import {
  fileItemsActions,
  fileItemsStore,
  type FileItem,
} from '@/store/files/files-store'
import { mockFilesTestData } from '@/static/workspace/files'

describe('fileItemsStore', () => {
  beforeEach(() => {
    fileItemsStore.setState({ fileItems: [...mockFilesTestData] })
  })

  it('should add a file', () => {
    const newFile: FileItem = {
      id: '99',
      name: 'New File.docx',
      fileType: 'document',
      size: 1000,
      modifiedAt: '2024-01-15T00:00:00Z',
      modifiedBy: { name: 'Test User' },
      starred: false,
    }
    fileItemsActions.addFile(newFile)
    expect(fileItemsStore.state.fileItems).toContainEqual(newFile)
    expect(fileItemsStore.state.fileItems).toHaveLength(
      mockFilesTestData.length + 1,
    )
  })

  it('should remove a file by its id', () => {
    const fileId = mockFilesTestData[0].id
    fileItemsActions.removeFile(fileId)

    expect(
      fileItemsStore.state.fileItems.find((f) => f.id === fileId),
    ).toBeUndefined()
    expect(fileItemsStore.state.fileItems).toHaveLength(
      mockFilesTestData.length - 1,
    )
  })

  it('should toggle the star for a file', () => {
    const fileId = mockFilesTestData[1].id
    const beforeStarred = fileItemsStore.state.fileItems.find(
      (f) => f.id === fileId,
    )?.starred

    fileItemsActions.toggleStar(fileId)
    const afterStarred = fileItemsStore.state.fileItems.find(
      (f) => f.id === fileId,
    )?.starred

    expect(afterStarred).toBe(!beforeStarred)
  })

  it('should handle multiple add operations', () => {
    const filesToAdd: Array<FileItem> = [
      {
        id: '100',
        name: 'Extra1.pdf',
        fileType: 'pdf',
        size: 2000,
        modifiedAt: '2024-01-16T00:00:00Z',
        modifiedBy: { name: 'Test User' },
        starred: false,
      },
      {
        id: '101',
        name: 'Extra2.jpg',
        fileType: 'image',
        size: 3000,
        modifiedAt: '2024-01-16T00:00:00Z',
        modifiedBy: { name: 'Test User' },
        starred: true,
      },
    ]

    filesToAdd.forEach((file) => fileItemsActions.addFile(file))

    expect(fileItemsStore.state.fileItems).toEqual(
      expect.arrayContaining(filesToAdd),
    )
    expect(fileItemsStore.state.fileItems).toHaveLength(
      mockFilesTestData.length + filesToAdd.length,
    )
  })
})
