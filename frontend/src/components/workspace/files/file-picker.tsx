import { Download } from 'lucide-react'
import React, { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  filePickerActions,
  filePickerStore,
} from '@/store/files/file-picker-store'

export default function FilePicker() {
  const { isOpen } = useStore(filePickerStore)
  const [_, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={filePickerActions.toggleDialog}>
      <DialogContent className="sm:max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>Upload a new file</DialogTitle>
        </DialogHeader>
        <div className="mt-4 p-6 h-[20rem] flex flex-col items-center justify-center border-dashed border-border border-2">
          <Input
            id="upload-file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            className="py-6 px-8 cursor-pointer"
            onClick={() => document.getElementById('upload-file')?.click()}
          >
            <Download />
            Browse Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
