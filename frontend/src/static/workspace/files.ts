export type FileItem = {
  id: string
  name: string
  fileType: 'document' | 'image' | 'pdf' | 'spreadsheet' | 'presentation'
  size?: string
  modifiedAt: string
  modifiedBy: {
    name: string
    avatar?: string
  }
  starred: boolean
}

export const mockFilesTestData: Array<FileItem> = [
  {
    id: '1',
    name: 'Project Requirements.docx',
    fileType: 'document',
    size: '2.4 MB',
    modifiedAt: '2024-01-12T15:30:00Z',
    modifiedBy: { name: 'Tomas Oh' },
    starred: true,
  },
  {
    id: '2',
    name: 'Design Assets',
    fileType: 'document',
    size: '156 MB',
    modifiedAt: '2024-01-12T14:20:00Z',
    modifiedBy: { name: 'Donovan Bosson' },
    starred: false,
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    fileType: 'image',
    size: '8.2 MB',
    modifiedAt: '2024-01-11T16:45:00Z',
    modifiedBy: { name: 'Nathan Chen' },
    starred: false,
  },
  {
    id: '4',
    name: 'Q1 Budget.xlsx',
    fileType: 'spreadsheet',
    size: '1.1 MB',
    modifiedAt: '2024-01-10T11:30:00Z',
    modifiedBy: { name: 'Tomas Oh' },
    starred: true,
  },
  {
    id: '5',
    name: 'API Documentation.pdf',
    fileType: 'pdf',
    size: '5.7 MB',
    modifiedAt: '2024-01-09T09:15:00Z',
    modifiedBy: { name: 'Joshua Holman' },
    starred: false,
  },
]
