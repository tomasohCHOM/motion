import {
  Download,
  FolderOpen,
  MoreHorizontal,
  Star,
  Trash,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import {
  formatDate,
  formatFileSize,
  getFileIcon,
  getFileTypeColor,
} from './utils'
import type { FileItem } from '@/store/files/files-store'
import { fileItemsActions } from '@/store/files/files-store'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMemberInitials } from '@/utils/initals'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { filePickerActions } from '@/store/files/file-picker-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const DeleteFileDialog: React.FC<{
  fileItem: FileItem
  isDeleteActionOpen: boolean
  setIsDeleteActionOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ fileItem, isDeleteActionOpen, setIsDeleteActionOpen }) => {
  return (
    <AlertDialog
      open={isDeleteActionOpen}
      onOpenChange={() => setIsDeleteActionOpen(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the file "{fileItem.name}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => fileItemsActions.removeFile(fileItem.id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const FileCard: React.FC<{ fileItem: FileItem }> = ({ fileItem }) => {
  const [isDeleteActionOpen, setIsDeleteActionOpen] = useState(false)

  const handleDownload = () => {
    if (!fileItem.file) return

    const url = URL.createObjectURL(fileItem.file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileItem.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="hover:shadow-md p-2 transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getFileIcon(fileItem)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{fileItem.name}</h4>
              {fileItem.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatFileSize(fileItem.size)}</span>
              <span>•</span>
              <span>Modified {formatDate(fileItem.modifiedAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={fileItem.modifiedBy.avatar} />
                  <AvatarFallback className="text-xs">
                    {getMemberInitials(fileItem.modifiedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{fileItem.modifiedBy.name}</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs mt-2 ${getFileTypeColor(fileItem.fileType)}`}
            >
              {fileItem.fileType}
            </Badge>
          </div>

          <DeleteFileDialog
            fileItem={fileItem}
            isDeleteActionOpen={isDeleteActionOpen}
            setIsDeleteActionOpen={setIsDeleteActionOpen}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileItemsActions.toggleStar(fileItem.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                {fileItem.starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteActionOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2 text-destructive" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export const NoFilesFound: React.FC<{ searchQuery: string }> = ({
  searchQuery,
}) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">No files found</h3>
      <p className="text-sm mb-4">
        {searchQuery.length === 0
          ? 'Upload some files to get started'
          : 'Try adjusting your search terms'}
      </p>
      <Button variant="outline" onClick={filePickerActions.toggleDialog}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    </div>
  )
}
