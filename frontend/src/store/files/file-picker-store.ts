import { Store } from '@tanstack/react-store'
import type { FileItem } from './files-store'

type FilePickerState = {
  isOpen: boolean
  selectedFile: FileItem | null
  isUploading: boolean
}

export const filePickerStore = new Store<FilePickerState>({
  isOpen: false,
  selectedFile: null,
  isUploading: false,
})

export const filePickerActions = {
  openDialog: () => {
    filePickerStore.setState((prev) => ({
      ...prev,
      isOpen: true,
      selectedFile: null,
      isUploading: false,
    }))
  },

  closeDialog: () => {
    filePickerStore.setState((prev) => ({
      ...prev,
      isOpen: false,
      selectedFile: null,
      isUploading: false,
    }))
  },

  toggleDialog: (isOpen?: boolean) => {
    filePickerStore.setState((prev) => ({
      ...prev,
      selectedFile: isOpen === false ? null : prev.selectedFile,
      isOpen: isOpen !== undefined ? isOpen : !prev.isOpen,
    }))
  },

  addFile: (file: FileItem) => {
    filePickerStore.setState((state) => ({
      ...state,
      selectedFile: file,
    }))
  },

  removeFile: () => {
    filePickerStore.setState((state) => ({
      ...state,
      selectedFile: null,
    }))
  },
}
