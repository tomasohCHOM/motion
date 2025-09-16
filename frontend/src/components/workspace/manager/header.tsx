import React from 'react'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { dialogActions } from '@/store/manager/dialog-store'

export const ManagerHeader: React.FC = () => (
  <div className="flex items-center justify-between border-b p-6 border-sidebar-border w-full">
    <div className="flex gap-4 items-center">
      <h1 className="font-bold text-lg">Manager Board</h1>
      <Badge variant="outline" className="text-xs">
        6 tasks
      </Badge>
    </div>
    <div className="flex items-center">
      <Button
        className="cursor-pointer"
        onClick={() => dialogActions.openAdd()}
      >
        <Plus /> New task
      </Button>
    </div>
  </div>
)
