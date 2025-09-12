import React from 'react'
import { Plus, Columns } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { dialogActions } from '@/store/manager/ui-store'

export const ManagerHeader: React.FC = () => (
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
      <Button className="cursor-pointer" onClick={dialogActions.toggleDialog}>
        <Plus /> New task
      </Button>
    </div>
  </div>
)
