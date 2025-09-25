import { FolderOpen, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { FileCard } from './file'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import { mockFilesTestData } from '@/static/workspace/files'
import FilePicker from '@/components/workspace/files/file-picker'
import { filePickerActions } from '@/store/files/file-picker-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        <Button
          onClick={filePickerActions.toggleDialog}
          className="cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  )
}

const FilesPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <div className="px-6">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid gap-6">
            {mockFilesTestData.length === 0 ? (
              <NoFilesFound />
            ) : (
              mockFilesTestData.map((item) => (
                <FileCard key={item.id} item={item} />
              ))
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
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
