import type React from 'react'

export const PageError: React.FC = () => {
  return (
    <div className="flex flex-col m-12 items-center justify-center">
      <h1 className="text-xl font-semibold text-destructive">
        500 — Internal Server Error
      </h1>
      <p>This page is unavailable right now. Please try again later.</p>
    </div>
  )
}
