import { beforeEach, describe, expect, it } from 'vitest'
import {
  filePickerActions,
  filePickerStore,
} from '@/store/files/file-picker-store'
import { mockFilesTestData } from '@/test/testdata/files'

describe('filePickerStore', () => {
  beforeEach(() => {
    filePickerStore.setState({
      selectedFile: null,
      isOpen: false,
      isUploading: false,
    })
  })

  it('should add a selected file', () => {
    const file = mockFilesTestData[0]
    filePickerActions.addSelectedFile(file)
    expect(filePickerStore.state.selectedFile).toBe(file)
  })

  it('should remove a file', () => {
    const file = mockFilesTestData[0]
    filePickerActions.addSelectedFile(file)
    filePickerActions.removeSelectedFile()
    expect(filePickerStore.state.selectedFile).toBeNull()
  })

  it('should toggle the dialog', () => {
    const before = filePickerStore.state.isOpen
    filePickerActions.toggleDialog()
    expect(filePickerStore.state.isOpen).toBe(!before)
    filePickerActions.toggleDialog()
    expect(filePickerStore.state.isOpen).toBe(before)
  })

  it('should close the dialog', () => {
    filePickerStore.state.isOpen = true
    filePickerActions.closeDialog()
    expect(filePickerStore.state.isOpen).toBe(false)
  })

  it('should not break if removing a file when none is selected', () => {
    filePickerActions.removeSelectedFile()
    expect(filePickerStore.state.selectedFile).toBeNull()
  })
})
