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
  closeDialog: () => {
    filePickerStore.setState((prev) => ({
      ...prev,
      isOpen: false,
      selectedFile: null,
      isUploading: false,
    }))
  },

  toggleDialog: () => {
    filePickerStore.setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }))
  },

  addSelectedFile: (file: FileItem) => {
    filePickerStore.setState((state) => ({
      ...state,
      selectedFile: file,
    }))
  },

  removeSelectedFile: () => {
    filePickerStore.setState((state) => ({
      ...state,
      selectedFile: null,
    }))
  },
}
