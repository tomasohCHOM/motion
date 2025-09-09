import React from 'react'
import { User, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
        <User /> Assign member
      </Button>
      <Button className="cursor-pointer">
        <Plus /> New task
      </Button>
    </div>
  </div>
)
