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
