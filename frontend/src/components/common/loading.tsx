import type React from 'react'
import { Spinner } from '../ui/spinner'

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="size-12" />
    </div>
  )
}
