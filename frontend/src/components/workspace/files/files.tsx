import { FolderOpen, Search, Upload } from 'lucide-react'
import { FileCard } from './file'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import { mockFilesTestData } from '@/static/workspace/files'
import FilePicker from '@/components/workspace/files/file-picker'

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
        <Button type="button" className="flex items-center">
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
      {mockFilesTestData.length === 0 ? (
        <NoFilesFound />
      ) : (
        mockFilesTestData.map((item) => <FileCard key={item.id} item={item} />)
      )}
    </div>
  )
}

export default function WorkspaceFiles() {
  return (
    <PageContent>
      <FilePicker />
      <FilesPageHeader />
      <FilesPageContent />
    </PageContent>
  )
}
