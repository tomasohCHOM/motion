import { Download, Upload, X } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import {
  formatFileSize,
  getFileIcon,
  getFileTypeColor,
  getFileTypeFromMimeType,
} from './utils'
import type { FileItem } from '@/store/files/files-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  filePickerActions,
  filePickerStore,
} from '@/store/files/file-picker-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PreviewFileCard: React.FC<{ file: FileItem }> = ({ file }) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getFileIcon(file)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <Badge
                variant="secondary"
                className={`text-xs ${getFileTypeColor(file.fileType)}`}
              >
                {file.fileType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={filePickerActions.removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FilePicker() {
  const { isOpen, selectedFile } = useStore(filePickerStore)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleSelectedFile = useCallback(
    (file: File) => {
      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        fileType: getFileTypeFromMimeType(file.type),
        size: file.size,
        modifiedAt: new Date(file.lastModified).toISOString(),
        modifiedBy: {
          name: 'Tomas Oh',
        },
        starred: false,
      }
      filePickerActions.addFile(fileItem)
    },
    [selectedFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleSelectedFile(files[0])
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectedFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={filePickerActions.toggleDialog}>
      <DialogContent className="md:max-w-[40rem] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Upload a new file</DialogTitle>
          <DialogDescription>
            Select a file to upload to your workspace. Maximum 100 MB.
          </DialogDescription>
        </DialogHeader>
        {!selectedFile ? (
          <div
            className={`p-6 h-[20rem] flex flex-col gap-4 items-center justify-center
            rounded-lg border-dashed border-2 transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-2 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse your computer
              </p>
            </div>
            <Input
              id="upload-file"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => document.getElementById('upload-file')?.click()}
              className="cursor-pointer"
              variant="outline"
            >
              <Download />
              Browse Files
            </Button>
          </div>
        ) : (
          <PreviewFileCard file={selectedFile} />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={filePickerActions.closeDialog}>
            Cancel
          </Button>
          <Button disabled={!selectedFile}>
            <Download />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
