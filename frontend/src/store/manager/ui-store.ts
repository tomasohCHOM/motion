import { Store } from '@tanstack/react-store'

type DialogState = {
  isDialogOpen: boolean
}

export const dialogStore = new Store<DialogState>({
  isDialogOpen: false,
})

export const dialogActions = {
  toggleDialog: () => {
    dialogStore.setState((state) => ({
      ...state,
      isDialogOpen: !state.isDialogOpen,
    }))
  },
}
