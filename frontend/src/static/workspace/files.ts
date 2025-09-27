import type { FileItem } from '@/store/files/files-store'

export const mockFilesTestData: Array<FileItem> = [
  {
    id: '1',
    name: 'Project Requirements.docx',
    fileType: 'document',
    size: 2.4e6,
    modifiedAt: '2024-01-12T15:30:00Z',
    modifiedBy: { name: 'Tomas Oh' },
    starred: true,
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    fileType: 'image',
    size: 8.2e6,
    modifiedAt: '2024-01-11T16:45:00Z',
    modifiedBy: { name: 'Nathan Chen' },
    starred: false,
  },
  {
    id: '4',
    name: 'Q1 Budget.xlsx',
    fileType: 'spreadsheet',
    size: 1.1e6,
    modifiedAt: '2024-01-10T11:30:00Z',
    modifiedBy: { name: 'Tomas Oh' },
    starred: true,
  },
  {
    id: '5',
    name: 'API Documentation.pdf',
    fileType: 'pdf',
    size: 5.7e6,
    modifiedAt: '2024-01-09T09:15:00Z',
    modifiedBy: { name: 'Joshua Holman' },
    starred: false,
  },
]
