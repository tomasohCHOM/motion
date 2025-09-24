import { Store } from '@tanstack/react-store'

type FilePickerState = {
  isOpen: boolean
}

export const filePickerStore = new Store<FilePickerState>({ isOpen: false })

export const filePickerActions = {
  toggleDialog: () => {
    filePickerStore.setState((prev) => ({ isOpen: !prev.isOpen }))
  },
}
