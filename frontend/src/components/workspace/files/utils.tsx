import { File, FileText, Image } from 'lucide-react'
import type { FileItem } from '@/store/files/files-store'

export const getFileTypeFromMimeType = (
  mimeType: string,
): FileItem['fileType'] => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf')) return 'pdf'
  if (
    mimeType.includes('text/') ||
    mimeType.includes('javascript') ||
    mimeType.includes('json')
  )
    return 'text'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return 'presentation'
  if (mimeType.includes('document') || mimeType.includes('word'))
    return 'document'
  return 'document'
}

export const getFileIcon = (item: FileItem) => {
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
    case 'text':
      return <FileText className="h-5 w-5 text-gray-600" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
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
    case 'text':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  // const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
