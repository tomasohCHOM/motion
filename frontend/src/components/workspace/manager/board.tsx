import React from 'react'
import type { Column } from './types'
import { DroppableColumn } from './column'

type Props = {
  columns: Array<Column>
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const Board: React.FC<Props> = ({ columns, setIsDialogOpen }) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            setIsDialogOpen={setIsDialogOpen}
          />
        ))}
      </div>
    </div>
  )
}
