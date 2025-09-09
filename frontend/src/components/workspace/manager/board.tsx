import React from 'react'
import type { Column } from './types'
import { DroppableColumn } from './column'

export const Board: React.FC<{ columns: Array<Column> }> = ({ columns }) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((column) => (
          <DroppableColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  )
}
