import type React from 'react'

export default function PageContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="p-8">
      <div className="flex flex-col w-full gap-8">{children}</div>
    </main>
  )
}
