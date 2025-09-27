import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { FileCard, NoFilesFound } from './file'
import { FilesPageHeader } from './header'
import PageContent from '@/components/workspace/layout/page-content'
import FilePicker from '@/components/workspace/files/file-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fileItemsStore } from '@/store/files/files-store'

export default function WorkspaceFiles() {
  const { fileItems } = useStore(fileItemsStore)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredFiles = fileItems.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'recent' &&
        new Date(file.modifiedAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (activeTab === 'starred' && file.starred)

    return matchesSearch && matchesTab
  })

  return (
    <PageContent>
      <FilePicker />
      <FilesPageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
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
              {filteredFiles.length === 0 ? (
                <NoFilesFound searchQuery={searchQuery} />
              ) : (
                filteredFiles.map((fileItem) => (
                  <FileCard key={fileItem.id} fileItem={fileItem} />
                ))
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </PageContent>
  )
}
