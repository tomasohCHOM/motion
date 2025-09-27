import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import type { FileItem } from '@/store/files/files-store'
import {
  formatDate,
  formatFileSize,
  getFileIcon,
  getFileTypeColor,
  getFileTypeFromMimeType,
} from '@/components/workspace/files/utils'

// Build a valid FileItem
const makeFileItem = (overrides: Partial<FileItem> = {}): FileItem => ({
  id: '1',
  name: 'test',
  fileType: 'document',
  size: 1000,
  modifiedAt: '2024-01-15T00:00:00Z',
  modifiedBy: {
    name: 'Test User',
  },
  starred: false,
  ...overrides,
})

describe('getFileTypeFromMimeType', () => {
  it('should detect image', () => {
    expect(getFileTypeFromMimeType('image/png')).toBe('image')
  })

  it('should detect pdf', () => {
    expect(getFileTypeFromMimeType('application/pdf')).toBe('pdf')
  })

  it('should detect text', () => {
    expect(getFileTypeFromMimeType('text/plain')).toBe('text')
    expect(getFileTypeFromMimeType('application/json')).toBe('text')
    expect(getFileTypeFromMimeType('application/javascript')).toBe('text')
  })

  it('should detect spreadsheet', () => {
    expect(getFileTypeFromMimeType('application/vnd.ms-excel')).toBe(
      'spreadsheet',
    )
  })

  it('should detect presentation', () => {
    expect(getFileTypeFromMimeType('application/vnd.ms-powerpoint')).toBe(
      'presentation',
    )
  })

  it('should detect document', () => {
    expect(getFileTypeFromMimeType('application/msword')).toBe('document')
  })

  it('should default to document', () => {
    expect(getFileTypeFromMimeType('unknown/type')).toBe('document')
  })
})

describe('getFileIcon', () => {
  const renderIcon = (fileType: FileItem['fileType']) => {
    const item = makeFileItem({ fileType })
    return render(getFileIcon(item))
  }

  it('renders image icon with green class', () => {
    const { container } = renderIcon('image')
    const svg = container.querySelector('svg')
    expect(svg?.classList).toContain('text-green-600')
  })

  it('renders pdf icon with red class', () => {
    const { container } = renderIcon('pdf')
    const svg = container.querySelector('svg')
    expect(svg?.classList).toContain('text-red-600')
  })

  it('renders text icon with gray class', () => {
    const { container } = renderIcon('text')
    const svg = container.querySelector('svg')
    expect(svg?.classList).toContain('text-gray-600')
  })

  it('renders default icon for unknown type', () => {
    // @ts-expect-error forcing an invalid type for testing
    const { container } = renderIcon('unknown')
    const svg = container.querySelector('svg')
    expect(svg?.classList).toContain('text-gray-500')
  })
})

describe('getFileTypeColor', () => {
  it('returns correct colors', () => {
    expect(getFileTypeColor('document')).toBe('bg-blue-100 text-blue-800')
    expect(getFileTypeColor('image')).toBe('bg-green-100 text-green-800')
    expect(getFileTypeColor('pdf')).toBe('bg-red-100 text-red-800')
    expect(getFileTypeColor('spreadsheet')).toBe('bg-green-100 text-green-800')
    expect(getFileTypeColor('presentation')).toBe(
      'bg-orange-100 text-orange-800',
    )
    expect(getFileTypeColor('text')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns default colors for unknown type', () => {
    expect(getFileTypeColor('unknown')).toBe('bg-gray-100 text-gray-800')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2025-01-15')).toBe('Jan 15, 2025')
  })
})

describe('formatFileSize', () => {
  it('handles 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('formats KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
  })

  it('formats GB', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('rounds to 1 decimal place', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})
