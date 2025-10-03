import type { FileItem } from '@/store/files/files-store'

export const mockFilesTestData: Array<FileItem> = [
  {
    id: '1',
    name: 'Document1.docx',
    fileType: 'document',
    size: 2.4e6,
    modifiedAt: '2024-01-12T15:30:00Z',
    modifiedBy: { name: 'User A' },
    starred: true,
  },
  {
    id: '2',
    name: 'Image1.jpg',
    fileType: 'image',
    size: 8.2e6,
    modifiedAt: '2024-01-11T16:45:00Z',
    modifiedBy: { name: 'User B' },
    starred: false,
  },
  {
    id: '3',
    name: 'Spreadsheet1.xlsx',
    fileType: 'spreadsheet',
    size: 1.1e6,
    modifiedAt: '2024-01-10T11:30:00Z',
    modifiedBy: { name: 'User A' },
    starred: true,
  },
  {
    id: '4',
    name: 'File1.pdf',
    fileType: 'pdf',
    size: 5.7e6,
    modifiedAt: '2024-01-09T09:15:00Z',
    modifiedBy: { name: 'User C' },
    starred: false,
  },
]
