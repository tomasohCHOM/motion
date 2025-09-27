import { Store } from '@tanstack/react-store'

export type FileItem = {
  id: string
  name: string
  file?: File
  fileType:
    | 'document'
    | 'pdf'
    | 'image'
    | 'text'
    | 'spreadsheet'
    | 'presentation'
  size: number
  modifiedAt: string
  modifiedBy: {
    name: string
    avatar?: string
  }
  starred: boolean
}

type FileItemsState = {
  fileItems: Array<FileItem>
}

export const fileItemsStore = new Store<FileItemsState>({
  fileItems: [],
})

export const fileItemsActions = {
  addFile: (fileItem: FileItem) => {
    fileItemsStore.setState((prev) => ({
      ...prev,
      fileItems: [...prev.fileItems, fileItem],
    }))
  },

  removeFile: (fileItemId: string) => {
    fileItemsStore.setState((prev) => {
      return {
        ...prev,
        fileItems: prev.fileItems.filter(
          (fileItem) => fileItem.id !== fileItemId,
        ),
      }
    })
  },

  toggleStar: (fileItemId: string) => {
    fileItemsStore.setState((prev) => {
      return {
        ...prev,
        fileItems: prev.fileItems.map((fileItem) =>
          fileItem.id === fileItemId
            ? {
                ...fileItem,
                starred: !fileItem.starred,
              }
            : fileItem,
        ),
      }
    })
  },
}
