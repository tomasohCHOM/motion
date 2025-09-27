import { describe, expect, it } from 'vitest'
import type { FileItem } from '@/store/files/files-store'
import {
  filePickerActions,
  filePickerStore,
} from '@/store/files/file-picker-store'

describe('filePickerStore', () => {
  it('should add a file', () => {
    const selectedFile = {
      id: '1',
      name: 'test',
      fileType: 'document' as FileItem['fileType'],
      size: 1000,
      modifiedAt: '2024-01-15',
      modifiedBy: { name: 'Test User' },
      starred: false,
    }

    filePickerActions.addSelectedFile(selectedFile)
    expect(filePickerStore.state.selectedFile).toBe(selectedFile)
  })

  it('should remove a file', () => {
    filePickerActions.removeSelectedFile()
    expect(filePickerStore.state.selectedFile).toBe(null)
  })

  it('should toggle the dialog', () => {
    filePickerActions.toggleDialog()
    expect(filePickerStore.state.isOpen).toBe(true)
  })

  it('should close the dialog', () => {
    filePickerActions.closeDialog()
    expect(filePickerStore.state.isOpen).toBe(false)
  })
})
