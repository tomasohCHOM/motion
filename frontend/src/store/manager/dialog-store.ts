import type { WorkspaceTask } from '@/types/task'
import { Store } from '@tanstack/react-store'

type DialogState = {
  isOpen: boolean
  isAdding: boolean
  columnId?: string
  task?: WorkspaceTask
}

export const dialogStore = new Store<DialogState>({
  isOpen: false,
  isAdding: true,
  columnId: '',
  task: undefined,
})

export const dialogActions = {
  openAdd: (columnId?: string) => {
    dialogStore.setState(() => ({
      isOpen: true,
      isAdding: true,
      columnId: columnId,
      task: undefined,
    }))
  },
  openEdit: (columnId: string, task: WorkspaceTask) => {
    dialogStore.setState(() => ({
      isOpen: true,
      isAdding: false,
      columnId: columnId,
      task,
    }))
  },
  close: () => {
    dialogStore.setState(() => ({
      isOpen: false,
      isAdding: false,
      columnId: undefined,
      task: undefined,
    }))
  },
}
