export type FileItem = {
  id: string
  name: string
  fileType:
    | 'document'
    | 'pdf'
    | 'image'
    | 'text'
    | 'spreadsheet'
    | 'presentation'
  size?: string
  modifiedAt: string
  modifiedBy: {
    name: string
    avatar?: string
  }
  starred: boolean
}
