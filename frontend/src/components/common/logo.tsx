import React from 'react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export const Logo: React.FC<Props> = ({ className }) => (
  <img
    src="/logo.svg"
    alt="Motion logo"
    className={cn('h-8 w-8 text-primary-foreground', className)}
  />
)
