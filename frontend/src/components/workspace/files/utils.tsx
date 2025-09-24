import { File, FileText, Image } from 'lucide-react'
import type { FileItem } from '@/static/workspace/files'

export function getFileIcon(item: FileItem) {
  switch (item.fileType) {
    case 'document':
      return <FileText className="h-5 w-5 text-blue-600" />
    case 'image':
      return <Image className="h-5 w-5 text-green-600" />
    case 'pdf':
      return <File className="h-5 w-5 text-red-600" />
    case 'spreadsheet':
      return <FileText className="h-5 w-5 text-green-700" />
    case 'presentation':
      return <FileText className="h-5 w-5 text-orange-600" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getFileTypeColor = (fileType?: string) => {
  switch (fileType) {
    case 'document':
      return 'bg-blue-100 text-blue-800'
    case 'image':
      return 'bg-green-100 text-green-800'
    case 'pdf':
      return 'bg-red-100 text-red-800'
    case 'spreadsheet':
      return 'bg-green-100 text-green-800'
    case 'presentation':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
