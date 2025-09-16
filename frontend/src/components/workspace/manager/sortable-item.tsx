import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  children: React.ReactNode
  id: string
}

export const SortableItem: React.FC<Props> = ({ children, id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
