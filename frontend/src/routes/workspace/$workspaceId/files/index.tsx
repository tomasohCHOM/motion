import { createFileRoute } from '@tanstack/react-router'
import {
  Download,
  File,
  FileText,
  FolderOpen,
  Image,
  MoreHorizontal,
  Search,
  Share,
  Star,
  Upload,
} from 'lucide-react'
import type { FileItem } from '@/static/workspace/files'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import { mockFilesTestData } from '@/static/workspace/files'
import { getMemberInitials } from '@/utils/initals'

function getFileIcon(item: FileItem) {
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getFileTypeColor = (fileType?: string) => {
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

const NoFilesFound: React.FC = () => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">No files found</h3>
      <p className="text-sm mb-4">Upload some files to get started</p>
      <Button variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    </div>
  )
}

const FileItem: React.FC<{ item: FileItem }> = ({ item }) => {
  return (
    <Card className="hover:shadow-md p-2 transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getFileIcon(item)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {item.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{item.size}</span>
              <span>•</span>
              <span>Modified {formatDate(item.modifiedAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={item.modifiedBy.avatar} />
                  <AvatarFallback className="text-xs">
                    {getMemberInitials(item.modifiedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{item.modifiedBy.name}</span>
              </div>
            </div>

            <Badge
              variant="secondary"
              className={`text-xs mt-2 ${getFileTypeColor(item.fileType)}`}
            >
              {item.fileType}
            </Badge>
          </div>

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
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                {item.starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

const FilesPageHeader: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files and folders..." className="pl-10" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  )
}

const FilesPageContent: React.FC = () => {
  return (
    <div className="p-6 grid gap-6">
      {mockFilesTestData.length === 0 && <NoFilesFound />}
      {mockFilesTestData.map((item) => (
        <FileItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function WorkspaceFiles() {
  return (
    <PageContent>
      <FilesPageHeader />
      <FilesPageContent />
    </PageContent>
  )
}

export const Route = createFileRoute('/workspace/$workspaceId/files/')({
  component: WorkspaceFiles,
})
