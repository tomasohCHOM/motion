import { Search, Upload } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { filePickerActions } from '@/store/files/file-picker-store'

type Props = {
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

export const FilesPageHeader: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="w-full flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => filePickerActions.toggleDialog()}
          className="cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  )
}
