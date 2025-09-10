import React from 'react'
import { Plus, Columns } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ManagerHeader: React.FC<Props> = ({ setIsDialogOpen }) => (
  <div className="flex items-center justify-between border-b p-6 border-sidebar-border w-full">
    <div className="flex gap-4 items-center">
      <h1 className="font-bold text-lg">Manager Board</h1>
      <Badge variant="outline" className="text-xs">
        6 tasks
      </Badge>
    </div>
    <div className="flex gap-4 items-center">
      <Button variant="outline" className="cursor-pointer">
        <Columns /> New Column
      </Button>
      <Button className="cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <Plus /> New task
      </Button>
    </div>
  </div>
)
